var game = new Phaser.Game(800, 640, Phaser.AUTO, "gameDiv");

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('lose', loseState);
game.state.add('highscore', highScoreState);

game.state.start('boot');