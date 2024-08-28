const {zendesk} = require('../configuration/zendesk-config');
const async = require("async");
const {slackHook} = require('../configuration/slack');

var finalData = []; //Hold the final data of the raw data fetched form the Zendesk Server
var pageNo = 1; //Initializing Page No
var nextPage = ""; //Initializing nextPage
var agentId = [4802628269339, 361244090414, 427594091873,14831245085723,14831250609563];

let agents = {
    4802628269339: [],
    427594091873:[],
    14831245085723: [],
    14831250609563:[]
};

// 4802628269339: Vikshit Shetty,  // 14831245085723: Shine // 14831250609563: Ryle  // 427594091873: Jalton // 24425825295259 : Thuy




const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));


const openTicketBacklog = (cb) => {
    finalData = [];
    async.whilst(function (callback) {
        callback(null,nextPage !==null);
      },
      function (next) {
          zendesk.search({
              query: `status:open -assignee:"Ajay Goel" -assignee:"Leon" -assignee:"Mary Reed" -assignee:"Jane Samuya" -assignee:"Thuy Vi" -assignee:"Sam Greenspan"`,
              page: pageNo++,
              
          })
           .then( (result)=>{
              console.log(result.body.nextPage)
              nextPage=result.body.nextPage
              finalData= finalData.concat(result.body.results);
              console.log(`Current number of tickets fetched ${finalData.length}`)
              next();
           }).catch( (err) => {console.log(err); cb()})
      },
      function (err) {
      if(err) throw err;  
      console.log('Fetch has been completed');
      
      async.every(finalData, function(ticket, callback) {
    
        zendesk.tickets.listComments(ticket['id'])
        .then((result)=>{
            let comment = result.body.comments[0];

          if(agentId.includes(comment.authorId) ){
            ticket['id'] = 0;
          }else{
            let time = (Date.now()) - (Date.parse(comment.createdAt)  /* Adding 5hrs 30mins since server is running on IST */);

            time = Math.round(time/(1000*60*60)); //Converting it into hours;
            
            agents[ticket['assigneeId']].push({"id": ticket['id'] , "hours" : time })

          }  
          callback(null,true)
        }).catch(err => {
                      console.log(`Error occurred for ticket ID ${ticket.id}`); //WIll show if any ticket has null value
                      callback(err,false)
              })
    //       zendesk.users.get(ticket['assigneeId'])
    //       .then( (result)=>{
              
    //           ticket['assigneeId']= result.body.user.name;
    //           ticket['id'] = `https://gmass.zendesk.com/agent/tickets/${ticket['id']}`;

    //           agents[ticket['assigneeId']] = agents[ticket['assigneeId']] ? agents[ticket['assigneeId']] + 1 : 1 
    //           callback(null,true)
    //       }).catch(err => {
    //           console.log(`Error occurred for ticket ID ${ticket.id}`); //WIll show if any ticket has null value
    //           callback(err,false)
    //   })
      
      }, function(err, result) {
          if(result){
              console.log("Ready to calculate the results")

            let template = {
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": ":admission_tickets:[Daily] Open Tickets Backlog  :admission_tickets:"
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "text": `*${new Date().toDateString()}*  |  Agent Wise Distribution`,
                                "type": "mrkdwn"
                            }
                        ]
                    },
                    {
                        "type": "divider"
                    }
                ]
            };

            // 4802628269339: Vikshit Shetty,  // 361244090414: Marvin // 427594091873: Jalton
            for( agent of Object.keys(agents)){
                let agentName;
                if(agent == 4802628269339){
                   agentName = 'Vikshit Shetty';
                }
            
                if(agent == 427594091873){
                    agentName = 'Jalton J';
                }

                if(agent == 14831245085723){
                    agentName= 'Shine Lyui'
                }

                if(agent == 14831250609563 ){
                    agentName = 'Ryle Dsilva'
                }
                //Adding Section for the assigned Agent.
                template["blocks"].push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${agentName.toUpperCase()}*`
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*_Ticket ID_*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*_Pending since_*"
                        }
                    ]
                })

                //Adding the tickets if any!

                if(!agents[agent].length){
                    template["blocks"].push({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "_No Open Tickets are pending for your response_"
                        },
                    });
                    
                }else{
                    for( ticket of agents[agent]){
                        template["blocks"].push({
                            "type": "section",
                            "fields": [
                                {
                                    "type": "mrkdwn",
                                    "text": `<https://gmass.zendesk.com/agent/tickets/${ticket['id']} | ${ticket['id']}>`
                                },
                                {
                                    "type": "mrkdwn",
                                    "text": `${ticket['hours']} hours`
                                }
                            ]
                        })
                    }
                    //Adding Divider line after adding all tickets for the Agent.
                    template["blocks"].push({
                        "type": "divider"
                    });

                }

            }
            
            //https://hooks.slack.com/services/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
          
            slackHook.post(process.env.SLACK_OPENTICKET2_SUCCESS_WEBHOOK_URL,template)
            .then((result)=>{
                console.log('Update has been posted in the channel')
                cb()

            }).catch((e) => {console.log(e); cb()})


          }else{
              console.log('Error Has been called');
              console.log(err)
              cb()
          }
      });
      
          
      } );
    

}

module.exports = {
    openTicketBacklog
}



  
  
  


