const { blackListApi } = require('../../configuration/blackListApi');
const { slackNotifyError } = require('./slackNotification/slackNotifyError');
const { slackNotifyListedIps } = require('./slackNotification/slackNotifyListedIps');
const moment = require('moment');
const { client } = require('../../configuration/dbClient');



// Array of IPs to check
const ips = ["193.24.210.214", "80.209.240.43", "31.13.213.26", "185.168.23.57", "138.128.242.113", 
             "45.157.60.66", "3.69.6.218", "141.95.1.152", "216.7.89.174", "45.86.37.181", 
             "216.187.74.214", "95.85.89.225", "34.217.238.114", "35.160.111.203"];

// Function to load last notified data from the database
async function loadLastNotified() {
    const result = await client.query('SELECT ip, last_notified FROM last_notified_ips');
    const lastNotified = {};
    result.rows.forEach(row => {
        lastNotified[row.ip] = moment(row.last_notified);
    });
    return lastNotified;
}

// Function to update the last notified timestamp in the database
async function updateLastNotified(ip) {
    const timestamp = moment().toISOString();
    await client.query(`
        INSERT INTO last_notified_ips (ip, last_notified)
        VALUES ($1, $2)
        ON CONFLICT (ip)
        DO UPDATE SET last_notified = EXCLUDED.last_notified
    `, [ip, timestamp]);
}

// Function to check if an IP is blacklisted
async function checkBlacklist(ip, lastNotified) {
    try {
        const response = await blackListApi.get(`/ZEN/${ip}`);
        const { status, resp } = response.data;

        if (status === 200) {
            if (!lastNotified[ip] || moment().diff(lastNotified[ip], 'hours') >= 24) {
                slackNotifyListedIps(ip, resp);
                await updateLastNotified(ip);
            }
        } else if (status === 404) {
            console.log(`IP ${ip} is not listed.`);
        } else {
            console.log(response);
            slackNotifyError(ip, status);
        }
    } catch (error) {
        if (error.response?.status !== 404) {
            console.error(`Error checking IP ${ip}: ${error.message}`);
            slackNotifyError(ip, error.response?.status || 500);
        } else {
            console.log(`IP ${ip} is not listed.`);
        }
    }
}

// Function to start the check process with a delay between each request
async function startChecking() {
    const lastNotified = await loadLastNotified();
    for (let i = 0; i < ips.length; i++) {
        await checkBlacklist(ips[i], lastNotified);
        if (i < ips.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 10 seconds
        }
    }
}

module.exports = {
    startChecking
}