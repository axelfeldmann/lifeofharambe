////////////////////////////////////////////////////////////////////////////////
// Globals
////////////////////////////////////////////////////////////////////////////////

HARAMBE_SPEED = 200;
sqrt2 = Math.sqrt(2);
ENCLOSURE_MARGIN = 90;
WALL_THICKNESS = 20;
KID_SPEED = 130;
CAPTURE_DIST = 40;
KID_WANDER_RANGE = 5;
SHIFT_DOWN = 15;

THROW_DIST = 22;
THROW_POWER = 600;

GUARD_SPEED = 130;
BULLET_SPEED = 300;

GUARD_PATH_OFFSET = 50;

DIFFICULTY = 100;
MAX_KIDS_SCALE = 2000;
MAX_GUARDS_SCALE = 1000;

GUARD_GENERATION_CHANCE = .01

KID_SIZE = [50,50];
GUARD_SIZE = [40,40];
BULLET_SIZE = [10,10];
KID_SHIFT = 20;


GUARD_KILL_SCORE_ADD = 500;

function setAngle(move_vector){
  if(move_vector[0] > 0 && move_vector[1] > 0) return 45;
  else if(move_vector[0] > 0 && move_vector[1] < 0) return 315;
  else if(move_vector[0] < 0 && move_vector[1] > 0) return 135;
  else if(move_vector[0] < 0 && move_vector[1] < 0) return 225;
  else if(move_vector[0] > 0 && move_vector[1] == 0) return 0;
  else if(move_vector[0] < 0 && move_vector[1] == 0) return 180;
  else if(move_vector[0] == 0 && move_vector[1] > 0) return 90;
  else if(move_vector[0] == 0 && move_vector[1] < 0) return 270; 
}

function remove(sprite){
  console.log(sprite);
  sprite.kill();
}

////////////////////////////////////////////////////////////////////////////////
// Gorillas
////////////////////////////////////////////////////////////////////////////////

function Gorilla(game, x, y){
    Phaser.Sprite.call(this, game, x, y, 'gorilla');
    this.anchor.setTo(0.5, 0.5);
    this.state = "hunting";
    this.friend = undefined;
    this.angle = 270;
    game.physics.arcade.enable(this);
    game.add.existing(this);
};

Gorilla.prototype = Object.create(Phaser.Sprite.prototype);
Gorilla.prototype.constructor = Gorilla;

Gorilla.prototype.interact = function(){
  if(this.state == "hunting"){
    game.kids.forEachAlive(function(kid){
      dist = Math.sqrt(Math.pow(this.x - kid.x,2) + 
                       Math.pow(this.y - kid.y,2));
      if(dist < CAPTURE_DIST){
        this.friend = kid;
        this.friend.state = "captured";
        this.state = "dragging";
      }
    },this);
  }
  else if(this.state == "dragging"){
    this.friend.state = "thrown";
    this.friend.throw_counter = THROW_DIST;
    this.friend = undefined;
    this.state = "hunting";
  }
};

Gorilla.prototype.move = function(move_vector){
  if(!(move_vector[0] == 0 && move_vector[1] == 0)){
    this.angle = setAngle(move_vector);
  }
  this.body.velocity.x = move_vector[0];
  this.body.velocity.y = move_vector[1];
};

////////////////////////////////////////////////////////////////////////////////
// Wall
////////////////////////////////////////////////////////////////////////////////

function Wall(game, x, y, width, height){
    Phaser.Sprite.call(this, game, x, y, 'wall');
    this.anchor.setTo(.5,.5);
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    game.physics.arcade.enable(this);
    this.body.immovable = true;
    game.walls.add(this);
};

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

////////////////////////////////////////////////////////////////////////////////
// Kid
////////////////////////////////////////////////////////////////////////////////

