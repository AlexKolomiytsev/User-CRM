'use strict';

/*
 * CALL THE PACKAGES
 * ==============================
 * */
const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const morgan            = require('morgan');
const mongoose          = require('mongoose');
const port              = process.env.PORT || 8080;
const jwt               = require('jsonwebtoken');

const superSecret       = 'ilovebeerbeerbeerbeerbeer';



/*
 * DATABASE CONFIGURATION
 * */
mongoose.connect('mongodb://localhost:27017/db_user_crm');

let User = require('./app/models/user');


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

/*
 * ROUTES FOR OUR API
 * ==============================
 * */
//basic route for the home page
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});

//get an instance of the express router
let apiRouter = express.Router();

apiRouter.post('/authenticate', (req, res) => {
    //find the user
    User.findOne({
        username: req.body.username
    }).select('name username password').exec((err, user) => {
        if (err) throw err;

        //no user with that username was found
        if (!user) {
           res.json({
               success: false,
               messages: [
                   'Authentication failed. User not found.'
               ]
           })
        }
        else if (user){
            //check if password matches
            let validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success: false,
                    messages: [
                        'Authentication failed. Wrong Password.'
                    ]
                });
            }
            else {
                //if user is found and password is right
                //create a token
                let token = jwt.sign({
                    name: user.name,
                    username: user.username
                }, superSecret, {
                    expiresIn: 1440 //expires in 24 hours
                });

                res.json({
                    success: true,
                    messages: [
                        'Enjoy your token!'
                    ],
                    token
                })
            }
        }
    })
});



//route middleware to verify a token
apiRouter.use((req, res, next) => {
    //check header or url parameters or post parameters for token
    let token = req.headers['authorization'];

    //decode token
    if (token) {
        token = token.split(' ')[1];

        //verifies secret and checks exp
        jwt.verify(token, superSecret, (err, decoded) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    messages: [
                        'Failed to authenticate token.'
                    ]
                })
            }
            else {
                //if everything is good, save to request for use in other routes
                req.decoded = decoded;

                next();
            }
        })
    }
    else {
        //if there is no token
        //return an HTTP response of 403 (access forbidden) and an error message
        return res.status(403).send({
            success: false,
            messages: [
                'No token provided'
            ]
        })
    }
});

/*
 * REGISTER OUR ROUTES
 * ==============================
 * */

app.use('/api', apiRouter);

apiRouter.route('/users')
//create a user
    .post((req, res) => {
        let user = new User();

        //set the user information (comes from the request)
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save((err) => {
            if (err) {
                //duplicate entry
                if (err.code == 11000) {
                    return res.json({
                        success: false,
                        messages: [
                            'A user with that username already exists.'
                        ]
                    })
                }
                else {
                    return res.send(err);
                }
            }
            res.json({
                messages: [
                    'User created!'
                ]
            });
        });

    })
    //get all the users
    .get((req, res) => {
        User.find((err, users) => {
            err ? res.send(err) : res.json(users);
        })
    });

apiRouter.route('/users/:user_id')
    //get the user with that if
    .get((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            err ? res.send(err) : res.json(user);
        })
    })
    //update the user with this id
    .put((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err) res.send(err);

            //update the users info only if it's new
            if (req.body.name) user.name = req.body.name;
            if (req.body.username) user.username = req.body.username;
            if (req.body.password) user.password = req.body.password;

            user.save(err => {
                if (err) {
                    //duplicate entry
                    if (err.code == 11000) {
                        return res.json({
                            success: false,
                            messages: [
                                'A user with that username already exists.'
                            ]
                        })
                    }
                    else {
                        return res.send(err);
                    }
                }
                res.json({
                    messages: [
                        'User updated'
                    ]
                });
            });
        });
    })
    //delete the user with this id
    .delete((req, res) => {
        User.remove({
            _id: req.params.user_id
        }, (err, user) => {
            err ? res.send(err) : res.json({
                messages: [
                    'Successfully deleted'
                ]
            });
        })
    });


/*
 * START THE SERVER
 * ==============================
 * */
app.listen(port);
console.log(`Magic happens on port ${port}`);



