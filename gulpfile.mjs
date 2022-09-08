import gulp from 'gulp';
import pkg from 'gulp-typescript';
const {createProject} = pkg;
import {deleteAsync} from 'del';

const tsProject = createProject("tsconfig.json");

function clean() {
    return deleteAsync('dist/**', {force: true});
}

function tsc() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
}

gulp.task('default',gulp.series(clean, tsc));
