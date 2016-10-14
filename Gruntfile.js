module.exports = function (grunt) {

  var os = require('os');
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          module: true,
          require: true,
          define: true
        },
        browser: true,
        devel: true,
        laxbreak: true,
        undef: true,
        newcap: true,
        unused: "vars",
        trailing: true,
        jquery: true
      }
    },
    copy: {
      "default": {
        files: [
          {
            expand: true,
            src: ['libs/require.min.js'],
            dest: 'dist',
            filter: 'isFile'
          },
          {
            expand: true,
            src: ['assets/*'],
            dest: 'dist',
            filter: 'isFile'
          }
        ]
      },
      nw_src: {
        files: [{
          expand: true,
          src: ['dist/**/*.*'],
          dest: 'distnw',
          filter: 'isFile'
        },
        {
          expand: true,
          cwd: "nodewebkit",
          src: "package.json",
          dest: "distnw/dist"
        }]
      },
      nw_exec_win: {
        files: [{
          expand: true,
          cwd: "nodewebkit",
          src: ['win/**/*'],
          dest: 'distnw',
          filter: 'isFile'
        }]},
      nw_exec_linux: {
        files: [{
          expand: true,
          cwd: "nodewebkit",
          src: ['linux32/**/*'],
          dest: 'distnw',
          filter: 'isFile'
        }]
      },
      nw_exec_mac: {
        files: [{
          expand: true,
          cwd: "nodewebkit",
          src: ['mac/**/*'],
          dest: 'distnw',
          filter: 'isFile'
        }]
      },
      nw_mac_app: {
        files: [{
          expand: true,
          cwd: "distnw",
          src: ['dist.zip'],
          dest: 'distnw/mac/node-webkit.app/Contents/Resources',
          filter: 'isFile',
          rename: function(dest, src) {
            return dest + "/app.nw";
          }
        }]
      }
    },
    processhtml: {
      options: {
      },
      dist: {
        files: {
          'dist/index.html': ['index.html'],
          'dist/editor.html': ['editor.html']
        }
      }
    },
    requirejs: {
      compileGame: {
        options: {
          name: "start",
          baseUrl: "src",
          mainConfigFile: "src/start.js",
          out: "dist/src/game5.min.js",
          done: requireJsDoneHandler
        }
      },
      compileEditor: {
        options: {
          name: "editorStart",
          baseUrl: "src",
          mainConfigFile: "src/editorStart.js",
          out: "dist/src/game5editor.min.js",
          done: requireJsDoneHandler
        }
      }
    },
    clean: {
      build: ["dist"],
      "nw_del_win" : ["distnw/win/nw.exe"],
      "nw_del_linux" : ["distnw/linux32/nw"]
    },
    compress: {
      nw_dist: {
        options: {
          archive: "distnw/dist.zip"
        },
        files: [
          { expand: true, cwd: "distnw/dist", src: ["**/*"], dest: "" },
        ]
      },
      nw_win: {
        options: {
          archive: "distnw/game5.win.zip"
        },
        files: [
          { expand: true, cwd: "distnw/win", src: ["**/*"], dest: "" },
        ]
      },
      nw_linux32: {
        options: {
          archive: "distnw/game5.linux32.zip"
        },
        files: [
          { expand: true, cwd: "distnw/linux32", src: ["**/*"], dest: "" },
        ]
      },
      nw_mac: {
        options: {
          archive: "distnw/game5.mac.zip"
        },
        files: [
          { expand: true, cwd: "distnw/mac", src: ["**/*"], dest: "" },
        ]
      }
    },
    shell: {
      nw_concat_win: {
        options: {
          stdout: true,
          execOptions: {
            cwd: 'distnw/win'
          }
        },
        command: getConcatCommand("nw.exe", "..\\dist.zip", "game5.exe")
      },
      nw_concat_linux: {
        options: {
          stdout: true,
          execOptions: {
            cwd: 'distnw/linux32'
          }
        },
        command: getConcatCommand("nw", "..\\dist.zip", "game5")
      }
    }
  });
  
  function requireJsDoneHandler(done, output) {
    try {
      var duplicates = require('rjs-build-analysis').duplicates(output);
  
      if (duplicates.length > 0) {
        grunt.log.subhead('Duplicates found in requirejs build:');
        grunt.log.warn(duplicates);
        done(new Error('r.js built duplicate modules, please check the excludes option.'));
      }
  
      done();
    }
    catch (e) {
      grunt.log.errorlns("Error in requireJsDoneHandler: " + e);
    }
  }
  
  function getConcatCommand(file1, file2, output) {
    var osname = os.platform();
    
    grunt.log.writeln("OS specific command, detected: " + osname);
    
    if (osname == "win32") {
      // example: copy /b nw.exe+app.nw app.exe 
      return 'copy /b "' + file1 + '"+"'+ file2 + '" ' + output;
    }
    else if (osname == "linux") {
      file1 = file1.replace(/\\/g,'/');
      file2 = file2.replace(/\\/g,'/');
      output = output.replace(/\\/g,'/');
      // example: cat /usr/bin/nw app.nw > app && chmod +x app
      return 'cat ' + file1 + ' '+ file2 + ' > ' + output + ' && chmod +x ' + output;
    }
    else if (osname == "darwin") {
      throw "Unsupported Apple product detected";
    }
    else {
      throw "Unsupported OS";
    }
  }

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask("default", ["jshint", "clean", "processhtml", "copy:default", "requirejs"]);
  grunt.registerTask("test", ["jshint"]);
  grunt.registerTask("nw_common", ["default", "copy:nw_src", "compress:nw_dist"]);
  grunt.registerTask("nw_win", ["nw_common", "copy:nw_exec_win", "shell:nw_concat_win", "clean:nw_del_win", "compress:nw_win"]);
  grunt.registerTask("nw_linux", ["nw_common", "copy:nw_exec_linux", "shell:nw_concat_linux", "clean:nw_del_linux", "compress:nw_linux32"]);
  grunt.registerTask("nw_mac", ["nw_common", "copy:nw_exec_mac", "copy:nw_mac_app", "compress:nw_mac"]);
  grunt.registerTask("nw", ["nw_win", "nw_linux", "nw_mac"]);
};