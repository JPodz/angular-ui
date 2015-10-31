var path = require('path');

module.exports = function (grunt) {
    grunt.initConfig({

        // RequireJS gathers and compiles all JavaScript for the application
        requirejs: {
            dist: {
                options: {
                    name: 'main',
                    baseUrl: 'src/',
                    mainConfigFile: 'src/rconfig.js',
                    out: 'dist/main.js',
                    generateSourceMaps: true
                }
            }
        },

        // Compiles all HTML templates used by AngularJS directives and caches them so calls don't result in any
        // HTTP requests being made during the running of the application
        ngtemplates: {
            options: {
                bootstrap: function (module, script) {
                    return 'define([],{init:function($templateCache){' + script + '}});';
                },
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: false,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            dist: {
                cwd: 'src/',
                src: path.join('**/*.html'),
                dest: path.join('src/views.js')
            }
        },

        // Compiles all LESS files for the application
        less: {
            dist: {
                options: {
                    paths: [],
                    sourceMap: true
                },
                files: {
                    'dist/main.css': 'src/main.less'
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-less');

    // The 'script' task compiles all JavaScript
    grunt.registerTask('script', ['ngtemplates', 'requirejs']);

    // The `style` task compiles all CSS
    grunt.registerTask('style', ['less']);

    // The 'default' task builds the entire structure
    grunt.registerTask('default', ['script', 'style']);

};