/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task,parallel,watch}  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    runSequence = require('run-sequence'),
    $ = require('gulp-load-plugins')({ lazy: true}),
    config = require('./gulp.config')();

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
async function compileStyles() {
  $.util.log('Compiling Less to CSS.');
  return src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer({  overrideBrowserslist : ['last 2 version', '> 5%'] }))
    .pipe(dest(config.outputCssDir, {overwrite : true}));
};

// *** JS copying ***
async function copyJs() {
  //Copy js into .tmp folder
  $.util.log('Moving js files into place');
  return src(config.alljs)
    .pipe(dest(config.srcDir, {overwrite : true}));
};

// *** HTML injection ***
async function injectHtml() {
  $.util.log('injecting JavaScript and CSS into the html files');

  var injectStyles = src(config.outputCss, { read: false });
  var injectScripts = src(config.js, { read: false });

  var wiredepOptions = config.getWiredepDefaultOptions();
  var injectOptions = {
    ignorePath: ['src', '.tmp'], addRootSlash: false,
  };

  var wiredep = require('wiredep').stream; 

  return src(config.html)
    .pipe(wiredep(wiredepOptions))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(dest(config.srcDir), {overwrite: true});

  

};


// *** All Injection ***

// *** Watch and live reload ***
async function watchCss() {
  return watch(config.less,{usePolling:true}, series(compileStyles) );
};

// run inject html and copy js
async function wactchJs() {
  return watch(config.js,{usePolling:true}, series(copyJs) );
 };

// run inject-html
async function watchHtml(){
   return watch(config.html,{usePolling:true}, series(injectHtml));
};

 async function watchFiles(){
  return $.util.log('Watching  styles and js');
 };

 async function reload() {
  src(config.injectedHtml)
    .pipe($.connect.reload() );
}

// watch 
async function liveReload() {
  $.util.log('Connecting live reload');
  //return watch(config.allOutputFiles, $.batch( function(){
  //    src(config.injectedHtml)
  //      .pipe($.connect.reload() );
  //}));
  return watch(config.allOutputFiles,  function(){
    src(config.injectedHtml)
      .pipe($.connect.reload());
  });
};


async function serveDev() {
  $.util.log('Starting serve-dev');
  return $.connect.server({
    root: ['.tmp', 'assets', 'node_modules', 'test/data', 'test'],
    port: '8080',
    livereload: true,
  });
};

task('help', $.taskListing);

// create a default task and just log a message


async function copyAssets() {
  return src('./assets/img/*', {'base' :'./assets'})
    .pipe(dest(config.build));
};

async function optimise() {
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
};


task('serve-prod', series(optimise), function () {
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
});
exports.default = task('default', series('help'));
exports.optimise = series(cleanStyles,cleanDist,parallel(series(compileStyles,copyJs,injectHtml),copyAssets),optimise); 
exports.servedev = series(compileStyles,copyJs,injectHtml,watchCss,wactchJs,watchHtml,watchFiles,liveReload,serveDev)
