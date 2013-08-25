
/* Game namespace */
var game = {
    // Run on page load.
    "onload" : function () {
        // Initialize the video.
      if (!me.video.init("screen", 800, 600, true, 'auto')) {
        alert("Your browser does not support HTML5 canvas.");
        return;
      }

      // add "#debug" to the URL to enable the debug Panel
      if (document.location.hash === "#debug") {
        window.onReady(function () {
          me.plugin.register.defer(debugPanel, "debug");
        });
      }

        // Initialize the audio.
      me.audio.init("mp3,ogg");

      // Set a callback to run when loading is complete.
      me.loader.onload = this.loaded.bind(this);

      // Load the resources.
      me.loader.preload(game.resources);

      // Initialize melonJS and display a loading screen.
      me.state.change(me.state.LOADING);
    },



    // Run on game resources loaded.
    "loaded" : function () {
      me.state.set(me.state.MENU, new game.TitleScreen());
      me.state.set(me.state.PLAY, new game.PlayScreen());
      me.state.set(me.state.GAME_END, new game.GameOverScreen(true));
      me.state.set(me.state.GAMEOVER, new game.GameOverScreen(false));

      me.input.bindKey(me.input.KEY.A, "fire", true);
      me.input.bindKey(me.input.KEY.S, "ice", true);
      me.input.bindKey(me.input.KEY.D, "teleport", true);
      me.input.bindKey(me.input.KEY.F, "heal", true);
      me.input.bindKey(me.input.KEY.LEFT, "left", true);
      me.input.bindKey(me.input.KEY.UP, "up", true);
      me.input.bindKey(me.input.KEY.DOWN, "down", true);
      me.input.bindKey(me.input.KEY.RIGHT, "right", true);
      me.input.bindKey(me.input.KEY.ENTER, "skip", true);
      me.input.bindKey(me.input.KEY.SPACE, "skip", true);

      me.state.transition("fade", "black", 200);

      me.entityPool.add('enemy', game.Enemy, true);
      me.entityPool.add('slash', game.Slash, true);
      me.entityPool.add('weapon', game.DroppedWeapon, true);
      me.entityPool.add('armor', game.DroppedArmor, true);

      // Start the game.
      me.state.change(me.state.MENU);
    }
};
