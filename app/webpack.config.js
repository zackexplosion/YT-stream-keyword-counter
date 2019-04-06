const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path')
const webpack = require('webpack')
module.exports = {
  mode: process.env.NODE_ENV,
  context: __dirname,
  entry: [
    // Add the client which connects to our middleware
    // You can use full urls like 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
    // useful if you run your app from another point like django
    // 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    // And then the actual application
    path.resolve(__dirname, 'sass', 'app.sass'),
    // path.resolve(__dirname, 'assets', 'app.js')
  ],
  // output: {
  //   path: path.join(__dirname, 'public'),
  //   publicPath: '/',
  //   filename: 'bundle.js'
  // },
  // output: {
  //   filename: 'app.js',
  //   path: path.resolve(__dirname, 'public')
  // },
  module: {
    rules: [{
      test: /\.(scss|sass)$/,
      use: [
        'css-hot-loader',
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
      // 指定輸出位置
      // [name] 為上方進入點設定的 "名稱"
      filename: path.join('public', 'app.css'),
    })
  ],
  devtool: '#source-map'
}