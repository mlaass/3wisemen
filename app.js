
var express = require('express'), sys = require('sys'), fs = require('fs'),
app = express.createServer();

//environement for google analytics and the like
var env ={googa: ''};
var sdb= require('./sdb');
var questions = require('./questions');
var secretphrase = 'I think we can work something out...';


app.configure(function(){    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: secretphrase }));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    env.googa = 'dev = true;';
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/static', { maxAge: oneYear }));
  app.use(express.errorHandler());
  fs.readFile(__dirname + '/googa', function(err, data){
	 env.googa = data; 
  });
});

app.set('view engine', 'jade');

var title= function(name){
	return '3 Wise Men - '+name;
};
var initSession = function (req, res, next){
	if(typeof req.session.lastAnswer==='undefined'){
		req.session.lastAnswer = {};
	}
	next();
};
var all = [initSession];

app.get('/', all, function(req, res){
	res.render('front', {locals: {
		env: env, 
		title: title('Start')
	}});
});
app.get('/game', all, function(req, res){
	res.render('game', {locals: {
		env: env, 
		title: title('Visiting the Temple')
	}});
});
app.get('/feedback', all, function(req, res){
	sdb.all('feedback', function(all){
		res.render('feedback', {locals: {
			env: env, 
			title: title('Feedback'),
			thanks: '',
			feedback: all
		}});
	});
});
app.post('/feedback', all, function(req, res){	
	sdb.add('feedback', req.body.feedback);
	sdb.all('feedback', function(all){
		res.render('feedback', {locals: {
			env: env, 
			title: title('Feedback'),
			thanks: 'Thanks a lot for taking the time.',
			feedback: all
		}});
	});
});
app.get('/credits', all, function(req, res){
	res.render('credits', {locals: {
		env: env, 
		title: title('Credits')
	}});
});
app.get('/dev', all, function(req, res){
	res.render('dev', {locals: {
		env: env, 
		title: title('dev')
	}});
});

app.post('/question/:who', all, function(req, res){
	var question = req.body.question.input = req.body.question.input.toLowerCase();
	sys.puts('question for ' + req.params.who+': ' + question);
	
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
});
app.post('/answer/:who', all, function(req, res){
	sys.puts('answer: ' + req.body.answer);
	question.remove(req.params.who + '_open', req.body.input);
	questions.add(req.params.who, req.body.answer);
	res.redirect('/open_question/' + req.params.who);
});

app.get('open_question/:who', all, function(req, res){
	questions.getRandom('open_' + req.params.who, function(entry){
		res.send(entry);
	});
});

questions.filter(function(answer){
	answer.words= answer.input.split(' ');
	return answer;
});

app.listen(10689);