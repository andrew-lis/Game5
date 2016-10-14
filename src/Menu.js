define(["libs/underscore", "libs/createjs", "Levels"], function (_, createjs, Levels) {
  "use strict";
  
  var Menu = function(controls, canvasWidth, canvasHeight) {
    this.controls = controls;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.selectedItemIx = 0;
    this.items = [];
    this.scores = [];
    this.totalScore = null;
    this.lastTick = 0;
    this.lastControlUp = null;
    this.lastControlEnter = false;
    
    this.initialize();
  };

  var p = Menu.prototype = new createjs.Container();
  p.Container_initialize = p.initialize;

  p.initialize = function() {
    this.Container_initialize();

    // black background
    var background = new createjs.Shape();
    background.graphics.beginFill("black").drawRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.addChild(background);

    var title = new createjs.Text("Game5 - Workers", "bold 40px Arial", "white");
    title.textBaseline = "top";
    title.textAlign = "center";
    title.x = this.canvasWidth / 2;
    title.y = 10;
    this.addChild(title);
    
    var desc = new createjs.Text("Worker must collect all diamonds", "20px Arial", "lightgray");
    desc.textBaseline = "top";
    desc.textAlign = "center";
    desc.x = this.canvasWidth / 2;
    desc.y = 50;
    this.addChild(desc);
    
    this.totalScore = new createjs.Text("Score: 0", "bold 20px Arial", "yellow");
    this.totalScore.textAlign = "center";
    this.totalScore.x = this.canvasWidth / 2;
    this.totalScore.y = 85;
    this.addChild(this.totalScore);
    
    var listY = 120;
    
    _(Levels).each(function (level, ix) {
      if (level.debug === true
          || level.tiles === undefined)
        return;
      
      var item = new createjs.Text(ix, "bold 30px Arial", "white");
      item.textAlign = "center";
      item.x = this.canvasWidth / 2;
      item.y = listY;
      this.addChild(item);
      
      var score = new createjs.Text("0", "10px Arial", "yellow");
      score.x = this.canvasWidth / 2 + item.getMeasuredWidth() / 2 + 20;
      score.y = listY + 12;
      score.value = 0;
      this.addChild(score);
      
      listY += 40;
      this.items.push(item);
      this.scores.push(score);
    }, this);
    
    this.selectedItem = this.items[this.selectedItemIx];
    this.selectedItem.color = "red";
  };

  p.tick = function(event) {
    if (event.time - this.lastTick > 100) {
      this.lastTick = event.time;
      var selectedIx = this.selectedItemIx;
      
      var ctrlKeySet = this.controls.getKeySet();
      var controlUp = null;
      
      if (ctrlKeySet.up) {
        controlUp = true;
      }
      else if (ctrlKeySet.down) {
        controlUp = false;
      }
      
      if (controlUp !== this.lastControlUp) {
        if (controlUp === true) {
          selectedIx--;
        }
        else if (controlUp === false) {
          selectedIx++;
        }
        
        this.lastControlUp = controlUp;
      }

      if (selectedIx < 0)
        selectedIx = 0;
      else if (selectedIx >= this.items.length)
        selectedIx = this.items.length - 1;
      
      if (selectedIx != this.selectedItemIx) {
        for (var i = 0; i < this.items.length; i++) {
          this.items[i].color = (i == selectedIx ? "red" : "white");
        }
        
        this.selectedItemIx = selectedIx;
      }
      
      if (this.lastControlEnter === false
          && (ctrlKeySet.enter || ctrlKeySet.right)) {
        this.lastControlEnter = true;
        var levelName = this.items[this.selectedItemIx].text;
        
        this.dispatchEvent({ type: "levelSelection",
          level: Levels[levelName]});
      } else {
        this.lastControlEnter = false;
      }
    }
  };
  
  p.setCurrentLevelScore = function (scoreValue) {
    var score = this.scores[this.selectedItemIx];
    score.text = scoreValue;
    score.value = scoreValue;
    
    var sum = _(this.scores).reduce(function (memo, scoreItem) {
      return memo + scoreItem.value;
    }, 0);
    
    this.totalScore.text = sum;
  };
  
  return Menu;
});