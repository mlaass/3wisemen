var fs = require('fs');
var path = __dirname+'/sdb/';
var ext ='.json';
var collections = {};

module.exports.root = collections;

var load = function(collection, callback){
	if(typeof collections[collection] === 'undefined'){
		fs.readFile(path+collection+ext, function (err, data) {
			  if (err){
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
		var p1 = Math.min(id, cl.length-1);
		var dir = (cl[p1].id > id)? -1: 1;

		for(var i = p1; i >= 0 && i < cl.length; i+= dir){
			if(cl[i].id === id){
				found = cl[i];
				index = i;
				i = -1;
			}
		}
		if(typeof callback === 'function'){
			callback(cl, found, index);
		}
	});
};

module.exports.find = function(collection, id, callback){
	search(collection, id, function(cl, found, index){
		if(typeof callback === 'function'){
			callback(found);
		}
	});
};
module.exports.add = function(collection, entry, callback){
	load(collection, function(cl){
		entry.id = cl.length;
		cl.push(entry);
		save(collection);
		if(typeof callback === 'function'){
			callback(entry);
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