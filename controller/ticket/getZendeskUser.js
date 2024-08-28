const {zendesk} = require('../../configuration/zendesk-config');


const getZendeskUser = (email,callback) =>{

    zendesk.search({
    query: `type:user email:${email}`	
})
 .then( (result)=>{
     if(result.body.results.length){
        console.log('User Does exists on Zendesk');
        callback(true,result.body.results[0])
     }else{
         console.log('User Doesnt exists on Zendesk');
        //  console.log(result.body.results[0])
         callback(false,result.body.results[0])
     }
 }).catch(err => {
     console.log('Error at getZendeskUser() \n'+err)
    callback(undefined,{})
})
}

module.exports = {
    getZendeskUser
}