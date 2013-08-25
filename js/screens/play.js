game.PlayScreen = me.ScreenObject.extend({

  init: function() {
    me.game.ticked = false;
    this.parent(true);

  },
  getRandomCoord: function(){
    f = function(){ return Math.floor(Math.random()*(12-3+1)+3); };
    return {x: f(), y: f() };
  },
  getRandomKey: function(ob){
    var ret;
    var c = 0;
    for(var k in ob)
      if(Math.random() < 1/c++)
        ret=k;
    return ret;
  },
  addDrops: function(x, y){
    //weapons first
    candidates = [];
    chosen = [];
    lvl = me.game.level;
    for(var k in me.game.weapons){
      if(k == 'Ultimate')
        continue;
      if(me.game.weapons[k].min <= lvl &&
        lvl <= me.game.weapons[k].max){
        candidates.push(k);
      }
    }
    count = Math.floor(Math.random()*100);
    count = count % 2;
    if(candidates.length > 0)
      for(i = 0; i < count; i++){
        idx = Math.floor(Math.random()*candidates.length);
        name = candidates[idx];
        chosen.push(name);
      }
    superchance = Math.random()*100;
    if(superchance < 0.1)
      chosen.push('Ultimate');
    candidates = [];
    for(var k in me.game.armors){
      if(me.game.armors[k].min <= lvl &&
        lvl <= me.game.armors[k].max){
        candidates.push(k);
      }
    }
    count = Math.floor(Math.random()*100);
    count = count % 2;
    if(candidates.length > 0)
      for(i = 0; i < count; i++){
        idx = Math.floor(Math.random()*candidates.length);
        name = candidates[idx];
        chosen.push(name);
      }
    superchance = Math.random()*100;
    if(superchance < 10){
      superchance = Math.random()*100;
      if(superchance < 50){ //armor
        k = this.getRandomKey(me.game.armors);
        if(k != 'Naked')
          chosen.push(k);
      }else{ //weapon
        k = this.getRandomKey(me.game.weapons);
        if(k != 'Fists' && k != "Ultimate")
          chosen.push(k);
      }
    }
    coordinates = [];
    for(i = 0; i < chosen.length; i++){
      while(true){
        c = this.getRandomCoord();
        if(c.x == x && c.y == y)
          continue;
        for(j = 0; j < coordinates.length; j++){
          if(c.x == coordinates[j].x && c.y == coordinates[j].y)
            continue;
        }
        coordinates.push(c);
        break;
      }
    }
    if(chosen.length != coordinates.length){
      console.log("WARNING - wrong number of spawned items?!");
      length = chosen.length < coordinates.length ? chosen.length : coordinates.length;
    } else {
      length = coordinates.length;
    }
    for(i = 0; i < length; i++){
      if(me.game.weapons[chosen[i]] != undefined){
        me.game.add(me.entityPool.newInstanceOf('weapon', chosen[i], coordinates[i].x, coordinates[i].y), this.z);
      } else {
        me.game.add(me.entityPool.newInstanceOf('armor', chosen[i], coordinates[i].x, coordinates[i].y), this.z);
      }
    }
  },
  addEnemies: function(x,y){
    candidates = [];
    chosen = [];
    lvl = me.game.level;
    for(var k in me.game.enemies){
      if(k == 'thing')
        continue;
      if(me.game.enemies[k].min <= lvl &&
         lvl <= me.game.enemies[k].max) {
        candidates.push(k);
      }
    }
    count = Math.floor(Math.random()*3+1);
    for(i = 0; i < count; i++){
      idx = Math.floor(Math.random()*candidates.length);
      name = candidates[idx];
      chosen.push(name);
    }
    superchance = Math.random()*100;
    if(superchance < 5)
      chosen.push('thing');
    coordinates = [];
    for(i = 0; i < chosen.length; i++){
      while(true){
        c = this.getRandomCoord();
        if(c.x == x && c.y == y)
          continue;
        for(j = 0; j < coordinates.length; j++){
          if(c.x == coordinates[j].x && c.y == coordinates[j].y)
            continue;
        }
        coordinates.push(c);
        break;
      }
    }
    if(chosen.length != coordinates.length){
      console.log("WARNING - wrong number of spawned enemies?!");
      length = chosen.length < coordinates.length ? chosen.length : coordinates.length;
    } else {
      length = coordinates.length;
    }

    for(i = 0; i < length; i++){
      me.game.add(me.entityPool.newInstanceOf('enemy', chosen[i], coordinates[i].x, coordinates[i].y), this.z);
    }

  },
  populateLevel: function(x,y){
    this.addEnemies(x,y);
    this.addDrops(x,y);
  },
  getLevelToLoad: function(){
    max = 4;
    return 'arena'+Math.floor(Math.random()*12+1);
  },
  onResetEvent: function(newgame) {
    me.game.reset();
    if(newgame){
      me.audio.playTrack('bgm');
      this.previoustick = false;
      me.game.firelvl = 0;
      me.game.icelvl = 0;
      me.game.heallvl = 0;
      me.game.telelvl = 0;
      me.game.level = 0;
      me.game.playerlevel = 1;
      me.game.moves = 10;
      me.game.hp = 12;
      me.game.equippedWeapon = me.game.weapons.Fists;
      me.game.equippedArmor = me.game.armors.Naked;
      me.game.exp = 0;
      me.game.player = null;
    }
    me.levelDirector.loadLevel(this.getLevelToLoad());
    me.game.level += 1;
    if(me.game.level == 100){ //end level!
      me.game.add(new game.Player(8,3), this.z);
      me.game.add(me.entityPool.newInstanceOf('enemy', 'boss', 0, 0), this.z);
    }else {
      c = this.getRandomCoord();
      me.game.add(new game.Player(c.x, c.y),this.z); // spawn player
      this.populateLevel(c.x, c.y);
    }
    me.game.addHUD(150,15,800,600);
    me.game.HUD.addItem("Top", new game.TopHUD());
    me.game.HUD.addItem("Bot", new game.BotHUD());
    me.game.HUD.addItem("Spells", new game.SpellsHUD());
    me.game.HUD.addItem("XP", new game.ExpCounter());
    me.game.DamageHUD = [];
    me.game.usedSpells = {};
    this.previoustick = false;
    me.game.ticked = false;
    me.game.sort();
  },


	onDestroyEvent: function() {
    this.clearDamageUI();
    me.game.disableHUD();
  },

  clearDamageUI: function() {
    for(i = 0; i < me.game.DamageHUD.length; i++){
      me.game.DamageHUD[i].die();
    }
    me.game.DamageHUD = [];
    me.game.repaint();
  },

  checkDamageUI: function() {
    for(i = 0; i < me.game.DamageHUD.length; i++){
      if(me.game.DamageHUD[i].update() == false){
        me.game.DamageHUD[i].die();
        me.game.DamageHUD.splice(i, 1);
        i--;
      }
    }
  },

  update: function(){
    this.checkDamageUI();
    if(me.game.ticked && this.previoustick) {
      if(me.game.castQueue != null && me.game.castQueue !== 'waiting')
        me.game.castQueue();
      me.game.ticked = false;
      me.game.moves--;
      if(me.game.moves <= 0 && me.game.level < 100){
        //me.game.remove(me.game.player, true);
        me.state.change(me.state.PLAY,false);
      }
      me.game.HUD.reset();
    }
    this.previoustick = me.game.ticked; //dirty hack for ticks but who cares ;)
    me.game.repaint();
    return true;
  },

  draw: function(){
  }

});
