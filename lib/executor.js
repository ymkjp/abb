/**
 *  Executor
 *
 *  1. Execute request based on agenda
 *  2. Store results in outcome
 */

(function(){
  'use strict';

  var RequestHandler = require('./request-handler')
    , ResponseHandler = require('./response-handler');

  function Executor(arg) {
    this.agent = arg.config.agent;
    this.assert = arg.config.assert;
    this.agenda = arg.agenda;
    this.outcome = arg.outcome;
    return this;
  }

  Executor.prototype = {
    constructor: Executor,
    execute: execute
  };

  function execute() {
    var agenda = this.agenda.get()
      , requestHandler
      , callback;

    requestHandler = RequestHandler.create({
      agent: this.agent,
      params: agenda[0].request
    });

    callback = ResponseHandler.create({
      assert: this.assert
      , params: agenda[0].response
      , outcome: this.outcome
    }).getHandler();

    requestHandler.request(callback);


    /**
     * @todo
     */
    for (var i = 0; i < agenda.length; ++i) {
      //requestHandler(this.agent, agenda[i]['createRequestor']);
      //this.outcome.push(i, result);

    }

    return this.outcome;
  }

  exports.create = function(arg) {
    return new Executor(arg);
  };

}());
