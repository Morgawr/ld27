function convert_to_tiles(x,y) {
  return {'x': x/32, 'y': y/32};
}

function convert_from_tiles(x,y) {
  return {'x': x*32, 'y': y*32};
}

function generate_unique_name(base) {
  return base + me.timer.getTime();
}

/**
 * PLAYER ENTITY
 */
game.Player = me.ObjectEntity.extend({
  init: function(x, y) {
    settings = me.ObjectSettings;
    settings.image = 'player';
    settings.name = 'player';
    settings.spritewidth = 32;
    settings.spriteheight = 32;
    x = convert_from_tiles(x,y)['x'];
    y = convert_from_tiles(x,y)['y'];
    this.parent(x,y,settings);
    this.setVelocity(0,0);
    this.setMaxVelocity(32,32);
    this.gravity = 0;
    this.collidable = true;
    me.game.moves = 10;
    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    me.game.player = this;
  },

  handleInput: function(){
    if(me.game.moves <= 0 && me.game.level != 100)
      return null;
    moved = 'none';
    if(me.input.isKeyPressed('fire') && me.game.castQueue == null
       && me.game.firelvl > 0 && me.game.usedSpells['fire'] == undefined){
      e = this;
      me.game.usedSpells['fire'] = true;
      me.game.castQueue = function(){
        e.castSpell('fire',me.game.firelvl);
      };
    }
    if(me.input.isKeyPressed('ice') && me.game.castQueue == null
       && me.game.icelvl > 0 && me.game.usedSpells['ice'] == undefined){
      e = this;
      me.game.usedSpells['ice'] = true;
      me.game.castQueue = function(){
        e.castSpell('ice',me.game.icelvl);
      };
    }
    if(me.input.isKeyPressed('heal') && me.game.castQueue == null
       && me.game.heallvl > 0 && me.game.usedSpells['heal'] == undefined){
      e = this;
      me.game.usedSpells['heal'] = true;
      me.game.castQueue = function(){
        e.castSpell('heal',me.game.heallvl);
      };
    }
    if(me.input.isKeyPressed('teleport') && me.game.castQueue == null
       && me.game.telelvl > 0 && me.game.usedSpells['teleport'] == undefined){
      e = this;
      me.game.usedSpells['teleport'] = true;
      me.game.castQueue = function(){
        e.castSpell('teleport',me.game.telelvl);
      };
    }
    if(me.input.isKeyPressed('right')){
      moved = 'right';
      this.vel.x = 32;
      this.vel.y = 0;
    }else if(me.input.isKeyPressed('left')){
      moved = 'left';
      this.vel.x = -32;
      this.vel.y = 0;
    }else if(me.input.isKeyPressed('up')){
      moved = 'up';
      this.vel.x = 0;
      this.vel.y = -32;
    }else if(me.input.isKeyPressed('down')){
      moved = 'down';
      this.vel.x = 0;
      this.vel.y = 32;
    }else{
      this.vel.x = 0;
      this.vel.y = 0;
    }
    return moved;
  },

  castSpell: function(name, level) {
    me.game.add(new game.Skills(name, level, this.pos.x, this.pos.y), this.z+1);
    me.game.sort();
    e = this;
    me.game.castQueue = 'waiting';
    setTimeout(function(){
      me.game.castQueue = null;
    }, 600);
    me.game.repaint();
  },

  update: function(){
    moved = this.handleInput();
    attacked = false;
    oldposx = this.pos.x;
    oldposy = this.pos.y;
    this.updateMovement();
    res = this.collide();
    if(res && (res.obj.type == me.game.ENEMY_OBJECT)) {
      this.pos.x = oldposx; //we pretend we didn't fuck up and walked in the goddamn face of a goddamn enemy
      this.pos.y = oldposy;

      //actually, let's attack him!
      res.obj.getRekt(function(e){
        dmg = me.game.equippedWeapon.damage - e;
        if(dmg < 0)
          return 0;
        else
          return dmg;});
      me.game.add(me.entityPool.newInstanceOf('slash',moved,this.pos), this.z+1);
      me.game.sort();
      attacked = true;
      me.game.ticked = true;
    }
    if(moved!=='none' && (oldposx != this.pos.x || oldposy != this.pos.y)) {
      me.game.ticked = true;
    }
    if(me.game.castQueue != null && me.game.castQueue !== 'waiting') {
      me.game.ticked = true;
    }
    this.parent();
    return true;
  },

  receiveDamage: function(strategy) {
    damage = strategy(this.getArmor());
    uname = generate_unique_name("Damage");
    popper = new game.DamagePopper(damage,this.pos.x, this.pos.y, uname);
    me.game.HUD.addItem(uname, popper);
    me.game.DamageHUD.push(popper);

    if(damage > 0) {
      me.game.hp -= damage;
      me.audio.play('hit');
    }
    if (me.game.hp <= 0) {
      me.state.change(me.state.GAMEOVER);
    }
  },

  getArmor: function() {
    return me.game.equippedArmor.absorb;
  },

  addExp: function(amount){
    me.game.exp += amount;
    if(me.game.exp >= 100) {
      me.game.playerlevel++;
      me.game.hp = this.getMaxHP();
      me.game.HUD.addItem("LevelUp", new game.LevelUpHUD());
      me.audio.play('levelup');
      endLevelup = (function(){
        try{
          me.game.HUD.removeItem("LevelUp");
        }catch(e){
        }
      });
      me.game.add(new game.AnimationObject(600, endLevelup, this.pos.x, this.pos.y, "levelup"),this.z+1);

      this.advanceSkills(me.game.playerlevel);
    }
    me.game.exp = me.game.exp % 100;
  },

  advanceSkills: function(level){
    if(level >= 5 && level % 5 == 0) {
      me.game.firelvl++;
    }
    if(level == 15) {
      me.game.heallvl++;
    }
    if(level == 25) {
      me.game.telelvl++;
    }
    if(level - 2 >= 5 && (level - 2) % 5 == 0 ){
      me.game.icelvl++;
    }
  },

  getMaxHP: function(){
    return 10*(Math.round(me.game.playerlevel/20)+1)+me.game.playerlevel*2;
  },

  heal: function(amount){
    if(me.game.hp + amount > this.getMaxHP())
      me.game.hp = this.getMaxHP();
    else
      me.game.hp += amount;
    uname = generate_unique_name("Damage");
    popper = new game.DamagePopper(-amount, this.pos.x, this.pos.y, uname);
    me.game.HUD.addItem(uname, popper);
    me.game.DamageHUD.push(popper);
  }

});


