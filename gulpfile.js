/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task,parallel,watch}  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    runSequence = require('run-sequence'),
    $ = require('gulp-load-plugins')({lazy:true}),
    mainBowerFiles = require('main-bower-files')
    config = require('./gulp.config')();

    // Considering this to try this dependency to inject npm modules to html 
    // mainNPMFiles = require('npmfiles'); 

   


// *** Code analysis ***
task('vet', function () {
  $.util.log('Running static code analysis.');
  return src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
});

// *** cleaning tasks ***
async function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

async function cleanStyles() {
  var files = config.tmpDir + '**/*.css';
  clean(files);
};

async function cleanDist () {
  clean('./dist/*');
};

// *** CSS Compilation ***
task('compile-styles', series(cleanStyles, function () {
  $.util.log('Compiling Less to CSS.');

  return src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer({ overrideBrowserslist: ['last 2 version', '> 5%'] }))
    .pipe(dest(config.outputCssDir, {overwrite : true}));
}));

// *** JS copying ***
async function copyJs() {
  //Copy js into .tmp folder
  $.util.log('Moving js files into place');
  return src(config.alljs)
    .pipe(dest(config.srcDir, {overwrite : true}));
};

// *** HTML injection ***
task('inject-html', series('compile-styles', function () {
  $.util.log('injecting JavaScript and CSS into the html files');

  var injectNpm = src(mainBowerFiles({
    paths: {
            bowerDirectory: 'node_modules',
           bowerJson: 'package.json'
          }
  }));

  var injectStyles = src(config.outputCss, { read: false });
  var injectScripts = src(config.js, { read: false });
  var injectOptions = {
    ignorePath: ['src', '.tmp'], addRootSlash: false,
  };

  return src(config.html)
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe($.inject(injectNpm,{name:'npm'}))
    .pipe(dest(config.srcDir), {overwrite: true});
}));

// *** All Injection ***
task('inject', series(parallel('compile-styles', copyJs, 'inject-html')));


// *** Watch and live reload ***
task('watch-css', series('inject-html', function () {
  return watch(config.less, series('compile-styles'));
}));

// run inject html and copy js
task('watch-js', series(parallel('inject-html', copyJs), function () {
  return watch(config.js);
}));

// run inject-html
task('watch-html', series('inject-html'), function () {
  return watch(config.html);
});

task( 'watch-tasks', series('watch-css', 'watch-js', 'watch-html', function (){
  return $.util.log('Watching  styles and js');
}));

task('livereload', series('watch-tasks',  function () {
  $.util.log('Connecting live reload');
  return watch(config.allOutputFiles,  function(){
    gulp.src(config.injectedHtml)
      .pipe($.connect.reload() );
  });
}));


 async function reload() {
  src(config.injectedHtml)
    .pipe($.connect.reload() );
}

// watch 
async  function serveDev() {
  $.util.log('Starting serve-dev');
  return $.connect.server({
    root: ['.tmp', 'assets', 'bower_components', 'test/data', 'test'],
    port: '8080',
    livereload: true,
  });
};




async function copyAssets() {
  return src('./assets/img/*', {'base' :'./assets'})
    .pipe(dest(config.build));
};


task('compile-all', series(parallel('inject', copyAssets, cleanDist), function () {

  var assets = $.useref({ searchPath: ['.tmp', './node_modules'] });

  return src(config.injectedHtml)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(dest(config.build));
}));

task('serve-prod', series('compile-all', function () {
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
}));

// create a default task and just log a message
task('help', $.taskListing);

exports.optimise = task('optimise', series('compile-all'));
exports.default = task('default', series('help'));
exports.servedev = series('livereload', serveDev); 
