'use strict'

const jsesc = require('jsesc')
const debug = require('debug')('json-line-parser')

/* @todo: use an error rate instead */
const MAX_ERROR = 50

var error_counter = 0

const handle_error = function (error, line, skip_errors) {
  error_counter += 1
  debug(line)
  if (error && error_counter >= MAX_ERROR && !skip_errors) {
    throw new Error('Reached max number of errors')
  }
}

const standard_parser = function (line) {
  try {
    if (line.length > 0) {
      return JSON.parse(line)
    }
  } catch (e) {
    handle_error(e, line, false)
    return {}
  }
}

const kissmetrics_parser = function (line) {
  try {
    if (line.length > 0) {
      return JSON.parse(jsesc(line).replace("\\'", "'"))
    }
  } catch (e) {
    return {}
  }
}

/**
* @param {object} [options]
* @param {object} [options.kissmetrics] set to true to use a kissmetrics specific parser
*/
module.exports = function (options) {
  options = options || {}
  if (options.kissmetrics) {
    return kissmetrics_parser
  } else {
    return standard_parser
  }
}
