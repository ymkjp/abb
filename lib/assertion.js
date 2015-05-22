/**
 *  Assertion
 */

(function(){
  'use strict';

  var util = require('util')
    , fs = require('fs')
    , _ = require('underscore')
    , JsonSchema = require('jsonschema');

  var hasOwnProperty = Object.prototype.hasOwnProperty
    , ENCODING = 'utf-8'
    , ASSERTION_METHOD = {
      status: 'assertValue'
      , header: 'assertObject'
      , jsonSchema: 'assertJsonSchema'
      , body: 'assertBody'
      , text: 'assertText'
    }
    , ASSERTION_TARGET = {'jsonSchema': 'body'};

  function Assertion(arg) {
    this.assert = arg.assert;
    this.jsonSchemaValidator = new JsonSchema.Validator();
    this.actualResponses = arg.actualResponses;
    this.expectedResponses = arg.expectedResponses;

    this._doAssert();

    return this;
  }

  Assertion.prototype = {
    constructor: Assertion
    , _doAssert: _doAssert
    , assertValue: assertValue
    , assertObject: assertObject
    , assertBody: assertBody
    , assertText: assertText
    , assertJsonSchema: assertJsonSchema
  };

  /**
   * @todo
   * Handle AssertionError
   *
   *         status: 200,
   header: {'content-type': 'application/json'},
   jsonSchema: path.join(__dirname, 'json_schema/entry_create.json'),
   body: {
          id: '111848702235277',
          website: 'http://brightb.it'
        }
   */
  function _doAssert() {
    var expected = this.expectedResponses
      , actual = this.actualResponses,
      method, target;
    for (var key in expected) {
      if (!hasOwnProperty.call(expected, key)) { continue; }
      method = ASSERTION_METHOD[key];
      if (hasOwnProperty.call(ASSERTION_TARGET, key)) {
        target = ASSERTION_TARGET[key];
        this[method](actual[target], expected[key]);
      } else if (hasOwnProperty.call(actual, key)) {
        this[method](actual[key], expected[key]);
      } else {
        this.assert.fail(actual, expected, util.format('Expected property "%s" does not exist.', key));
      }
    }
  }


  function assertValue(actual, expected) {
    if (_.isRegExp(expected)) {
      // @todo
      this.assert(new RegExp(expected).test(actual));
    } else {
      this.assert.equal(actual, expected);
    }
  }

  function assertObject(actual, expected) {
    for (var key in expected) {
      if (!hasOwnProperty.call(expected, key)) { continue; }
      if (hasOwnProperty.call(actual, key)) {
        // @todo
        this.assertValue(actual[key], expected[key]);
      } else {
        this.assert.fail(actual, expected, util.format('Expected header "%s" does not exist.', key));
      }
    }
  }

  function assertBody(actual, expected) {
    // @todo
    // contatin
    this.assert(actual, expected);
  }

  function assertText(actual, expected) {
    // @todo
    // .contain
    this.assert(actual, expected);
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
      this.assert.fail(actual, expected,
        util.format(
          'Unexpected type of "jsonSchema" (%s), it should be string (filename) or object (JSON Schema)'
          , typeof expected
        ));
    }
    result = this.jsonSchemaValidator.validate(actual, jsonSchema);
    if (result.valid) {
      this.assert(result.valid);
    } else {
      this.assert.fail(actual, expected, util.format(
        'JSONSchema validation failed with the following errors:\n\t%j', result.errors
      ));
    }
  }

  exports.create = function(arg) {
    return new Assertion(arg);
  };

}());
