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
                    out: 'dist/main.js'
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
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-angular-templates');

    // The 'script' task compiles all JavaScript
    grunt.registerTask('script', ['ngtemplates', 'requirejs']);

    // The 'default' task builds the entire structure
    grunt.registerTask('default', ['script']);

};