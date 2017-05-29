var gameArea, label, label_kills;
var area_size = 600;
var field_number = 10;
var field_size = (area_size/field_number);
var game_speed = 200;
var kills = 0, survived_time = 0;

var hero, hero_movement_speed = 10;
var hero_start_pos = 0;
	if (field_number%2 == 0) { hero_start_pos = (area_size/2); }
	else { hero_start_pos = ((area_size/2) - (field_size/2)); }
var hero_position = { x: hero_start_pos, y: hero_start_pos};
var hero_aim_pos = 37;

var zombies = [];

var KEYLEFT = 37, KEYUP = 38, KEYRIGHT = 39, KEYDOWN = 40, KEYSPACE = 32;

var game_status = "play";
var game_zombie_moving;

function random1or2() {
	var minimum = 0, maximum = 1;
	return (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);		
}
function random1_4() {
	var minimum = 0, maximum = 3;
	return (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);	
}

function addHero() {
	hero = $('<img/>').attr("src", "pictures/survivor.png").attr("id", "hero").css({
		position: "absolute",
		width: field_size,
		height: field_size,
		left: hero_start_pos,
		top: hero_start_pos
	}).appendTo(gameArea);
}

function zombieSpawnLocation() {
	var minimum = 0, maximum = 4;
	var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
	return (randomnumber * field_size);
}
function zombieSpawnLocationX(i) {
	if ( i%4 == 0) { return 0; }
	if ( i%4 == 2) { return (area_size-field_size); }
	return zombieSpawnLocation();
}
function zombieSpawnLocationY(i) {
	if ( i%4 == 1) { return 0; }
	if ( i%4 == 3) { return (area_size-field_size); }
	return zombieSpawnLocation();
}

function zombieMove(position, rnumber) {
	if( rnumber%2 == 0) { return position; }
	if( position == 0 ) {
		return field_size;
	} else if( position == (area_size-field_size)) {
		return ((area_size-field_size)-field_size);
	} else {
		random1or2();
		if ( random1or2()%2 == 0) {
			return (position+field_size);
		} else { return (position-field_size); }
	}
}

function addZombies() {
	for (var i = 0; i < 5; ++i) {
		zombies.push({
			x: zombieSpawnLocationX(i),
			y: zombieSpawnLocationY(i),
			speed: 200,
			img: $('<img />').appendTo(gameArea).attr('src', 'pictures/zombie.jpg').css({
				width: field_size,
				height: field_size,
				position: 'absolute'
			}).addClass('zombie')
		});
	}
}

function spawnZombies() {
	for (var i in zombies) {
		var zombie = zombies[i];
		var zombieImg = zombie.img;

		zombieImg.css({
			left: zombie.x,
			top: zombie.y
		});
	}
}

function spawnMoreZombies() {
	var rnumber = random1_4();
	zombies.push({
		x: zombieSpawnLocationX(rnumber),
		y: zombieSpawnLocationY(rnumber),
		speed: 200,
		img: $('<img />').appendTo(gameArea).attr('src', 'pictures/zombie.jpg').css({
			width: field_size,
			height: field_size,
			position: 'absolute'
		}).addClass('zombie')
	});
	var zombie = zombies[zombies.length - 1];
	var zombieImg = zombie.img;
	
	zombieImg.css({
		left: zombie.x,
		top: zombie.y
	});
}

function animateZombies() {
	if (game_status === "ended") { return; }
	
	for (var i in zombies) {
		var zombie = zombies[i];
		var zombieImg = zombie.img;
		if( zombieImg.is(":animated")) { continue; }
		
		var rnumber = random1or2();		
		zombie.x = zombieMove(zombie.x, rnumber);
		zombie.y = zombieMove(zombie.y, (rnumber+1));
			
		zombieImg.animate({
			left: zombie.x,
			top: zombie.y
		}, zombie.speed);
		
		isEated(zombie.x, zombie.y);
	}
}

