var fs = require('fs');
var path = __dirname+'/sdb/';
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
				  collections[collection] = [];
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
		fs.writeFile(path+collection+ext, JSON.stringify(collections[collection]),function (err) {
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

module.exports.find = function(collection, id, callback){
	search(collection, id, function(cl, entry, index){
		
		if(typeof callback === 'function'){
			entry = filter(collection, 'add', entry);
			callback(entry, collection, index);
		}
	});
};
module.exports.add = function(collection, entry, callback){
	load(collection, function(cl){
		entry = filter(collection, 'add', entry);
		entry.id = cl.length;
		cl.push(entry);
		save(collection);
		if(typeof callback === 'function'){
			callback(entry, entry.id);
		}
	});
};
module.exports.remove = function(collection, id, callback){
	search(collection, id, function(cl, found, index){
		if(index>=0){
			cl.splice(index, 1);
			if(typeof callback === 'function'){
				callback('success');
			}
		}else{
			if(typeof callback === 'function'){
				callback('fail', new Error('not found'));
			}
		}
	});
};

module.exports.filter = function(fn, options){
	options.collection = options.collection || 'all';
	options.event = options.event || 'add';
	
	filters[options.event][options.collection] = fn;
};