"use strict"

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let config = require("./webpack.base.config.js");

config.optimization.minimizer.push(
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
            safe: true,
            autoprefixer: { disable: true }, // 禁用掉cssnano对于浏览器前缀的处理。OptimizeCssAssetsPlugin默认使用cssnano，autoprefixer会把加号的前缀移除。
            mergeLonghand: false,
            discardComments: {
                removeAll: true // 移除注释
            },
            canPrint: true
        }
    })
);
config.optimization.minimizer.push(
    // 多进程并行压缩
    new ParallelUglifyPlugin({ // 插件应用于生产环境而非开发环境
        cacheDir: '.cache/',
        uglifyJS: { // 传递给uglifyJS的参数
            output: {
                comments: false, // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
                beautify: false // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
            },
            compress: {
                warnings: false, // 是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
                drop_console: true, // 是否删除代码中所有的console语句，默认为不删除
                collapse_vars: true, // 是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不转换，为了达到更好的压缩效果，可以设置为false
                reduce_vars: true // 是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
            }
        }
    })
)
config.plugins.push(new BundleAnalyzerPlugin());

module.exports = config;
// module.exports = {
//     optimization: {
//         minimizer: [
//             // 自定义JS优化配置，覆盖默认配置
//             // new UglifyJsPlugin({
//             //     exclude: /\.min\.js$/, // 过滤掉以“.min.js”结尾的文件，因为可以认为这就是压缩好的代码
//             //     cache: true,
//             //     parallel: true, // 开启并行压缩
//             //     sourceMap: false,
//             //     extractComments: false, // 移除注释
//             //     uglifyOptions: {
//             //         compress: {
//             //             unused: true,
//             //             warnings: false,
//             //             drop_debugger: true
//             //         },
//             //         output: {
//             //             comments: false
//             //         }
//             //     }
//             // }),
//             // 优化CSS
//             new OptimizeCssAssetsPlugin({
//                 assetNameRegExp: /\.css$/g,
//                 cssProcessorOptions: {
//                     safe: true,
//                     autoprefixer: { disable: true }, // 禁用掉cssnano对于浏览器前缀的处理。OptimizeCssAssetsPlugin默认使用cssnano，autoprefixer会把加号的前缀移除。
//                     mergeLonghand: false,
//                     discardComments: {
//                         removeAll: true // 移除注释
//                     },
//                     canPrint: true
//                 }
//             }),
//             // 多进程并行压缩
//             new ParallelUglifyPlugin({ // 插件应用于生产环境而非开发环境
//                 cacheDir: '.cache/',
//                 uglifyJS: { // 传递给uglifyJS的参数
//                     output: {
//                         comments: false, // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
//                         beautify: false // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
//                     },
//                     compress: {
//                         warnings: false, // 是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
//                         drop_console: true, // 是否删除代码中所有的console语句，默认为不删除
//                         collapse_vars: true, // 是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不转换，为了达到更好的压缩效果，可以设置为false
//                         reduce_vars: true // 是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
//                     }
//                 }
//             }),
//         ]
//     }
// }