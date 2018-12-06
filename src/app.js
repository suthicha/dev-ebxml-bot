'use strict';

const express       = require('express');
const bodyParser 		= require('body-parser');
const cors 				  = require('cors');
const morgan 			  = require('morgan');

const middleware = require('@line/bot-sdk').middleware
const JSONParseError = require('@line/bot-sdk').JSONParseError
const SignatureValidationFailed = require('@line/bot-sdk').SignatureValidationFailed
const Client = require('@line/bot-sdk').Client;

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
// app.use(bodyParser.json({limit: '50mb'}));


// create LINE SDK config from env variables
const config = {
  channelAccessToken: 'ixZlAa4SRss2eSGc47WwokbuTUJe1l6+VOdkxy7SM6y/GlBuEyYlJsp9u01yTz8qNFxfc679Y7E7HRYMmL7PvXueUeMOgwPrASMFZvnbXfExyPGjeSGxdAKtY3sXovBxyh/313XnfPHo7Dy6/GUHsAdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'bbb144cb35ddcc9f0ad17f0bac1df7b3',
};

// app.use('/webhook', middleware(config))
app.use(bodyParser.json())

const client = new Client(config);
app.post('/webhook',middleware(config), (req, res) => {
  client.pushMessage('U37507f6b9512f3a8d796e21986bfa902', { type: 'text', text: 'hello, world' });
  res.json(req.body.events) // req.body will be webhook event object
})

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    console.log(err);
    res.status(401).send(err.signature)
    return
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw)
    return
  }
  next(err) // will throw default 500
})

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
// const port = process.env.PORT || 9001;
// app.listen(port, () => {
//   console.log(`listening on ${port}`);
// });
// app.use((req, res, next) => {
//   const error = new Error('Not Found');
//   error.status = 400;
//   next(error);
// });

// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.json({
//       error: "INVARID_ROUTE",
//       error_description: "Find not found routing"
//   });
// });

module.exports = app;
