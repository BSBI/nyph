require('dotenv').config({ silent: false }); // get local environment variables from .env
const path = require('path');

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  require('load-grunt-config')(grunt, {
    // path to task.js files, defaults to grunt dir
    configPath: path.join(process.cwd(), 'config/build'),
    // auto grunt.initConfig
    init: true,
  });
};
