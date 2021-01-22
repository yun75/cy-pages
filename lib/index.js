const { src, dest, series, parallel, watch } = require('gulp');

const del = require('del');

const loadPlugins = require('gulp-load-plugins');

//生成一个对象，所有的插件都会成为这个对象下的一个属性，命名方式去掉前面的 gulp-, 剩下的部分采用驼峰命名
const plugins = loadPlugins(); 

//热更新开发服务器

// const sass = require('gulp-sass'); //scss
// const babel = require('gulp-babel'); //js
// const plugins.swig = require('gulp-swig'); // html 模版引擎转换插件
// const plugins.imagemin = require('gulp-imagemin'); //图片, 无损压缩，只是删除一些原数据的信息，svg 代码格式化

//sass 转化时 认为下划线开头的文件是主文件依赖的文件，不会被准换，会被忽略掉; 
// 配置 outputStyle:expanded, 完全展开的样式输出

//babel 只是转换平台，presets 是最新的ES6插件的集合，需要转换的特性

//swig 模版引擎转换插件

//gulp-load-plugins 自动加载插件

//browser-sync  热更新开发服务器
const browserSync = require('browser-sync');
const bs = browserSync.create(); //创建一个开发服务器

//useref 文件引用处理，自动处理 html 中的构建注释，去掉构建注释，把构建注释中包含的文件合并到一个文件中
const cwd = process.cwd(); //返回当前命令行所在的工作目录
let config = {
  //default config
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'src/assets/styles/*.scss',
      scripts: 'src/assets/script/*.js',
      pages: '*.html',
      images: 'src/assets/images/**',
      fonts: 'src/assets/fonts/**'
    }
  }
}

try {
  const loadConfig = require(`${cwd}/pages.config.js`);
  config = Object.assign({}, config, loadConfig);
} catch (e) { }

const clean = () => {
  return del([ config.build.dist, config.build.temp])
}

const style = () => {
  return src(config.build.paths.styles, { base: config.build.src , cwd: config.build.src }) // base 配置 基准路径，src 后面的目录结构保存下来
    .pipe(plugins.sass({ outputStyle: 'expanded' }))  
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))  // 以流的方式向浏览器推
}

const  script = () => {
  return src(config.build.paths.scripts, { base: config.build.src , cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] } ))
    .pipe(dest(config.build.temp))
}

const page = () => {
  return src(config.build.paths.pages, { base: config.build.src , cwd: config.build.src }) // src/**/*.html src目录下任意子目录下的html文件
    .pipe(plugins.swig({ data: config.data ,defaults: { cache: false } }))  // 防止模板缓存导致页面不能及时更新
    .pipe(dest(config.build.temp))
}

const image = () => {
  return src(config.build.paths.images, { base: config.build.src , cwd: config.build.src  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src , cwd: config.build.src  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const extra = () => {
  return src('**', { base: config.build.public , cwd: config.build.public})
    .pipe(dest(config.build.dist))
}

const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src },script)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    config.build.paths.images,
    config.build.paths.fonts
  ], { cwd: config.build.src }, bs.reload );

  watch('**', { cwd: config.build.public }, bs.reload);

  bs.init({
    notify: false,  //关闭热启动的刷新的提示框
    port: 2021,  //端口号
    // open: false, //自动打开浏览器，默认true
    // files: 'dist/**', //指定监听的文件, 一般不使用这个，使用 bs.reload,
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],  //顺序查找
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] })) //. 当前目录
    //分别采用不同的插件压缩 html  js css 
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin( { 
      collapseWhitespace: true,  //压缩html中的空白字符
      minifyCSS: true,   //压缩html中的css
      minifyJS: true   //压缩html中的js
    }))) 
    .pipe(dest(config.build.dist))
}

const compile = parallel(style, script, page)

const build = series(
  clean, 
  parallel(
    series(compile, useref), 
    image, 
    font, 
    extra
  )
);

const develop = series(compile, serve);

module.exports = {
  clean,
  build,
  develop
}