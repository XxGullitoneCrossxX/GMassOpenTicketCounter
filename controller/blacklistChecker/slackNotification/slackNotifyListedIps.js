const {slackHook} = require('../../../configuration/slack');



const slackNotifyListedIps = (entity,status) => {

    let stringIp = '';
    
  stringIp = stringIp.concat(` <https://check.spamhaus.org/results/?query=${entity}|${entity}> \n `);
    

    let template = {
   
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": ":page_facing_up: Spamhaus IP/Domain Listing"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "text": new Date().toString(),
                            "type": "mrkdwn"
                        }
                    ]
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `${stringIp}`
                        }
                    ]
                }
            ]

    }

    slackHook.post(process.env.SLACK_SUCCESS_WEBHOOK_URL,template)
            .then((result)=>{
                console.log('Ips/Domain Update has been posted in the channel')

            }).catch((e) => {console.log(e);})


}


module.exports = {
    slackNotifyListedIps
}