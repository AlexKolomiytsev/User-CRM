'use strict';

const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const morgan            = require('morgan');
const path              = require('path');
const mongoose          = require('mongoose');
const config            = require('./config');

/*
 * APP CONFIGURATION
 * ==============================
 * */
//use body-parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//configure our app to handle CORS requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

//log all requests to the console
app.use(morgan('dev'));

//connect to our database
mongoose.connect(config.database);

//set static files location
//used for requests that our frontend will make
app.use(express.static(`${__dirname}/public`));

/*
 * ROUTES FOR OUR API
 * ==============================
 * */
let apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

/*
* MAIN CATCHALL ROUTE
* has to be registred after api routes
* */
app.get('*', (req, res) => {
    res.sendFile(path.join(`${__dirname}/public/angular/index.html`))
});

/*
 * START THE SERVER
 * ==============================
 * */
app.listen(config.port);
console.log(`Magic happens on port ${config.port}`);



