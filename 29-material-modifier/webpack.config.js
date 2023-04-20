const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: "development",
  name: "material-modifier",
  devtool: 'eval-source-map',
  entry: {
    app: ["./src/index.js"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },

  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015',
        },
      },
      {
        test: /\.s?css$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      },
      {
        type: 'javascript/auto',
        test: /\.(glb|png|svg|jpe?g|gif|hdr|json|mp3|mov|woff|woff2|eot|ttf|otf|mp4|webm|ico)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/',
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, "dist", "index.html"),
      title: `Three.js | Material Modifier`,
      hash: true,
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/assets/", to: "assets/" },
        { from: "src/vendor/", to: "vendor/" },
      ],
      options: {
        concurrency: 100,
      },
    }),
    new NodePolyfillPlugin()
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    host: "0.0.0.0", // Open every network Access.
    compress: true,
    port: 9000,
  },
}
