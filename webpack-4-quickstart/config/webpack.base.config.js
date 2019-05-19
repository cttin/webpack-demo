"use strict";

const path = require('path');
const resolve = dir => path.join(__dirname, '..', dir);
const os = require('os');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const AutoDllPlugin = require('autodll-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const relativeToRootPath = "..";

const createHappyPlugin = (id, loaders) => new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    verbose: true
});

module.exports = {
    // entry: {
    //     app: resolve('src/index.js')
    // },
    resolve: { // 配置模块如何解析
        modules: [ // 指定以下目录寻找第三方模块，避免webpack往父级目录递归搜索
            resolve('src'),
            resolve('node_modules')
        ],
        mainFields: ['main'], // 只采用main字段作为入口文件描述字段，减少搜索步骤
        alias: {
            // vue$: "vue/dist/vue.common",
            // moment$: "moment/min/moment.min.js",
            "@components": resolve(__dirname, relativeToRootPath, "./src/components"),
            "@": resolve("src") // 缓存src目录为@符号，避免重复寻址
        }
    },
    module: {
        noParse: /jquery|lodash/, // 忽略未采用模块化的文件，因此jquery或lodash将不会被下面的loaders解析
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(es6|js|jsx)$/,
                exclude: /node_modules/,
                loader: "happypack/loader?id=happy-babel" // @1
            }
        ]
    },
    optimization: {
        minimizer: [],
        runtimeChunk: 'single',
        // 等价于
        // runtimeChunk: {
        //   name: 'runtime'
        // }
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    minSize: 30000, // 小于30KB的代码块不分离出来，因为小代码块还要额外消耗一次请求去加载它，成本太高
                    minChunks: 1,
                    chunks: 'initial',
                    priority: 1 // 该配置项是设置处理的优先级，数值越大越优先处理
                },
                commons: {
                    test: /[\\/]src[\\/]common[\\/]/,
                    name: 'commons',
                    minSize: 30000,
                    minChunks: 3,
                    chunks: 'initial',
                    priority: -1,
                    reuseExistingChunk: true // 这个配置允许我们使用已经存在的代码块
                }
            }
        }
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html",
            // template: 'xxx',
            // inject: true,
            // chunks: ['runtime', 'app'], // 将runtime插入html中
            // chunksSortMode: 'dependency',
            // minify: {/* */}
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new InlineManifestWebpackPlugin('runtime'),
        createHappyPlugin('happy-babel', [{
            loader: 'babel-loader', // 对于@1中，loader: "happypack/loader?id=happy-babel" 这句，便需要在 plugins 中创建一个 happy-babel 的插件实例
            options: {
                babelrc: true,
                cacheDirectory: true // 启用缓存
            }
        }]),
        new AutoDllPlugin({
            inject: true,
            filename: '[name]_[hash].js',
            entry: {
              vendor: [ // 若未使用 cdn可以将常用的库都写进去
                // 'echarts',
                // 'vuex',
                // 'vue-router',
                // 'axios'
              ]
            }
        }),
        // new BundleAnalyzerPlugin()
    ]
}

// if (config.build.bundleAnalyzerReport) {
//     const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//     webpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }

// module.exports = webpackConfig