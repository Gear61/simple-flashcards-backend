const express = require('express');
const app = express();

// POST body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
require('./routes')(app);

'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');
var privateKEY  = fs.readFileSync(require('path').resolve(__dirname, './routes/keys/private.key'), 'utf8');
var publicKEY  = fs.readFileSync(require('path').resolve(__dirname, './routes/keys/public.key'), 'utf8');

/*
 ====================   JWT Signing =====================
 */

 var payload = {
 	data1: "Data 1",
 	data2: "Data 2",
 	data3: "Data 3",
 	data4: "Data 4",
 };
 var i  = 'Mysoft corp';   
 var s  = 'some@user.com';   
 var a  = 'http://mysoftcorp.in';var signOptions = {
 	issuer:  i,
 	subject:  s,
 	audience:  a,
 algorithm:  "RS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
};
var token = jwt.sign(payload, privateKEY, signOptions);
console.log("Token :" + token);

/*
 ====================   JWT Verify =====================
 */

 var verifyOptions = {
 	issuer:  i,
 	subject:  s,
 	audience:  a,
 	algorithm:  ["RS256"]
 };
 var legit = jwt.verify(token, publicKEY, verifyOptions);
 console.log("\nJWT verification result: " + JSON.stringify(legit));

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
