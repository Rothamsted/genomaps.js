
module.exports = function () {

/* TODO: remove, not used
  var libsWithOrder =[
		'./node_modules/loglevel.js', 
	  './node_modules/bootstrap.js',
	  './node_modules/bootstrap-select.js',
	  './node_modules/jquery.bootstrap-touchspin.js',
 	]
*/


  var config = {

    tmpDir: './.tmp/',

    // all the JavaScript files for this project
    alljs: './src/**/*.js',
    srcJS: './src/js/*js',
    srcCSS: './src/css/*css', 
    libCss: [
			'./node_modules/bootstrap-touchspin/src/jquery.bootstrap-touchspin.css',
			'./node_modules/bootstrap-select/dist/css/bootstrap-select.css'
		],
    libsOrderJs:[
	    './node_modules/loglevel/dist/loglevel.js',
	    './node_modules/jquery/dist/jquery.js', 
	    './node_modules/bootstrap/dist/js/bootstrap.js',
	    './node_modules/bootstrap-select/dist/js/bootstrap-select.js',
	    './node_modules/bootstrap-touchspin/src/jquery.bootstrap-touchspin.js',
	  ],
	  libsJs:[
		  './node_modules/lodash/lodash.js',
			'./node_modules/d3/d3.js',
			'./node_modules/d3.promise/dist/d3.promise.js',
			'./node_modules/labella/dist/labella.js',
			'./node_modules/file-saver/FileSaver.js',
			'./node_modules/simple-statistics/dist/simple_statistics.js', 
			'./node_modules/saveSvgAsPng/saveSvgAsPng.js', 
			'./node_modules/es5-shim/es5-shim.js',
			'./node_modules/es6-shim/es6-shim.js',
   	],
 
    // all the source files
    less: ['./src/less/*.less', '!./src/less/variables.less'],
    srcDir: './src/',
    js: './src/js/*.js',
    svg: './assets/svg/*.svg',

    // the development output
    srcDir: './.tmp/',
    allOutputFiles: './.tmp/**/*',
    distHtml: './src/index.html',
    devHtml: './src/index-dev.html',
    outputCssDir: './.tmp/css/',
    outputJsDir: './.tmp/js/',
    outputLib: './.tmp/lib/',
    outputSvg: './.tmp/assets/*.svg',
    xmlFiles: './test/data/**/*.xml',

    // production output
    build: './dist',
    buildJs:'./dist/js',
    buildCss:'./dist/css',
    svgSpriteConfig: {
      mode: {
        defs: {
          dest: '.',
          sprite: 'sprite-defs.svg',
          inline: true,
        },
      },
    },
  };

  return config;
};