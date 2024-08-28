const {zendesk} = require('../configuration/zendesk-config');


const checkIfUserIsVIP = (id,subject) =>{

    zendesk.tickets.update(id, {
                  
        ticket: {
            subject: "[VIP] "+subject
            
            
          }
      }).then(function(result){
        if(result){
            
            console.log(`Subject for TicketID: ${id} has been changed to VIP!`)
        }
        else{
            console.log(`Subject update was failed! for TicketID: ${id}`)
        }
      }).catch((err)=>{
          console.log(`unable to update the Zendesk Ticket: ${err}`)
      })

}


module.exports = {
checkIfUserIsVIP
}
