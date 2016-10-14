define(["libs/underscore", "libs/createjs"], function (_, createjs) {
  "use strict";
  
  var Enemy = function(board) {
    this.board = board;
    
    this.type = "Q";
    this.lastMove = -3;
    
    // set initial direction of movement
    this.dirX = 1;
    this.dirY = 0;
    this.useRight = true;
    
    this.initialize();
  };

  var p = Enemy.prototype = new createjs.Bitmap();
  p.Bitmap_initialize = p.initialize;

  p.initialize = function() {
    this.Bitmap_initialize("assets/tile_enemyq.png");
    
    this.regY = -(this.board.y);
  };
  
  p.makeMove = function(posX, posY) {
    var res = {
      canMove: false,
      x: posX,
      y: posY
    };
    
    // check if Player is near, if yes, attack!
    for (var px = -1; px <= 1 && res.canMove === false; px += 1) {
      for (var py = -1; py <= 1 && res.canMove === false; py += 1) {
        if (px * py !== 0 || px === py)
          continue;
        var ptype = this.board.getTileType(posX + px, posY + py);
        if (ptype === "@") {
          res.canMove = true;
          res.x = posX + px;
          res.y = posY + py;
        }
      }
    }
    
    if (res.canMove === false) {
      res = this.makeMoveFree(posX, posY);
    }

    return res;
  };
  
  p.makeMoveFree = function (posX, posY) {
    var res = {
      canMove: false,
      x: posX,
      y: posY
    };
    
    // move rotation "matrix" (to left)
    // rotation matrix helps to determine new direction of movement
    // turns: go left (initial), forward, right, back: use 0, 1, -1, 0
    // turns: go right (initial), forward, left, back: use 0, -1, 1, 0)
    var modxx;
    var modxy;
    var modyx;
    var modyy;
    
    if (this.useRight) {
      modxx = 0;
      modxy = -1;
      modyx = 1;
      modyy = 0;
    }
    else {
      modxx = 0;
      modxy = 1;
      modyx = -1;
      modyy = 0;
    }
    
    var tempDirX = this.dirX;
    var tempDirY = this.dirY;
    var lastResportPosX = null;
    var lastResportPosY = null;
    var firstSideTile = null;
    var tempMod = null;
    
    for (var i=0; i < 4 && res.canMove === false; i++) {
      // comp new direction basing on current rotation
      this.dirX = modxx * tempDirX + (modxy)*tempDirY;
      this.dirY = modyx * tempDirX + (modyy)*tempDirY;
      
      res.x = posX + this.dirX;
      res.y = posY + this.dirY;
      
      // shift rotation matrix (in case this loop won't end with a move)
      // rotation for "left first" with: x'=y,y'=-x
      // rotation for "right first" with x'=-y,y'=x 
      if (this.useRight) {
        tempMod = modxx;
        modxx = -modxy;
        modxy = tempMod;
        tempMod = modyx;
        modyx = -modyy;
        modyy = tempMod;
      }
      else {
        tempMod = modxx;
        modxx = modxy;
        modxy = -tempMod;
        tempMod = modyx;
        modyx = modyy;
        modyy = -tempMod;
      }
      
      // check if move is possible and ok
      var possibleTile = this.board.getTileType(res.x, res.y);
      
      if (i === 0) {
        firstSideTile = possibleTile;
      }
      
      if (possibleTile === " " || possibleTile === "@") {
        lastResportPosX = res.x;
        lastResportPosY = res.y;
        
        if (isNearBlock(this.board, res.x, res.y, posX, posY)) {
          res.canMove = true;
        }
      }
      else if (possibleTile === "*"
        && res.x == posX && res.y < posY) {
        // if a rock is found that is above the enemy - freeze,
        // so it can kill the enemy (do not escape before it)
        break;
      }
    }
    
    if (i === 2) {
      // "go forward" was selected, 
      // check what's on the "not selected" side ("other"), 
      // if there's a wall, change sides of "what to check first"
      // (use modxx, etc which now point to "other side") 
      var sideX = modxx * tempDirX + (modxy)*tempDirY;
      var sideY = modyx * tempDirX + (modyy)*tempDirY;
      var otherSideTile = this.board.getTileType(sideX, sideY);
      
      if (firstSideTile === ' ' && otherSideTile !== '') {
        this.useRight = !this.useRight;
      }
    }
    
    if (res.canMove === false && lastResportPosX !== null) {
      // if there was no good move (with rules), check if there is any move at all
      res.x = lastResportPosX;
      res.y = lastResportPosY;
      res.canMove = true;
    }
    
    return res;
  };
  
  p.onRockHit = function (posX, posY, time) {
    for (var x = posX - 1; x <= posX + 1; x++) {
      for (var y = posY - 1; y <= posY + 1; y++) {
        this.board.setTile(x, y, "+", time);
      }
    }
  };
  
  function isNearBlock(board, newX, newY, oldX, oldY) {
    for (var ix = -1; ix <= 1; ix++) {
      for (var iy = -1; iy <= 1; iy++) {
        if ((ix === 0 && iy === 0)
            || (oldX === newX + ix && oldY === newY + iy))
          continue;
        
        var itile = board.getTileType(newX + ix, newY + iy);
        
        if (itile !== " ")
          return true;
      }
    }
    
    return false;
  }
  
  return Enemy;
});