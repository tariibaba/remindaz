const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = (config) => {
  return {
    ...config,
    target: 'electron-renderer',
    plugins: [...config.plugins, new NodePolyfillPlugin()],
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        path: require.resolve('path-browserify'),
      },
    },
  };
};
