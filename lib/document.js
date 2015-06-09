/**
 *  Document
 *
 *  Store original document data
 */

(function(){
  'use strict';

  var Promise = require('bluebird')
    , _ = require('underscore')
    , AbbError = require('./abb-error');

  function Document(args) {
    this.title = '';
    this.description = '';

    return this;
  }

  Document.prototype = {
    constructor: Document
    , setTitle: setTitle
    , setDescription: setDescription
    , generate: generate
  };

  function setTitle(text) {
    this.title = text;
    return this;
  }

  function setDescription(text) {
    this.description = text;
    return this;
  }


  function generate(result) {
    var self = this;

    return new Promise(function (resolve, reject) {
      try {
        resolve();
        //self.resultList.push(result);
        //resolve(self.resultList);
      } catch (e) {
        reject(e);
      }
    });
  }

  exports.create = function(args) {
    return new Document(args);
  };

}());
