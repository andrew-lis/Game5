(function () {
  "use strict";

  require.config({
    paths: {
      libs: "../libs/",
      
      "libs/createjs" : "../libs/easeljs-0.7.0.min",
      "libs/preloadjs" : "../libs/preloadjs-0.4.0.min"
    },

    shim: {
      "libs/underscore": {
        exports: "_"
      },
      "libs/createjs": {
        exports: "createjs"
      },
      "libs/preloadjs": {
        deps: ['libs/createjs'],
        exports: "createjs"
      }
    }
  });

  require(["libs/domReady!", "Main"], function (domReady, Main) {
    new Main();
  });
})();