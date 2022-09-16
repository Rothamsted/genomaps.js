

var path = require('path');
var moduleAssets = require('./moduleAssets'); 
var CopyPlugin = require('copy-webpack-plugin');

module.exports = {
   mode: 'development',
   entry: {
       app: './javascripts/main.js'
   },
   plugins:[
    
    new CopyPlugin(

    moduleAssets.map(singlemodule => {
        return {from:path.resolve(__dirname,`./node_modules/${singlemodule}`),to: path.resolve(__dirname, './src/lib')}
    })

    )],
}