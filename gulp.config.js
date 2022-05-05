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
      directory:'./node_modules',
      packageJson: require('./package.json'),
    };
    return options
  }
  return config;
};
