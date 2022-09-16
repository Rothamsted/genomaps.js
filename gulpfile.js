/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task,parallel,watch}  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    streamflow = require('stream-series'),
    $ = require('gulp-load-plugins')({lazy:true}),
    config = require('./gulp.config')();

    // webpack config 
    var webpack = require('webpack'), 
    webpackConfig = require("./webpack.config");
      

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

// ** clean styles 
function cleanStyles(done) {
  var files = config.tmpDir + '**/*.css';
  clean(files);
  clean('./src/lib/*');
  done();
};

// ** clean Dist
function cleanDist (done) {
  clean('./dist/*');
  done(); 
};

// copying node_modules with webpack 
async function fetchModules(){
    $.util.log('copying node modules to lib folder')
      webpack(webpackConfig, (err, stats)=> {
      if(err){
        return reject(err)
      }
      if(stats.hasErrors()){
        return reject(new Error(stats.compilation.errors.join('.\n')))
      }
    })
}


// ** Copying bootstrap touchspin styles ** 
function copyLibCss () {
  return src(config.libCss)
    .pipe(dest(config.outputLib),{append:true});
};

// ** Copying custom styles ***
function copyCss(){
  return src(config.srcCSS)
    .pipe(dest(config.outputCssDir),{append:true});
};

// ** Copying order required **
async function copyLibJq(){
  return src(config.libJquery) 
    .pipe(dest(config.outputLib));
}
//** non-jquery **
async function copyLibJs(){
  return src(config.libnoJquery) 
    .pipe(dest(config.outputLib));
}

// *** JS copying ***
function copyJs(){
  //Copy js into .tmp folder
  $.util.log('Moving js files into place');
  return src(config.srcJS)
    .pipe(dest(config.outputJsDir, {overwrite :true}));
};


// *** HTML injection ***
function injectHtml() {
  $.util.log('injecting JavaScript and CSS into the html files');
  var injectLibStyles = src(config.libCss, { read: false });
  var injectJqScripts = src(config.libJquery, { read: false });
  var injectJsibScripts = src(config.libnoJquery, { read: false});
  var injectStyles = src(config.srcCSS, { read: false });
  var injectScripts = src(config.js, { read: false });
  var injectOptions = {ignorePath: ['src', '.tmp'], };
  return src(config.html)
    .pipe($.inject(streamflow(injectJqScripts,injectJsibScripts,injectScripts), injectOptions))
    .pipe($.inject(streamflow(injectLibStyles,injectStyles), injectOptions))
    .pipe(dest(config.srcDir), {overwrite: false})
};

// run inject html and copy js
// parallel('inject-html', copyJs),
async function watchJs() {
  return watch(config.js,copyJs);
};

// run inject-html
 async function watchHtml() {
  return watch(config.html,series(injectHtml));
};

// series(parallel('watch-css', 'watch-js', 'watch-html')
async function watchTasks(){
  return $.util.log('Watching  styles and js');
};

async function liveReload() {
  $.util.log('Connecting live reload');
  return watch(config.allOutputFiles,  function(){
    src(config.injectedHtml)
      .pipe($.connect.reload() );
  });
};


 async function reload() {
  src(config.injectedHtml)
    .pipe($.connect.reload() );
}

// watch 
async function serveDev() {
  $.util.log('Starting serve-dev');
  return $.connect.server({
    root: ['.tmp', 'assets', './node_modules', 'test/data', 'test'],
    port: '8080',
    livereload: true,
  });
};


function copyAssets(){
  return src('./assets/img/*', {'base' :'./assets'})
    .pipe(dest(config.build));
};

async function compileAll(){
  return src(config.injectedHtml)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))

    .pipe($.useref({ searchPath: ['.tmp','./node_modules'] }))
    .pipe($.if('*.js', $.terser()))
    .pipe($.if('*.css', $.csso()))
    .pipe(dest(config.build));
};

task('serve-prod', series(function(){
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
}));

// create a default task and just log a message
task('help', $.taskListing);

exports.default = task('default', series('help'));
exports.optimise = series(cleanStyles,fetchModules,copyCss,copyLibCss,copyLibJs,copyLibJq,copyJs,injectHtml,cleanDist,copyAssets,compileAll);
exports.servedev = series(parallel(copyCss,copyLibCss,copyLibJs,copyLibJq,copyJs,injectHtml),watchJs,watchHtml,watchTasks,liveReload,serveDev); 
