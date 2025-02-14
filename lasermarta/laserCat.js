//------------//
//System Setup//
//------------//
(function() {
	//var stats = new Stats();
	//stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	//document.body.appendChild(stats.dom);
	var c = document.getElementById("canvas");
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	var width = c.width, height = c.height;
	var ctx = c.getContext("2d");
	//---------//
	//starField//
	//---------//
	var starNumberModifier,
	    starNumber,
	    starSpeed,
	    dirX,
	    dirY,
	    oldX,
	    oldY,
	    stars,
	    mouseCoords;
	stars = [];
	starSpeed = 0.0025;
	starNumberModifier = 0.1;
	starNumber = width * height / 1200 * starNumberModifier;
	mouseCoords = {
		x: 0,
		y: 0
	};
	dirX = width / 2;
	dirY = height / 2;
	//describe initial starField state and execute prior to animating starField
	function starFieldInit() {
		for (var x = 0; x < starNumber; x++) {
			stars[x] = {
				x: range(0, width),
				y: range(0, height),
				size: range(0, 4)
			};
		}
	}
	starFieldInit();
	function starField() {
		//iterate over stars
		for (var x = 0; x < starNumber; x++) {
			// save old star coordinates
			oldX = stars[x].x;
			oldY = stars[x].y;

			// calculate changes to star
			stars[x].x += (stars[x].x - dirX) * stars[x].size * starSpeed;
			stars[x].y += (stars[x].y - dirY) * stars[x].size * starSpeed;
			stars[x].size += starSpeed * 5;

			// if star is out of bounds, reset
			if (
				stars[x].x < 0 ||
				stars[x].x > width ||
				stars[x].y < 0 ||
				stars[x].y > height
			) {
				stars[x] = {
					x: range(0, width),
					y: range(0, height),
					size: 0
				};
			}
			//draw stars
			ctx.strokeStyle = "rgba(255, 255, 255, " + Math.min(stars[x].size, 1) + ")";
			ctx.lineWidth = stars[x].size;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(oldX, oldY);
			ctx.lineTo(stars[x].x, stars[x].y);
			ctx.stroke();
		}
	}

	//---------------------------//
	//Game (Mechanics) and assets//
	//---------------------------//
	var cat, rat, ratBoxW, ratBoxH, delta, laserHit, laserHitImage, deathSplode,
	    deathSplodeImage, fx, score, degrees, sprites, enemies;
	score = 0;
	degrees = 0;
	sprites = [];
	enemies = [];
	fx = [];
	ratBoxW = 100;
	ratBoxH = 104;
	
	var h, op, rOpOut, rOpCore, rOpIn, rG, rB, laserL, laserR, deg, EyeL, EyeR;

	//sprite function for particle/laser effect on enemy hit
	function Sprite(options) {
		var that = {},
		    frameIndex = 0,
		    tickCount = 0,
		    ticksPerFrame = options.ticksPerFrame || 0,
		    numberOfFrames = options.numberOfFrames || 1;
		that.ctx = options.ctx;
		that.width = options.width;
		that.height = options.height;
		that.x = 0;
		that.y = 0;
		that.image = options.image;
		that.scaleRatio = 1;
		that.loop = options.loop;
		that.opacity = options.opacity || 1;

		that.update = function() {
			//defining parameters for sprite update function
			tickCount += 1;
			if (tickCount > ticksPerFrame) {
				tickCount = 0;
				// If the current frame index is in range
				if (frameIndex < numberOfFrames - 1) {
					// Go to the next frame
					frameIndex += 1;
				} else if (that.loop) {
					frameIndex = 0;
				}
			}
		};
		//defining parameters for sprite draw function
		that.render = function() {
			ctx.save();
			ctx.globalAlpha = that.opacity;
			that.ctx.drawImage(
				that.image,
				frameIndex * that.width / numberOfFrames,
				0,
				that.width / numberOfFrames,
				that.height,
				that.x,
				that.y,
				that.width / numberOfFrames * that.scaleRatio,
				that.height * that.scaleRatio
			);
			ctx.restore();
		};
		//let it know how wide the frames are within the spritemap
		that.getFrameWidth = function() {
			return that.width / numberOfFrames;
		};
		return that;
	}
	//defining image object and sprite options for animated sprite object 
	//on enemy hit and death, respectively;
	laserHitImage = new Image();
	laserHitImage.src =
		"laserHitpx.png";
	laserHit = Sprite({
		ctx: c.getContext("2d"),
		width: 1500,
		height: 100,
		image: laserHitImage,
		numberOfFrames: 15,
		ticksPerFrame: 4,
		scaleRatio: 1,
		loop: false
	});
	deathSplodeImage = new Image();
	deathSplodeImage.src =
		"deathsplosion.png";
	deathSplode = Sprite({
		ctx: c.getContext("2d"),
		width: 17920,
		height: 256,
		image: deathSplodeImage,
		numberOfFrames: 70,
		ticksPerFrame: 4,
		scaleRatio: 1,
		loop: false
	});
	//creating enemy object (defaults to rat imgsrc)
	function Enemy(name, imgsrc, x, y, width, height, degrees, weapon, health) {
		this.name = name || "Enemy";
		this.image = new Image();
		this.image.src =
			imgsrc ||
			"rat.png";
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 200;
		this.height = height || 216;
		this.degrees = degrees || degrees;
		this.weapon = weapon || false;
		this.health = health || 100;
		this.opacity = health / 100 || 1;
	}
	//creating player object (defaults to cat imgsrc)
	function Player(name, imgsrc, x, y, width, height, weapon, health) {
		this.name = name || "Player";
		this.image = new Image();
		this.image.src = imgsrc || "cat.gif";
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 546;
		this.height = height || 562;
		this.weapon = weapon || false;
		this.health = health || 100;
	}
	cat = new Player(
		"cat",
		"cat.gif",
		width - 546,
		height - 562,
		546,
		562
	);
	//set value in globals to hold the eye coordinates for proper laser positioning/appearance
	eyeL = {
		x: 0,
		y: 0
	};
	eyeL.x = cat.x + cat.width - 322;
	eyeL.y = cat.y + cat.height - 249;
	eyeR = {
		x: 0,
		y: 0
	};
	eyeR.x = cat.x + cat.width - 179;
	eyeR.y = cat.y + cat.height - 227;
	//assign x,y to laserL and R for holding current laser position on fire.
	laserL = {
		x: 0,
		y: 0
	};
	laserR = {
		x: 0,
		y: 0
	};

	//---------------//
	//event listeners//
	//---------------//
	//mousemove for starField offset
	c.onmousemove = function(event) {
		dirX = c.width - event.offsetX;
		dirY = c.height - event.offsetY;
	};
	//click for laser targeting
	c.addEventListener("click", function(e) {
		mouseCoords.x = e.pageX;
		mouseCoords.y = e.pageY;
		cat.weapon.trigger();
	});

	//---------//
	//Main Loop//
	//---------//
	function animate() {
		//stats.begin();
		degrees = (degrees + 1) % 360;
		//render() (called below) is the main update function--
		//a few functions "draw" outside of render(); but
		//everything should clearRect via this function.
		render();
		//stats.end();
		requestAnimationFrame(animate);
	}
	//defining function responsible for hit detection
	function hitTest(x1, y1, w1, h1, x2, y2) {
		//x1, y1 = x and y coordinates of object 1
		//w1, h1 = width and height of object 1
		//x2, y2 = x and y coordinates of object 2 (usually midpt)
		if (x1 <= x2 && x1 + w1 >= x2 && (y1 <= y2 && y1 + h1 >= y2)) 
			return true;
		else return false;
	}
	//helper function for tying enemy health property to modified output from the
	//"degrees" counter determining the speed at which enemies blink when hit.
	//Since this is also inside of "animate", "degrees" is still in scope.
	function oscillOpacity(enemyhealth, degrees) {
		deg = degrees % (Math.PI * 6);
		h = 1 - enemyhealth / 100;
		op = 0.5 * Math.cos(h * deg) + 0.5;
		return Math.max(0.2, op);
	}
	//--------------------//
	//Main Update Function//
	//--------------------//
	//(increments animations for each frame requested within animate();)
	function render() {
		//clear context before each update
		ctx.clearRect(0, 0, c.width, c.height);
		//rendering starField update/drawing stars first so it appears in background
		starField();
		//draw cat player object at default positions
		ctx.drawImage(cat.image, cat.x, cat.y);
		//begin querying enemy array for length to check spawn conditions
		if (enemies.length <= 0) {
			var newRat = new Enemy();
			newRat.x = Math.floor(Math.random() * (width / 1.8));
			newRat.y = -104;
			//newRat.health = 100;
			enemies.push(newRat);
		}
		//set default enemy movement/increment y to simulate enemies "falling"
		for (var i = 0; i < enemies.length; i++) {
			var enemy = enemies[i];
			
			enemy.y = enemy.y + 6;
			enemy.degrees = degrees;
			//check to see if they have fallen out of view-->remove if so
			if (enemy.y > c.height || enemy.x < -100 || enemy.x > width) {
				enemies.splice(i, 1); score = score-1
			}
			//include weapon firing conditions/drawing updates PRIOR to...
			//drawing enemies to achieve proper appearance during gameplay...
			//should appear in this order back-front: cat-->laser-->mouse
			if (cat.weapon.active) {
				cat.weapon.fire(laserL, laserR);
				//defining collision detection and outcome(s) if true
				if (
					hitTest(
						enemy.x,
						enemy.y,
						ratBoxW,
						ratBoxH,
						cat.weapon.l1c.x,
						cat.weapon.l2c.y
					)
				) {
					enemy.health = enemy.health - cat.weapon.damage;
					degrees = degrees - 3;
					enemy.y = enemy.y - 4;
					enemy.x = enemy.x;
					laserHit.x = enemy.x - 25;
					laserHit.y = enemy.y - 30;
					laserHit.scaleRatio = 1.5;
					laserHit.render();
					laserHit.update();
				}
				//now we can define conditionals that hinge on the outcomes 
				//of hitTest re:health and other properties
				if (enemy.health < 100 && enemy.health > 0) {
				//ties opacity to remaining health so that less health means 						//faster blinking rate from (.25,1) respectively (ratio)
					enemy.opacity = oscillOpacity(enemy.health, degrees);
				}
				//check enemy health and remove from array if <=0, 
				//define explosion effect/sprites and spawn locations
				//on enemy array splice
				if (enemy.health <= 0) {
					for (var z = 0; z < 3; z++) {
						var newFx = new Sprite({
							ctx: c.getContext("2d"),
							width: 17920,
							height: 256,
							image: new Image(),
							numberOfFrames: 70,
							ticksPerFrame: 0.95,
							scaleRatio: 1,
							loop: false
						});
						newFx.image.src ="deathsplosion.png";
						newFx.x =	enemy.x - getRandomIntInc(180, 220);
						newFx.y =	enemy.y - getRandomIntInc(200, 240);
						newFx.scaleRatio = range(1.6, 2.01);
						newFx.opacity = 0;
						//newRat.health = 100;
						fx.push(newFx);
					}
					enemies.splice(i, 1);
					// git ye some score, bro
					score++;
				}
				for (var i = 0; i < fx.length; i++) {
					var thisFx = fx[i];
					thisFx.opacity = 0.5;
					// var xDist = thisFx.x - enemy.x;
					// var yDist = thisFx.y - enemy.y;
					// var Dist = 
					// Math.sqrt(xDist*xDist + yDist*yDist);
					// thisFx.x = thisFx.x + getRandomIntInc(0, 2);
					// thisFx.y = thisFx.y + getRandomIntInc(0, 2);
					// if (Dist >= 400){
					//   fx.splice(i,1);
					// }
					if (
						thisFx.y > c.height ||
						thisFx.x <= -200 ||
						thisFx.x > c.width+200 ||
						thisFx.frameIndex >= 70 ||
						thisFx.opacity <= 0
					) {
						fx.splice(i, 1);
					}
					// if ((enemy.y > c.height) || (enemy.x < -100) 
					//|| (enemy.x> width)) {
					//     fx.splice(0, fx.length);
					// }
					thisFx.x++;
					thisFx.y = thisFx.y + 3;
					thisFx.opacity = 
						thisFx.opacity - range(0.005, 0.02);

					thisFx.render();
					thisFx.update();
				}
			}
			//finally draw after all rat... er... that
			drawRats(
				enemy.image,
				ratBoxW,
				ratBoxH,
				enemy.x,
				enemy.y,
				enemy.degrees,
				enemy.opacity
			);
		}
		//draw the score after updating on enemy kill (@ 0 health)
		ctx.fillStyle = "white";
		ctx.font = "48px sans-serif";
		ctx.fillText(score, width - 60, 60);
	}

	//--------------------------//
	//Helper/Secondary Functions//
	//--------------------------//
	//random number (including non-integers) given range
	function range(start, end) {
		return Math.random() * (end - start) + start;
	}
	//inclusive random integer selection given range
	function getRandomIntInc(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	//copying global values for proper weapon behavior to newly created cat 
	//player object on canvas
	cat.weapon = {
		type: "laser",
		speed: 0.05,
		active: false,
		l1s: {
			// laser 1 start {x,y}
			x: eyeL.x,
			y: eyeL.y
		}, // laser 2 start {x,y}
		l2s: {
			x: eyeR.x,
			y: eyeR.y
		}, // laser 1 current position {x,y}
		l1c: {
			x: 0,
			y: 0
		}, // laser 2 current position {x,y}
		l2c: {
			x: 0,
			y: 0
		},
		damage: 10,
		opacity: 1
	};
	//letting our hitTest function know when to run
	cat.weapon.trigger = function() {
		cat.weapon.speed = 0.05;
		cat.weapon.active = true;
	};
	cat.weapon.fire = function(laserL, laserR) {
		cat.weapon.speed += 0.05;
		if (cat.weapon.speed > 1) cat.weapon.speed = 1;

		//var to get random value between 0 and 1 for opacity to simulate flicker
		rOpOut = range(0, 0.5);
		rOpCore = range(0.5, 1);
		rOpIn = range(0.2, 0.5);
		rG = getRandomIntInc(200, 255);
		rB = getRandomIntInc(180, 255);

		//here are our lerp maths to calculate where the next node will be stroked,
		//c in l1c, l2c stands for "current" which is useful in understanding how 
		//strokes are animated.
		cat.weapon.l1c.x =
			cat.weapon.l1s.x + (mouseCoords.x - cat.weapon.l1s.x) * cat.weapon.speed;
		cat.weapon.l1c.y =
			cat.weapon.l1s.y + (mouseCoords.y - cat.weapon.l1s.y) * cat.weapon.speed;
		cat.weapon.l2c.x =
			cat.weapon.l2s.x + (mouseCoords.x - cat.weapon.l2s.x) * cat.weapon.speed;
		cat.weapon.l2c.y =
			cat.weapon.l2s.y + (mouseCoords.y - cat.weapon.l2s.y) * cat.weapon.speed;

		//assign above valuations to laserL and laserR for shorthand
		laserL.x = cat.weapon.l1c.x;
		laserL.y = cat.weapon.l1c.y;
		laserR.x = cat.weapon.l2c.x;
		laserR.y = cat.weapon.l2c.y;
		//pass appropriate values to laser layer drawings
		laserOuter(laserL, laserR, rOpOut);
		laserCore(laserL, laserR, rG, rB, rOpCore);
		laserInner(laserL, laserR, rOpIn);
	};
	//define each layer drawn on laser fire
	function laserCore(laserL, laserR, rG, rB, rOpCore) {
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.lineWidth = 12;
		ctx.strokeStyle = "rgba(255," + rG + ", " + rB + ", " + rOpCore + ")";
		ctx.moveTo(cat.weapon.l1s.x, cat.weapon.l1s.y);
		ctx.lineTo(laserL.x, laserL.y);
		ctx.moveTo(cat.weapon.l2s.x, cat.weapon.l2s.y);
		ctx.lineTo(laserR.x, laserR.y);
		ctx.stroke();
		ctx.closePath();
	}

	function laserInner(laserL, laserR, rOpIn) {
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.lineWidth = 35;
		ctx.strokeStyle = "rgba(255, 80, 80, " + rOpIn + ")";
		ctx.moveTo(cat.weapon.l1s.x, cat.weapon.l1s.y);
		ctx.lineTo(laserL.x, laserL.y);
		ctx.moveTo(cat.weapon.l2s.x, cat.weapon.l2s.y);
		ctx.lineTo(laserR.x, laserR.y);
		ctx.stroke();
		ctx.closePath();
	}

	function laserOuter(laserL, laserR, rOpOut) {
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.lineWidth = 25;
		ctx.strokeStyle = "rgba(255, 0, 0, " + rOpOut + ")";
		ctx.moveTo(cat.weapon.l1s.x, cat.weapon.l1s.y);
		ctx.lineTo(laserL.x, laserL.y);
		ctx.moveTo(cat.weapon.l2s.x, cat.weapon.l2s.y);
		ctx.lineTo(laserR.x, laserR.y);
		ctx.stroke();
		ctx.closePath();
	}
	//rat (enemy) animator/updater function
	function drawRats(imgsrc, ratBoxW, ratBoxH, xPos, yPos, degrees, opacity) {
		//define the rat's path (for future implementation)
		// xPos = canvas.width-200 + -Math.cos(.05*delta) * canvas.width;
		// yPos = canvas.height/4 + Math.sin(.1*delta) * (canvas.height/4);
		//save context before applying rotation (we have to save here because we need to
		//adjust context dimensions to animate rotation--see below)
		ctx.save();
		ctx.globalAlpha = opacity;
		//increment degrees using the animation loop%360 and inform rotation by this value
		ctx.translate(xPos + ratBoxW / 2, yPos + ratBoxH / 2);
		ctx.rotate(degrees * Math.PI / 180);
		//since we are animating the ROTATION of a regular rectangle, 
		//we know we have to double the context area to account for 
		//added x-width during rotation, otherwise we'll cut off 
		//some of the sprite during each revolution
		ctx.drawImage(
			imgsrc,
			0,
			0,
			ratBoxW,
			ratBoxH,
			-ratBoxW / 2,
			-ratBoxH / 2,
			ratBoxW,
			ratBoxH
		);
		ctx.rotate(-degrees * Math.PI / 180);
		ctx.translate(-xPos - ratBoxW / 2, -yPos - ratBoxH / 2);
		ctx.restore();
	}
	//re-set important variables on resize event relative to the new canvas size
	function resizeCanvas() {
		//reset the canvas dimensions first.
		c.width = window.innerWidth;
		c.height = window.innerHeight;
		width = c.width;
		height = c.height;
		cat.x = width - cat.width;
		cat.y = height - cat.height;
		eyeL.x = cat.x + cat.width - 322;
		eyeL.y = cat.y + cat.height - 248;
		eyeR.x = cat.x + cat.width - 179;
		eyeR.y = cat.y + cat.height - 227;
		cat.weapon.l1s.x = eyeL.x;
		cat.weapon.l1s.y = eyeL.y;
		cat.weapon.l2s.x = eyeR.x;
		cat.weapon.l2s.y = eyeR.y;
		//make sure the starField function knows how big...
		//the new canvas is by re-calling starFieldInit();
		starFieldInit();
		render();
	}
	animate();
	window.addEventListener("resize", resizeCanvas, false);
})();

