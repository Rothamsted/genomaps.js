/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task,watch, parallel}  = require('gulp'),
    args = require('yargs').argv,
    concat = require('gulp-concat'),
    ignore = require('gulp-ignore'),
    del = require('del'),
    terser = require('gulp-terser'),
    rename = require('gulp-rename'),
    $ = require('gulp-load-plugins')({lazy:true}),
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
 function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

// ** clean styles 
 function cleanStyles(done) {
  var files = config.tmpDir + '**/*.css';
  clean(files);
  done();
};

/**
 * Utility that merges multiple .js files into one output and additionally outputs 
 * the minified version.
 * 
 */
function processJs(fileLocation, fileName){
  return src(fileLocation) 
    .pipe(concat(`${fileName}.js`))
    .pipe(dest(config.buildJs, {overwrite:true}))
    .pipe(rename(`${fileName}.min.js`))
    .pipe(terser())
    .pipe(dest(config.buildJs, {overwrite:true}))
}

// ** clean Dist
function cleanDist(done) {
  clean('./dist/*');
  done(); 
};

// ** Copying custom styles ***
function compileStyles(cb){
  $.util.log('Compiling Less to CSS.');
  compileLess()
  cb();
};

// Copies less files from src folder to dist folders (used to copy to tmpDir too)
function compileLess(){
  return src(config.less)
  .pipe($.plumber(function (err) {
    $.util.log(err);
    this.emit('end');
  }))
  .pipe($.less())
  .pipe($.autoprefixer())
  .pipe(concat('genomap.css'))
  .pipe(dest(config.buildCss))
  .pipe(rename('genomap.min.css'))
  .pipe($.csso())
  .pipe(dest(config.buildCss),{append:true})
 }

// ** Copying bootstrap and jquery styles ** 
async function copyLibCss(){
  return src(config.libCss)
    .pipe(concat('jquery-bstrap.css'))
    .pipe(dest(config.buildCss),{append:true})
    .pipe(rename('jquery-bstrap.min.css'))
    .pipe($.csso())
    .pipe(dest(config.buildCss),{append:true});
};

function copyLibJs(cb){
  $.util.log('Moving js lib unordered files into place');
  processJs(config.libsJs, 'genomap-lib');
  cb()
}

// ** Copying Boostrap and Jquery related dependencies where ordering is required **
async function copyJqueryBstrapJs(){
  $.util.log('Moving js lib ordered files into place');
  processJs(config.libsOrderJs,'jquery-bstrap')
}

//** Copying a replicate of jquery-bstrap.js file without Jquery **
// TODO: use processJs?
function copyNoJquery(){
  return src(config.libsOrderJs)
  .pipe(ignore.exclude('jquery.js'))
  .pipe(concat('nonjquery-bstrap.js'))
  .pipe(dest(config.buildJs, {overwrite:true}))
  .pipe(rename('nonjquery-bstrap.js.min.js'))
  .pipe(terser())
  .pipe(dest(config.buildJs, {overwrite:true}))
}

// *** custom JS copying ***
function copyJs(done){
  $.util.log('Moving js files into place');
  processJs(config.srcJS,'genomap')
  done()
};

// *** copying images 
function copyAssets(){
  return src('./assets/img/*', {'base' :'./assets'})
  .pipe(dest(config.tmpDir,{overwrite : true}))
    .pipe(dest(config.build,{overwrite : true}));
};

// ** Copying Html file to dist folder**
function copyProdHtml(cb){
  copyHtml(config.distHtml, config.build)
  cb();
}

// ** Copying Html file to tmp folder **
function copydevHtml(cb){
  copyHtml(config.devHtml, config.srcDir)
  cb()
}

function copyHtml(fileLocation, outputLocation){
    return src(fileLocation)
    .pipe(rename('index.html'))
    .pipe(dest(outputLocation))
}

// launching dev server
async function launchProdServer(){
  return $.connect.server({
    root: [ config.build, config.testDataDir ],
    port: '8000',
    livereload: false,
  });
};


 function launchDevServer(cb){
	// TODO this used to have tmpDir only, but now many files aren't copied into tmpDir anymore
	// Also, it's not clear why We have to add testDataDir, which is a subdir of testDir
	//
  return $.connect.server({
    root: [ config.build, config.tmpDir, config.testDir, config.testDataDir ],
    port: '8000',
    livereload: true,
  });
  cb()
 }

function reload (cb) {
  src(config.devHtml)
  .pipe($.connect.reload());
  cb()
}

function watchFiles(cb){
    watch(config.less, series(cleanStyles,compileStyles, reload))
    watch(config.srcJS,series(copyJs, reload))
    watch(config.devHtml, series(copydevHtml, reload))
    watch(config.xmlFiles,reload)
    cb()
}


const coreTasks =  series(cleanStyles,cleanDist,compileStyles,copyLibCss,copyLibJs,copyJqueryBstrapJs,copyNoJquery,copyJs,copyAssets,copydevHtml,copyProdHtml)



// create a default task and just log a message
task('help', $.taskListing);

exports.default = task('default', series('help'));
exports.build = series(coreTasks)
exports.demo = series(launchProdServer)
exports.demoDev = parallel(series(coreTasks,series(launchDevServer)),series(watchFiles))

