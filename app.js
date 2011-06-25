
var express = require('express'), sys = require('sys'), fs = require('fs'),
app = express.createServer();

var sdb = require('./sdb');

app.configure(function(){    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'I think we can work something out...' }));
    app.use(app.router);

});

app.configure('development', function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/static', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.set('view engine', 'jade');

var title= function(name){
	return '3 Wise Men - '+name;
};
var initSession = function (req, res, next){
	next();
};
var all = [initSession];

app.get('/', all, function(req, res){
	res.render('front', {locals: {
		title: title('Start')
	}});
});
app.get('/game', all, function(req, res){
	res.render('game', {locals: {
		title: title('Visiting the Temple')
	}});
});
app.get('/feedback', all, function(req, res){
	res.render('feedback', {locals: {
		title: title('Feedback')
	}});
});
app.get('/credits', all, function(req, res){
	res.render('credits', {locals: {
		title: title('Credits')
	}});
});

app.listen(10689);