function Kid(game){
    random_x = game.rnd.integerInRange(game.left_wall.right + KID_SIZE[0], 
                                       game.right_wall.left - KID_SIZE[0]);
    random_y = game.rnd.integerInRange(game.top_wall.bottom + KID_SIZE[1], 
                                       game.bottom_wall.top - KID_SIZE[1]);
    Phaser.Sprite.call(this, game, random_x, random_y, 'kid');
    this.width = KID_SIZE[0];
    this.height = KID_SIZE[1];
    this.anchor.setTo(0.5, 0.5);
    this.state = "wandering";
    this.checkWorldBounds = true;
    this.events.onOutOfBounds.add(remove, this);
    game.physics.arcade.enable(this);
    game.kids.add(this);
};

Kid.prototype = Object.create(Phaser.Sprite.prototype);
Kid.prototype.constructor = Kid;

Kid.prototype.move = function(){
  if(this.state == "wandering"){
    this.wander();
  }
  else if(this.state == "captured"){
    this.beCarried();
  }
  else if(this.state == "thrown"){
    this.beThrown();
  }
  else if(this.state == "escaping"){  
    this.runAway();
  }
};

Kid.prototype.wander = function(){
  this.angle += game.rnd.integerInRange(-KID_WANDER_RANGE, KID_WANDER_RANGE);
  this.body.velocity.x = KID_SPEED * Math.cos((this.angle - 90) * Math.PI/180);
  this.body.velocity.y = KID_SPEED * Math.sin((this.angle - 90) * Math.PI/180);
};

Kid.prototype.beCarried = function(){
  this.x = game.harambe.x - KID_SHIFT * Math.cos((this.angle) * Math.PI/180);
  this.y = game.harambe.y - KID_SHIFT * Math.sin((this.angle) * Math.PI/180);
  this.angle = game.harambe.angle;
};

Kid.prototype.beThrown = function(){
  if(this.throw_counter >= 0){
    this.body.velocity.x = THROW_POWER * Math.cos(this.angle * Math.PI/180);
    this.body.velocity.y = THROW_POWER * Math.sin(this.angle * Math.PI/180);
    this.throw_counter -= 1;
  }
  else{
    if(this.left > game.left_wall.right &&
       this.right < game.right_wall.left &&
       this.bottom < game.bottom_wall.top &&
       this.top > game.top_wall.bottom){
      this.state = "wandering";
    }
    else{
      this.state = "escaping";
    }
  }
};

Kid.prototype.runAway = function(){
  center_vector = [this.x - game.world.centerX, this.y - game.world.centerY];
  dist = Math.sqrt(Math.pow(this.x - game.world.centerX, 2) + 
                   Math.pow(this.y - game.world.centerY, 2));
  unit_vector = [center_vector[0]/dist, center_vector[1]/dist];
  this.body.velocity.x = unit_vector[0] * KID_SPEED;
  this.body.velocity.y = unit_vector[1] * KID_SPEED;
};

////////////////////////////////////////////////////////////////////////////////
// Guard
////////////////////////////////////////////////////////////////////////////////

function startPos(width, height){ //technically a global, but only used for this
  top_pos = [game.rnd.integerInRange(0, game.width), -height];
  bottom_pos = [game.rnd.integerInRange(0, game.width), game.height + height];
  left_pos = [-width, game.rnd.integerInRange(0, game.height)]
  right_pos = [game.width + width, game.rnd.integerInRange(0, game.height)]
  start_areas = [top_pos, bottom_pos, left_pos, right_pos]
  return start_areas[game.rnd.integerInRange(0, 3)];
}

function Guard(game){
    Phaser.Sprite.call(this, game, 0, 0, 'guard_patrolling');
    this.width = GUARD_SIZE[0];
    this.height = GUARD_SIZE[1];
    start_pos = startPos(this.width, this.height);
    this.x = start_pos[0];
    this.y = start_pos[1];
    this.anchor.setTo(0.5, 0.5);
    this.state = "positioning";
    this.shot_time = 0;
    game.physics.arcade.enable(this);
    game.guards.add(this);
};

Guard.prototype = Object.create(Phaser.Sprite.prototype);
Guard.prototype.constructor = Guard;

Guard.prototype.move = function(){
  if(this.state == "positioning"){
    this.getInPosition();
  } 
  if(this.state == "passive"){
    this.patrol();
  }
  if(this.state == "active"){
    this.attack();
  }
};

