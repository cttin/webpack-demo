## 从零开始搭建环境
### 新建一个项目(注意项目名不要和包名相同)，然后在终端执行以下命令：
```
npm init -y // 初始化package.json文件，-y表示默认所有的配置
npm i webpack --save-dev // npm install webpack -g为全局安装，一般推荐本地安装
npm i webpack-cli --save-dev
```
注：定义在`package.json`里面的脚本称为npm脚本，
### 修改代码`package.json`
```
scripts: {
    "build": "webpack"
}
```
此时`package.json`文件是这样的：
```
{
  "name": "webpack-4",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^4.30.0",
    "webpack-cli": "^3.3.2"
  }
}
```
### 运行`npm run build`
通过[npm-run-scripts文档](https://docs.npmjs.com/cli/run-script#description)我们可以知道运行`npm run build`命令实际上会调用`node_modules/.bin/webpack`。执行`node_modules/.bin/webpack`和运行`npm run build`的效果一模一样。
此时，会提示如下信息：
![屏幕快照 2019-05-09 上午7.40.54.png](https://i.loli.net/2019/05/09/5cd3695ce8264.png)
主要包含两个错误：
  1. WARNING：没有设置`mode`选项；
  2. ERROR：没有找到入口文件。
### 默认入口起点和输出
`entry`对象用于webpack查找启动并构建bundle，在以前的webpack版本中，必须在`webpack.config.js`文件中通过`entry`定义entry points(入口起点)，但从**webpack4开始不再必须定义entry points**，它将在./src中寻找entry points，且默认为`./src/index.js`。下面我们来看看。
 - 新建`./src/index.js`，在index.js文件中加点东西：
```
export default function() {
    return 'entry';
}
```
 - 运行`npm run build`
我们发现没有那个ERROR了，而且在`~/webpack-4/dist/main.js`中获取到打包后的文件！也就是说：
>> webpack4默认配置了entry points（入口起点）为`src/index.js`，output（输出）为`dist/main.js`。
综上可得：**webpack不是必须要有配置文件**。
### 通过mode设置development（开发）和 production（生产）模式
在webpack中定义两种及以上的配置是很常见的事情，一个典型的项目可能就会有如下配置：
 - 用于开发环境的配置文件，首先考虑的是方便开发，方便代码调试，不需要考虑代码合并和css样式分离这些，如用于定义webpack dev server等。
 - 用于生产环境的配置文件，生产环境打包是要最后发布到服务器部署的代码，我们需要尽量保持代码简洁，加载性能最优，不需要调试辅助工具，如用于定义UglifyJSPlugin、sourcemap等。  
但在webpack中，你可以在没有一行配置的情况下完成。正如第一个WARNING所示，webpack4可以通过mode设置开发和生产环境。打开`package.json`文件，补充scripts配置：
```
"scripts": {
  "dev": "webpack --mode development",
  "build": "webpack --mode production"
}
```
尝试运行`npm run dev`，你会发现没有那个WARNING了！在`./dist/main.js`中看到了bundle（包）文件，并且是没有压缩的。  
再次尝试运行`npm run build`，再次打开`./dist/main.js`文件，你会看到一个压缩了的bundle（包）！  
在webpack4中production mode（生产模式）可以开箱即用地进行各种优化，包括：压缩、作用域提升、tree-shaking 等。另一方面，development mode(开发模式)针对速度进行了优化，仅仅提供了一种不压缩的 bundle。
或者你也可以在配置文件中加入mode属性：
```
module.exports = {
  mode: 'production' // 或 development
};
```
### 覆盖默认入口起点和输出
如何覆盖默认的entry point(入口点) 和 默认 output(输出) 呢？可以在package.json文件里面配置它们，如：
```
"scripts": {
    "dev": "webpack --mode development ./src/js/index.js --output ./foo/main.js",
    "build": "webpack --mode production ./src/js/index.js --output ./foo/main.js"
}
```
### babel7转译ES6
现在我们编写代码一般都是ES6，但是并非所有浏览器都能识别并处理它。这就需要一种转换，这个转换的步骤称为transpiling(转译)，即使得浏览器可以处理ES6等语法的行为。虽然webpack不知道如何转换，但是webpack可以通过loader（加载器）来进行转译，babel-loader就是用于将ES6及以上版本转译为ES5，除了安装babel-loader，要开始使用loader还需要使用一些依赖，如@babel/core、@babel/present-env等。
```
npm i @babel/core babel-loader @babel/preset-env --save-dev
```
`@babel/core`：babel的核心API都在[@babel/core](https://babel.docschina.org/docs/en/babel-core#docsNav)里面。
`babel-loader`：用于编译JavaScript代码。
`@babel/preset-env`：[@babel/preset-env](https://babel.docschina.org/docs/en/babel-preset-env#docsNav)用于编译成浏览器认识的JavaScript标准。
随后在`package.json`同目录下创建`.babelrc`文件来配置babel：
```
{
    "presets": [
        "@babel/preset-env"
    ]
}
```
这里需要注意一点：babel升级到7以上，如果你以前安装了`babel-core`、`babel-preset-*`等，需要运行`npm un XXX`（XXX => `babel-core`、`babel-preset-*`）把它们卸载掉，重新安装为`npm i -D XXX`（XXX => `@babel/core`、`@babel/preset-env`），并且修改`.babelrc`文件。`-D`是指开发环境需要，上线不需要。
```
.babelrc:
- "presets": ["react", "env", "stage-0"] // stage-*已经弃用
+ "presets": ["@babel/preset-react", "@babel/preset-env"]
```
### 使用babel-loader
要使用babel-loader有几种方式：
 - 通过配置文件使用
    要在webpack中使用loader，还是需要依赖`webpack.config.js`配置文件，我们创建一个名为`webpack.config.js`的文件并配置loader（加载器）。
    接下来在`./src/index.js`里面添加点代码。
    ```
    const arr = [1, 2, 3];
    const result = arr.map(item => item*2);
    ```
    运行`npm run dev`，查看转换后的代码。可以看到代码是经过babel将ES6的代码转换成了ES5的代码。
    这里再进行一下说明，在运行`npm run dev`时，其实是执行了`package.json`里面的scripts命令，scripts字段是一个对象，它的每一个属性都对应一段脚本。当我们运行`npm run dev`时，其实对应的脚本是`webpack --mode development`，具体原理可以参考[npm scripts 使用指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)。默认情况下，会搜索当前目录的`webpack.config.js`文件，这个文件是一个node模块，返回一个json格式的配置信息对象。前面提到我们的项目中可能会定义多种环境，这时候在不同环境下可能需要加载不同的配置文件，我们可以创建一个文件夹来放置不同的配置文件，在scripts命令中通过`--config`选项来指定配置文件。
    ```
    "scripts": {
        "dev": "webpack --mode development --config webpack.dev.config.js",
        "build": "webpack --mode production --config webpack.prd.config.js"
    }
    ```
    针对打包出来的bundle文件具体分析可以参考之前的博客[webpack之bundle文件分析](https://www.jianshu.com/p/39e6a680dcc6)。
 - 不通过配置文件使用
    `--module-bind`允许在scripts命令中指定加载器，但它会增加scripts的复杂性，该特性从webpack3就以已经开始支持：
    ```
    "sccripts": {
        "dev": "webpack --mode development --module-bind js=babel-loader",
        "build": "webpack --mode development --module-bind js=babel-loader"
    }
    ```
### react
  - 首先安装react：
    ```
    npm i react react-dom -D
    ```
  - 接下来添加[@babel/preset-react](https://babel.docschina.org/docs/en/babel-preset-react#docsNav)，它是用于编译react的jsx。
    ```
    npm i @babel/preset-react -D
    ```
  - 然后在`.babelrc`中配置预设：
    ```
    {
    "presets": [
            "@babel/preset-env",
            "@babel/preset-react"
        ]
    }
    ```
  - 使用`babel-loader`来读取`.jsx`文件，在配置文件中配置如下：
    ```
    module.exports = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        }
    }
    ```
  - 最后进行验证，在`.src/App.js`中添加些react代码:
    ```
    import React from 'react';
    import ReactDOM from 'react-dom';
    const App = () => {
        return (
            <div>
                <p>React !</p>
            </div>
        )
    };
    export default App;
    ReactDOM.render(<App />, document.getElementById("app"));
    ```
    在`./src/index.js`文件中导入组件：
    ```
    import App from "./App";
    ```
    最后运行`npm run dev`打包，看看是否成功。
### 处理HTML插件
  webpack需要两个组件来处理HTML：html-webpack-plugin 和 html-loader。使用html-webpack-plugin可以将生成的js自动引入到html页面，不用手动添加，html-loader会把html文件输出成字符串。
  ```
  npm i html-webpack-plugin html-loader -D
  ```
  接下来更新`webpack.config.js`配置文件：
  ```
    const HtmlWebPackPlugin = require('html-webpack-plugin');
    module.exports = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: { minimize: true }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: "./src/index.html",
                filename: "./index.html"
            })
        ]
    }
  ```
  接下来在`./src/index.html`文件中创建一个HTML文件：
  ```
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>webpack 4 quickstart</title>
    </head>
    <body>
        <div id="app">
        </div>
    </body>
    </html>
  ```
  运行构建：
  ```
    npm run build
  ```
  此时在`./dist`目录下已经生成了一个HTML文件，没有必要在HTML文件中引入JS，bundle（包）会自动注入。在浏览器打开这个HTML文件，发现React组件可以正常工作。
### 抽离CSS
  我们知道，要使得CSS样式能够在打包后生效，至少需要用到`style-loader`和`css-loader`两个loaders，`style-loader`的作用就是通过自动注入`<style>`标签将css添加到`<head>`中。webpack打包时也会默认把样式文件打包到`bundle.js`中（css和js在同一个文件），这样如果样式足够多，就会使得打包后的js文件体积变大，阻碍页面的加载速度，可能会引起页面样式的错乱，尤其是在js没有完全加载出来的情况下导致页面无法正常显示。
  这就需要将css文件进行抽离，webpack自身不知道如何抽离css到一个文件中，这时候就需要一些插件的协助。在webpack4以前使用的是`extract-text-webpack-plugin`插件，在webpack4之后使用的是`mini-css-extract-plugin`插件。相比`extract-text-webpack-plugin`，它的优点是：异步加载；不重复编译，性能更好；更容易使用；只针对CSS。
  ```
    npm i mini-css-extract-plugin css-loader -D
  ```
  这里需要注意下：`MiniCssExtractPlugin.loader` 和 `style-loader` 不能共存，所以在loader链中不再使用`style-loader`，且目前不支持HMR（Hot Module Replacement，热更新）。
  接下来进行验证，创建一个`./src/main.css`文件：
  ```
    body{
        color: red;
    }
  ```
  配置plugins（插件）和loader（加载器）：
  ```
    const HtmlWebPackPlugin = require('html-webpack-plugin');
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    module.exports = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
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
                    text: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader"]
                }
            ]
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: "./src/index.html",
                filename: "./index.html"
            }),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            })
        ]
    }
  ```
  再次运行`npm run build`，你会发现在dist目录下已经生成`main.css`文件，再次在浏览器打开`./dist/index.html`文件，你会发现样式生效了！
  再次强调：因为`MiniCssExtractPlugin`不支持热更新，你可以只在生产环境中使用CSS提取，方便在开发环境下进行热重载，或者在开发环境引入 css-hot-loader，以便支持css热更新。
  ```
    {
        test: /\.scss$/,
        use: [
            ...(isDev ? ["css-hot-loader", "style-loader"] : [MiniCssExtractPlugin.loader]),
            "css-loader",
            postcss,
            "sass-loader"
        ]
    }
  ```
### webpack-dev-server
  虽然wepack提供了`webpack --watch`的命令来动态监听文件的改变并实时打包输出新的`bundle.js`文件。但是文件多了之后，打包速度会很慢，而且不能做到`hot replace`，每次webpack编译之后，还需要手动去刷新浏览器。
  `webpack-dev-server`就是解决这么一个问题，它启动了一个使用express的http服务器。此外，这个http服务器和client使用了websocket通信协议，原始文件改变之后，`webpack-dev-server`都会实时的编译。所以如果配置了[webpack-dev-server](https://github.com/webpack/webpack-dev-server)，它将会在浏览器中启动你的应用程序，每次更改文件时，会自动刷新浏览器的窗口。不过需要注意，启动`webpack-dev-server`，编译后的文件并没有输出到目标文件夹中，目标文件夹中是看不到编译后的文件的，实时编译后的文件都保存到了内存当中。
  ```
    npm i webpack-dev-server -D
  ```
  接着在`package.json`文件中添加配置：
  ```
    "scripts": {
        "start": "webpack-dev-server --mode development --open"
    }
  ```
  然后在终端运行`npm start`，你将看到`webpack-dev-server`会在浏览器中开启你的程序。
  到这里，项目的环境基本搭建起来了，下面再重点聊一些优化的部分。
## webpack打包优化
### 缩小编译范围
  在实际项目开发中，为了提升开发效率，可能会使用很多第三方库，即便自己写的代码，模块间相互引用，为了方便也会使用相对路径，或者别名(alias)；这中间如果能使得 Webpack 更快寻找到目标，将对打包速度产生很是积极的影响。
  为了缩小编译范围，减小不必要的编译工作，首先我们可以将modules、mainFields、noParse、alias、includes、exclude等配置起来。
  Webpack的resolve.modules配置模块库（即 node_modules）所在的位置，在 js 里出现 import 'vue' 这样不是相对、也不是绝对路径的写法时，会去 node_modules 目录下找。但是默认的配置，会采用向上递归搜索的方式去寻找，但通常项目目录里只有一个 node_modules，且是在项目根目录，为了减少搜索范围，可以直接写明 node_modules 的全路径；同样，对于别名(alias)的配置也是一样。
  ```
    resolve: {
        modules: [
            resolve('src'),
            resolve('node_modules')
        ],
        mainFields: ['main'],
        alias: {
            moment$: "moment/min/moment.min.js",
            "@components": path.resolve(__dirname, relativeToRootPath, "./src/components"),
            "@": resolve("src")
        }
    },
    module: {
        noParse: /jquery|lodash/,
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "happypack/loader?id=happy-babel" // @1
            }
        ]
    }
  ```
### optimization
  webpack4之后一些默认插件由`optimization`配置替代：
  * `CommonsChunkPlugin`废弃，由`optimization.splitChunks`（拆分代码）和`optimization.runtimeChunk`（提取runtime代码）替代。原来的`CommonsChunkPlugin`产出模块时，会包含重复的代码，无法优化异步模块，并且minchunks的配置也较复杂。
  * `NoEmitOnErrorsPlugin`弃用，由`noEmitOnErrors`替代。在编译出现错误时，使用 `noEmitOnErrors` 来跳过输出阶段。这样可以确保输出资源不会包含错误。生产环境默认开启。
  * `NamedModulesPlugin`弃用，由 `optimization.namedModules` 替代，生产环境默认开启。
  * `ModuleConcatenationPlugin`弃用，由 `optimization.concatenateModules` 替代，生产环境默认开启。
  * `optimize.UglifyJsPlugin`弃用，由 `optimization.minimize` 替代，生产环境默认开启。

  这里先来讲一下CSS和JS在`optimization.minimizer`中的优化配置。
  - minimizer 
    * CSS  
    production环境下，需要将代码进行压缩。webpack5可能会内置CSS压缩器，webpack4目前还需要手动压缩，可以使用`optimize-css-assets-webpack-plugin`，设置`optimization.minimizer`来覆盖默认配置。这款插件主要用来优化CSS文件的输出，其优化策略主要包括：摒弃重复样式、去除样式规则中多余的参数、移除不需要的浏览器前缀等等。
    ```
        // 优化CSS
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessorOptions: {
                safe: true,
                autoprefixer: { disable: true },
                mergeLonghand: false,
                discardComments: {
                    removeAll: true
                },
                canPrint: true
            }
        }),
    ```
    * JS  
    目前，最成熟的JS代码压缩工具是[UglifyJS](https://github.com/mishoo/UglifyJS2)，它会分析JavaScript代码语法树，理解代码含义，从而能做到去除无效代码、日志输出代码、压缩变量名等优化。
    要在webpack中接入UglifyJS需要通过插件的形式，目前有两个比较成熟的插件：
    1. UglifyJsPlugin  
    通过封装UglifyJS实现。虽然webpack4在生产环境下会默认为我们提供`UglifyJS`插件来压缩混淆代码，且webpack4默认也是开启并行压缩的模式，但这不一定能满足我们的需求。我们可以自定义JS优化配置，来覆盖默认的配置。
    ```
    // 自定义JS优化配置，覆盖默认配置
    new UglifyJsPlugin({
        exclude: /\.min\.js$/, // 过滤掉以“.min.js”结尾的文件，因为可以认为这就是压缩好的代码
        cache: true,
        parallel: true, // 开启并行压缩
        sourceMap: false,
        extractComments: false, // 移除注释
        uglifyOptions: {
            compress: {
                unused: true,
                warnings: false,
                drop_debugger: true
            },
            output: {
                comments: false
            }
        }
    }),
    ```
    2. ParallelUglifyPlugin  
    导致编译速度较慢的阶段主要为：babel等 loaders 解析阶段；js 压缩阶段。js 压缩是发布编译的最后阶段，压缩JS代码需要先把代码解析成用Object抽象表示的AST语法树，再去应用各种规则分析和处理AST，导致这个过程耗时非常大。`ParallelUglifyPlugin`通过多进程并行处理，把对多个文件的压缩工作分别给多个子进程去完成，每个子进程还是通过`UglifyJS`去一个个压缩并且输出，子进程处理完后再把结果发送给主进程，从而实现并发编译，进而大幅提升js压缩速度。
    安装：
    ```
    npm i -D webpack-parallel-uglify-plugin
    ```
    替换自带的`UglifyJsPlugin`配置：
    ```
    new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: { // 传递给uglifyJS的参数
            output: {
                comments: false,
                beautify: false
            },
            compress: {
                warnings: false,
                drop_console: true,
                collapse_vars: true,
                reduce_vars: true
            }
        }
    })
    ```
    - runtimeChunk  
    分离出webpack编译运行时的代码，好处是方便做文件的持久化缓存。[runtimeChunk](https://webpack.js.org/configuration/optimization/#optimization-runtimechunk)可以设置多种类型，其中，single即将所有chunk的运行代码打包到一个文件中，multiple就是给每一个chunk的运行代码打包一个文件。
    可以配合InlineManifestWebpackPlugin插件将运行代码直接插入html文件中，这样做可以避免一次请求的开销。
    ```
        optimization: {
            runtimeChunk: 'single'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                filename: "./index.html",
                template: 'xxx',
                inject: true,
                chunks: ['runtime', 'app'], // 将runtime插入html中
                chunksSortMode: 'dependency',
                minify: {/* */}
            }),
            new InlineManifestWebpackPlugin('runtime')
        ]
    ```
    和老版本不同的是，我们并不需要在html模版中添加`<%= htmlWebpackPlugin.files.webpackManifest %>`，只需将runtime加入chunks即可。这里有一个点要注意，InlineManifestWebpackPlugin插件的顺序一定要在HtmlWebpackPlugin之后，否则会导致编译失败。
    - splitChunks  
    webpack4移除了CommonsChunkPlugin插件，取而代之的是splitChunks。
    首先，将`node_modules`分离出来；`common`里面是分理出共享模块，按道理来说，项目的公共代码（或者称为可复用的代码）应该是放置于同一个根目录下的，基于这点可以将src/common中的公用代码提取出来。
    ```
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    minSize: 30000,
                    minChunks: 1,
                    chunks: 'initial',
                    priority: 1
                },
                commons: {
                    test: /[\\/]src[\\/]common[\\/]/,
                    name: 'commons',
                    minSize: 30000,
                    minChunks: 3,
                    chunks: 'initial',
                    priority: -1,
                    reuseExistingChunk: true
                }
            }
        }
    }
    ```
### happyPack
webpack中为了方便各种资源和类型的加载，设计了以 loader 加载器的形式读取资源，但是受nodejs编程模型的影响，所有的 loader 虽然以 async 的形式来并发调用，但还是运行在单个 node 的进程以及在同一个事件循环中。
HappyPack就是为了解决此类问题的，happypack的思路是：同`webpack-parallel-uglify-plugin`插件一样，HappyPack 也能实现并发编译，即将原有的 webpack 对 loader 的执行过程，从单一进程的形式扩展多进程模式，从而加速代码构建；原本的流程保持不变，这样可以在不修改原有配置的基础上，来完成对编译过程的优化，从而可以大幅提升 loader 的解析速度。
```
const  HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const createHappyPlugin = (id, loaders) => new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    verbose: true
});
plugins: [
    createHappyPlugin('happy-babel', [{
        loader: 'babel-loader',
        options: {
            babelrc: true,
            cacheDirectory: true
        }
    }]),
]
```
通过在 loader 中配置直接指向 happypack 提供的 loader，对于文件实际匹配的处理 loader，则是通过配置在 plugin 属性来传递说明，这里 happypack 提供的 loader 与 plugin 的衔接匹配，则是通过id=happybabel来完成。
此外，像 vue-loader、css-loader 等都支持 happyPack 加速。
### AutoDllPlugin
在实际项目中，其实我们希望修改业务功能后打包时只打包业务模块的代码，而不打包那些第三方基础库，如Vue、Vuex、React等等，这样可以快速的提高打包速度。AutoDllPlugin插件就是解决这样一个问题的，在AutoDllPlugin之前其实还有其他的方案，如CommonsChunkPlugin、DLLPlugin等来将第三方库和自己的代码分开，但都存在一定的缺陷，具体可以参考[深入浅出的webpack构建工具---AutoDllPlugin插件(八)](https://www.cnblogs.com/tugenhua0707/p/9526677.html)。
webpack4以上版本安装：
```
    npm install --save-dev autodll-webpack-plugin
```
配置：
```
    const AutoDllPlugin = require('autodll-webpack-plugin');
    new AutoDllPlugin({
        inject: true,
        filename: '[name]_[hash].js',
        entry: {
            vendor: [ // 若未使用 cdn可以将常用的库都写进去
            'echarts',
            'vuex',
            'vue-router',
            'axios'
            ]
        }
    })
```
注意：这里不需要`webpack.dll.config.js`文件。
### webpack-bundle-analyzer
编译速度作为一项指标，影响的更多是开发者体验，与之相比，编译后文件大小更为重要。webpack4 编译的文件，比之前版本略小一些，为了更好的追踪文件 size 变化，开发环境和生产环境都需要引入 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 插件。
```
    npm install --save-dev webpack-bundle-analyzer
```
默认在`http://127.0.0.1:8888/`打开。
## webpack主要构建流程
webpack就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。
webpack 通过 Tapable 来组织这条复杂的生产线。 webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条生产线中，去改变生产线的运作。
webpack强大的功能主要还是依赖于 loader 与 plugin 机制，loader 主要负责对于某些文件的处理与转化。但构建过程中的很多场景，并非都是针对单个文件去做处理的。比如我需要把最终编译后的js文件压缩混淆一下。如果单个文件去压缩，有些全局变量或上下文关系处理起来就很麻烦。比如我想在编译期定义几个全局常量，如定义_DEV_为当前编译环境。这个跟某些文件并没有关系。而这些都需要相应的 plugin 来支持。
我们能大致的感受到，plugin 是作用于webpack命令执行的整个生命周期的。在webpack编译的生命周期中，会暴露出对应的一系列生命周期钩子，以便于 plugin 调用与执行相应的行为。
### 构建流程
webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：
1. 初始化参数（entry-option）：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
2. 开始编译（run）：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3. 确定入口（make）：根据配置中的 entry 找出所有的入口文件；
4. 解析（before-resolve - after-resolve）： 对其中一个模块位置进行解析；
5. 开始构建（build-module）：开始构建 (build) 这个module，这里将使用文件对应的loader加载；
6. 编译（normal-module-loader）：对用loader加载完成的module(是一段js代码)进行编译,用 acorn 编译,生成ast抽象语法树；
7. 收集依赖（program）：开始对ast进行遍历，当遇到require等一些调用表达式时，触发 call require 事件的handler执行，收集依赖；
8. 递归调用：再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
9. 完成模块编译：在经过第 4 - 8 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
10. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会，比如合并，抽取公共模块、加hash、压缩代码，插件 UglifyJsPlugin 就放在这个阶段；
11. bootstrap： 生成启动代码；
12. 输出完成（emit）：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。
在以上过程中，webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 webpack 提供的 API 改变 webpack 的运行结果。
### 核心对象
1. Compile 对象：负责文件监听和启动编译。Compiler 实例中包含了完整的 webpack 配置，全局只有一个 Compiler 实例。
2. compilation 对象：当 webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。一个 Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。Compilation 对象也提供了很多事件回调供插件做扩展。
这两对象都继承自[tapable](https://github.com/webpack/tapable)。

>> 参考  
[使用webpack4提升180%编译速度](http://louiszhai.github.io/2019/01/04/webpack4/)  
[细说 webpack 之流程篇](http://taobaofed.org/blog/2016/09/09/webpack-flow/)  
[从实践中寻找webpack4最优配置](https://segmentfault.com/a/1190000015032321)  


