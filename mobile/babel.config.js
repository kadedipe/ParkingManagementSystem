module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@api': './src/api',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@assets': './src/assets',
          '@types': './src/types',
          '@contexts': './src/contexts',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
    ['react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: true,
      allowUndefined: true,
    }],
    'react-native-reanimated/plugin',
  ],
};