var gulp = require('gulp');
// this will automatically register to gulp tasks: ln:bundle, ln:minify and returns them as gulp.series( 'ln:bundle', 'ln:minify' )
var bundle = require('@lernetz/gulp-typescript-bundle');
var exec = require('child_process').exec;

gulp.task('ng-build', function (cb) {
    console.log('running ng build...');
    exec('ng build', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        console.log(err);
        cb(err);
        return true;
    });
});

gulp.task('watch', function () {
    gulp.watch('src/*.*', function () {
        gulp.series(['ng-build', 'bundle']);
    });
});


gulp.task('bundle-block-crawler', bundle({
    dest: 'dist/mphfe/assets',
    src: 'src/assets/block-crawler.ts',
    name: 'block.crawler',
    rollup: {
        outputOptions: {
            sourcemap: true,
            minify: false
        }
    }
}));

gulp.task('bundle-all', gulp.series(['bundle-block-crawler']));

gulp.task('default', gulp.series(['ng-build', 'bundle-all']));

// TODO remove unnecesary ts files from assets. Then dont heed to be put in assets in source code anymore.
// They might be in every other folder.
// Minify...