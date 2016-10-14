# Game5
> A Boulder Dash clone...
Play at http://andrew-lis.github.io/Game5

![screen](http://andrew-lis.github.io/Game5/screen1.jpg)

## How to play
- online http://andrew-lis.github.io/Game5
- deskop on Windows: http://andrew-lis.github.io/Game5/game5.win.zip
- deskop on Linux: http://andrew-lis.github.io/Game5/game5.linux32.zip
- deskop on MAC OSX: http://andrew-lis.github.io/Game5/game5.mac.zip

## Used libs
- Game framework: EaselJS (CreateJS)
- Asset caching: PreloadJS (CreateJS)
- Dependency manager: RequireJS
- Build tool: GruntJS
- DOM manipulation: jQuery
- Utility belt: Underscore
- Linter: JSHint
- HTML processing: grunt-processhtml

## Features
- cool graphics (I made it myself ;)
- keyboard control
- player can move and collect diamonds
- rocks and diamonds can fall if not supported (even to sides)
- player can move rocks
- player can be killed
- board scrolling
- simple "win" and "lose" conditions
- menu with level selection
- HUD with state and score
- exit play by ESC or Enter (only on finish)
- getting back to menu, setting last selection
- exit as win-condition (shown on win-score)
- level editor (creating, loading, altering levels)
- computing score, showing score in game, total score in menu
- URL params can modify gameplay
- preloading assets with load progress bar
- modular architecture
- testing levels with lvlDef url param

## Future features
- sound
- better graphics (including animations)
- support for mobile devices

## Getting Started
- Install Node.js
- Install Grunt-CLI

```shell
npm install grunt-cli -g
```
- Install dependencies
Enter main directory and run following command:

```shell
npm install
```

- Build package

```shell
grunt
```

- Get the build result from the "dist" directory 

## How to play
- try to get required number of diamonds in shortest time
- move rocks to solve puzzles
- kill an enemy to get 9 diamonds
- find a way out before the time is up
- keyboard: cursors (move), space (push), escape (exit level), enter (exit level for winners)
- advanced: create or mod levels with editor (editor.html) (test with URL param lvlDef)

## License
The MIT license
