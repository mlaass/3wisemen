var fs = require('fs');
var path = __dirname+'/questions/';
var ext ='.json';
var collections = {};
var filters = {
		add: {},
		find: {}
};

module.exports.root = collections;

var load = function(collection, callback){
	if(typeof collections[collection] === 'undefined'){
		fs.readFile(path+collection+ext, function (err, data) {
			  if (err){
				  //throw err;
				  collections[collection] = {};
			  }else{
				  collections[collection] = JSON.parse(data);
			  }
			  
			  if(typeof callback === 'function'){
				  callback(collections[collection]);				  
			  }

		});
	}else if(typeof callback === 'function'){
		callback(collections[collection]);
	}	
};
module.exports.all = load;

var save = function(collection){
	if(typeof collections[collection] !== 'undefined'){
		fs.writeFile(path+collection+ext, JSON.stringify(collections[collection]), function (err) {
			  if (err){
				  throw(err);
			  }
		});
	}
};
var search = module.exports.search = function(collection, id, callback){
	load(collection, function(cl){
		
		id = parseInt(id, 10);
		if(id < 0){
			throw new Error('id must be bigger than 0');
		}
		var found = null, index = -1;
		for(var i = 0; i < cl.length; i++){
			if(cl[i].id === id){
				found = cl[i];
				index = i;
			}
		}
		if(typeof callback === 'function'){
			callback(cl, found, index);
		}
	});
};

var filter = function(collection, event, entry){
	if(typeof filters[event].all === 'function'){
		entry = filters[event].all(entry);
	}
	if(typeof filters[event][collection] === 'function'){
		entry = filters[event][collection](entry);
	}
	return entry;
};

var address = function(entry){
	return entry.input.split(' ').join();
};
module.exports.add = function(collection, entry, callback){
	load(collection, function(cl){
		entry = filter(collection, 'add', entry);
		var addr = address(entry);
		if(typeof cl[addr] === 'undefined'){
			cl[addr] = entry;		
			save(collection);
			if(typeof callback === 'function'){
				callback(entry, addr);
			}
		}else if(typeof callback === 'function'){
			callback(null, addr);
		}
			
	});
};
module.exports.match = function(where, input, callback){
	var match = function(where, input, callback){
		var addr = address({input: input});
		if(typeof where[addr] !== 'undefined'){
			callback(where[addr]);
		}else{
			callback(null);
		}
	};
	if(typeof where.substr === 'function'){
		load(where, function(all){
			match(all, input, callback);
		});
	}else if(typeof where.sub !== 'undefined'){
		match(where.sub, input, callback);
	}else{
		callback(null);
	}
};
module.exports.remove = function(collection, input, callback){
	var addr = address({input: input});
	if(typeof collection[addr] !== 'undefined'){
		delete collection[addr];
		save(collection);
		callback();
	}else{
		callback(new Error('could not find :'+addr));
	}
};

module.getRandom = function(where, callback){	
	load(collection, function(cl){
		var index=[];
		for(var i in cl){
			index.push(i);
		}
		var a =Math.parseInt(Math.random()*index.length-1, 10);
		a= Math.max(a,0);
		callback(cl[a]);
	});
};

module.exports.filter = function(fn, options){
	options = options || {};
	options.collection = options.collection || 'all';
	options.event = options.event || 'add';
	
	filters[options.event][options.collection] = fn;
};