var gulp = require('gulp'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		del = require('del');
    
var paths = {
	scripts: [
		'js/src/eventmanager.js',
    'js/src/ui-channel.js',
    'js/src/channel-manager.js',
		'js/src/tempo.js',
		'js/src/tempomat.js',
		'js/src/poll-manager.js',
		'js/src/uimanager.js',
		'js/src/sequencer.js',
		'js/src/sequencerloader.js',
		'js/src/debugpanel.js'
		]
};

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('scripts', ['clean'], function() {
	return gulp.src(paths.scripts)
		.pipe(uglify())
		.pipe(concat('seq.min.js'))
		.pipe(gulp.dest('dist'));

});

gulp.task('watch', function() {
  gulp.watch('js/src/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);
