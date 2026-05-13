const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    nodeModulesPath: [
      require('path').resolve(__dirname, 'node_modules'),
      require('path').resolve(__dirname, 'backend/node_modules'),
    ],
  },
  watchFolders: [
    require('path').resolve(__dirname, 'backend'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);