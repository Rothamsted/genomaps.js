/* globals  module, require, -$ */

module.exports = function () {
  var config = {

    tmpDir: './.tmp/',

    // all the JavaScript files for this project
    alljs: ['./src/**/*.js', './*.js'],

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
    outputCss: './.tmp/css/*.css',
    outputSvg: './.tmp/assets/*.svg',

    build: './dist/',

    // configuration
    paths: {
      bowerJson: 'package.json',
      bowerDirectory: 'node_modules',
    },

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

   config.getWiredepDefaultOptions = function () {
     
     var options = {
      packageJson: require('./package.json'),
        directory: './bower_components/',
        dependencies: true,
        includeSelf:true,
      dependecies: true,
      includeSelf:true
     };

     return options;
  };

  return config;
};
