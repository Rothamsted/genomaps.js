/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var {series,dest,src,task}  = require('gulp'),
    args = require('yargs').argv,
    concat = require('gulp-concat'),
    ignore = require('gulp-ignore'),
    del = require('del'),
    terser = require('gulp-terser'),
    rename = require('gulp-rename'),
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
  done();
};

// util function to rename,concat and minify javascript files
function processJs(fileLocation, fileName){
  return src(fileLocation) 
    .pipe(concat(`${fileName}.js`))
    .pipe(dest(config.buildJs, {overwrite:true}))
    .pipe(rename(`${fileName}.min.js`))
    .pipe(terser())
    .pipe(dest(config.buildJs, {overwrite:true}))
}

// ** clean Dist
async function cleanDist (done) {
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
async function copyLibCss(){
  return src(config.libCss)
    .pipe(concat('genomaps-libs.css'))
    .pipe(dest(config.buildCss),{append:true});
};

// ** Copying custom styles ***
async function copyCss(){
  return src(config.srcCSS)
  .pipe(concat('genomaps.css'))
  .pipe(dest(config.buildCss),{append:true});  
};

// ** Copying order required libraries **
async function copyLibJs(){
  $.util.log('Moving js lib unordered files into place');
  processJs(config.libsJs, 'genomaps-libs')
}

async function copyLibOrderJs(){
  $.util.log('Moving js lib ordered files into place');
  processJs(config.libsOrderJs,'genomaps-libs-order')
}

//** non-jquery **
async function copyLibNoJquery(){
  return src(config.libsOrderJs)
  .pipe(ignore.exclude('jquery.js'))
  .pipe(concat('genomaps-libsorder-nojquery.js'))
  .pipe(dest(config.buildJs, {overwrite:true}))
  .pipe(rename('genomaps-libsorder-nojquery.min.js'))
  .pipe(terser())
  .pipe(dest(config.buildJs, {overwrite:true}))
}


// *** custom JS copying ***
async function copyJs(){
  $.util.log('Moving js files into place');
  processJs(config.srcJS,'genomaps')
};


async function copyAssets(){
  return src('./assets/img/*', {'base' :'./assets'})
    .pipe(dest(config.build,{overwrite : true}));
};

async function copyHtml(){
  return src(config.html)
  .pipe(dest(config.build,));
}

async function launchServer(){
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
};


// create a default task and just log a message
task('help', $.taskListing);

exports.default = task('default', series('help'));
exports.optimise = series(cleanStyles,cleanDist,fetchModules,copyLibCss,copyLibJs,copyLibOrderJs,copyLibNoJquery,copyCss,copyJs,copyAssets,copyHtml);
exports.servedev = series(launchServer)