Guard.prototype.getInPosition = function(){
  if(!this.insidePath()){
    center_vector = [game.guard_path.centerX - this.x, 
                     game.guard_path.centerY - this.y];
    center_dist = Math.sqrt(Math.pow(center_vector[0],2) + 
                            Math.pow(center_vector[1],2));
    unit_vector = [center_vector[0]/center_dist, center_vector[1]/center_dist];
    move_vector = [unit_vector[0] * GUARD_SPEED, unit_vector[1] * GUARD_SPEED];
    this.body.velocity.x = move_vector[0];
    this.body.velocity.y = move_vector[1];
  }
  else if(game.agro){
    this.snapToPath();
    this.state = "active";
    this.loadTexture('guard_shooting');
  }
  else{
    this.snapToPath();
    this.state = "passive";
  }
};

Guard.prototype.patrol = function(){
  if(game.agro){
    this.state = "active";
    this.loadTexture('guard_shooting');
    return;
  }
  if(this.x <= game.guard_path.left){
    this.body.velocity.y = -GUARD_SPEED; this.body.velocity.x = 0; 
    this.angle = 0;
  }
  if(this.y <= game.guard_path.top){
    this.body.velocity.x = GUARD_SPEED; this.body.velocity.y = 0; 
    this.angle = 90;
  }
  if(this.x >= game.guard_path.right){
    this.body.velocity.y = GUARD_SPEED; this.body.velocity.x = 0; 
    this.angle = 180;
  }
  if(this.y >= game.guard_path.bottom && this.x >= game.guard_path.left){
    this.body.velocity.x = -GUARD_SPEED; this.body.velocity.y = 0; 
    this.angle = 270;
  }
};

Guard.prototype.attack = function(){
  radians = game.physics.arcade.angleBetween(this, game.harambe)
  this.angle = radians * 180 / Math.PI + 270
  this.body.velocity.x = 0; this.body.velocity.y = 0;
  if(this.shot_time <= 0){
    this.shoot();
    this.shot_time = DIFFICULTY;
  }
  this.shot_time -= 1;
};

Guard.prototype.insidePath = function(){
  return game.guard_path.contains(this.x, this.y)
};

Guard.prototype.shoot = function(){
  new_bullet = new Bullet(game, this);
  game.bullets.add(new_bullet);
  if(!game.mute) game.gunshot.play();
};

Guard.prototype.snapToPath = function(){
  distances = [Math.abs(this.x - game.guard_path.left),
               Math.abs(this.x - game.guard_path.right),
               Math.abs(this.y - game.guard_path.top),
               Math.abs(this.y - game.guard_path.bottom)];
  min_dist = Math.min.apply(Math, distances);
  if(min_dist == Math.abs(this.x - game.guard_path.left)){
    this.x = game.guard_path.left;
  }
  if(min_dist == Math.abs(this.x - game.guard_path.right)){
    this.x = game.guard_path.right;
  }
  if(min_dist == Math.abs(this.y - game.guard_path.top)){
    this.y = game.guard_path.top;
  }
  if(min_dist == Math.abs(this.y - game.guard_path.bottom)){
    this.y = game.guard_path.bottom;
  }
};

////////////////////////////////////////////////////////////////////////////////
// Bullet
////////////////////////////////////////////////////////////////////////////////

