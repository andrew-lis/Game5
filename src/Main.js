define(["libs/underscore", "libs/createjs", "Controls", "Menu", "Hud", "Board", "Player", "Levels", "Loader"],
    function (_, createjs, Controls, Menu, Hud, Board, Player, Levels, Loader) {
  "use strict";

  function Main() {
    this.controls = new Controls();
    this.board = null;
    this.hud = null;
    this.stage = null;
    this.player = null;
    this.menu = null;
    this.urlVars = getUrlVars();
    
    this.stage = new createjs.Stage(document.getElementById("view"));

    this.loader = new Loader(this.stage.canvas.width, this.stage.canvas.height);
    this.loader.load();
    this.stage.addChild(this.loader);
    
    this.loader.addEventListener("loadCompleted", _(this.startMenu).bind(this));
    
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addEventListener("tick", _(this.tick).bind(this));
  }
  
  Main.prototype.tick = function(event) {
    if (this.loader !== null) {
      this.loader.tick(event);
    }
    else if (this.player !== null) {
      this.hud.tick(event);
      this.board.tick(event);
      this.player.tick(event);
    }
    else if (this.menu !== null) {
      this.menu.tick(event);
    }

    this.stage.update(event);
  };

  Main.prototype.startMenu = function() {
    this.loader = null;
    
    this.menu = new Menu(this.controls, this.stage.canvas.width, this.stage.canvas.height);
    this.menu.addEventListener("levelSelection", _(this.levelSelectCallback).bind(this));
    
    this.showMenu();
    
    this.handleUrlParams();
  };
  
  Main.prototype.handleUrlParams = function () {
    var level = null;
    
    if (this.urlVars.lvl !== undefined && Levels[this.urlVars.lvl] !== undefined) {
      level = Levels[this.urlVars.lvl];
    }
    else if (this.urlVars.lvlDef !== undefined) {
      var levelText = atob(this.urlVars.lvlDef);
      level = JSON.parse(levelText);
    }
    
    if (level !== null) {
      if (this.urlVars.x !== undefined)
        level.player.x = this.urlVars.x;
      if (this.urlVars.y !== undefined)
        level.player.y = this.urlVars.y;
      if (this.urlVars.winScore !== undefined)
        level.winScore = this.urlVars.winScore;
      if (this.urlVars.maxTime !== undefined)
        level.maxTime = this.urlVars.maxTime;

      this.menu.dispatchEvent({ type: "levelSelection",
        level: level });
    }
  };
  
  Main.prototype.showMenu = function () {
    this.player = null;
    
    this.stage.removeAllChildren();
    this.stage.addChild(this.menu);
    
    this.stage.update();
  };
  
  Main.prototype.levelSelectCallback = function(event) {
    this.stage.removeChild(this.menu);
    
    this.hud = new Hud(this.stage.canvas.width, event.level);
    
    this.board = new Board(this.stage.canvas.width,
        this.stage.canvas.height - this.hud.height, this.hud.height, event.level);
    this.board.y = this.hud.height;
    this.board.addEventListener("enemyKilled", _(this.boardEnemyKilled).bind(this));
    
    this.player = new Player(this.board, this.hud, event.level, this.controls);
    this.player.addEventListener("playerExit", _(this.playerExitEvent).bind(this));
    this.player.addEventListener("playerScoreOk", _(this.playerScoreOk).bind(this));
    
    this.stage.addChild(this.board);
    this.stage.addChild(this.hud);
    this.stage.addChild(this.player);
    
    this.stage.update();
  };
  
  Main.prototype.playerExitEvent = function() {
    this.showMenu();
    
    this.stage.removeChild(this.board);
    this.stage.removeChild(this.hud);
    this.stage.removeChild(this.player);
    
    if (this.hud.statusWin === true) {
      this.menu.setCurrentLevelScore(this.hud.scoreValue);
    }
  };
  
  Main.prototype.playerScoreOk = function () {
    this.board.openExit();
  };
  
  Main.prototype.boardEnemyKilled = function() {
    this.hud.addKilledEnemies();
  };
  
  function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = decodeURIComponent(value);
    });
    return vars;
  }
  
  return Main;
});