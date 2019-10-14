const path = require('path');
const express = require('express');
const expressHbs = require('express-handlebars');
const app = express();
const hbs = expressHbs.create({});

// POST body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.set('port', (process.env.PORT || 5000));
app.use('/static', express.static(path.join(__dirname, 'public')))

// Register `hbs.engine` with the Express app.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

require('./routes')(app);
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
