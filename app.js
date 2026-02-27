
require('dotenv').config();
const express = require('express');
const util = require('util');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();

//environment for google analytics and the like
const env = {googa: ''};
const sdb = require('./sdb');
const questions = require('./questions');
const secretphrase = process.env.SESSION_SECRET || 'I think we can work something out...';

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: secretphrase,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Environment-specific configuration
if (process.env.NODE_ENV === 'production') {
    const oneYear = 31557600000;
    app.use(express.static(path.join(__dirname, 'static'), { maxAge: oneYear }));

    fs.readFile(path.join(__dirname, 'googa'), 'utf8', function(err, data){
        if (!err) {
            env.googa = data;
        }
    });
} else {
    // Development mode
    app.use(express.static(path.join(__dirname, 'static')));
    env.googa = 'dev = true;';
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const title = function(name){
	return '3 Wise Men - ' + name;
};

const initSession = function (req, res, next){
	if(typeof req.session.lastAnswer === 'undefined'){
		req.session.lastAnswer = {};
	}
	next();
};

const all = [initSession];

app.get('/', all, function(req, res){
	res.render('front', {
		env: env,
		title: title('Start')
	});
});

app.get('/game', all, function(req, res){
	res.render('game', {
		env: env,
		title: title('Visiting the Temple')
	});
});

app.get('/feedback', all, function(req, res){
	sdb.all('feedback', function(allFeedback){
		res.render('feedback', {
			env: env,
			title: title('Feedback'),
			thanks: '',
			feedback: allFeedback
		});
	});
});

app.post('/feedback', all, function(req, res){
	if (req.body.feedback) {
		sdb.add('feedback', req.body.feedback);
	}
	sdb.all('feedback', function(allFeedback){
		res.render('feedback', {
			env: env,
			title: title('Feedback'),
			thanks: 'Thanks a lot for taking the time.',
			feedback: allFeedback
		});
	});
});

app.get('/credits', all, function(req, res){
	res.render('credits', {
		env: env,
		title: title('Credits')
	});
});

app.get('/dev', all, function(req, res){
	res.render('dev', {
		env: env,
		title: title('dev')
	});
});

app.post('/question/:who', all, function(req, res){
	try {
		if (!req.body.question || !req.body.question.input) {
			return res.status(400).send({error: 'Question input is required'});
		}

		const question = req.body.question.input = req.body.question.input.toLowerCase().trim();
		console.log('question for ' + req.params.who + ': ' + question);

		questions.match(req.session.lastAnswer, question, function(answer){
			if(answer === null){
				questions.match(req.params.who, question, function(answer){
					if(answer === null){
						questions.add(req.params.who + '_open', {input: question });
						res.send({out: 'I don\'t have an answer, but ' + secretphrase});
					}else{
						req.session.lastAnswer = answer;
						res.send(answer);
					}
				});
			}else{
				req.session.lastAnswer = answer;
				res.send(answer);
			}
		});
	} catch (error) {
		console.error('Error in /question/:who:', error);
		res.status(500).send({error: 'Internal server error'});
	}
});

app.post('/answer/:who', all, function(req, res){
	try {
		if (!req.body.answer || !req.body.input) {
			return res.status(400).send({error: 'Answer and input are required'});
		}

		console.log('answer: ' + req.body.answer);
		questions.remove(req.params.who + '_open', req.body.input);
		questions.add(req.params.who, req.body.answer);
		res.redirect('/open_question/' + req.params.who);
	} catch (error) {
		console.error('Error in /answer/:who:', error);
		res.status(500).send({error: 'Internal server error'});
	}
});

app.get('/open_question/:who', all, function(req, res){
	try {
		questions.getRandom('open_' + req.params.who, function(entry){
			res.send(entry);
		});
	} catch (error) {
		console.error('Error in /open_question/:who:', error);
		res.status(500).send({error: 'Internal server error'});
	}
});

questions.filter(function(answer){
	answer.words = answer.input.split(' ');
	return answer;
});

// Error handling middleware
app.use(function(req, res, next) {
	res.status(404).render('error', {
		env: env,
		title: title('Not Found'),
		message: 'Page not found'
	});
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(err.status || 500).render('error', {
		env: env,
		title: title('Error'),
		message: err.message || 'Internal server error'
	});
});

const PORT = process.env.PORT || 10689;
const server = app.listen(PORT, function() {
	console.log('3 Wise Men server listening on port ' + PORT);
	console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
	console.log('Visit http://localhost:' + PORT);
});

module.exports = app;