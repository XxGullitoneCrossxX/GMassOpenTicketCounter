const express = require('express');
const { openTicketBacklog } = require('./controller/openTicketBacklog');
const { smtpPushRequestBacklog } = require('./controller/smtpPushRequestBacklog');
const { checkIfUserIsVIP } = require('./controller/checkIfUserIsVIP');
const { backEnd } = require('./configuration/backEnd');
const { generateCancelTicket } = require('./controller/generateCancelTicket');

const { generateCampaignTicket } = require('./controller/generateCampaignTicket');
const { startChecking } = require('./controller/blacklistChecker/ipBlackListChecker');

const { startCheckingDomains } = require('./controller/blacklistChecker/domainBlackListChecker');


const app = express();
app.use(express.json());


app.listen(process.env.PORT || 3000, () => {
  console.log(`Application is listening at port 3000`);

})

app.get('/ping', (req, res) => {

  console.log('Keeping the app alive')
  res.send("App is alive")
})

app.post('/generateCancellationTicket', (req, res) => {
  console.log(req.body);
  if (req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {

    generateCancelTicket(req.body.subject, req.body.body, 4802628269339, (status) => {
      res.json({
        status: status
      });
    })
  } else {
    res.send('Unauthorized access')
  }

})

app.post('/generateCampaignTicket', (req, res) => {
  if (req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {

    let subject, fromAddress;

    for (let header of req.body.headers) {

      if (header.name.toLowerCase() === 'subject') {
        subject = header.value
      } else if (header.name.toLowerCase() === 'from') {
        fromAddress = header.value;
      }

    }

    let body;

    //Handling the case where decoded Content parameter is missing from the email
    if (!req.body.body) {
      body = req.body.snippet;
    } else {
      body = req.body.body;
    }

    generateCampaignTicket(subject, body, fromAddress, 4802628269339, (status) => {
      res.json({
        status: status
      });
    })
  } else {
    res.send('Unauthorized access')
  }
})

app.get('/getOpenTicketBacklog', (req, res) => {
  if (req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {
    openTicketBacklog(() => {
      res.send('Executed the Open Ticket Counter')
    })
  } else {
    res.send('Unauthorized access')
  }

})

//Get IP Blacklisting from SpamHaus Zen

app.get('/getIpBlackListing', async (req, res) => {

  if (req.headers.token && req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {
    try {
      await startChecking();
      res.status(200).send('Blacklist check initiated.');
    } catch (error) {
      console.error(`Error initiating blacklist check: ${error.message}`);
      res.status(500).send('Error initiating blacklist check.');
    }
  } else {
    res.send('Unauthorized access')
  }

})

// Get Domain Blacklisting from SpamHaus DBL

// Endpoint to trigger the domain blacklist check
app.get('/checkDomainBlacklist', async (req, res) => {

  if (req.headers.token && req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {
    try {
      await startCheckingDomains();
      res.status(200).send('Domain blacklist check initiated.');
    } catch (error) {
      console.error(`Error initiating domain blacklist check: ${error.message}`);
      res.status(500).send('Error initiating domain blacklist check.');
    }
  } else {
    res.send('Unauthorized access')
  }
});

//Check SMTP Push Notifications

app.post('/notifySmtpPushRequest', (req, res) => {
  if (req.headers.token === process.env.AUTH_TOKEN_FROM_Make) {
    smtpPushRequestBacklog(req.body.subject, req.body.text, req.body.date, () => {
      res.send('Executed notify Push Notification ')
    })
  } else {
    res.send('Unauthorized access')
  }

})

app.post('/checkIfUserIsVIP', async (req, res) => {
  // if (req.headers.token === process.env.AUTH_TOKEN_FROM_CRON) {
  //     openTicketBacklog(() => {
  //         res.send('Executed the Open Ticket Counter')
  //     })
  // }else{
  //     res.send('Unauthorized access')
  // }
  console.log(req.body);
  try {
    const response = await backEnd.post("/campaignSearch", { searchTerm: req.body.email });

    if (response.status === 201) {
      if (response.data.userData && response.data.userData[0].AccountStatus === 'e') {
        checkIfUserIsVIP(req.body.id, req.body.subject);
      }

    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized access, login failed")
      return "failed"
    } else if (error.response && error.response.status === 400) {
      console.log("Database didn't respond")
      return "failed"
    } else {
      console.log("Backend Server is not reachable");
      console.log(error)
    }
  }

  res.send('Executed');
})

//CheckIpBlackListing



