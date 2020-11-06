const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Переменная для того что бы менять конфигурацию при билде Dev или Prod
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

// function for minimization scc and js files
const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };
  if (isProd) {
    config.minimizer = [
      new OptimizeCSSPlugin(),
      new TerserPlugin(),
    ];
  }

  return config;
};

// Функция для хеша при dev without hash разработке и Prod with hash
const fileName = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

// Функция для загрузки loader CSS/LESS/SCSS
const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
        publicPath: '',
      },
    },
    'css-loader',
    'postcss-loader',
  ];
  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const babelOptions = (preset) => {
  const opts = {
    presets: ['@babel/preset-env'],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
  };
  if (preset) {
    opts.presets.push(preset);
  }
  return opts;
};

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions(),
  }];

  if (isDev) {
    loaders.push(
      {
        loader: 'eslint-loader',
        options: {
          fix: true,
        },
      },
    );
  }

  return loaders;
};

const plugins = () => {
  const base = [
    // Плагин для HTML
    new HTMLWebpackPlugin({
      title: 'Webpack App',
      template: path.resolve(__dirname, './src/index.html'),
      filename: 'index.html',
    }),
    // Очистка dist
    new CleanWebpackPlugin(),
    // Перенос файлов в dist
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, './src/favicon.ico'), to: path.resolve(__dirname, './dist') },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: fileName('css'),
    }),
  ];

  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }

  return base;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  // Входные точки откуда будет происходить билд
  entry: {
    main: ['@babel/polyfill', './index.jsx'],
  },
  // Путь к собраному проекту
  output: {
    filename: fileName('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  // Розширения для файлов что бы не прописывать в конце
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.css'],
    alias: {
      '@models': path.resolve(__dirname, './src/models'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Оптимизация скриптов и стилей что бы не повторялись и минификация при Prod билде
  optimization: optimization(),
  // Сервер для авто обновления контента
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    compress: true,
    hot: !isDev,
    port: 4200,
  },
  devtool: isDev ? 'source-map' : false,
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-typescript'),
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-react'),
        },
      },
      {
        test: /\.css$/i,
        use: cssLoaders(),
      },
      {
        test: /\.less$/i,
        use: cssLoaders('less-loader'),
      },
      {
        test: /\.(s[ac]ss)$/i,
        use: cssLoaders('sass-loader'),
      },
      {
        test: /\.(?:ico|gif|png|svg|jpg|jpeg)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.xml$/,
        use: ['xml-loader'],
      },
      {
        test: /\.csv$/,
        use: ['csv-loader'],
      },
    ],
  },
};
