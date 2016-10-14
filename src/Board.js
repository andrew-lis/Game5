define(["libs/underscore", "libs/createjs", "Enemy"], function (_, createjs, Enemy) {
  "use strict";

  var Board = function(canvasWidth, canvasHeight, offsetY, level) {
    this.levelDef = level;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.offsetY = offsetY;
    this.tiles = [];
    this.lastMoveTime = 0;
    this.previousMoveTime = -1;
    this.playerX = 0;
    this.playerY = 0;
    this.backgroundIndex = 0;
    this.backgroundFlashShape = null;

    this.initialize();
  };

  var p = Board.prototype = new createjs.Container();
  p.Container_initialize = p.initialize;

  p.initialize = function() {
    this.Container_initialize();

    // black background
    var background = new createjs.Shape();
    background.graphics.beginFill("black").drawRect(0, 0, this.levelDef.width*32, this.levelDef.height*32);
    this.addChild(background);
    this.backgroundIndex = this.getChildIndex(background);
 
    // init 2D tiles array
    this.tiles = [];
    while (this.tiles.length < this.levelDef.height) {
      this.tiles[this.tiles.length] = [];
    }

    // create tile objects from level definition
    _(this.levelDef.tiles).each(function(tileSym, tileIndex) {
      var posX = tileIndex % this.levelDef.width;
      var posY = Math.floor(tileIndex / this.levelDef.width);

      var tile = null;
 
      if (tileSym === "-") {
        tileSym = ".";
      }
      
      if (tileSym === "Q") {
        tile = new Enemy(this);
      }
      else {
        tile = createTile(tileSym);
      }
      
      if (tile.isVisible !== undefined) {
        // on visual object...
        tile.x = posX * 32;
        tile.y = posY * 32;
        this.addChild(tile);
      }

      this.tiles[posY][posX] = tile;
    }, this);
  };

  p.tick = function(event) {
    if (event.time - this.lastMoveTime > 250) {

      // get snapshot of current state, before any moves
      var prevTypes = [];
      while (prevTypes.length < this.levelDef.height) {
        prevTypes[prevTypes.length] = _(this.tiles[prevTypes.length]).pluck("type");
      }

      // go through all tiles
      for ( var posY = 0; posY < this.tiles.length; posY++) {
        for ( var posX = 0; posX < this.tiles[posY].length; posX++) {
          var newX = 0;
          var newY = 0;
          var canMove = false;
          var tile = this.tiles[posY][posX];
          
          // ignore this step if other tile changed it in this tick
          if (tile.lastMove === event.time)
            continue;

          if (tile.type == '*' || tile.type == '+') {
            // fall logic for stones and diamonds
            var tileBelow = this.getTileType(posX, posY + 1);

            if (tileBelow == ' ' || tileBelow == '@' || tileBelow === 'Q') {
              // standard falling down of a rock
              canMove = true;
              newX = posX;
              newY = posY + 1;

              if (tileBelow == '@' && tile.lastMove < this.previousMoveTime) {
                // if a player is below, do not move if rock is stable
                canMove = false;
              }
            }
            else {
              // rock falling of a heap of rocks
              var tilePrevAbove = (posY > 0 ? prevTypes[posY - 1][posX] : undefined);
              var tileAbove = this.getTileType(posX, posY - 1);
              var tileOnRight = this.getTileType(posX + 1, posY);
              var tileBelowRight = this.getTileType(posX + 1, posY + 1);
              var tileOnLeft = this.getTileType(posX - 1, posY);
              var tileBelowLeft = this.getTileType(posX - 1, posY + 1);

              var fallRight = (tileOnRight == ' ' && (tileBelowRight == ' ' ));
              var fallLeft = (tileOnLeft == ' ' && (tileBelowLeft == ' ' ));
              if (tileAbove !== '*' && tilePrevAbove !== '*'
                  && tileAbove !== '+' && tilePrevAbove !== '+'
                  && (fallRight || fallLeft)) {
                canMove = true;
                newX = posX + (fallRight ? +1 : -1);
                newY = posY;
              }
            }
          } // if (tile.type == '*' || tile.type == '+')
          else if (tile.makeMove !== undefined) {
            var moveRes = tile.makeMove(posX, posY);
            canMove = moveRes.canMove;
            newX = moveRes.x;
            newY = moveRes.y;
          }
          
          if (canMove) {
            this.moveTile(posX, posY, newX, newY, event.time);
          }
        } // for...
      } // for... (go through all tiles)
      
      if (this.backgroundFlashShape !== null) {
        this.removeChild(this.backgroundFlashShape);
        this.backgroundFlashShape = null;
      }

      this.previousMoveTime = this.lastMoveTime;
      this.lastMoveTime = event.time;
    }
  };

  p.setViewport = function (player) {
    var viewportDx = null;
    var viewportDy = null;

    // comp viewport offset - if player is too close to one of sides
    var width1_4 = this.canvasWidth / 4;
    var width3_4 = width1_4 * 3;
    var height1_4 = this.canvasHeight / 4;
    var height3_4 = height1_4 * 3;
    var playerOffsetX = player.x - this.regX;
    var playerOffsetY = player.y - this.regY;
    
    if (playerOffsetX > width3_4 - 32) {
      viewportDx = this.regX + (playerOffsetX - width3_4 + 32);
    }
    if (playerOffsetX < width1_4) {
      viewportDx = this.regX + (playerOffsetX - width1_4);
    }
    if (playerOffsetY > height3_4 - 32) {
      viewportDy = this.regY + (playerOffsetY - height3_4 + 32);
    }
    if (playerOffsetY < height1_4) {
      viewportDy = this.regY + (playerOffsetY - height1_4);
    }
    
    // comp how far can the viewport be set
    var viewportHoldX = this.levelDef.width*32 - this.canvasWidth;
    viewportHoldX = viewportHoldX - (viewportHoldX % 32);
    var viewportHoldY = this.levelDef.height*32 - this.canvasHeight;
    viewportHoldY = viewportHoldY - (viewportHoldY % 32);
    
    // check if viewport is outside of the canvas
    if (viewportDx < 0)
      viewportDx = 0;
    else if (viewportDx > viewportHoldX)
      viewportDx = viewportHoldX;
    if (viewportDy < 0)
      viewportDy = 0;
    else if (viewportDy > viewportHoldY)
      viewportDy = viewportHoldY;
    
    // if changed - set new viewport
    if (viewportDx !== null) {
      this.regX = viewportDx;
      player.regX = this.regX;
    }
    
    if (viewportDy !== null) {
      this.regY = viewportDy;
      player.regY = this.regY - this.offsetY;
    }
  };
  
  p.getTileType = function(x, y) {
    if (x < 0 || x >= this.levelDef.width || y < 0 || y >= this.levelDef.height)
      return undefined;

    var tile = this.tiles[y][x];
    if (tile !== undefined)
      return tile.type;
    else
      return undefined;
  };

  p.moveTile = function(fromX, fromY, toX, toY, time) {
    if (fromX < 0 || fromX >= this.levelDef.width
        || fromY < 0 || fromY >= this.levelDef.height)
      return undefined;
    if (toX < 0 || toX >= this.levelDef.width
        || toY < 0 || toY >= this.levelDef.height)
      return undefined;

    var targetTile = this.tiles[toY][toX];
    this.removeChild(targetTile);

    var movingTile = this.tiles[fromY][fromX];
    movingTile.lastMove = time;
    movingTile.x = toX * 32;
    movingTile.y = toY * 32;
    this.tiles[toY][toX] = movingTile;
    this.tiles[fromY][fromX] = getNewTile(' ');

    if (movingTile.type === '@') {
      this.playerX = toX;
      this.playerY = toY;
    }
    
    if (targetTile.type === '@') {
      this.dispatchEvent("playerOverridden");
    }
    else if (targetTile.onRockHit !== undefined) {
      targetTile.onRockHit(toX, toY, time);
      
      this.dispatchEvent("enemyKilled");
    }
  };
  
  p.clearTile = function(x, y, time) {
    if (x < 0 || x >= this.levelDef.width
        || y < 0 || y >= this.levelDef.height)
      return undefined;

    var targetTile = this.tiles[y][x];
    this.removeChild(targetTile);

    this.tiles[y][x] = getNewTile(' ');
    
    return true;
  };
  
  p.setTile = function(x, y, type, time, ignoreBorders) {
    if (x < 0 || x >= this.levelDef.width
        || y < 0 || y >= this.levelDef.height)
      return undefined;

    if (ignoreBorders !== true) {
      if (x === 0 || x === this.levelDef.width -1
          || y === 0 || y === this.levelDef.height - 1)
        return undefined;
    }
    
    var targetTile = this.tiles[y][x];
    this.removeChild(targetTile);

    var newTile =  createTile(type);
    this.tiles[y][x] = newTile;
    newTile.x = x * 32;
    newTile.y = y * 32;
    newTile.lastMove = time;
    this.addChild(newTile);
    
    if (targetTile.type === '@') {
      this.dispatchEvent("playerOverridden");
    }
    
    return true;
  };

  p.initPlayer = function(x, y) {
    // remove any previous
    this.removeChild(this.tiles[y][x]);

    // set player
    this.playerX = x;
    this.playerY = y;
    this.tiles[y][x] = getNewTile('@');
  };
  
  p.getPlayerPos = function () {
    return {
      x: this.playerX,
      y: this.playerY
    };
  };
  
  p.openExit = function () {
    // flash of the background
    this.backgroundFlashShape = new createjs.Shape();
    this.backgroundFlashShape.graphics.beginFill("gray").drawRect(0, 0, this.levelDef.width*32, this.levelDef.height*32);
    this.addChildAt(this.backgroundFlashShape, this.backgroundIndex + 1);
    
    // find exit
    for ( var posY = 0; posY < this.tiles.length; posY++) {
      for ( var posX = 0; posX < this.tiles[posY].length; posX++) {
        var tile = this.tiles[posY][posX];
        
        if (tile.type === "E") {
          tile.image.src = getImagePathForTileDef("E", false);
          return;
        }
      }
    }
  };

  function getImagePathForTileDef(tileDef, hideExit) {
    switch (tileDef) {
      case "+":
        return "assets/tile_tres.png";
      case "E":
        return (hideExit === false ? "assets/tile_exit.png" : "assets/tile_rock.png");
      case "#":
        return "assets/tile_rock.png";
      case "*":
        return "assets/tile_dan.png";
      case ".":
        return "assets/tile_dirt.png";
    }
    return undefined;
  }
  
  function createTile(tileSym) {
    var tile = getNewTile(tileSym);

    var imagePath = getImagePathForTileDef(tileSym);
    var sprite = null;
    
    if (imagePath !== undefined) {
      sprite = new createjs.Bitmap(imagePath);
      _(sprite).extend(tile);
      tile = sprite;
    }

    return tile;
  }

  function getNewTile(tileSym) {
    var tile = {};
    tile.type = tileSym;
    tile.lastMove = -3;
    return tile;
  }

  return Board;
});