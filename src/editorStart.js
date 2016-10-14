(function () {
  "use strict";

  require.config({
    paths: {
      libs: "../libs/",
        
      "libs/jquery" : '../libs/jquery-2.0.3.min'
    },

    shim: {
      "libs/underscore": {
        exports: "_"
      },
      "libs/jquery": {
        exports: "$"
      }
    }
  });

  require(["libs/domReady!", "Editor"], function (domReady, Editor) {
    new Editor();
  });
})();