function isEated(zombieX, zombieY) {
	if((zombieX == hero_position.x) && (zombieY == hero_position.y)) {
		label.text('GAME OVER');
		$(window).off('keydown');
		gameArea.css({
			background: 'black'
		});
		
		game_status = "ended";
		clearInterval(game_zombie_moving);
	}
}
function isZombieKilled(bulletX, bulletY) {
	for (var i in zombies) {
		var zombie = zombies[i];		
		if( (zombie.x == bulletX) && (zombie.y == bulletY) ) {
			zombie.img.css({
				'z-index': '0'
			});		
			zombie.img.delay(300).fadeOut(300);
			zombies.splice(i, 1);
			
			++kills;
			label_kills.text("Kills: " + kills);
		}
	}
}

function shoot() {
	var posX = hero_position.x;
	var posY = hero_position.y;
	var shootSize;
	var shootX, shootY;
	
	if( hero_aim_pos == KEYLEFT ) {
		shootSize = (posX / field_size );
		
		for( ; shootSize > 0; --shootSize) {
			shootX = (hero_position.x - (shootSize*field_size));
			shootY = hero_position.y;
			
			bullet = $('<img/>').attr("src", "pictures/shoot.png").attr("class", "bullet").css({
				position: "absolute",
				width: field_size,
				height: field_size,
				left: shootX,
				top: shootY,
				'z-index': 1
			}).appendTo(gameArea);
			
			isZombieKilled(shootX, shootY);
		}

		$('.bullet').delay(300).fadeOut(300);
		
	} else if ( hero_aim_pos == KEYRIGHT ) {
		shootSize = (((area_size - posX) / field_size)-1);

		for( ; shootSize > 0; --shootSize) {
			shootX = (hero_position.x + (shootSize*field_size));
			shootY = hero_position.y;
			
			bullet = $('<img/>').attr("src", "pictures/shoot.png").attr("class", "bullet").css({
				position: "absolute",
				width: field_size,
				height: field_size,
				left: shootX,
				top: shootY,
				'z-index': 1
			}).appendTo(gameArea);
			
			isZombieKilled(shootX, shootY);
		}

		$('.bullet').delay(300).fadeOut(300);
		
	} else if ( hero_aim_pos == KEYUP ) {
		shootSize = (posY / field_size);

		for( ; shootSize > 0; --shootSize) {
			shootX = hero_position.x;
			shootY = (hero_position.y - (shootSize*field_size));
			
			bullet = $('<img/>').attr("src", "pictures/shoot.png").attr("class", "bullet").css({
				position: "absolute",
				width: field_size,
				height: field_size,
				left: shootX,
				top: shootY,
				'z-index': 1,
				'transform': 'rotate(' + 90 + 'deg)'
			}).appendTo(gameArea);
			
			isZombieKilled(shootX, shootY);
		}

		$('.bullet').delay(300).fadeOut(300);
		
	} else if ( hero_aim_pos == KEYDOWN ) {
		shootSize = (((area_size - posY) / field_size)-1);

		for( ; shootSize > 0; --shootSize) {
			shootX = hero_position.x;
			shootY = (hero_position.y + (shootSize*field_size));
			
			bullet = $('<img/>').attr("src", "pictures/shoot.png").attr("class", "bullet").css({
				position: "absolute",
				width: field_size,
				height: field_size,
				left: shootX,
				top: shootY,
				'z-index': 1,
				'transform': 'rotate(' + 90 + 'deg)'
			}).appendTo(gameArea);
			
			isZombieKilled(shootX, shootY);
		}

		$('.bullet').delay(300).fadeOut(300);
	}
}

function move() {
	animateZombies();
	//spawnMoreZombies();
}

function moveHero() {
	hero.animate({
		left: hero_position.x,
		top: hero_position.y
	}, hero_movement_speed);
}

