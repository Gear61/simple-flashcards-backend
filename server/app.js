'use strict'

const express = require('express');
const argv = require('minimist')(process.argv);

function setupServer(cb) {
  const app = express();
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({limit: '50mb'}));
  cb(undefined, {app: app});
}

function setupLogging(args, cb) {
  const { app } = args;
  const scribe = require('scribe-js')();
  app.use(scribe.express.logger());
  if(argv.scribe || process.env.LOGS) {
    process.console.log('Setting up Log Viewer');
    app.use('/logs', scribe.webPanel()); //Initiate location to view logs.
  }
  cb(undefined, args);
}

function setupRoutes(args, cb) {
  const { app } = args;
  process.console.log('Setting up configuration');
  app.set('port', (process.env.PORT || 5000));
  process.console.log('Serving static files');
  app.use(express.static(__dirname + '/public'));
  process.console.log('Loading Routes');
  require('./routes')(app);
  cb(undefined, args);
}

function startServer(args, cb) {
  const { app } = args;
  app.listen(app.get('port'), function() {
    process.console.log('Node app is running on port', app.get('port'));
  });
  cb(undefined, args);
}

function start() {
  const async = require('async');
  async.waterfall([
    setupServer,
    setupLogging,
    setupRoutes,
    startServer,
  ], (err, res) => {
    if(err) {
      console.log(err);
    } else {
      process.console.log('Server Startup Finished');
    }
  });
}

start();
