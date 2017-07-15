var bootState = {
  create: function(){
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.plugin(Fabrique.Plugins.InputField);

    game.state.start('load');
  }
};