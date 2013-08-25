
//Top has: HP, Level, Dungeon Level
game.TopHUD = me.HUD_Item.extend({

  init: function() {
    this.parent(10,10);
    this.font = new me.Font("arial", 20, "white");
  },

  draw: function(context, x, y) {
    this.font.draw(context, "Player Level: " + me.game.playerlevel, this.pos.x, this.pos.y);
    if(me.game.level == 0) //a shitty hack
      this.font.draw(context, "Dungeon Level: 1", this.pos.x + 200, this.pos.y);
    else
      this.font.draw(context, "Dungeon Level: " + me.game.level, this.pos.x + 200, this.pos.y);
    if(me.game.player == undefined) //another shitty hack
      this.font.draw(context, "HP: " + me.game.hp + "/" + 12, this.pos.x, this.pos.y + 20);
    else
      this.font.draw(context, "HP: " + me.game.hp + "/" + me.game.player.getMaxHP(), this.pos.x, this.pos.y + 20);
    if(me.game.level == 100)
    	return;
    if(me.game.moves < 0) //even more shitty hacks
      this.font.draw(context, "Steps Left: " + 0, this.pos.x + 200, this.pos.y + 20);
    else
      this.font.draw(context, "Steps Left: " + me.game.moves, this.pos.x + 200, this.pos.y + 20);
  }
});

//Bot has: Equipped items and skills
game.BotHUD = me.HUD_Item.extend({
  init: function() {
    this.parent(10,500);
    this.font = new me.Font("arial", 15, "white");
  },

  draw: function(context, x, y) {
    weapondesc = me.game.equippedWeapon.description;
    weaponname = me.game.equippedWeapon.name;
    weaponplus = me.game.equippedWeapon.damage;
    armordesc = me.game.equippedArmor.description;
    armorname = me.game.equippedArmor.name;
    armorplus = me.game.equippedArmor.absorb;
    this.font.draw(context, "Weapon: " + weaponname + " - " + weapondesc + " Damage: +" + weaponplus, this.pos.x, this.pos.y);
    this.font.draw(context, "Armor: " + armorname + " - " + armordesc + " Resistance: +" + armorplus, this.pos.x, this.pos.y+40);

  }

});

game.DamagePopper = me.HUD_Item.extend({
  init: function(value, x, y, name){
    this.name = name;
    color = "red";
    if(value < 0) {
      color = "green";
    } else if (value == 0) {
      color = "white";
    }
    this.font = new me.Font("arial", 20, color);
    this.life = 200;
    this.parent(x,y,Math.abs(value));
  },

  update: function() {
    this.life -= me.timer.tick * 20;
    this.pos.y -= me.timer.tick;
    if(this.life <= 0){
      return false;
    }
    return true;
  },

  draw: function(context, x, y) {
    this.font.draw(context, this.value, this.pos.x, this.pos.y);
  },

  die: function() {
    me.game.HUD.removeItem(this.name);
  }
});

game.ExpCounter = me.HUD_Item.extend({
  init: function() {
    this.font = new me.Font("arial", 15, "#FFFF66");
    this.parent(0,0);
  },

  draw: function(context, x, y) {
    this.font.draw(context, "XP: " + me.game.exp + "%", 60, 100);
  }
});

game.LevelUpHUD = me.HUD_Item.extend({
  init: function() {
    this.created = me.timer.getTime();
    this.font = new me.Font("arial", 30, "#FFFF66");
    this.parent(0,0);
  },

  draw: function(context, x, y) {
    this.font.draw(context, "LEVEL UP!!", 170, 450);
    if(me.timer.getTime() - this.created > 500)
      me.game.HUD.removeItem("LevelUp");
  }

});

game.SpellsHUD = me.HUD_Item.extend({
  init: function(){
    this.font = new me.Font("arial", 15, "white");
    this.parent(0,0);
  },
  draw: function(context, x, y){
    firemsg = me.game.firelvl == 0 ? "<need lvl5>" : me.game.usedSpells['fire'] != undefined ? "USED" : "lvl" + me.game.firelvl;
    icemsg = me.game.icelvl == 0 ? "<need lvl7>" : me.game.usedSpells['ice'] != undefined ? "USED" : "lvl" + me.game.icelvl;
    healmsg = me.game.heallvl == 0 ? "<need lvl15>" : me.game.usedSpells['heal'] != undefined ? "USED" : "lvl" + me.game.heallvl;
    telemsg = me.game.telelvl == 0 ? "<need lvl25>" : me.game.usedSpells['teleport'] != undefined ? "USED" : "lvl" + me.game.telelvl;
    this.font.draw(context, "[A]Fire: " + firemsg + " [S]Ice: " + icemsg, 130, 80);
    this.font.draw(context, "[F]Heal: " + healmsg + " [D]Teleport: " + telemsg, 130, 100);
  }

});