/**
 * ENEMY ENTITY HERE
 */

game.Enemy = me.ObjectEntity.extend({
  init: function(name, x, y){
    if(name == 'boss') {
      settings = me.ObjectSettings;
      settings.image = 'boss';
      settings.name = 'enemy';
      settings.spritewidth = 32;
      settings.spriteheight = 32;
      x = convert_from_tiles(8,8)['x'];
      y = convert_from_tiles(8,8)['y'];
      this.parent(x,y,settings);
      this.gravity = 0;
      this.collidable = true;
      this.type = me.game.ENEMY_OBJECT;
      this.hp = 400;
      this.updateWithSkill = false;
      this.behavior = 'aggressive';
      this.defense = 65;
      this.damage = 90;
      this.realname = name;
      this.exp = 0;
      return;
    }
    enemy = me.game.enemies[name];
    settings = me.ObjectSettings;
    settings.image = enemy.image;
    settings.name = 'enemy';
    settings.spritewidth = 32;
    settings.spriteheight = 32;
    x = convert_from_tiles(x,y)['x'];
    y = convert_from_tiles(x,y)['y'];
    this.parent(x,y,settings);
    this.gravity = 0;
    this.collidable = true;
    this.type = me.game.ENEMY_OBJECT;
    this.hp = enemy.hp;
    this.updateWithSkill = false;
    this.behavior = enemy.behavior;
    this.defense = enemy.defense;
    this.damage = enemy.damage;
    this.realname = name;
    this.exp = enemy.exp;
    this.minlvl = enemy.min;
    this.maxlvl = enemy.max;
  },

  setPosition: function(x,y) {
    this.set(new Vector2d(x,y), 32, 32);
  },

  attack: function(target, strategy){
    target.receiveDamage(strategy);
  },

  getProperExp: function(){
    if(this.realname == 'thing')
      return 100;
    average = (this.maxlvl - this.minlvl)/2 + this.minlvl;
    step = this.maxlvl - this.minlvl;
    percentage = 100.0 / step;
    currlvl = me.game.playerlevel;
    jump = Math.abs(average - currlvl);
    if(currlvl < this.minlvl)
      return this.exp;
    return Math.round((100-percentage*jump)*(this.exp/100.0));
  },

  getRekt: function(strategy) {
    damage = strategy(this.defense);
    uname = generate_unique_name("Damage");
    popper = new game.DamagePopper(damage, this.pos.x, this.pos.y, uname);
    me.game.HUD.addItem(uname, popper);
    me.game.DamageHUD.push(popper);
    if(damage > 0) {
      me.audio.play('hit');
      this.hp -= damage;
      if(this.behavior == 'indifferent')
        this.behavior = 'aggressive';
    }
    if(this.hp <= 0) {
      if(this.realname == 'boss'){ //we won!
        me.state.change(me.state.GAME_END);
        return;
      }
      me.game.player.addExp(this.getProperExp());
      me.game.remove(this);
    }
  },

  aggroMove: function(){
    playerpos = me.game.player.pos;
    if(this.pos.x < playerpos.x) {
      if(this.pos.x + 32 == playerpos.x && this.pos.y == playerpos.y){
        this.meleeAttack('right');
        return null;
      }else{
        return { x: this.pos.x + 32, y: this.pos.y };
      }
    }else if(this.pos.x > playerpos.x) {
      if(this.pos.x - 32 == playerpos.x && this.pos.y == playerpos.y){
        this.meleeAttack('left');
        return null;
      }else{
        return { x: this.pos.x - 32, y: this.pos.y };
      }
    }else if(this.pos.y < playerpos.y) {
      if(this.pos.x == playerpos.x && this.pos.y + 32 == playerpos.y){
        this.meleeAttack('down');
        return null;
      }else{
        return { x: this.pos.x, y: this.pos.y + 32 };
      }
    }else if(this.pos.y > playerpos.y) {
      if(this.pos.x == playerpos.x && this.pos.y - 32 == playerpos.y){
        this.meleeAttack('up');
        return null;
      } else {
        return { x: this.pos.x, y: this.pos.y - 32 };
      }
    }
  },

  indiffMove: function(){
    if(this.realname == 'thing')
      return null;
    randmove = Math.floor(Math.random()*4 + 1);
    moves = ['left', 'right', 'up', 'down'];
    playerpos = me.game.player.pos;
    switch(moves[randmove-1]){
      case 'left':
        return {x: this.pos.x - 32, y: this.pos.y };
      case 'right':
        return {x: this.pos.x + 32, y: this.pos.y };
      case 'up':
        return {x: this.pos.x, y: this.pos.y - 32 };
      case 'down':
        return {x: this.pos.x, y: this.pos.y + 32 };
    }
  },
  scaredMove: function(){
    playerpos = me.game.player.pos;
    randmove = Math.floor(Math.random()*4+1);
    moves = ['left', 'right', 'up', 'down'];
    if(this.pos.x + 32 == playerpos.x && this.pos.y == playerpos.y){
      this.meleeAttack('right');
      return null;
    }
    if(this.pos.x - 32 == playerpos.x && this.pos.y == playerpos.y){
      this.meleeAttack('left');
      return null;
    }
    if(this.pos.x == playerpos.x && this.pos.y + 32 == playerpos.y){
      this.meleeAttack('down');
      return null;
    }
    if(this.pos.x == playerpos.x && this.pos.y - 32 == playerpos.y){
      this.meleeAttack('up');
      return null;
    }
    //we gotta run
    switch(moves[randmove-1]){
      case 'left':
        if(playerpos.x - 32*4 >= this.pos.x + 32)
          return {x: this.pos.x + 32, y: this.pos.y};
        else
          return {x: this.pos.x - 32, y: this.pos.y};
      case 'right':
        if(playerpos.x + 32*4 <= this.pos.x - 32)
          return {x: this.pos.x - 32, y: this.pos.y};
        else
          return {x: this.pos.x + 32, y: this.pos.y};
      case 'up':
        if(playerpos.y + 32*4 <= this.pos.y - 32)
          return {x: this.pos.x, y: this.pos.y - 32};
        else
          return {x: this.pos.x, y: this.pos.y + 32};
      case 'down':
        if(playerpos.y + 32*4 >= this.pos.y + 32)
          return {x: this.pos.x, y: this.pos.y + 32};
        else
          return {x: this.pos.x, y: this.pos.y - 32};
    }
  },

  meleeAttack: function(direction){
    e = this;
    this.attack(me.game.player,
             (function(armor){
               dmg = e.damage-armor;
               if(dmg < 0)
                 dmg = 0;
               return dmg;}));
    me.game.add(me.entityPool.newInstanceOf('slash',direction, this.pos), this.z+1);
    me.game.sort();
  },

  isFreePosition: function(newpos){
    entities = me.game.getEntityByName('enemy');
    for(i = 0; i < entities.length; i++){
      if(entities[i] != this){
        if(entities[i].pos.x == newpos.x && entities[i].pos.y == newpos.y){
          return false;
        }
      }
    }
    if(me.game.player.pos.x == newpos.x && me.game.player.pos.y == newpos.y)
      return false;
    tilecoord = convert_to_tiles(newpos.x, newpos.y);
    if(tilecoord.x < 3 || tilecoord.x > 12 || tilecoord.y < 3 || tilecoord.y > 12)
      return false;
    return true;
  },

  think: function() { //AI code goes here
    behave = {
      'aggressive': (function(e){return e.aggroMove();}),
      'indifferent': (function(e){return e.indiffMove();}),
      'scared': (function(e){return e.scaredMove();})
    };
    newpos = behave[this.behavior](this);
    if(newpos != null && this.isFreePosition(newpos) && Math.floor(Math.random()*100) > 4){ //sometimes enemies don't move at random ;)
      this.pos.x = newpos.x;
      this.pos.y = newpos.y;
    }
  },

  doUpdate: function(){
    this.think();
    this.updateMovement();
  },

  update: function(){
    if(me.game.ticked) {
      if(me.game.castQueue == null) {
        this.doUpdate();
      }else{
        this.updateWithSkill = true;
      }
    }else if(this.updateWithSkill){
      this.doUpdate();
      this.updateWithSkill = false;
    }

    this.parent();

    return true;
  },

  onDestroyEvent: function(){
    me.entityPool.freeInstance(this);
  }

});


