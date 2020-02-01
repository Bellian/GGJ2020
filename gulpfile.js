// Sass configuration
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');
var path = require('path');


var modules = {
    less: {
        use: false,
        instances: [
        ],
    },
    sass: {
        use: true,
        instances: [
            {
                name: 'Controller',
                watch: './scss/**/*.scss',
                src: './scss/controller.scss',
                dest: './bin/css'
            },
            {
                name: 'Screen',
                watch: './scss/**/*.scss',
                src: './scss/screen.scss',
                dest: './bin/css'
            },
        ],
    },
    typescript: {
        use: true,
        instances: [
            {
                name: 'Screen',
                config: './src/screen/tsconfig.json',
                watch: ['./src/screen/**/*.ts', './src/screen/**/*.tsx'],
                src: ['./src/screen/**/*.ts', './src/screen/**/*.tsx'],
                dest: './src/.bin/screen'
            },
            {
                name: 'Controller',
                config: './src/controller/tsconfig.json',
                watch: ['./src/controller/**/*.ts', './src/controller/**/*.tsx'],
                src: ['./src/controller/**/*.ts', './src/controller/**/*.tsx'],
                dest: './src/.bin/controller'
            },
            {
                name: 'Common',
                config: './src/common/tsconfig.json',
                watch: ['./src/common/**/*.ts', './src/common/**/*.tsx'],
                src: ['./src/common/**/*.ts', './src/common/**/*.tsx'],
                dest: './src/.bin/common'
            },
            
        ],
    },
    browserify: {
        use: true,
        instances: [
            {
                name: 'Screen',
                watch: ['./src/.bin/screen/**/*.js', './src/.bin/common/**/*.js'],
                src: ['./src/.bin/screen/index.js'],
                dest: './bin/js/screen'
            },
            {
                name: 'Controller',
                watch: ['./src/.bin/controller/**/*.js', './src/.bin/common/**/*.js'],
                src: ['./src/.bin/controller/index.js'],
                dest: './bin/js/controller'
            },
        ],
    },
    uglify: {
        use: true,
        instances: [
            {
                name: 'Screen',
                watch: ['./bin/js/screen/index.js'],
                src: './bin/js/screen/index.js',
                dest: './bin/js/screen',
                mangle: true,
                compress: true,
            },
            {
                name: 'Controller',
                watch: ['./bin/js/controller/index.js'],
                src: './bin/js/controller/index.js',
                dest: './bin/js/controller',
                mangle: true,
                compress: true,
            },
        ]
    }
}

let watching = false;



/**
 * Sass Parts:
 *      Enables compilation of sas files!
 */
