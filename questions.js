var mongoose = require('mongoose'),
	crypto = require('crypto'),
	redis = require('redis');

var Schema = mongoose.Schema,
	QuestionSchema, 
	Question,
	rediscli = redis.createClient();

var cleanQuestion = function(text){
	return text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
};

QuestionSchema = new Schema({
	'input': {type: String},
	'question': {type: String, index: {unique:true}},
	'random': {type: Number, 'default': Math.random},
	'answer': {type: String, 'default': '__not__' },
	'date': {type: Date, 'default': Date.now},
	'domain': {type: String, enum:['red', 'black', 'blue'], index:true}
});

QuestionSchema.pre('save', function(next) {	
	this.question = cleanQuestion(this.input);	
	next();
});
mongoose.model('Question', QuestionSchema);

module.exports.Question = Question = mongoose.model('Question');


module.exports.getRandom = function(domain, fn){
	var rnd = Math.random();
	Question.findOne({answer: '__not__', domain: domain, random: {'$gt':rnd}}, function(err, result){
		if(!result){
			Question.findOne({answer: '__not__', domain: domain, random: {'$lt': rnd}}, function(err, result){
				if(!result){
					result = {input: 'No more open questions!', over: true};
				}
				fn(result);
			});
		}else{
			fn(result);
		}
	});
};
module.exports.answer = function(question, fn){
	Question.findOne({question: question.question}, function(err, result){
		if(result){
			result.answer = question.answer;
			Question.update(result, fn);
			console.log('update');
		}else{
			fn();
		}
		
	});
};
module.exports.post = function(question, fn){
	var q = cleanQuestion(question.input);
	Question.findOne({domain: question.domain, question: q}, function(err, result){
		
		if(!result){
			var quest = new Question(question);
			quest.save();
			fn(false);
		}else if(result.answer === '__not__'){
			fn(false);
		}else{
			fn(result);
		}
	});
};
if(process.env.NODE_ENV !== 'production'){
	mongoose.connect('mongodb://localhost:27017/threewisemen');
}else{
	//TODO: enter correct mongodb connection
	mongoose.connect('mongodb://localhost:27017/threewisemen');
}