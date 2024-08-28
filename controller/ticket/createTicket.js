const {zendesk} = require('../../configuration/zendesk-config');




const createTicket = (requestorId,agentId,subject,body,callback) => {

    zendesk.tickets.create({
        ticket:{
            requesterId: parseInt(requestorId),
            status: 'new',
            subject: subject,
            submitterId: parseInt(requestorId),
            comment : {
                body: body,
                public: true,
              }		 	
        }
    }).then( (response)=>{
        callback(true,undefined,response.body.ticket.id);
        
    }).catch( (err)=>{
        console.log('Zendesk API Failure, while Create Ticket Call')
        console.log(err);
        callback(false,'Ticket Creation Failed, Zendesk API Error')
    })

}


module.exports = {
 createTicket
}