$(window).on('keydown', function(e) {
	var key = e.which;
	if( (key != KEYLEFT) && (key != KEYRIGHT) && (key != KEYDOWN) && (key != KEYUP) ) {
		return;
	}
	
	hero_position.x = hero.position().left;
	hero_position.y = hero.position().top;
	
	if ( hero.is(':animated')) {
		return;
	} else {
		if (key != hero_aim_pos) {
			if (key == KEYLEFT) {
				$('#hero').css('transform','rotate(' + 0 + 'deg)');
				hero_aim_pos = KEYLEFT;
			} else if (key == KEYUP) {
				$('#hero').css('transform','rotate(' + 90 + 'deg)');
				hero_aim_pos = KEYUP;
			} else if (key == KEYRIGHT) {
				$('#hero').css({
					'-moz-transform': 'scale(-1, 1)',
					'-webkit-transform': 'scale(-1, 1)',
					'-o-transform': 'scale(-1, 1)',
					'transform': 'scale(-1, 1)',
					'filter': 'FlipH'
				});
				hero_aim_pos = KEYRIGHT;
			} else if (key == KEYDOWN) {
				$('#hero').css('transform','rotate(' + 270 + 'deg)');
				hero_aim_pos = KEYDOWN;
			}
		} else {
			if (key == KEYLEFT) {
				hero_position.x -= field_size;
			} else if (key == KEYUP) {
				hero_position.y -= field_size;
			} else if (key == KEYRIGHT) {
				hero_position.x += field_size;
			} else if (key == KEYDOWN) {
				hero_position.y += field_size;
			}
			
			if( (hero_position.x >= 0) &&
				(hero_position.y >= 0) &&
				(hero_position.x < area_size) &&
				(hero_position.y < area_size)) {
				moveHero();
			}
			
			for (var i in zombies) {
				var zombie = zombies[i];
				isEated(zombie.x, zombie.y);
			}
		}		
	
	}
});

$(window).on('keydown', function(e2) {
	var key = e2.which;
	if (key == KEYSPACE) {
		shoot();
	}
});

$(window).on('keydown', function(e3) {
	var key = e3.which;
	if( (key != KEYLEFT) && (key != KEYRIGHT) && (key != KEYDOWN) && (key != KEYUP) ) {
		return;
	}
	
	hero_position.x = hero.position().left;
	hero_position.y = hero.position().top;
	
	if ( hero.is(':animated')) {
		return;
	} else {
		if (key != hero_aim_pos) {
			if (key == KEYLEFT) {
				$('#hero').css('transform','rotate(' + 0 + 'deg)');
				hero_aim_pos = KEYLEFT;
			} else if (key == KEYUP) {
				$('#hero').css('transform','rotate(' + 90 + 'deg)');
				hero_aim_pos = KEYUP;
			} else if (key == KEYRIGHT) {
				$('#hero').css({
					'-moz-transform': 'scale(-1, 1)',
					'-webkit-transform': 'scale(-1, 1)',
					'-o-transform': 'scale(-1, 1)',
					'transform': 'scale(-1, 1)',
					'filter': 'FlipH'
				});
				hero_aim_pos = KEYRIGHT;
			} else if (key == KEYDOWN) {
				$('#hero').css('transform','rotate(' + 270 + 'deg)');
				hero_aim_pos = KEYDOWN;
			}
		} else {
			if (key == KEYLEFT) {
				hero_position.x -= field_size;
			} else if (key == KEYUP) {
				hero_position.y -= field_size;
			} else if (key == KEYRIGHT) {
				hero_position.x += field_size;
			} else if (key == KEYDOWN) {
				hero_position.y += field_size;
			}
			
			if( (hero_position.x >= 0) &&
				(hero_position.y >= 0) &&
				(hero_position.x < area_size) &&
				(hero_position.y < area_size)) {
				moveHero();
			}
			
			for (var i in zombies) {
				var zombie = zombies[i];
				isEated(zombie.x, zombie.y);
			}
		}		
	
	}
});

$(document).ready(function(){
	gameArea = $('<div></div>').attr('id', 'gameArea').css({
		width: area_size,
		height: area_size,
		border: '1px solid black',
		margin: '0 auto',
		background: 'lightgray',
		position: 'relative',
		overflow: 'hidden'
	}).appendTo('body');
	
	label = $('<p></p>').css({
		width: '100%',
		height: '100%',
		color: 'white',
		'font-size': '65px',
		position: 'absolute',
		top: '120px',
		'text-align': 'center',
		'z-index' : '1'
	}).appendTo(gameArea);
	
	label_kills = $('<p></p>').css({
		width: '100%',
		height: '100%',
		color: 'red',
		'font-size': '30px',
		position: 'absolute',
		left: '10px',
		'z-index' : '1'
	}).appendTo(gameArea);

	addHero();
	addZombies();
	spawnZombies();
	game_zombie_moving = setInterval(move, game_speed);
	game_zombie_moving = setInterval(spawnMoreZombies, game_speed*5);
});