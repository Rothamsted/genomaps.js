
module.exports = function () {
  var config = {

    tmpDir: './.tmp/',

    // all the JavaScript files for this project
    alljs: './src/**/*.js',
    srcJS: './src/js/*js',
    srcCSS: './src/css/*css', 
    libCss: ['./src/lib/css/jquery.bootstrap-touchspin.css','./src/lib/css/bootstrap-select.css',
    ],
    libJquery:['./src/lib/lib-jquery/loglevel.js', 
    './src/lib/lib-jquery/jquery.js',
    './src/lib/lib-jquery/jquery-ui.js',
    './src/lib/lib-jquery/bootstrap.js',
    './src/lib/lib-jquery/bootstrap-select.js',
    './src/lib/lib-jquery/jquery.bootstrap-touchspin.js',
   ],
    libnoJquery:'./src/lib/no-jquery/*js',
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
    outputLibJq: './.tmp/lib/lib-jquery/',
    outputLibJs: './.tmp/lib/no-jquery/',
    outputLibCss: './.tmp/lib/css/',
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