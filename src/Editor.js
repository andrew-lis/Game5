define(["libs/underscore", "libs/jquery"], function (_, $) {
  "use strict";

  var typeMapping = [
    { sym: "#", "class": "rock" },
    { sym: " ", "class": "empty" },
    { sym: "-", "class": "dirt" },
    { sym: ".", "class": "dirt" },
    { sym: "+", "class": "diamond" },
    { sym: "E", "class": "exit" },
    { sym: "Q", "class": "enemyQ" },
    { sym: "*", "class": "danger" },
    { sym: "@", "class": "player" },
  ];
  
  function Editor() {
    this.level = null;
    
    $("#load").click(_(this.load).bind(this));
    $("#generate").click(_(this.generate).bind(this));
    $("#dimX, #dimY").change(_(this.onDimsChange).bind(this));
    
    $("#palette td").click(_(this.onPaletteSelect).bind(this));
    $(document).on("click", "#board td", _(this.onBoardSelect).bind(this));
    
    $("#testURL").on("click", function () {
      $(this).select();
    });
    
    this.newBoard();
  }
  
  Editor.prototype.newBoard = function () {
    this.level = {
        "width": 16,
        "height": 16,
        "player": {
          "x": 1,
          "y": 1
        },
        "winScore": 1,
        "maxTime": 120
      };
    
    this.level.tiles = [];
    
    for (var y=0; y < this.level.height; y ++) {
      for (var x=0; x < this.level.width; x++) {
        var filling = ".";
        if (x === 0 || y === 0
            || x == this.level.width - 1 || y === this.level.height -1)
          filling = "#";
        this.level.tiles[x+y*this.level.width] = filling;
      }
    }
    
    $("#dimX").val(this.level.width);
    $("#dimY").val(this.level.height);
    $("#winScore").val(this.level.winScore);
    $("#maxTime").val(this.level.maxTime);
    
    this.showLevel();
  };
  
  Editor.prototype.showLevel = function () {
    this.level.tiles[this.level.player.x+this.level.player.y*this.level.width] = "@";
    
    $("#board tbody").empty();
    
    for (var y=0; y < this.level.height; y++) {
      var row = $("<tr id='1'></tr>").attr("row", y);
     
      for (var x=0; x < this.level.width; x++) {
        var cellType = this.getTileClass(x, y);
        var cell = $("<td></td>").attr("col", x).addClass(cellType);
        row.append(cell);
      }
      
      $("#board tbody").append(row);
    }
    
    $("#board").attr("width", this.level.width*32 + "px")
      .attr("height", this.level.height*32 + "px");
  };
  
  Editor.prototype.load = function () {
    var levelText = $("#textContent").val();
    
    try {
      this.level = JSON.parse(levelText);
      
      $("#dimX").val(this.level.width);
      $("#dimY").val(this.level.height);
      $("#winScore").val(this.level.winScore);
      $("#maxTime").val(this.level.maxTime);
      
      this.showLevel();
    }
    catch (e) {
      alert("Error: " + e);
    }
  };
  
  Editor.prototype.generate = function () {
    this.level.maxTime = parseInt($("#maxTime").val());
    this.level.winScore = parseInt($("#winScore").val());
    
    var newLevel = jQuery.extend(true, {}, this.level);
    
    delete newLevel.tiles;
    
    var text = JSON.stringify(newLevel, null, 2);
    
    text = text.substring(0, text.length - 2);
    text += ",\n  ";
    text += "\"tiles\": [";
    
    var pos = 0;
    for (var y=0; y < this.level.height; y++) {
      if (y > 0)
        text += "            ";
      
      for (var x=0; x < this.level.width; x++, pos++) {
        text += "\"" + this.level.tiles[pos] + "\"";
        if (y != this.level.height - 1 || x != this.level.width - 1)
          text += ",";
      }
      
      if (y != this.level.height - 1)
        text += "\n";
    }
    
    text += "]\n}";
    
    $("#textContent").val(text);
    
    var prefix = $("#testPrefix").val();
    
    $("#testURL").val(prefix + btoa(text));
  };
  
  Editor.prototype.onDimsChange = function () {
    var oldWidth = this.level.width;
    var oldHeight = this.level.height;
    
    this.level.width = $("#dimX").val();
    this.level.height = $("#dimY").val();
    
    var oldTiles = this.level.tiles;
    this.level.tiles = [];
    
    for (var y=0; y < this.level.height; y++) {
      for (var x=0; x < this.level.width; x++) {
        var useSym = null;
        if (x < oldWidth && y < oldHeight)
          useSym = oldTiles[x+y*oldWidth];
        else {
          if (x === 0 || y === 0
              || x == this.level.width - 1 || y === this.level.height -1)
            useSym = "#";
          else
            useSym = ".";
        }
        
        this.level.tiles[x+y*this.level.width] = useSym;
      }
    }
    
    this.showLevel();
  };
  
  Editor.prototype.onPaletteSelect = function (event) {
    $("#palette td").removeClass("active");
    $(event.target).addClass("active");
  };
  
  Editor.prototype.onBoardSelect = function (event) {
    var activeType = $("#palette td.active").attr("type");
    
    var $sel = $(event.target);
    $sel.removeAttr("class");
    $sel.addClass(activeType);
    
    var x = parseInt($sel.attr("col"));
    var y = parseInt($sel.parent().attr("row"));
    
    var sym = this.getSymForClass(activeType);
    
    if (sym === "@") {
      this.level.player = {
          x: x,
          y: y
      };
      
      sym = " ";
    }
    
    this.level.tiles[x+y*this.level.width] = sym;
  };
  
  Editor.prototype.getTileClass = function (x, y) {
    var tile = this.level.tiles[x+y*this.level.width];
    
    for (var i=0; i < typeMapping.length; i++) {
      if (typeMapping[i].sym === tile)
        return typeMapping[i]["class"];
    }
    
    return undefined;
  };
  
  Editor.prototype.getSymForClass = function (cls) {
    for (var i=0; i < typeMapping.length; i++) {
      if (typeMapping[i]["class"] === cls)
        return typeMapping[i].sym;
    }
    
    return undefined;
  };
  
  return Editor;
});