if(modules.sass.use){
    var sass = require('gulp-sass');

    function sassFunctions(options) {
        options = options || {};
        options.base = options.base || process.cwd();
    
        var fs        = require('fs');
        var path      = require('path');
        var types     = require('node-sass').types;
    
        var funcs = {};
    
        funcs['inline-image($file)'] = function(file, done) {
            var file = path.resolve(options.base, file.getValue());
            var ext  = file.split('.').pop();
            fs.readFile(file, function(err, data) {
                if (err) return done(err);
                data = Buffer.from(data);
                data = data.toString('base64');
                data = 'url(data:image/' + ext + ';base64,' + data +')';
                data = types.String(data);
                done(data);
            });
        };
        
        funcs['inline-font($file)'] = function(file, done) {
            var file = path.resolve(options.base, file.getValue());
            var ext  = file.split('.').pop();
            fs.readFile(file, function(err, data) {
                if (err) return done(err);
                data = Buffer.from(data);
                data = data.toString('base64');
                data = 'url(data:font/' + ext + ';base64,' + data +')';
                data = types.String(data);
                done(data);
            });
        };
    
        return funcs;
    }

    gulp.task('sass', function(done) {
        
        function performSass(instance){
            return gulp.src(instance.src)
            .pipe(sourcemaps.init())
            .pipe(sass({
                functions: sassFunctions(),
                outputStyle: 'compressed',
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(instance.dest))
        }


        let streams = [];
        for(let instance of modules.sass.instances){
            streams.push(performSass(instance));
        }

        if(watching){
            for(let instance of modules.sass.instances){
                gulp.task(`sass ${instance.name}`, function() {
                    return merge(performSass(instance));
                });
                gulp.watch(instance.watch, gulp.series([`sass ${instance.name}`]));
            }
        }

        return merge([].concat(...streams));
    });
}


/**
 * Sass Parts:
 *      Enables compilation of sass files!
 */
if(modules.less.use){
    var less = require('gulp-less');
    gulp.task('less', function(done) {
        
        function performLess(instance){
            return gulp.src(instance.src)
                .pipe(sourcemaps.init())
                .pipe(less())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(instance.dest))
        }

        let streams = [];
        for(let instance of modules.less.instances){
            streams.push(performLess(instance));
        }

        if(watching){
            for(let instance of modules.less.instances){
                gulp.task(`less ${instance.name}`, function() {
                    return merge(performLess(instance));
                });
                gulp.watch(instance.watch, gulp.series([`less ${instance.name}`]));
            }
        }

        return merge([].concat(...streams));
    });
}


/**
 * Typescript Parts:
 *      Enables compilation of ts files!
 */
if(modules.typescript.use){
    var ts = require('gulp-typescript');
    let projects = new Map();
    gulp.task('typescript', function(done) {
        for(let instance of modules.typescript.instances){
            let options = require(instance.config);
            let tsProject = ts.createProject(Object.assign(options.compilerOptions, {
                declaration: instance.declaration === true,
                rootDir: path.dirname(instance.config)
            }), ts.reporter.nullReporter(true));
            projects.set(instance, tsProject);
        }

        function performProject(instance){
            let tsResult = gulp.src(instance.src)
                .pipe(sourcemaps.init({}))
                .pipe(projects.get(instance)())
                .on('error', (e) => {
                    if(!watching) throw e;
                });
            
            return [
                tsResult.dts
                    //.pipe(sourcemaps.write('./')) // prevent source maps for defs
                    .pipe(gulp.dest(path.join(instance.dest))),
                tsResult.js
                    .pipe(sourcemaps.write('./'))
                    .pipe(gulp.dest(instance.dest))
            ];
        }


        let streams = [];
        for(let instance of modules.typescript.instances){
            streams.push(performProject(instance));
        }

        if(watching){
            for(let instance of modules.typescript.instances){
                gulp.task(`typescript ${instance.name}`, function() {
                    return merge(performProject(instance));
                });
                gulp.watch(instance.watch, gulp.series([`typescript ${instance.name}`]));
            }
        }

        return merge([].concat(...streams));
    });
}

/**
 * Browserify Parts:
 *      Enables compilation of sass files!
 */
if(modules.browserify.use){
    var bro = require('gulp-bro');
    gulp.task('browserify', function(done) {
        
        function performBrowserify(instance){
            return gulp.src(instance.src)
                .pipe(sourcemaps.init())
                .pipe(bro())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(instance.dest));
        }

        let streams = [];
        for(let instance of modules.browserify.instances){
            streams.push(performBrowserify(instance));
        }

        if(watching){
            for(let instance of modules.browserify.instances){
                gulp.task(`browserify ${instance.name}`, function() {
                    return merge(performBrowserify(instance));
                });
                gulp.watch(instance.watch, gulp.series([`browserify ${instance.name}`]));
            }
        }

        return merge([].concat(...streams));
    });
}

/**
 * Uglify Parts:
 */
if(modules.uglify.use){
    var uglify = require('gulp-uglify');
    var rename = require("gulp-rename");
    gulp.task('uglify', function(done) {
        
        function performUglify(instance){
            return gulp.src(instance.src)
                .pipe(sourcemaps.init())
                .pipe(uglify({
                    compress: instance.compress,
                    mangle: instance.mangle,
                }))
                .pipe(rename({
                    extname: ".min.js",
                }))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(instance.dest));
        }

        let streams = [];
        for(let instance of modules.uglify.instances){
            streams.push(performUglify(instance));
        }

        if(watching){
            for(let instance of modules.uglify.instances){
                gulp.task(`uglify ${instance.name}`, function() {
                    return merge(performUglify(instance));
                });
                gulp.watch(instance.watch, gulp.series([`uglify ${instance.name}`]));
            }
        }

        return merge([].concat(...streams));
    });
}




/**
 * Gulp logic
 */
let tasks = Object.keys(modules); // ['sass', 'less', 'typescript', 'browserify', uglify];

gulp.task('default', 
    function(done) {
        let tasksToRun = tasks.filter(e => { if(modules[e] === undefined) return true; return modules[e].use; });
        
        gulp.series(tasksToRun)(done)
    }
)
gulp.task(
    'watch',
    function() {
        watching = true;
        gulp.series('default')();
    }
)