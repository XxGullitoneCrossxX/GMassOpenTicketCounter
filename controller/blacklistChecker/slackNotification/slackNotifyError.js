const {slackHook} = require('../../../configuration/slack');



const slackNotifyError = (entity,errorMessage) => {

    let template =  {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Error Event has occurred"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Error while making IP/Domain blacklist check for ${entity}\n Status Code: ${errorMessage}`
                }
            }
        ]
    }

    slackHook.post(process.env.SLACK_DOMAIN_ERROR_WEBHOOK_URL,template)
    .then((result)=>{
        console.log(`${new Date().toISOString()} Error Update has been posted in the channel\n`)

   

 }).catch((e) => { console.log(`${new Date().toISOString()} Failed to add send notification Slack about ${entity} blacklist check`);

})

}


module.exports = {
    slackNotifyError
}