const jsesc = require('jsesc')
const debug = require('debug')('json-line-parser')

const MAX_ERROR = 50
let error_counter = 0

const handle_error = function (error, line, skip_errors) {
  error_counter += 1
  debug(line)
  if (error && error_counter >= MAX_ERROR && !skip_errors) { // @TODO: turn this into an error rate?
    throw new Error('Reached max number of errors')
  }
}

const standard_parser = function (line) {
  if (line.length > 0) {
    try {
      return JSON.parse(line)
    } catch (e) {
      handle_error(e, line, false)
      return undefined
    }
  }
}

// this is probably an optimization killer, use parsimoniously
const kissmetrics_parser = function (line) {
  if (line.length > 0) {
    try {
      return JSON.parse(jsesc(line).replace("\\'", "'"))
    } catch (e) {
      return undefined
    }
  }
}

/**
* @param {object} [options]
* @param {object} [options.kissmetrics] set to true to use a kissmetrics specific parser
*/
module.exports = function (options = {}) {
  if (options.kissmetrics) {
    return kissmetrics_parser
  } else {
    return standard_parser
  }
}