/**
 * SLASH ENTITY
 */
game.Slash = me.ObjectEntity.extend({
  init: function(direction,origin) {
    settings = me.ObjectSettings;
    settings.name = 'slash';
    if(direction == 'up' || direction == 'down'){
      settings.image = 'slashv';
      settings.spritewidth = 25;
      settings.spriteheight = 12;
    }else{
      settings.image = 'slashh';
      settings.spriteheight = 25;
      settings.spritewidth=12;
    }
    this.parent(origin.x, origin.y,settings);
    this.gravity = 0;
    this.lifetime = 500;
    this.setMaxVelocity(10,10);
    this.collidable = false;
    this.direction = direction;
  },

  update: function(){
    step = 3;
    switch(this.direction) {
      case 'up':
        this.vel.x = 0;
        this.vel.y = -step;
        break;
      case 'down':
        this.vel.x = 0;
        this.vel.y = step;
        this.flipY(true);
        break;
      case 'left':
        this.vel.x = -step;
        this.vel.y = 0;
        this.flipX(true);
        break;
      case 'right':
        this.vel.x = step;
        this.vel.y = 0;
        break;
    }
    this.lifetime -= me.timer.tick*120;
    this.updateMovement();
    if(this.lifetime <= 0){
      me.game.remove(this);
      return true;
    }
    return true;
  },

  onDestroyEvent: function(){
    me.entityPool.freeInstance(this); // die
    me.game.repaint();
  }
});

