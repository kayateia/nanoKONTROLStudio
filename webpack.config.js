//webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    main: './src/controller.ts',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'nanoKONTROLStudio.control.js' // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  }
};
