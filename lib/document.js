/**
 *  Document
 */

(function(){
  'use strict';

  var Promise = require('bluebird')
    , _ = require('lodash')
    , AbbError = require('./abb-error');

  function Document(args) {
    this.title = '';
    this.description = '';
    this.docMode = args.docMode;

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

  function generate(context) {
    var self = this;

    //console.log(context);
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
