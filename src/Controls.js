define(["libs/underscore"], function (_) {
  "use strict";
  
  var KEYCODE_ENTER = 13;
  var KEYCODE_ESC = 27;
  var KEYCODE_SPACE = 32;
  var KEYCODE_UP = 38;
  var KEYCODE_LEFT = 37;
  var KEYCODE_RIGHT = 39;
  var KEYCODE_DOWN = 40;

  function Controls() {
    document.onkeydown = _(this.handleKeyDown).bind(this);
    document.onkeyup = _(this.handleKeyUp).bind(this);
    
    this.currentKeySet = {};
  }

  Controls.prototype.handleKeyDown = function(e) {
    if (!e) {
      e = window.event;
    }

    var handled = false;
    
    if (e.keyCode === KEYCODE_LEFT) {
      this.currentKeySet.left = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_RIGHT) {
      this.currentKeySet.right = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_UP) {
      this.currentKeySet.up = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_DOWN) {
      this.currentKeySet.down = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_ENTER) {
      this.currentKeySet.enter = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_ESC) {
      this.currentKeySet.esc = true;
      handled = true;
    }
    if (e.keyCode === KEYCODE_SPACE) {
      this.currentKeySet.space = true;
      handled = true;
    }

    return !handled;
  };

  Controls.prototype.handleKeyUp = function(e) {
    if (!e) {
      e = window.event;
    }
    
    if (e.keyCode === KEYCODE_LEFT) {
      delete this.currentKeySet.left;
    }
    if (e.keyCode === KEYCODE_RIGHT) {
      delete this.currentKeySet.right;
    }
    if (e.keyCode === KEYCODE_UP) {
      delete this.currentKeySet.up;
    }
    if (e.keyCode === KEYCODE_DOWN) {
      delete this.currentKeySet.down;
    }
    if (e.keyCode === KEYCODE_ENTER) {
      delete this.currentKeySet.enter;
    }
    if (e.keyCode === KEYCODE_ESC) {
      delete this.currentKeySet.esc;
    }
    if (e.keyCode === KEYCODE_SPACE) {
      delete this.currentKeySet.space;
    }
  };
  
  Controls.prototype.getKeySet = function() {
    return this.currentKeySet;
  };
  
  Controls.prototype.setKeySet = function(keySet) {
    this.currentKeySet = keySet;
  };

  return Controls;
});