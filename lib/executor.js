/**
 *  Executor
 *
 *  1. By each agenda
 *    - Execute request
 *    - Assert response data
 *    - Store assertion results in outcome
 *  2. Generate document from outcomes
 */

(function(){
  'use strict';

  var Promise = require('bluebird')
    , _ = require('lodash')
    , Request = require('./request')
    , Reference = require('./reference')
    , Assertion = require('./assertion');

  function Executor(arg) {
    this.config = arg.config;
    this.context = arg.context;
    this.document = arg.document;

    this.reference = Reference.create({
      config: this.config
      , context: this.context
    });

    return this;
  }

  Executor.prototype = {
    constructor: Executor
    , execute: execute
    , createTaskChain: createTaskChain
  };

  function execute(done) {
    if (!_.isUndefined(done) && !_.isFunction(done)) {
      throw new TypeError('Invalid type of Callback function "done"');
    }
    if (this.context.hasAgenda()) {
      return this.createTaskChain(done);
    } else {
      return done();
    }
  }

  function createTaskChain(done) {
    var context = this.context
      , document = this.document
      , reference = this.reference
      , config = this.config
      , tasks;

    tasks = _.reduce(context.getAgendaData(), function(promise, targetAgenda) {
      return promise.then(function() {
        return Request.task({
          config: config
          , params: targetAgenda.request
          , reference: reference
        });
      }).then(function (res) {
        return Assertion.task({
          config: config
          , expectedResponse: targetAgenda.response
          , actualResponse: res
          , reference: reference
        });
      }).then(function (res) {
        return context.pushOutcome(res);
      });
    }, Promise.resolve());

    tasks.then(function () {
      return context.checkErrors();
    }).then(function () {
      return document.generate(context);
    }).then(function () {
      done();
    }).catch(function (error) {
      done(error);
    });
    return tasks;
  }

  exports.create = function(arg) {
    return new Executor(arg);
  };

}());
