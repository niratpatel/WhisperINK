// client/babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // No plugins needed for the reverted state
    plugins: [],
  };
};