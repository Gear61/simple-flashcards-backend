const express = require('express');
const app = express();

// POST body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
require('./routes')(app);

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
