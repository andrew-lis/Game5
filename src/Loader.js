define(["libs/underscore", "libs/createjs", "libs/preloadjs", "Levels"], function (_, createjs, preloadjs, Levels) {
  "use strict";

  var assetsToLoad = [
    { src: "levels.json", type: preloadjs.LoadQueue.JSONP, callback: function () {} },
    "tile_empty.png",
    "tile_tres.png",
    "tile_dan.png",
    "tile_play.png",
    "tile_rock.png",
    "tile_dirt.png",
    "tile_exit.png",
    "tile_enemyq.png"];
  
  var assetsDir = "assets/";
  
  var Loader = function (canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.preload = new preloadjs.LoadQueue(false);

    this.progressValue = 0;
    this.progressBar = null;
    
    this.filesWithError = "";
    
    this.initialize();
  };
  
  var p = Loader.prototype = new createjs.Container();
  p.Container_initialize = p.initialize;

  p.initialize = function() {
    this.Container_initialize();
    
    var background = new createjs.Shape();
    background.graphics.beginFill("black").drawRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.addChild(background);
    
    this.progressBar = new createjs.Shape();
    this.progressBar.graphics.beginFill("gray").drawRect(0, 0, 2, 20);
    this.addChild(this.progressBar);
    
    this.preload.addEventListener("progress", _(this.handleOverallProgress).bind(this));
    this.preload.addEventListener("error", _(this.handleFileError).bind(this));
    this.preload.addEventListener("complete", _(this.handleOverallCompleted).bind(this));
    this.preload.addEventListener("fileload", _(this.handleFileLoaded).bind(this));
  };
  
  p.tick = function(event) {
    this.progressBar.graphics.beginFill("gray").drawRect(0, 0, this.progressValue * this.canvasWidth, 20);
  };
  
  p.load = function() {
    this.preload.loadManifest(assetsToLoad, true, assetsDir);
  };
  
  p.handleOverallProgress = function (e) {
    this.progressValue = e.progress;
    
    this.dispatchEvent({ type: "loadProgress",
      progress: e.progress });
  };
  
  p.handleFileError = function (e) {
    this.filesWithError += e.item.src + ", ";
    
    console.log("Loader: asset load error: " + e.item.src);
  };
  
  p.handleOverallCompleted = function (e) {
    if (this.filesWithError.length > 0) {
      alert("Assets with load error: " + this.filesWithError);
    }
    
    this.dispatchEvent("loadCompleted");
  };
  
  p.handleFileLoaded = function (e) {
    if (e.item.src === "levels.json") {
      // when the manifest is loaded JSONP callback is fired first
      // and it sets its value into Levels module
      var levelLoadManifest = [];
      
      _(Levels.manifest).each(function (value) {
        var obj = { src: value, type: preloadjs.LoadQueue.JSONP, callback: function () {} };
        levelLoadManifest.push(obj);
      });
      
      this.preload.loadManifest(levelLoadManifest, true, assetsDir);
    }
  };
  
  return Loader;
});