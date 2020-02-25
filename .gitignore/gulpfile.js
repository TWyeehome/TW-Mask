/*** gulp 核心 ***/
let gulp = require('gulp');
// sass 套件
let sass = require('gulp-sass');
// CSS 優化套件
let postcss = require('gulp-postcss');
// gulp-postcss 的延伸套件 (瀏覽器相容)
let autoprefixer = require('autoprefixer');
// ES6 統一轉成 原生 js
let babel = require('gulp-babel');
// 可用瀏覽器的 console查看壓縮前的程式碼位置
let sourcemaps = require('gulp-sourcemaps');
// 合併所有檔案
let concat = require('gulp-concat');
// 壓縮 CSS
let cleanCSS = require('gulp-clean-css');
// 壓縮 ES6 JavaScript
let uglifyes = require('uglify-es');
let composer = require('gulp-uglify/composer');
let uglify = composer(uglifyes, console);
// 壓縮圖片
let imagemin = require('gulp-imagemin');
// 壓縮 HTML
let htmlmin = require('gulp-htmlmin');


/* 複製 source 裡的 index.html 貼到 public 資料夾裡面 */
gulp.task('copyHTML', () => {
    return gulp.src('./source/index.html')
        // 壓縮 HTML
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./public/'))
})

gulp.task('copyImg', () => {
    return gulp.src('./source/green.svg')
        .pipe(gulp.dest('./public/'))
})

gulp.task('copyJavaScript', () => {
    return gulp.src('./source/js/**/tools.js')
        .pipe(gulp.dest('./public/js'))
})

/* sass 轉 CSS */
gulp.task('sass', () => {
    // 使用 postcss 的延伸套件(autoprefixer) 把 CSS 相容至前 5 版瀏覽器及IE 6 - 8
    let plugins = [
        // 至 package.json > browserslist > 設定瀏覽器相容性的參數
        autoprefixer()
    ];
    return gulp.src('./source/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        // 編譯完 CSS 之後引用上面的套件
        .pipe(postcss(plugins))
        // 壓縮 CSS
        .pipe(cleanCSS())
        // 合併檔案
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./source/css'))
        .pipe(gulp.dest('./public/css'))
});


/* 壓縮 ES6 */
gulp.task('compress', () => {
    return gulp.src(['./source/js/**/*.js', '!./source/js/**/tools.js'])
        .pipe(sourcemaps.init())
        .pipe(uglify({
            compress: {
                // 移除 console.log() 為 true
                drop_console: true
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'));
});

/* 壓縮圖片 */
gulp.task('images-min', () => {
    // 被壓縮的圖片的路徑
    return gulp.src('./source/img/**/*')
        // 執行壓縮
        .pipe(imagemin())
        // 壓縮完畢的圖片的路徑
        .pipe(gulp.dest('./public/img'))
});

/* gulp 監聽事件 */
gulp.task('watch', () => {
    // 監聽 './source/scss/**/*.scss' 路徑的檔案儲存之後是否有變化，有則執行 gulp sass
    gulp.watch('./source/scss/**/*.scss', gulp.series('sass'));
});

// 只需輸入 gulp 就能直接依序執行 'copyHTML','sass','watch' 
// 參考來源 : https://reurl.cc/XXoY2e
gulp.task('default', gulp.series('copyHTML', gulp.series('copyImg'), gulp.series('copyJavaScript'), gulp.series('sass'), gulp.series('compress'), gulp.series('images-min'), gulp.series('watch')));