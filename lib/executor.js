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
    , _ = require('underscore')
    , Request = require('./request')
    , Reference = require('./reference')
    , Assertion = require('./assertion');

  function Executor(arg) {
    this.config = arg.config;
    this.agenda = arg.agenda;
    this.outcome = arg.outcome;
    this.document = arg.document;

    this.reference = Reference.create({
      config: this.config
      , agenda: this.agenda
      , outcome: this.outcome
    });

    return this;
  }

  Executor.prototype = {
    constructor: Executor
    , execute: execute
  };

  function execute(done) {
    var agenda = this.agenda.get()
      , outcome = this.outcome
      , document = this.document
      , reference = this.reference
      , config = this.config
      , tasks;

    tasks = _.reduce(agenda, function(promise, targetAgenda) {
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
        return outcome.push(res);
      });
    }, Promise.resolve(), this);

    tasks.then(function () {
      return outcome.checkErrors();
    }).then(function (res) {
      return document.generate(res);
    }).then(function () {
      done();
    }).catch(function (error) {
      // @todo Dump actual responses
      //console.error(error);
      done(error);
    });
    return tasks;
  }

  exports.create = function(arg) {
    return new Executor(arg);
  };

}());
