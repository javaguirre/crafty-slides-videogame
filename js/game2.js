window.onload = function() {
	var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var TILE_SIZE = 16;
    console.log(WIDTH+" "+HEIGHT+" "+TILE_SIZE);
	// Initialize Crafty
	Crafty.init(WIDTH, HEIGHT);
	Crafty.canvas.init();
	
	//turn the sprite map into usable components
	Crafty.sprite(16, "../images/bananabomber-sprites.png", {
	    grass1: [0, 0],
	    grass2: [1, 0],
	    grass3: [2, 0],
	    grass4: [3, 0],
	    flower: [0, 1],
	    bush1: [0, 2],
	    bush2: [1, 2],
	    player: [0, 3],
	    enemy: [0, 3],
	    banana: [4, 0],
	    empty: [4, 0]
	});
	
	//method to randomy generate the map
	function generateWorld() {
		var x_tiles = Math.floor(WIDTH/TILE_SIZE);
		var y_tiles = Math.floor(HEIGHT/TILE_SIZE);
		console.log(x_tiles+" "+y_tiles);
		/*
		//generate the grass along the x-axis
		for(var i = 0; i < x_tiles; i++) {
			//generate the grass along the y-axis
			for(var j = 0; j < y_tiles; j++) {
				
				grassType = Crafty.math.randomInt(1, 4);
				Crafty.e("2D, Canvas, grass"+grassType)
					.attr({x: i * 16, y: j * 16});
				
				//1/50 chance of drawing a flower and only within the bushes
				if(i > 2 && i < (x_tiles-1) && j > 0 && j < (y_tiles-2) && Crafty.math.randomInt(0, 50) > 49) {
					Crafty.e("2D, DOM, flower, solid, SpriteAnimation")
						.attr({x: i * 16, y: j * 16})
						.animate("wind", 0, 1, 3)
						.bind("EnterFrame", function() {
							if(!this.isPlaying())
								this.animate("wind", 80);
						});
				}
				
			}
		}
		*/
		//create the bushes along the x-axis which will form the boundaries
		for(var i = 14; i < (x_tiles-14); i++) {
			Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
				.attr({x: i * TILE_SIZE, y: (2*TILE_SIZE+1), z: 2});
			Crafty.e("2D, DOM, wall_bottom, solid, bush"+Crafty.math.randomInt(1,2))
				.attr({x: i * TILE_SIZE, y: ((y_tiles-2)*TILE_SIZE), z: 2});
		}
		
		//create the bushes along the y-axis
		//we need to start one more and one less to not overlap the previous bushes
		for(var i = 3; i < (y_tiles-2); i++) {
			Crafty.e("2D, DOM, wall_left, solid, bush"+Crafty.math.randomInt(1,2))
				.attr({x: 14*TILE_SIZE, y: i * TILE_SIZE, z: 2});
			Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
				.attr({x: ((x_tiles-15)*TILE_SIZE), y: i * TILE_SIZE, z: 2});
		}
	}
	
	//the loading screen that will display while our assets load
	Crafty.scene("loading", function() {
		//load takes an array of assets and a callback when complete
		Crafty.load(["../images/bananabomber-sprites.png", "../sounds/golpe.mp3", "../sounds/salto.mp3", "../sounds/tortuga.mp3"], function () {
			Crafty.scene("main"); //when everything is loaded, run the main scene
		});
		
		//black background with some loading text
		//Crafty.background("#000");
		Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
			.text("Loading")
			.css({"text-align": "center"});
	});
	
	//automatically play the loading scene
	Crafty.scene("loading");
	
	Crafty.scene("main", function() {
		generateWorld();
		
		//load audio data
		Crafty.audio.add("golpe", "../sounds/golpe.mp3");
		Crafty.audio.add("salto", "../sounds/salto.mp3");
		Crafty.audio.add("tortuga", "../sounds/tortuga.mp3");
		
		Crafty.c('Hero', {
			init: function() {
					//setup animations
					this.requires("SpriteAnimation, Collision")
					.animate("walk_left", 6, 3, 8)
					.animate("walk_right", 9, 3, 11)
					.animate("walk_up", 3, 3, 5)
					.animate("walk_down", 0, 3, 2)
					//change direction when a direction change event is received
					.bind("NewDirection",
						function (direction) {
							if (direction.x < 0) {
								if (!this.isPlaying("walk_left"))
									this.stop().animate("walk_left", 10, -1);
							}
							if (direction.x > 0) {
								if (!this.isPlaying("walk_right"))
									this.stop().animate("walk_right", 10, -1);
							}
							if (direction.y < 0) {
								if (!this.isPlaying("walk_up"))
									this.stop().animate("walk_up", 10, -1);
							}
							if (direction.y > 0) {
								if (!this.isPlaying("walk_down"))
									this.stop().animate("walk_down", 10, -1);
							}
							if(!direction.x && !direction.y) {
								this.stop();
							}
					})
					// A rudimentary way to prevent the user from passing solid areas
					.bind('Moved', function(from) {
						if(this.hit('solid')){
							this.attr({x: from.x, y:from.y});
							Crafty.audio.play("tortuga");
						}
					})
					
					.bind('Click', function(){
						Crafty.audio.play("salto");
					});
				return this;
			}
		});

		Crafty.c("RightControls", {
			init: function() {
				this.requires('Multiway');
			},

			rightControls: function(speed) {
				this.multiway(speed, {W: -90, S: 90, D: 0, A: 180})
				return this;
			}

		});
		
		//create our player entity with some premade components
		player = Crafty.e("2D, Canvas, player, RightControls, Hero, Animate, Collision")
			.attr({x: WIDTH/2, y: HEIGHT/2, z: 1})
			.rightControls(1);
	});
	
};