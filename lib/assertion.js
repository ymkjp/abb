/**
 *  Assertion
 */

(function(){
  'use strict';

  var util = require('util')
    , fs = require('fs')
    , Promise = require('bluebird')
    , _ = require('lodash')
    , JsonSchema = require('jsonschema');

  var ENCODING = 'utf-8'
    , ASSERTION_METHOD = {
      status: 'assertValue'
      , header: 'assertObject'
      , jsonSchema: 'assertJsonSchema'
      , body: 'assertObject'
      , text: 'assertValue'
    }
    , ASSERTION_TARGET = {'jsonSchema': 'body'};

  function Assertion(arg) {
    this.assert = arg.config.assert;
    this.failFast = arg.config.failFast;
    this.jsonSchemaValidator = new JsonSchema.Validator();
    this.actualResponse = arg.actualResponse;
    this.expectedResponse = arg.expectedResponse;
    this.errors = {};
    this.passed = {};

    return this;
  }

  Assertion.prototype = {
    constructor: Assertion
    , assertAll: assertAll
    , assertValue: assertValue
    , assertObject: assertObject
    , assertJsonSchema: assertJsonSchema
    , hasError: hasError
    , getError: getError
  };

  function assertAll() {
    var expected = this.expectedResponse
      , actual = this.actualResponse
      , method, target;

    _.each(expected, function(expectedValue, key) {
      method = ASSERTION_METHOD[key];
      try {
        if (_.has(ASSERTION_TARGET, key)) {
          target = ASSERTION_TARGET[key];
          this[method](actual[target], expected[key]);
        } else if (_.has(actual, key)) {
          this[method](actual[key], expected[key]);
        } else {
          this.assert.fail(actual, expected, util.format('Expected property "%s" does not exist.', key));
        }
      } catch (exception) {
        if (!this.failFast && exception instanceof this.assert.AssertionError) {
          this.errors[key] = exception;
        } else {
          throw exception;
        }
      }
      if (!_.has(this.errors, key)) {
        this.passed[key] = expected[key];
      }

    }, this);
    return this;
  }

  function assertValue(actual, expected) {
    if (_.isRegExp(expected)) {
      var re = new RegExp(expected);
      this.assert(re.test(actual), util.format(
        'Regular expression /%s/%s%s%s does not match with "%s"'
        , re.source
        , re.global ? 'g' : ''
        , re.ignoreCase ? 'i' : ''
        , re.multiline ? 'm' : ''
        , actual));
    } else {
      this.assert.strictEqual(actual, expected);
    }
  }

  function assertObject(actual, expected) {
    _.each(expected, function(expectedValue, key) {
      if (_.has(actual, key)) {
        if (_.isRegExp(expectedValue)) {
          this.assertValue(actual[key], expectedValue);
        } else if (_.isObject(expectedValue) || _.isArray(expectedValue)) {
          this.assertObject(actual[key], expectedValue);
        } else {
          this.assertValue(actual[key], expectedValue);
        }
      } else {
        this.assert.fail(actual, expected, util.format('Expected header "%s" does not exist.', key));
      }
    }, this);
  }

  function readFile(filename) {
    return fs.readFileSync(filename, ENCODING);
  }

  function assertJsonSchema(actual, expected) {
    var jsonSchema, result;
    if (_.isString(expected)) {
      jsonSchema = JSON.parse(readFile(expected));
    } else if (_.isObject(expected)) {
      jsonSchema = expected;
    } else {
      this.assert.fail(actual, expected, util.format(
        'Unexpected type of "jsonSchema" (%s), it should be string (filename) or object (JSON Schema)'
        , typeof expected));
    }
    result = this.jsonSchemaValidator.validate(actual, jsonSchema);
    if (result.valid) {
      this.assert(result.valid);
    } else {
      this.assert.fail(actual, expected, util.format(
        'JSONSchema validation failed with the following errors:\n\t%s', result.errors.join('\n\t')
      ));
    }
  }

  function hasError() {
    return !_.isEmpty(this.errors);
  }

  function getError(key) {
    return _.isUndefined(key) ? this.errors : this.errors[key];
  }

  exports.create = function(arg) {
    return new Assertion(arg);
  };

  exports.task = function(arg) {
    return new Promise(function (resolve, reject) {
      try {
        var result = new Assertion(arg).assertAll();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  };

}());
