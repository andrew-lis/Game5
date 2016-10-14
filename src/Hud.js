define(["libs/underscore", "libs/createjs"], function (_, createjs) {
  "use strict";
  
  var Hud = function(canvasWidth, level) {
    this.canvasWidth = canvasWidth;
    this.height = 32;
    this.level = level;
    this.diamondsText = null;
    this.stateText = null;
    this.timeText = null;
    this.startTime = (new Date()).getTime();
    this.leftTime = this.level.maxTime;
    this.diamonds = 0;
    this.enemyKilled = 0;
    this.statusWin = false;
    this.scoreValue = 0;

    this.initialize();
  };

  var p = Hud.prototype = new createjs.Container();
  p.Container_initialize = p.initialize;

  p.initialize = function() {
    this.Container_initialize();

    // background
    var background = new createjs.Shape();
    background.graphics.beginFill("black").drawRect(0, 0, this.canvasWidth, this.height);
    this.addChild(background);

    var line = new createjs.Shape();
    line.graphics.beginFill("gray").drawRect(0, this.height - 2, this.canvasWidth, 2);
    this.addChild(line);

    var title = new createjs.Text("Game5", "bold 20px Arial", "white");
    title.x = 10;
    title.y = 7;
    this.addChild(title);

    this.timeText = new createjs.Text(this.leftTime + "\"", "bold 18px Arial", "yellow");
    this.timeText.x = 115;
    this.timeText.y = 7;
    this.addChild(this.timeText);

    this.diamondsText = new createjs.Text("0 / " + this.level.winScore, "bold 18px Arial", "yellow");
    this.diamondsText.x = 180;
    this.diamondsText.y = 7;
    this.addChild(this.diamondsText);

    this.stateText = new createjs.Text("", "bold 20px Arial", "white");
    this.stateText.x = 250;
    this.stateText.y = 7;
    this.addChild(this.stateText);
  };

  p.tick = function(event) {
    if (this.startTime !== null) {
      var elapsed = ((new Date()).getTime() - this.startTime) / 1000;
      this.leftTime = (this.level.maxTime - Math.floor(elapsed));
      if (this.leftTime < 0)
        this.leftTime = 0;
      this.timeText.text = this.leftTime + "\"";
      
      this.updateLevelScore();
    }
  };

  p.updateDiamonds = function(diamonds) {
    this.diamonds = diamonds;
    this.diamondsText.text = diamonds + " / " + this.level.winScore;
    
    this.updateLevelScore();
  };

  p.updateStatus = function(newStatus, bad) {
    this.stateText.text = newStatus;
    if (bad === undefined)
      this.stateText.color = "white";
    else {
      this.stateText.color = (bad ? "red" : "green");
      this.statusWin = !bad;
    }
    
    this.startTime = null;
  };
  
  p.addKilledEnemies = function () {
    this.enemyKilled++;
  };
  
  p.updateLevelScore = function() {
    if (this.startTime === null)
      return;
    
    this.scoreValue = this.diamonds * (this.enemyKilled + 1) * this.leftTime;
    this.stateText.text = this.scoreValue;
    this.stateText.color = "yellow";
  };

  return Hud;
});