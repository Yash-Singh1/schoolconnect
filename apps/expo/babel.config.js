// The Babel configuration, used by Expo to transpile the code when bundling

module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ["nativewind/babel", require.resolve("expo-router/babel")],
    presets: ["babel-preset-expo"],
  };
};
