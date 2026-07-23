module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@shared': './src/shared',
          '@dashboards': './src/dashboards',
          '@screens': './src/screens',
          '@store': './src/shared/store',
          '@models': './src/shared/models',
          '@types': './src/shared/types',
          '@components': './src/shared/components',
          '@theme': './src/shared/theme',
          '@db': './src/shared/db',
          '@api': './src/shared/api',
        },
      },
    ],
  ],
};