function Bullet(game, shooter){
    Phaser.Sprite.call(this, game, 0, 0, 'bullet');
    this.width = BULLET_SIZE[0];
    this.height = BULLET_SIZE[1];
    this.x = shooter.x
    this.y = shooter.y
    this.anchor.setTo(0.5, 0.5);
    this.vector = this.getBulletVector();
    this.events.onOutOfBounds.add(remove, this);
    game.physics.arcade.enable(this);
    game.bullets.add(this);
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.move = function(){
  this.body.velocity.x = this.vector[0];
  this.body.velocity.y = this.vector[1];
};

Bullet.prototype.getBulletVector = function(){
  complete_vector = [game.harambe.x - this.x, game.harambe.y - this.y];
  dist = Math.sqrt(Math.pow(complete_vector[0],2)+
                   Math.pow(complete_vector[1],2));
  unit_vector = [complete_vector[0]/dist, complete_vector[1]/dist];
  return [unit_vector[0] * BULLET_SPEED, unit_vector[1] * BULLET_SPEED];
};

////////////////////////////////////////////////////////////////////////////////
// Collision Handlers
////////////////////////////////////////////////////////////////////////////////

function harambeWall(harambe, wall){

}

function harambeBullets(harambe, bullet){
  game.state.start('lose');
}

function kidsGuards(kid, guard){
  if(kid.state == "thrown"){
    guard.kill();
    game.score += GUARD_KILL_SCORE_ADD;
  }  
}

function kidsWalls(kid, wall){
  if(wall.width > wall.height){ //it's a horizontal wall
    kid.angle = 180 - kid.angle;
  }
  else{ //it's a vertical wall
    kid.angle = 360 - kid.angle;
  }
}

//processCallback on kid-wall collisions
function kidCollideStateWall(kid, wall){
  if(kid.state == "wandering") return true;
  else return false;
}

function kidCollideStateGuards(kid, guard){
  if(kid.state == "thrown") return true;
  else return false;
}

////////////////////////////////////////////////////////////////////////////////
// Input Handling
////////////////////////////////////////////////////////////////////////////////

function handleMovement(){
  move_vector = [0,0];
  if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
    move_vector[0] -= HARAMBE_SPEED;
  }
  if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
    move_vector[0] += HARAMBE_SPEED;
  }
  if (game.input.keyboard.isDown(Phaser.Keyboard.W)){
    move_vector[1] -= HARAMBE_SPEED;
  }
  if (game.input.keyboard.isDown(Phaser.Keyboard.S)){
    move_vector[1] += HARAMBE_SPEED;
  }
  if(move_vector[0] != 0 && move_vector[1] != 0){
    move_vector[0] = move_vector[0] / sqrt2;
    move_vector[1] = move_vector[1] / sqrt2;
  }
  game.harambe.move(move_vector);
}

function handleAction(){
  action_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  action_key.onDown.add(game.harambe.interact, game.harambe);
}

////////////////////////////////////////////////////////////////////////////////
// Main Game Functions
////////////////////////////////////////////////////////////////////////////////

function buildWall(){
  game.left_wall = new Wall(game, 
                            ENCLOSURE_MARGIN, game.height/2 + SHIFT_DOWN,  
                            WALL_THICKNESS,
                            game.height - 2*ENCLOSURE_MARGIN + WALL_THICKNESS);
  game.right_wall = new Wall(game, 
                            game.width - ENCLOSURE_MARGIN, 
                            game.height/2 + SHIFT_DOWN,  
                            WALL_THICKNESS,
                            game.height - 2*ENCLOSURE_MARGIN + WALL_THICKNESS);
  game.top_wall = new Wall(game, 
                            game.width/2, ENCLOSURE_MARGIN + SHIFT_DOWN,
                            game.width - 2*ENCLOSURE_MARGIN + WALL_THICKNESS,
                            WALL_THICKNESS);
  game.bottom_wall = new Wall(game, game.width/2, 
                            game.height - ENCLOSURE_MARGIN + SHIFT_DOWN,
                            game.width - 2*ENCLOSURE_MARGIN + WALL_THICKNESS,
                            WALL_THICKNESS);
}

function createGuardpath(){
  game.guard_path = new Phaser.Rectangle(0, 0, 
                                  GUARD_PATH_OFFSET + game.top_wall.width,
                                  GUARD_PATH_OFFSET + game.left_wall.height);
  game.guard_path.centerX = game.width/2;
  game.guard_path.centerY = game.height/2 + SHIFT_DOWN;
}

function drawGeometry(){
  game.geometry = game.add.graphics(0, 0);
  game.geometry.beginFill("#707070", 1);
  game.geometry.drawRect(0, 0, game.width, 40);
  game.geometry.endFill()
  window.graphics = game.geometry;
}

