const Zendesk = require('zendesk-node');
const email = process.env.ZENDESK_EMAIL; //
const zendeskSubdomain = process.env.ZENDESK_DOMAIN;
const zendeskAdminToken = process.env.ZENDESK_ADMIN_TOKEN
// const zendeskAdminToken = process.env.API_KEY; // Login to your Zendesk's Agent and go to Admin -> API to generate.
const zendesk = Zendesk({ authType: Zendesk.AUTH_TYPES.API_TOKEN, zendeskSubdomain, email, zendeskAdminToken })

module.exports = {
    zendesk
}

