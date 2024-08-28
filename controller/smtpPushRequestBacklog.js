
const {slackHook} = require('../configuration/slack');

const smtpPushRequestBacklog = (subject,text,date,callback) => {

   // Extract AI REASON 
    let regex = /AI Reason: (.+)/;
    const aiReasonMatch = text.match(regex);
    
    let aiReason = "NA";

    if (aiReasonMatch) {
        
        aiReason = aiReasonMatch[1];
    }
    
   //Extract AI Recommendation 
  regex = /AI Recommendation: (\w+)/;
  
  const aiRecommendationMatch = text.match(regex);
  let aiRecommendation = "False";


  if(aiRecommendationMatch){
    aiRecommendation = aiRecommendationMatch[1];
  }

  //Extract Push and Reject SMTP URL

  const links = text.match(/(https?:\/\/[^\s]+)/g);

  const pushSMTPUrl = links[links.length-2];

  const rejectSMTPUrl = links[links.length-1];

  const showEmailUrl = links[0];

  //Extracting campaign details
const subjectRegex = /Subject: (.+)/;
const campaignIdRegex = /Campaign ID: (\d+)/;
const emailsRemainingRegex = /Emails remaining: ([0-9,]+)/;
const emailsSentRegex = /Emails remaining: ([0-9,]+)/;

const subjectMatch = text.match(subjectRegex)[0];
const campaignIdMatch = text.match(campaignIdRegex)[0];
const emailsRemainingMatch = text.match(emailsRemainingRegex)[0];
const emailsSentMatch = text.match(emailsSentRegex)[0];

//Get registered email address

const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/;
const emailMatch = subject.match(emailRegex);


const registeredEmail = emailMatch[0];


let template = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": ":bell: New SMTP Request Received"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"text": date,
					"type": "mrkdwn"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Request Details",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Requestor Email : ${registeredEmail}`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${subjectMatch}`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${campaignIdMatch}`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${emailsRemainingMatch}`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Email Content : <${showEmailUrl}|Show Email>`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Dashboard : <https://www.gmass.co/dashboard/email?email=${registeredEmail} |Login URL>`,
				"verbatim": false
			}
		},{
			"type": "divider"
		},
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "AI Suggestions",
				"emoji": true
			}
		},{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `AI Recommendation : ${aiRecommendation}`,
				"verbatim": false
			}
		},{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `AI Reason : ${aiReason}`,
				"verbatim": false
			}
		},

		{
			"type": "divider"
		},
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Action",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Accept Push : <${pushSMTPUrl} |Click to accept SMTP push request>`,
				"verbatim": false
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Reject Push : <${rejectSMTPUrl} |Click to reject SMTP push request>`,
				"verbatim": false
			}
		}
	]
}


slackHook.post(process.env.SLACK_SMTPPUSH_SUCCESS_WEBHOOK_URL,template)
            .then((result)=>{
                console.log('SMTP Push Update has been posted in the channel')
                callback();

            }).catch((e) => {console.log(e); callback()}) 	
}

module.exports = {
    smtpPushRequestBacklog
}