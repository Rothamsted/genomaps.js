
module.exports = function () {
  var libsWithOrder =[
		'./src/lib/loglevel.js', 
	  './src/lib/bootstrap.js',
	  './src/lib/bootstrap-select.js',
	  './src/lib/jquery.bootstrap-touchspin.js',
 	]


  var config = {

    tmpDir: './.tmp/',

    // all the JavaScript files for this project
    alljs: './src/**/*.js',
    srcJS: './src/js/*js',
    srcCSS: './src/css/*css', 
    libCss: [
			'./src/lib/jquery.bootstrap-touchspin.css',
			'./src/lib/bootstrap-select.css'
		],
    libsOrderJs:[
	    './src/lib/loglevel.js',
	    './src/lib/jquery.js', 
	    './src/lib/bootstrap.js',
	    './src/lib/bootstrap-select.js',
	    './src/lib/jquery.bootstrap-touchspin.js',
	  ],
	  libsJs:[
		  './src/lib/lodash.js',
			'./src/lib/d3.js',
			'./src/lib/d3.promise.js',
			'./src/lib/labella.js',
			'./src/lib/FileSaver.js',
			'./src/lib/simple_statistics.js', 
			'./src/lib/saveSvgAsPng.js', 
			'./src/lib/es5-shim.js',
			'./src/lib/es6-shim.js',
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