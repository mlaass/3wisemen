require(['jo/jo', 'jo/Game','jo/Camera', 'jo/Animation'], 
		function(jo, Game, Camera, Animation){	
	//one global variable to rule them all very useful with the firebug console
	$jo=jo;
	
	//the game object needs id of the canvas 
	var game = jo.game = new Game({ name: '#canvas', fullscreen: true, fps: 30});
	game.setup(function(){
		//preloading of the files we need
		game.load(['/img/logo.png',
		           '/img/player.png',
		           '/img/red_monk_small.png',
		           '/img/black_monk_small.png',
		           '/img/blue_monk_small.png',
		           '/img/enso.png']);		
		game.cam = new jo.Camera(0,0);				
	});

	game.ready(function(){
		game.state = 'start';
		game.enso ={
				pos: jo.point(jo.screen.width/2,87)
		};
		game.player = {
			player: true,
			pos: new jo.Point(jo.screen.width/2, jo.screen.height-174),
			img: new Animation([1,2,3,4], 64, 128, jo.files.img.player),
			draw:  function(){
				game.player.img.draw({pivot:'center'}, game.player.pos, jo.screen);
			}
		};
		game.monks = [{
		    	name:'black',
		    	pos: jo.point(jo.screen.width/2,174),
		    	img: jo.files.img.black_monk_small
	    	},
	    	{
	    		name:'red',
		    	pos: jo.point(jo.screen.width/2 +200,400),
		    	img: jo.files.img.red_monk_small
	    	},
	    	{
	    		name:'blue',
		    	pos: jo.point(jo.screen.width/2 -200,400),
		    	img: jo.files.img.blue_monk_small
	    	},
	    	game.player];
		
		game.monks.draw =function(){
			game.monks.sort(function(a,b){
				return a.pos.y - b.pos.y;
			});
			
			for(var i = 0; i < game.monks.length; i++){
				if(!game.monks[i].player){
					game.monks[i].img.draw({pivot:'center'}, game.monks[i].pos.plus(jo.point(0,17)), jo.screen);
				}else{
					game.monks[i].img.draw({pivot:'center'}, game.monks[i].pos, jo.screen);
					
				}
			}
		};
		game.monks.check =function(){
			for(var i =0; i< game.monks.length; i++){
				if(!game.monks[i].player){
					var d = game.player.pos.minus(game.monks[i].pos);
					var l = d.length();
					if(l< 74){
						game.monks.talk(game.monks[i].name, game.monks[i]);
						var dist=47;
						if(l <dist){
							d.multiply(1/l);
							d.multiply(dist-l);
							game.player.pos.add(d);
						}
					}
				}
		
			}
			if(game.player.pos.y< 160){
				game.player.pos.y= 160;
			}
		};
		game.monks.talk = function(name, monk){
			if(!monk.talking){
				game.head = monk.head;
				$('#speech').html('Hello, what is your question?');
				
				$('#talk-form').attr('action','/question/'+name);
				$('#question-input').focus();
				jo.input.clearKeys();
				monk.talking=true;
			}
		};
	});
	
	//main game loop
	game.OnUpdate(function(ticks){
		var sp=4;
		 if(jo.input.k('UP')){
			 game.player.pos.y-=sp;
			 game.player.img.frame=1;
		 }
		 if(jo.input.k('DOWN')){
			 game.player.pos.y+=sp;
			 game.player.img.frame=0;
		 }
		 if(jo.input.k('LEFT')){
			 game.player.pos.x-=sp;
			 game.player.img.frame=2;
		 }
		 if(jo.input.k('RIGHT')){
			 game.player.pos.x+=sp;
			 game.player.img.frame=3;
		 }
		 game.monks.check();

	});
	game.editControls= function(){
		//player.pos.copy(game.cam.toWorld(jo.input.mouse));
		if(jo.input.k('D') ){
			jo.log(game.map.data);
		}
		if(jo.input.once('P') ){
			var lvl = game.saveLevel();
			jo.log(lvl.json);
		}

		if(jo.input.k('CTRL')|| jo.input.k('ALT')){

			 if(jo.input.k('UP')){
				 game.player.pos.y-=2;
				 game.player.img.frame=2;
			 }
			 if(jo.input.k('DOWN')){
				 game.player.pos.y+=2;
				 game.player.img.frame=1;
			 }
			 if(jo.input.k('LEFT')){
				 game.player.pos.x-=2;
			 }
			 if(jo.input.k('RIGHT')){
				 game.player.pos.x+=2;
			 }
		}
		if(jo.input.once('TAB')){
			game.tileBrush = (game.tileBrush+1)%game.map.tileSet.tiles.length;
		}
		if(jo.tool==='pick'){
			if(jo.input.once('MOUSE1')){
				for(var i in game.objects){
					if(m2d.intersect.pointBox( game.cam.toWorld(jo.input.mouse), game.objects[i])){
						game.sb.select = game.selection= i;
						
						game.sb.fillInspector();
					}
				}
			}else if(jo.input.k('MOUSE1') ){
				if(game.selection){
					game.objects[game.selection].pos.copy(game.cam.toWorld(jo.input.mouse));
				}
			 }else{
				 game.selection=false;
			 }
		}
		
		if(jo.tool==='drag'){
			 if(jo.input.k('MOUSE1') ){
				game.cam.subtract(jo.input.mouseMovement());
			 }
		}
		if(jo.tool==='tile'){
			if(jo.input.k('MOUSE1')){
				var p=game.cam.toMap(jo.input.mouse);
				game.map.put(p.x, p.y, {index: game.tileBrush});
			}
			if(jo.input.k('MOUSE2')){
				var p=game.cam.toMap(jo.input.mouse);
				game.map.put(p.x, p.y, {index: -1});
			}
		}
	};
	var caption = function(msg){
		jo.screen.text({align: 'center', fill: 'white', stroke: 0}, jo.point(jo.screen.width/2, jo.screen.height/2), msg);
	};
	
	//main drawing loop get called after each update
	game.OnDraw(function() {
		jo.screen.clear(jo.color(0,0,0));
		//caption('start');
		jo.files.img.enso.draw({pivot:'center'}, game.enso.pos, jo.screen);
		game.monks.draw();
		jo.files.img.logo.draw({pivot:'center'}, jo.point(jo.screen.width-48,jo.screen.height-48), jo.screen);
		//game.player.draw();
	});	
	
});