game.DroppedWeapon = me.CollectableEntity.extend({
  init: function(name, x, y){
    settings = me.ObjectSettings;
    settings.image = me.game.weapons[name].image;
    settings.name = 'weapon';
    settings.spritewidth = 32;
    x = convert_from_tiles(x,y)['x'];
    y = convert_from_tiles(x,y)['y'];
    this.parent(x,y,settings);
    this.collidable = true;
    this.gravity = 0;
    this.weapon_id = name;
    this.weapon_name = me.game.weapons[name].name;
  },

  onCollision: function(res, obj) {
    if(obj.type == me.game.ENEMY_OBJECT)
      return;
    if(me.game.equippedWeapon.damage <= me.game.weapons[this.weapon_id].damage){
      me.game.equippedWeapon = me.game.weapons[this.weapon_id];
    }
    me.game.remove(this);
  },

  onDestroyEvent: function(){
    me.entityPool.freeInstance(this);
  }
});

game.DroppedArmor = me.CollectableEntity.extend({
  init: function(name, x, y){
    settings = me.ObjectSettings;
    settings.image = me.game.armors[name].image;
    settings.name = 'armor';
    settings.spritewidth = 32;
    x = convert_from_tiles(x,y)['x'];
    y = convert_from_tiles(x,y)['y'];
    this.parent(x,y,settings);
    this.collidable = true;
    this.gravity = 0;
    this.armor_id = name;
    this.armor_name = me.game.armors[name].name;
  },

  onCollision: function(res, obj) {
    if(obj.type == me.game.ENEMY_OBJECT)
      return;
    if(me.game.equippedArmor.absorb <= me.game.armors[this.armor_id].absorb){
      me.game.equippedArmor = me.game.armors[this.armor_id];
    }
    me.game.remove(this);
  },

  onDestroyEvent: function(){
    me.entityPool.freeInstance(this);
  }
});

game.AnimationObject = me.AnimationSheet.extend({
  init: function(duration, ondeath, x, y, anim) {
    this.parent(x,y, me.loader.getImage(anim), 32, 32);
    this.life = duration;
    this.onDestroyEvent = ondeath;
    e = this;
    setTimeout(function(){
      me.game.remove(e);
    }, duration)
  },
  update: function() {
    //try{
      if(me.game.player == null)
        return false;
      this.pos.x = me.game.player.pos.x;
      this.pos.y = me.game.player.pos.y;
      this.parent();
      return false;
    //}catch(e){
      //;
    //}
  }
});
