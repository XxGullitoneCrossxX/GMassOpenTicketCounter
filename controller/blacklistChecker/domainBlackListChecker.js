const { blackListApi } = require('../../configuration/blackListApi');
const { slackNotifyError } = require('./slackNotification/slackNotifyError');
const { slackNotifyListedIps } = require('./slackNotification/slackNotifyListedIps');
const { client } = require('../../configuration/dbClient');
const moment = require('moment');


// Array of Domains to check
const domains = [
  "amailroute.net", "bmailroute.net", "cmailroute.net", "dmailroute.net",
  "emailroute.net", "fmailroute.net", "gmailroute.net", "hmailroute.net",
  "imailroute.net", "jmailroute.net", "smtpgm.net", "wordzen.com",
  "gmass.co", "gmass.io", "gmapp4.net", "gmreg5.net", "gmgb4.net",
  "gmlink.net", "gma.as"
];

// Function to load last notified data from the database
async function loadLastNotifiedDomains() {
    const result = await client.query('SELECT domain, last_notified FROM last_notified_domains');
    const lastNotifiedDomains = {};
    result.rows.forEach(row => {
        lastNotifiedDomains[row.domain] = moment(row.last_notified);
    });
    return lastNotifiedDomains;
}

// Function to update the last notified timestamp in the database
async function updateLastNotifiedDomain(domain) {
    const timestamp = moment().toISOString();
    await client.query(`
        INSERT INTO last_notified_domains (domain, last_notified)
        VALUES ($1, $2)
        ON CONFLICT (domain)
        DO UPDATE SET last_notified = EXCLUDED.last_notified
    `, [domain, timestamp]);
}

// Function to check if a domain is blacklisted
async function checkDomainBlacklist(domain, lastNotifiedDomains) {
    try {
        const response = await blackListApi.get(`/DBL/${domain}`);
        const { status, resp } = response.data;

        if (status === 200) {
            if (!lastNotifiedDomains[domain] || moment().diff(lastNotifiedDomains[domain], 'hours') >= 48) {
                slackNotifyListedIps(domain, resp);
                await updateLastNotifiedDomain(domain);
            }
        } else if (status === 404) {
            console.log(`Domain ${domain} is not listed.`);
        } else {
            console.log(response);
            slackNotifyError(domain, status);
        }
    } catch (error) {
        if (error.response?.status !== 404) {
            console.error(`Error checking domain ${domain}: ${error.message}`);
            slackNotifyError(domain, error.response?.status || 500);
        } else {
            console.log(`Domain ${domain} is not listed.`);
        }
    }
}

// Function to start the check process with a delay between each request
async function startCheckingDomains() {
    const lastNotifiedDomains = await loadLastNotifiedDomains();
    for (let i = 0; i < domains.length; i++) {
        await checkDomainBlacklist(domains[i], lastNotifiedDomains);
        if (i < domains.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 10 seconds
        }
    }
}

module.exports = {
    startCheckingDomains
}
