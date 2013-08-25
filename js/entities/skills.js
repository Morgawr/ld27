function convert_to_tiles(x,y) {
  return {'x': x/32, 'y': y/32};
}

function convert_from_tiles(x,y) {
  return {'x': x*32, 'y': y*32};
}

game.Skills = me.AnimationSheet.extend({
  init: function(name, level, x, y){
    this.parent(-500,-500, me.loader.getImage("skillsheet"),32, 32);
    this.name = name;
    this.level = level;
    this.tilepos = convert_to_tiles(x,y);
    this.x = x;
    this.y = y;
    this.z = 1000;
    this.addAnimation('fire', [0,1,2,3]);
    this.addAnimation('heal', [4,5,6,7]);
    this.addAnimation('ice', [8,9,10,11]);
    this.addAnimation('teleport', [12,13,14,15]);
    this.setCurrentAnimation(name, this.onComplete);
    this.alwaysUpdate = true;

    switch(this.name){
      case 'fire':
        me.audio.play('fire');
        for(i = 1; i <= this.level; i++){
          flag = false;
          //N
          if(this.tilepos.y - i >= 3){
            me.game.add(new this.fireReplica(this.tilepos.x, this.tilepos.y-i, this.level, this.onComplete), this.z);
            flag = true;
          }
          //S
          if(this.tilepos.y + i < 13){
            me.game.add(new this.fireReplica(this.tilepos.x, this.tilepos.y+i, this.level, this.onComplete), this.z);
            flag = true;
          }
          //W
          if(this.tilepos.x - i >= 3){
            me.game.add(new this.fireReplica(this.tilepos.x - i, this.tilepos.y, this.level, this.onComplete), this.z);
            flag = true;
          }
          //E
          if(this.tilepos.x + i < 13){
            me.game.add(new this.fireReplica(this.tilepos.x + i, this.tilepos.y, this.level, this.onComplete), this.z);
            flag = true;
          }
          if(!flag)
            break;
        }
        break;
      case 'heal':
        me.audio.play('heal');
        me.game.add(new this.healReplica(0,0,10,this.onComplete),this.z);
        break;
      case 'ice':
        me.audio.play('ice');
        for(i = 1; i <= this.level; i++){
          flag = false;
          //diagonals
          //NE
          if(this.tilepos.y - i >= 3 && this.tilepos.x - i >= 3){
            me.game.add(new this.iceReplica(this.tilepos.x-i, this.tilepos.y-i, this.level, this.onComplete), this.z);
            flag = true;
          }
          //NW
          if(this.tilepos.y - i >= 3 && this.tilepos.x + i < 13){
            me.game.add(new this.iceReplica(this.tilepos.x+i, this.tilepos.y-i, this.level, this.onComplete), this.z);
            flag = true;
          }
          //S
          if(this.tilepos.y + i < 13 && this.tilepos.x - i >= 3){
            me.game.add(new this.iceReplica(this.tilepos.x-i, this.tilepos.y+i, this.level, this.onComplete), this.z);
            flag = true;
          }
          //SW
          if(this.tilepos.y + i < 13 && this.tilepos.x + i < 13){
            me.game.add(new this.iceReplica(this.tilepos.x+i, this.tilepos.y+i, this.level, this.onComplete), this.z);
            flag = true;
          }
          if(!flag)
            break;
        }
        break;
      case 'teleport':
        me.audio.play('teleport');
        me.game.add(new this.teleportReplica(0,0,10,this.onComplete), this.z);
        break;
    }
    me.game.sort();
  },
  update: function(){
    this.parent();
  },

  onComplete: function(){
    me.game.remove(this);
  },

  iceReplica: me.AnimationSheet.extend({
    init: function(x,y,damage,end){
      pos = convert_from_tiles(x,y);
      this.parent(pos.x,pos.y,me.loader.getImage("skillsheet"),32,32);
      this.addAnimation('ice', [8,9,10,11]);
      this.setCurrentAnimation('ice', end);
      this.damage = damage+Math.floor(me.game.equippedArmor.absorb/5.0)+Math.round(me.game.equippedWeapon.damage*1.2);
    },
    update: function(){
      this.parent();
      if(!this.collisioncheck){
        this.collisioncheck = true;
        entities = me.game.getEntityByName('enemy');
        for(i = 0; i < entities.length; i++){
          tilep1 = convert_to_tiles(this.pos.x, this.pos.y);
          tilep2 = convert_to_tiles(entities[i].pos.x, entities[i].pos.y);
          if(tilep1.x == tilep2.x && tilep1.y == tilep2.y){
            e = this;
            entities[i].getRekt(function(res){
              if((e.damage - res) < 0)
                return 0;
              else
                return e.damage - res;
            });
            break;
          }
        }
      }
    }
  }),

  fireReplica: me.AnimationSheet.extend({
    init: function(x,y,damage,end){
      pos = convert_from_tiles(x,y);
      this.parent(pos.x,pos.y,me.loader.getImage("skillsheet"),32,32);
      this.addAnimation('fire', [0,1,2,3]);
      this.setCurrentAnimation('fire', end);
      this.collisioncheck = false;
      this.damage = damage+me.game.equippedWeapon.damage*2 - me.game.equippedArmor.absorb/2;
    },
    update: function(){
      this.parent();
      if(!this.collisioncheck){
        this.collisioncheck = true;
        entities = me.game.getEntityByName('enemy');
        for(i = 0; i < entities.length; i++){
          tilep1 = convert_to_tiles(this.pos.x, this.pos.y);
          tilep2 = convert_to_tiles(entities[i].pos.x, entities[i].pos.y);
          if(tilep1.x == tilep2.x && tilep1.y == tilep2.y){
            e = this;
            entities[i].getRekt(function(res){
              if((e.damage - res) < 0)
                return 0;
              else
                return e.damage - res;
            });
            break;
          }
        }
      }
    }
  }),

  healReplica: me.AnimationSheet.extend({
    init: function(x,y,damage,end){
      pos = convert_from_tiles(x,y);
      this.parent(me.game.player.pos.x,me.game.player.pos.y,me.loader.getImage("skillsheet"),32,32);
      this.addAnimation('heal', [4,5,6,7]);
      this.setCurrentAnimation('heal',end);
      me.game.player.heal(Math.floor(me.game.player.getMaxHP()/2));
    },
    update: function(){
      this.parent();
      this.pos.x = me.game.player.pos.x;
      this.pos.y = me.game.player.pos.y;
    }
  }),

  teleportReplica: me.AnimationSheet.extend({
    init: function(x,y,damage,end){
      pos = convert_from_tiles(x,y);
      this.parent(me.game.player.pos.x,me.game.player.pos.y,me.loader.getImage("skillsheet"),32,32);
      this.addAnimation('teleport', [12,13,14,15]);
      this.setCurrentAnimation('teleport', end);
      me.game.player.pos.x = 32*4;
      me.game.player.pos.y = 32*4;
      count = 0;
      entities = me.game.getEntityByName('enemy');
      while(count < 5) { // 3 -> 12
        nx = Math.floor(Math.random()*(12-3+1)+3);
        ny = Math.floor(Math.random()*(12-3+1)+3);
        for(i = 0; i < entities.length; i++){
           tilep = convert_to_tiles(entities[i].pos.x, entities[i].pos.y);
          if(tilep.x == nx && tilep.y == ny){
            count++;
            continue;
          }
        }
        me.game.player.pos.x = convert_from_tiles(nx,ny)['x'];
        me.game.player.pos.y = convert_from_tiles(nx,ny)['y'];
        break;
      }
    },
    update: function(){
      this.parent();
      //here we check if we hit anybody
    }
  })
});
