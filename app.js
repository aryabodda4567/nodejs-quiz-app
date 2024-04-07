var express = require("express");

var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//module for questions
var { questions } = require('./helpers/questions');
//module for ansers validation
var { validateAnswers } = require("./helpers/validator");
//module for user authantication 
var { validateUser} = require('./helpers/auth');

app = express();



//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Serve static files
app.use(cookieParser()); // Use cookie-parser middleware
//app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
app.use(express.static(__dirname + '/frontend'));






//Server Configuration
const PORT = process.env.PORT || 3000;
const ADDRESS = "127.0.0.1";


//Map to store user quiz response 
const submittedUsers = {};


// 
// 
// HTML pages are served from api endpoint so that we can prevent from unauthorized access
// by checking cokkies every time they sends a request
// 
// 

//Displays home page(Login page)
app.get('/', function (req, res) {
    try {
        // Check if the user is logged in
        if (req.cookies.user) {
            // If   logged in, redirect to dashboard page 
            return res.redirect('/dashboard');
        } else {
            //Sends home page as reponse(login page)
            return res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
        }
    } catch (err) {
        console.error('Error in home page route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



// Api endpoint to handle login
app.post('/login', (req, res) => {
    try {
        //get username and passwotd from request body
        var { username, password } = req.body;

        // Check if username or password are empty
        if (!username || !password) {
            // Send response indicating username and password are required
            return res.status(400).json({ response: 'Username and password are required' });
        }

        //validate user name and password
        if (validateUser(username, password)) {
            //if credentials matches
            //set username as cookie;
            res.cookie('user', username, { maxAge: 86400000, httpOnly: true }); // Expires in one day

            //navigate to dashboard
            return res.status(200).json({ redirectUrl: `http://${ADDRESS}:${PORT}/dashboard` });
        } else {
            //credentials doesn't matches
            return res.status(400).json({ response: 'Username or password is wrong' });
        }
    } catch (err) {
        console.error('Error in login route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//Instructions page endpoint
app.get('/dashboard', function (req, res) {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        }
        //Return instructions page as response
        return res.sendFile(path.join(__dirname, 'frontend', 'instructions.html'));
    } catch (err) {
        console.error('Error in dashboard route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//Quiz page end point
app.get('/quiz', function (req, res) {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        }
        //Return quiz page as response
        return res.sendFile(path.join(__dirname, 'frontend/quiz', 'quiz.html'));
    } catch (err) {
        console.error('Error in quiz route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//
app.get('/questions', function (req, res) {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        }
        //Send questions
        res.status(200).json(questions);
    } catch (err) {
        console.error('Error in questions route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//Endpoint to submit quiz
app.post('/submit-quiz', (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        } else {
            //get client user name from cookie
            let userName = req.cookies.user;
            //get response from client
            const userAnswers = req.body;
            //validate reponse
            let response = validateAnswers(userAnswers);
            //add result to the username 
            submittedUsers[userName] = response;
        }
        //navigate to results page
        return res.status(200).json({ redirectUrl: `http://${ADDRESS}:${PORT}/resultpage` });
    } catch (err) {
        console.error('Error in submit-quiz route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//endpoint to get result of the users quiz as json
app.get('/res', (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        }
        //get username from cookies
        let userName = req.cookies.user;
        
        //check wheter the user has attempted the quiz or not
        if (submittedUsers[userName]) {
            //return result along with score to client in json format
            return res.status(200).json({
                questions: submittedUsers[userName], // Array of questions
                score: submittedUsers[userName].score // Score property
            });
        } else {
            //if not attempted return note
            res.status(404).json({ result: "You have not attempted the quiz" });
        }
    } catch (err) {
        console.error('Error in res route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//End point to return  results page html
app.get('/resultpage', (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.cookies.user) {
            // If not logged in, redirect to login page 
            return res.redirect('/');
        }
        //sends result page
        return res.sendFile(path.join(__dirname, 'frontend/quiz', 'result.html'));
    } catch (err) {
        console.error('Error in resultpage route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});





app.listen(PORT, ADDRESS, function () {
    console.log(`Running at http://${ADDRESS}:${PORT}`);
});