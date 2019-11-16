const prod = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './index.js',
  target: 'node',
  mode: prod ? 'production' : 'development',
  output: {
    path: __dirname,
    filename: 'xrandr-watcher.js'
  }
};
