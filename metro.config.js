const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree-shaking and optimize for production
config.transformer.minifierConfig = {
  keep_classnames: false,
  keep_fnames: false,
  mangle: {
    keep_classnames: false,
    keep_fnames: false,
  },
  compress: {
    drop_console: true,
  },
};

module.exports = config;
