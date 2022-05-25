/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task,parallel,watch}  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    $ = require('gulp-load-plugins')({lazy:true}),
   webpack = require('webpack'),
   webConfig = require ('./webpack.config'),
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


async function addNodeModules(){
  $.util.log('copying node modules to tmp folder');
    webpack(webConfig, (err,stats)=> {
      if(err){
        return reject(err)
      }
      if(stats.hasErrors()){
        return reject(new Error(stats.compilation.errors.join('\n')))
      }
    })
    

}

// *** cleaning tasks ***
 async function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

function cleanStyles(done) {
  var files = config.tmpDir + '**/*.css';
  clean(files);
  done();
};

function cleanDist (done) {
  clean('./dist/*');
  done(); 
};

// *** CSS Compilation ***
function compileStyles() {
  $.util.log('Compiling Less to CSS.');
  return src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer())
    .pipe(dest(config.outputCssDir, {overwrite : true}));
};

function copyLibCss () {
  return src(config.css)
    .pipe(dest(config.outputCssDir),{append:true});
};

async function copyLibJs(){
  return src(config.libjs) 
    .pipe(dest(config.srcJS));
}

// *** JS copying ***
function copyJs(){
  //Copy js into .tmp folder
  $.util.log('Moving js files into place');
  return src(config.alljs)
    .pipe(dest(config.srcDir, {overwrite :true}));
};

// *** HTML injection ***
function injectHtml() {
  $.util.log('injecting JavaScript and CSS into the html files');
  var injectStyles = src(config.outputCss, { read: false });
  var injectScripts = src(config.js, { read: false });
  var injectOptions = {ignorePath: ['src', '.tmp'], };
  return src(config.html)
    .pipe($.inject(injectStyles, injectOptions),)
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(dest(config.srcDir), {overwrite: false})
};

// *** All Injection called in compile all task***
// series(cleanStyles,compileStyles,copyJs,injectHtml)


// *** Watch and live reload ***
 async function watchCss () {
  return watch(config.less, compileStyles);
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

task('serve-prod', series(compileStyles, function(){
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
}));

// create a default task and just log a message
task('help', $.taskListing);

exports.default = task('default', series('help'));
exports.optimise = series(addNodeModules,cleanStyles,compileStyles,copyLibCss,copyLibJs,copyJs,injectHtml,cleanDist,copyAssets,compileAll);
exports.servedev = series(parallel(copyLibJs,copyJs,injectHtml),watchCss,watchJs,watchHtml,watchTasks,liveReload,serveDev); 
