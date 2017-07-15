//this is total and absolute trash - to be rewritten at some point

function restart () {
  game.state.start('menu');
}

function displayHighScores(ret){
  game.add.text(50, 50, "top #dicksoutforharambe:",{font: '36px Arial', fill:'#ff0000'});
  score_array = JSON.parse(ret);
  for(i = 0; i < score_array.length - 1; i++){ //take into account the last dummy val
    console.log(score_array[i]);
    score_text = game.add.text(50, 100 + 40 * i, 
                               score_array[i].score,
                               {font: '30px Arial', fill:'#ffffff'});
    score_text = game.add.text(100, 100 + 40 * i, 
                               score_array[i].name,
                               {font: '30px Arial', fill:'#ffffff'});
  game.add.text(50, 550, "press space to live again",{font: '30px Arial', fill:'#ff0000'});
  }

}

function highScoreScreen(){
  game.stage.backgroundColor = "#000000";
  var banana = game.add.tileSprite(game.width, game.height/2, 697, 1064 , 'banana');
  banana.anchor.setTo(1,.5);
  banana.scale.setTo(.5,.5);
  
  $.get('highscores.php',{},function(ret){displayHighScores(ret)})
  
  var wkey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


  wkey.onDown.addOnce(restart, this);
  
}

var highScoreState = {
  create: highScoreScreen
};