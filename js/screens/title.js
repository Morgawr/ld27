game.TitleScreen = me.ScreenObject.extend({
  init: function(){
    this.parent(true,true);
    this.back = new me.SpriteObject(0,0, me.loader.getImage('mmenu'));
  },

  onResetEvent: function(){
    me.game.reset();
    me.audio.playTrack('mainmenu');
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
      me.state.change(me.state.PLAY,true);
    }
    return true;
  }
})
