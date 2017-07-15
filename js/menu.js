control_string =  "      how to play:\n" +
                  "      run around making friends while not dying\n"+
                  "      you gain points while holding a friend\n"+
                  "      or by throwing a friend at a guard\n"+
                  "\n"+
                  "         controls: \n"+
                  "         WASD to move \n"+
                  "         spacebar to pick up a friend\n"+
                  "         spacebar to throw your friend\n"+
                  "                 spacebar to start\n"+
                  "                 m to toggle mute (only on this menu)";

function mute(){
  game.mute = !game.mute;
  if(game.mute) game.menu_music.stop();
  else game.menu_music.play();
}

var menuState = {
  create: function(){
    game.add.tileSprite(0, 0, 800, 640, 'background1');
    var name_label = game.add.text(40, 80, 'harambe simulator',
                                  {font: '44px Arial', fill:'#ff0000'});
    var instructions_abel = game.add.text(20, 150, control_string,
                                  {font: '20px Arial', fill:'#ff0000'});
    var version_string = game.add.text(game.width-20, game.height-20, 
                                  "version 1.0",
                                  {font: '18px Arial', fill:'#ff0000'});
    version_string.anchor.setTo(1,1);
    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    wkey.onDown.addOnce(this.start, this);

    if (game.game_music) game.game_music.stop();

    game.menu_music = game.add.audio('donkeykong');
    if(!game.mute) game.menu_music.play();

    game.mkey = game.input.keyboard.addKey(Phaser.Keyboard.M)
    game.mkey.onDown.add(mute, this);
  },
  start: function(){
    game.state.start('play');
  }
};