function initBackground(){
  game.stage.backgroundColor = "#147510";
  drawGeometry();
  game.score_text = game.add.text(20, 5, "Score:", {
        font: "24px Arial",
        fill: "#ffffff",
        align: "center"
  });
  game.score_text.anchor.setTo(0, 0);
  game.banner_text = game.add.text(game.world.centerX, 5, "HARAMBE", {
        font: "30px Arial",
        fill: "#ffffff",
        align: "center"
  });
  game.banner_text.anchor.setTo(0.5, 0)
}

function create() {

  game.menu_music.stop();

  //temp code
  game.enclosure = game.add.tileSprite(0,0,
				       game.width - 2*ENCLOSURE_MARGIN + WALL_THICKNESS, 
				       game.height - 2*ENCLOSURE_MARGIN + WALL_THICKNESS, 
				       "enclosure");
  game.enclosure.anchor.setTo(.5,.5);
  game.enclosure.x = game.width/2;
  game.enclosure.y = game.height/2 + SHIFT_DOWN;
  
  //initialize harambe
  game.harambe = new Gorilla(game, game.width/2, game.height/2);
  //BIG BEAUTIFUL WALL
  game.walls = game.add.physicsGroup();
  buildWall();
  //initialize physics groups - guards, bullets, children
  game.kids = game.add.physicsGroup();
  game.bullets = game.add.physicsGroup();
  game.guards = game.add.physicsGroup();
  
  initBackground();

  //GUARDPATH
  createGuardpath();
  //initialize initial entities
  new Kid(game);
  new Guard(game);
  //some important game values
  game.agro = false; game.score = 0;

  game.game_music = game.add.audio('harambe');
  game.gunshot = game.add.audio('gunshot');
  game.sound.setDecodedCallback([game.gunshot, game.game_music], update, this);

  if(!game.mute) game.game_music.play();
}

function updateBackground(){


  game.score_text.text = "Score: " + Math.floor(game.score/100);
  if(game.agro){
    game.banner_text.text = "THEY WANT TO KILL HARAMBE";
    game.banner_text.addColor("#ff0000", 0);
  }
  else{
    game.banner_text.text = "all is well at the zoo";
  }
}

function gameUpdate(){
  game.kids.forEachAlive(function(kid){
    kid.move();
  });
  game.guards.forEachAlive(function(guard){
    guard.move();
  });
  game.bullets.forEachAlive(function(bullet){
    bullet.move();
  });
  updateBackground();
}

function generateGuards(){
  if(game.agro) max_guards = Math.floor((game.score / MAX_GUARDS_SCALE) + 1);
  else max_guards = 1;
  if(game.guards.countLiving() < max_guards && 
     Math.random() < GUARD_GENERATION_CHANCE){
    game.guards.add(new Guard(game));  
  }
}

function generateKids(){
  if(game.agro) max_kids = Math.floor((game.score / MAX_KIDS_SCALE) + 1);
  else max_kids = 1;
  while(game.kids.countLiving() < max_kids){
    game.kids.add(new Kid(game));
  }
}

function gameFlow(){
  generateKids();
  generateGuards();
  if(game.agro == false && game.harambe.state == "dragging"){
    game.agro = true;
  }
  if(game.harambe.state == "dragging"){
    game.score ++;
  }
}

function update() {
  //collision handlers
  game.physics.arcade.collide(game.harambe, game.walls, harambeWall, 
                              null, this);
  game.physics.arcade.collide(game.harambe, game.bullets, harambeBullets, 
                              null, this);
  game.physics.arcade.collide(game.kids, game.guards, kidsGuards, 
                              kidCollideStateGuards, this);
  game.physics.arcade.collide(game.kids, game.walls, kidsWalls,
                              kidCollideStateWall, this);

  //handle input
  handleMovement();
  handleAction();

  //update game
  gameUpdate();
  gameFlow();
}

function render () { //for debug purposes only
    // game.debug.geom(game.guard_path,'#0fffff');
}

var playState = {
  create: create,
  update: update,
  render: render
}