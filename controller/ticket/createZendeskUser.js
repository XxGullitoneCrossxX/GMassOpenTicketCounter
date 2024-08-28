const {zendesk} = require('../../configuration/zendesk-config');


const createZendeskUser = (email,callback) =>{

    zendesk.users.create({
        user:{ 
        name: email.split('@')[0],
        email: email,
        verified: true
     }
     })
 .then( (result)=>{
     callback(true,result.body.user)
 }).catch(err => {
     console.log('Error at createZendeskUser() \n'+err)
    callback(false,{})
})
}

module.exports = {
    createZendeskUser
}