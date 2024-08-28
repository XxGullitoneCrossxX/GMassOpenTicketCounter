const { getZendeskUser } = require('./ticket/getZendeskUser');
const {createTicket} = require('./ticket/createTicket');
const {createZendeskUser} = require('./ticket/createZendeskUser');


const generateCancelTicket = (rawSubject,body,agentId,callback) =>{

    let requestorEmail = rawSubject.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)[0];
    console.log(`RequestorEMail: ${requestorEmail}`);
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
                    "text": `*Error while creating ticket for* ${requestorEmail} for cancellation ticket`
                }
            }
        ]
    }

    getZendeskUser(requestorEmail,(status,user)=>{

        switch(status){
            case true:

                requestorId=user.id;
          

                createTicket(requestorId,agentId,"[Feedback Subscription Cancellation] We're Here to Help - GMass",body,(status,message,ticketId)=>{
                    if(status){
                        console.log(`Ticket ${ticketId}has been created successfully with User Exists Case`);
                        callback('success');
                    }else{
                        console.log('Ticket Creation has been failed with User Exists Case');
                        slackHook.post(process.env.SLACK_OPENTICKET_SUCCESS_WEBHOOK_URL,template)
                        .then((result)=>{
                            console.log(`${new Date().toISOString()} Update has been posted in the channel\n`)
                            callback(message);
                
                     }).catch((e) => { console.log(e);
                        callback(message);
                    })
                        
                    }
                })
                break;

            case false:
            
                
                createZendeskUser(requestorEmail,(status,user)=>{
                    if(status){
                        console.log(`${user.name} successfully added to the Zendesk with user Id: ${user.id}`)
                        // console.log(user);
                        requestorId=user.id;
                        createTicket(requestorId,agentId,"[Feedback Subscription Cancellation] We're Here to Help - GMass",body,(status,message,ticketId)=>{
                            if(status){
                                console.log('Ticket has been created successfully with User Exists Case');
                                callback('success');
                            }else{
                                console.log('Ticket Creation has been failed with User Exists Case');
                                slackHook.post(process.env.SLACK_OPENTICKET_SUCCESS_WEBHOOK_URL,template)
                                .then((result)=>{
                                    console.log(`${new Date().toISOString()} Update has been posted in the channel\n`)
                                    callback(message);
                        
                             }).catch((e) => { console.log(e);
                                callback(message);
                            })
                            
                            }
                        })
                    }else{
                        callback('Error has occurred while Zendesk Create User API')
                    }
                    console.log('Ticket has been created successfully with FALSE CASE');
                })
                // Call Zendesk Create User with email & name depending upon if requestoEmail exits or not
                
                break;
            case undefined:
                callback('Error has occurred while fetching Zendesk User API');
                break;
            default:
                console('Default Case of Callback of getZendeskUser()')
        }

    })

}


module.exports = {
generateCancelTicket
}
