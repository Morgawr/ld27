game.GameOverScreen = me.ScreenObject.extend({

  init: function(win){
    this.parent(true,true);
    if(win)
      bg = 'game_end';
    else
      bg = 'gameover';
    this.back = new me.SpriteObject(0,0, me.loader.getImage(bg));
  },

  onResetEvent: function(){
    me.game.reset();
    me.audio.stopTrack();
    me.audio.playTrack(bg);
    me.game.add(this.back, this.z);
    me.game.sort();
    this.timer = 0;
    me.game.repaint();
  },

  onDestroyEvent: function(){
    me.audio.stopTrack();
  },

  update: function(){
    this.timer += me.timer.tick*10;
    if(this.timer > 5 && me.input.isKeyPressed("skip")){
      me.state.change(me.state.MENU);
    }
    return true;
  }
});
