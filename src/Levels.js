define([""], function () {
  "use strict";
  
  var Levels = {};
  
  Levels.setLevelsManifest = function (manifest) {
    Levels.manifest = manifest;
  };
  
  Levels.addLevel = function (name, levelDef) {
    Levels[name] = levelDef;
  };
  
  return Levels;
});