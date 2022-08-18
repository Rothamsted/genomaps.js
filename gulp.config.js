
module.exports = function () {
  var config = {

    tmpDir: './.tmp/',

    // all the JavaScript files for this project
    alljs: './src/**/*.js',
    srcJS: './src/js/*js',
    srcCSS: './src/css/*css', 
    libCss: ['./src/lib/jquery.bootstrap-touchspin.css','./src/lib/bootstrap-select.css',
    ],
    libJquery:['./src/lib/loglevel.js', 
    './src/lib/jquery.js',
    './src/lib/bootstrap.js',
    './src/lib/bootstrap-select.js',
    './src/lib/jquery.bootstrap-touchspin.js',
   ],
    libnoJquery:['./src/lib/d3.js',
    './src/lib/lodash.js',
    './src/lib/d3.promise.js',
    './src/lib/labella.js',
    "./src/lib/FileSaver.js",
    './src/lib/simple_statistics.js', 
    './src/lib/saveSvgAsPng.js', 
    './src/lib/es5-shim.js',
    './src/lib/es6-shim.js',
    './src/lib/lodash.js'
  ],
    // all the source files
    less: ['./src/less/*.less', '!./src/less/variables.less'],
    html: './src/*.html',
    js: './src/js/*.js',
    svg: './assets/svg/*.svg',

    // the development output
    srcDir: './.tmp/',
    allOutputFiles: './.tmp/**/*',
    injectedHtml: './.tmp/*.html',
    outputCssDir: './.tmp/css/',
    outputJsDir: './.tmp/js/',
    outputLibJq: './.tmp/lib/',
    outputLibJs: './.tmp/lib/',
    outputLibCss: './.tmp/lib/',
    outputCss: './.tmp/css/*.js',
    outputSvg: './.tmp/assets/*.svg',

    build: './dist/',
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