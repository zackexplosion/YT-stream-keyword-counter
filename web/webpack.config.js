const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path')
const webpack = require('webpack')
module.exports = {
  mode: process.env.NODE_ENV,
  context: __dirname,
  entry: {
    // app: path.join(__dirname, 'js', 'app.js'),
    // style: path.join(__dirname, 'sass', 'app.sass'),
    // chat: path.join(__dirname, 'sass', 'chat.sass')
  },
  // entry: [{
  //     chat: path.resolve(__dirname, 'sass', 'chat.sass')
  //   },
  //   // And then the actual application
  //   // path.resolve(__dirname, 'sass', 'app.sass'),
  //   // path.resolve(__dirname, 'sass', 'chat.sass'),
  //   // Add the client which connects to our middleware
  //   // You can use full urls like 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
  //   // useful if you run your app from another point like django
  //   'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
  // ],
  // output: {
  //   path: path.join(__dirname, 'public'),
  //   // publicPath: '/',
  // },
  // output: {
  //   filename: 'app.js',
  //   path: path.resolve(__dirname, 'public')
  // },
  module: {
    rules: [{
      test: /\.(scss|sass)$/,
      use: [
        // 'css-hot-loader',
        MiniCssExtractPlugin.loader,
        "css-loader",
        "sass-loader",
      ]
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: path.join(__dirname, 'dist', "[name].css"),
      // filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  devtool: '#source-map'
}