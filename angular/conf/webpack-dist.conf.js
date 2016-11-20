const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

/*const CopyWebpackPlugin = require('copy-webpack-plugin');*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPrefixPlugin = require('html-webpack-prefix-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('../../package.json');
const autoprefixer = require('autoprefixer');

module.exports = {
    node: {
        fs: "empty"
    },
    module: {
        /*preLoaders: [
         {
         test: /\.js$/,
         exclude: /node_modules/,
         loader: 'eslint?{rules: {"spaced-comment": 0}}'
         }
         ],*/

        loaders: [
            {
                test: /.json$/,
                loaders: [
                    'json'
                ]
            },
            {
              test: /\.(css|less)$/,
              loaders: ExtractTextPlugin.extract({
                fallbackLoader: 'style',
                loader: 'css?minimize!less!postcss'
              })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    'ng-annotate',
                    'babel'
                ]
            },
            {
                test: /.html$/,
                loaders: [
                    'html'
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: conf.path.src('index.html'),
            inject: true,
            prefix: '/angular/'
        }),
        new HtmlWebpackPrefixPlugin(),
        /*new webpack.optimize.UglifyJsPlugin({
         compress: {unused: true, dead_code: true} // eslint-disable-line camelcase
         }),*/
        new ExtractTextPlugin('index-[contenthash].css'),
        /*new CopyWebpackPlugin([
            {
                from: 'src/libs/tinymce/js/tinymce/tinymce.min.js',
                to: 'libs/tinymce/js/tinymce/tinymce.min.js'
            },
            {
                from: 'src/util/stub/',
                to: '../util/stub/'
            },
            {
                from: 'src/app/templates/',
                to: '../app/templates/'
            }
        ])*/
    ],
    postcss: () => [autoprefixer],
    output: {
        path: path.join(process.cwd(), conf.paths.dist),
        filename: '[name]-[hash].js'
    },
    entry: {
        app: `./${conf.path.src('index')}`,
        //vendor: Object.keys(pkg.dependencies).filter(dep => ['todomvc-app-css'].indexOf(dep) === -1)
    }
};
