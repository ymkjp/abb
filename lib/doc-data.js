/**
 *  DocData
 *
 *  Store original document data
 */

(function(){
  'use strict';

  function DocData() {
    this.title = '';
    this.description = '';

    return this;
  }

  DocData.prototype = {
    constructor: DocData,
    setTitle: setTitle,
    setDescription: setDescription
  };

  function setTitle(text) {
    var self = this;
    self.title = text;
    return self;
  }

  function setDescription(text) {
    var self = this;
    self.description = text;
    return self;
  }

  exports.create = function() {
    return new DocData();
  };

}());
