var addStream     = require('add-stream');
var gulp          = require('gulp');
var nodemon       = require('gulp-nodemon');
var inject        = require('gulp-inject');
var concat        = require('gulp-concat');
var concatCss     = require('gulp-concat-css');
var rename        = require('gulp-rename');
var sourceMaps    = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var ts            = require('gulp-typescript');
var tslint        = require('gulp-tslint');
var uglify        = require('gulp-uglify');
var sass          = require('gulp-sass');
var cssnano       = require('gulp-cssnano');
var path          = require('path');
var wiredep       = require('wiredep').stream;
var _             = require('underscore');


// Lint to keep us in line
gulp.task('lint', function() {
	return gulp.src('src/main/rocks3d/**/*.ts')
		.pipe(tslint())
		.pipe(tslint.report('default'));
});

// Concatenate & minify JS
gulp.task('scripts', function() {

	return gulp.src('src/main/rocks3d/**/*.ts')
		.pipe(addStream.obj(prepareTemplates()))
		.pipe(sourceMaps.init())
		.pipe(ts({
			noImplicitAny: true,
			target : 'ES5',
			suppressImplicitAnyIndexErrors: true,
			out: 'rocks3d.js'
		}))
		.pipe(gulp.dest('src/main/webapp/rocks3d/assets'))
		.pipe(rename('rocks3d.min.js'))
		.pipe(uglify())
		.pipe(sourceMaps.write('.'))
		.pipe(gulp.dest('src/main/webapp/rocks3d/assets'));
});

// Compile, concat & minify sass
gulp.task('sass', function () {
	return gulp.src('src/main/rocks3d/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('src/main/webapp/rocks3d/assets/css'));
});

gulp.task('concatCss', ['sass'], function () {
	return gulp.src('src/main/webapp/rocks3d/assets/css/**/*.css')
		.pipe(concatCss("rocks3d.css"))
		.pipe(gulp.dest('src/main/webapp/rocks3d/assets'))
});

gulp.task('minifyCss', ['sass', 'concatCss'], function() {
	return gulp.src('src/main/webapp/rocks3d/assets/rocks3d.css')
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('src/main/webapp/rocks3d/assets'));
});

// Inject dist, bower, and resource files
gulp.task('inject', ['scripts', 'minifyCss'], function(){

	// wire up all src files
	var injectSrc = gulp.src([

		// any scripts we want to drop in directly,
		// we should not be doing this from here on
		'./src/main/webapp/rocks3d/resources/**/*.css',
		'./src/main/webapp/rocks3d/resources/**/*.js',

		// our dist files
		'./src/main/webapp/rocks3d/assets/rocks3d.css',
		'./src/main/webapp/rocks3d/assets/rocks3d.js'
	], { read: false });

	var injectOptions = {
		ignorePath: '/src/main/webapp',
		relative: true
	};

	// inject bower deps
	var options = {
		bowerJson: require('./bower.json'),
		directory: './src/main/webapp/rocks3d/bower_components',
		ignorePath: '../../src/main'
	};

	return gulp.src('./src/main/webapp/*.html')
		.pipe(wiredep(options))
		.pipe(inject(injectSrc, injectOptions))
		.pipe(gulp.dest('./src/main/webapp'));

});

gulp.task('serve', ['scripts', 'minifyCss', 'inject'], function(){

	var options = {
		restartable: "rs",
		verbose: true,
		ext: "ts html scss",
		script: 'server.js',
		delayTime: 1,
		watch: ['src/main/rocks3d/**/*(*.ts|*.html)', 'public/src/**/*.scss'],
		env: {
			'PORT': 3000
		},
		ignore: ["src/main/webapp/rocks3d/assets/*", "src/main/webapp/rocks3d/assets/**/**"],
		// bit faster if we only do what we need to
		tasks: function (changedFiles) {
			var tasks = [];
			changedFiles.forEach(function (file) {
				var ext = path.extname(file);
				if (ext === '.ts' || ext === '.html'){
					tasks.push('lint');
					tasks.push('scripts');
				}
				else if (ext === '.scss'){
					tasks.push('sass');
					tasks.push('concatCss');
					tasks.push('minifyCss');
				}
			});
			return tasks
		}
	};

	return nodemon(options)
		.on('restart', function(ev){
			console.log('restarting..');
		});
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'sass', 'concatCss', 'minifyCss', 'inject', 'serve']);

function prepareTemplates() {

	// we get a conflict with the < % = var % > syntax for $templateCache
	// template header, so we'll just encode values to keep yo happy
	var encodedHeader = "angular.module(&quot;&lt;%= module %&gt;&quot;&lt;%= standalone %&gt;).run([&quot;$templateCache&quot;, function($templateCache:any) {";
	return gulp.src('src/main/rocks3d/**/*.html')
		.pipe(templateCache('templates.ts', {
			root: "rocks3d",
			module: "rocks3d.templates",
			standalone : true,
			templateHeader: _.unescape(encodedHeader)
		}));
}