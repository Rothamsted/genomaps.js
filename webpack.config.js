var path = require('path'), 
 CopyWebpackPlugin = require ('copy-webpack-plugin'), 

//  javascript files from node_modules
Assets = require('./nodeAssets'); 
 module.exports = {
    mode: 'development',
    entry: {
        app: './javascripts/main.js'
    },
    plugins:[
        new CopyWebpackPlugin(
        Assets.map(asset => {
            return {
                from: path.resolve(__dirname, `./node_modules/${asset}`),
                to:path.resolve(__dirname, './lib')
            }

     }))]
 }
