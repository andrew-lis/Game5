define(["libs/underscore", "libs/createjs"], function (_, createjs) {
  "use strict";
  
  var Player = function(board, hud, level, controls) {
    this.levelDef = level;
    this.board = board;
    this.hud = hud;
    this.controls = controls;
    this.lastMoveTime = 0;
    this.diamonds = 0;
    this.alive = true;
    
    this.initialize(level);
  };

  var p = Player.prototype = new createjs.Bitmap();
  p.Bitmap_initialize = p.initialize;

  p.initialize = function() {
    this.Bitmap_initialize("assets/tile_play.png");
    
    var x = this.levelDef.player.x;
    var y = this.levelDef.player.y;
    this.board.initPlayer(x, y);
    this.board.addEventListener("playerOverridden", _(this.playerOverridden).bind(this));
    
    this.x = x * 32;
    this.y = y * 32;
    this.regY = -(this.board.y);
    
    this.board.setViewport(this);
  };
  
  p.tick = function(event) {
    if (event.time - this.lastMoveTime <= 250)
      return;
    
    var ctrlKeySet = this.controls.getKeySet();
    
    if (this.alive === true) {
      if (this.hud.leftTime === 0) {
        this.alive = false;
        this.hud.updateStatus("Time's up!", true);
        return;
      }
      
      var moveRequest = false;
      var movePossible = false;
      var curPos = this.board.getPlayerPos();
      var newX = curPos.x;
      var newY = curPos.y;
      
      if (ctrlKeySet.right) {
        newX = curPos.x + 1;
        moveRequest = true;
      }
      else if (ctrlKeySet.left) {
        newX = curPos.x - 1;
        moveRequest = true;
      }
      else if (ctrlKeySet.up) {
        newY = curPos.y - 1;
        moveRequest = true;
      }
      else if (ctrlKeySet.down) {
        newY = curPos.y + 1;
        moveRequest = true;
      }
      
      var newTile = null;
      
      if (moveRequest) {
        newTile = this.board.getTileType(newX, newY);
        
        if (newTile == ' ' || newTile == '.' || newTile == '+'
          || (this.diamonds >= this.levelDef.winScore && newTile === "E")) {
          movePossible = true;
        }
        else if (newTile == '*') {
          // a rock, see if can be moved
          var behindRockX = (newX*2 - curPos.x);
          var tileBehindRock = this.board.getTileType(behindRockX, newY);
          
          if (tileBehindRock === ' ') {
            movePossible = true;
            // move the rock
            this.board.moveTile(newX, curPos.y, behindRockX, newY, event.time);
          }
        }
      }
      
      if (movePossible) {
        var digAside = !!ctrlKeySet.space;
        
        if (digAside === false) {
          this.board.moveTile(curPos.x, curPos.y, newX, newY, event.time);
        }
        else {
          if (newTile !== "E") {
            this.board.clearTile(newX, newY, event.time);
          }
          
          newX = curPos.x;
          newY = curPos.y;
        }
        
        if (newTile == '+') {
          this.diamonds = this.diamonds + 1;
          
          this.hud.updateDiamonds(this.diamonds);
          
          if (this.diamonds == this.levelDef.winScore) {
            // trigger opening the Exit
            this.dispatchEvent("playerScoreOk");
          }
        }
        else if (newTile === "E" && digAside === false) {
          // set game WIND status
          this.alive = false;
          this.board.clearTile(newX, newY, event.time);
          this.hud.updateStatus("Worker wins!", false);
        }
        
        this.lastMoveTime = event.time;

        this.x = newX * 32;
        this.y = newY * 32;
        
        this.board.setViewport(this);
      }
    } // if (canMove)
    
    if (ctrlKeySet.esc
        || (this.alive === false && ctrlKeySet.enter)) {
      this.dispatchEvent("playerExit");
    }
  };
  
  p.playerOverridden = function () {
    this.visible = false;
    this.alive = false;
    
    // set game status
    this.hud.updateStatus("Worker loses!", true);
  };
  
  return Player;
});