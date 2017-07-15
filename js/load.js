var loadState = {
  preload: function(){
    var loadingLabel = game.add.text(80, 150, 'loading...',
                                     {font: '30px Courier', fill:'#ffffff'});
    game.load.image('guard_patrolling', 'images/guard_patrolling.png');
    game.load.image('guard_shooting', 'images/guard_shooting.png');
    game.load.image('kid', 'images/kid.png');
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('wall', 'images/wall.png');
    game.load.image('gorilla', 'images/Harambe.png');
    game.load.image("background1", "images/background1.jpg");
    game.load.image("heaven", "images/harambe_in_heaven.png");
    game.load.image("enclosure", "images/map.png");
    game.load.image("banana", "images/banana.png");
    game.load.spritesheet('button', 'images/button_sprite_sheet.png', 
                          193, 71);

    game.load.audio('harambe', 'sounds/harambe.wav');
    game.load.audio('donkeykong', 'sounds/donkeykong.mp3');
    game.load.audio('gunshot', 'sounds/gunshot.mp3');

    game.mute = false;

  },
  create: function(){
    game.state.start('menu');
  }
};