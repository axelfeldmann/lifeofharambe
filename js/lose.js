function encrypt(name){
  letter_sum = 0;
  for(i = 0; i < name.length; i++){
    letter_sum += name.charCodeAt(i);
  }
  bigint_sum = bigInt(letter_sum);
  return bigint_sum.modPow(37, 339803).value;
}

function submitScore(){
  name = game.name_input.text._text;
  score = Math.floor(game.score/100)
  if(name.length > 0){
    $.get('highscores.php',{'name':name,'score':score, 'meme':encrypt(name)},
          function(ret){});
  }
  
  game.button.destroy();
  game.name_input.destroy();
  game.submit_text.destroy();
  game.state.start('highscore');
}

function displayGoodPlayer(ret){
  score_array = JSON.parse(ret);
  if(Math.floor(game.score/100) > score_array[9].score){
    var you_r_good = game.add.text(40, 610, "YOU ARE IN THE TOP 10, SUBMIT YOUR SCORE",
                                   {font: '30px Arial', fill:'#ff0000'});
  }
}

var loseState = {
  create: function(){
    game.add.tileSprite(0, 0, 800, 640, 'heaven');
    var winLabel = game.add.text(80, 40, 
                              '#dicksoutforharambe: ' + Math.floor(game.score/100),
                                 {font: '50px Arial', fill:'#000000'});
    var highscoreLabel = game.add.text(40, game.world.height - 180,
                                   'submit your high score',
                                   {font: '25px Arial', fill:'#000000'});
    var startLabel = game.add.text(40, game.world.height - 80,
                                   'press spacebar to live again',
                                   {font: '25px Arial', fill:'#000000'});
                                   
    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    wkey.onDown.addOnce(this.restart, this);
    
    game.button = game.add.button(400, 520, 
                               'button', submitScore, 
                               this, 2, 1, 0);
    game.button.scale.setTo(.8,.8)
    game.button.anchor.setTo(.5,.5)
   
    game.name_input = game.add.inputField(40, 500, {
      font: '18px Arial',
      fill: '#212121',
      fontWeight: 'bold',
      width: 250,
      height: 22,
      padding: 8,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 6,
      placeHolder: 'Your Name',
      max: 18
    });

    game.submit_text = game.add.text(400, 522, 'Submit',
                      {font: '18px Arial', fill:'#ffffff'});
    game.submit_text.anchor.setTo(.5,.5)
    
    $.get('highscores.php',{},function(ret){displayGoodPlayer(ret)})
    
    },
  restart: function(){
    game.state.start('menu');
  }
}