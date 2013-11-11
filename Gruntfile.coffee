module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      options:
        bare: true
      compile:
        files:
          'view.js': ['src/view.coffee']
          'examples/demo.js': ['examples/demo.coffee']
    watch:
      options:
        livereload: true # <script src="http://localhost:35729/livereload.js"></script>
      js:
        files: ['src/**/*.coffee', 'examples/**/*.coffee']
        tasks: ['coffee:compile']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'build', ['coffee']
