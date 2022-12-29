const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlPlugin = require('html-webpack-plugin')
const htmlPlugin = new HtmlPlugin({
  template: './public/index.html',                   // 这是html模板存放的地址
  filename: './index.html',
})

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/[name].js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  devtool: 'inline-source-map',
  plugins: [new VueLoaderPlugin(), htmlPlugin],
  cache: {
    type: 'filesystem',
    compression: 'gzip',
    hashAlgorithm: 'md4',
  },
  devServer: {
    // server: 'https',
    open: true,
    // hot: true,
    // historyApiFallback: true,
    // static: './dist',
    host: '0.0.0.0',
    port: '8080',
    allowedHosts: 'all',
    compress: true,
    // https: true,
    // http2: true,
    bonjour: true,
    client: {
      progress: true,
      reconnect: true,
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    headers: [
      {
        key: 'X-Custom',
        value: 'foo',
      },
      {
        key: 'Y-Custom',
        value: 'bar',
      },
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
      },
    },
  },
  optimization: {
    runtimeChunk: 'single',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader'] },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.styl$/,
        use: ["style-loader", "css-loader", "stylus-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
