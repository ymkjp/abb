/**
 *  Document
 *  Supports Markdown
 */

(function(){
  'use strict';

  var fs = require('fs')
    , path = require('path')
    , util = require('util')
    , Url = require('url')
    , Promise = require('bluebird')
    , _ = require('lodash')
    , Handlebars = require('handlebars')
    , HttpStatus = require('http-status');

  var TEMPLATE_PATH = path.join(__dirname, '/templates/schema.hbs');

  function Document(args) {
    this.resource = {
      name: ''
      , desc: ''
      , context: []
    };
    this.docMode = args.docMode;
    this.docPath = args.docPath;

    return this;
  }

  Document.prototype = {
    constructor: Document
    , setResource: setResource
    , generate: generate
    , _prepare: _prepare
    , _execute: _execute
    , _buildCurl: _buildCurl
  };

  function setResource(param) {
    _.assign(this.resource, param);
    return this;
  }

  function generate(context) {
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        if (self.docMode) {
          self._prepare(context);
          self._execute(resolve, reject);
        } else {
          resolve(context);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  function _prepare(context) {
    var operation, response;
    this.resource.title = this.resource.name ? this.resource.name : '***TITLE***';
    this.resource.context = _.map(context.getAgendaData(), function(agenda, index) {
      operation = _.findKey(context.named, function(value) {
        return value === index;
      });
      response = context.outcome.getData(index).actualResponse;
      return {
        operation: operation ? _.capitalize(operation) : '***OPERATION***'
        , req: {
          method: agenda.request.method.toUpperCase()
          , data: agenda.request.send ? _prettifyJson(agenda.request.send) : null
          , header: agenda.request.header
          , url: Url.parse(agenda.request.url)
          , curl: _buildCurl(agenda.request)
          , _dataFormat: _hasJsonAttribute(agenda.request.header) ? 'json' : ''
        }
        , res: {
          header: response.header
          , status: {code: response.status, message: HttpStatus[response.status]}
          , body: _hasJsonAttribute(response.header) ? _prettifyJson(response.text) : response.text
          , _dataFormat: _hasJsonAttribute(response.header) ? 'json' : ''
        }
      };
    }, this);
  }

  function _prettifyJson(obj) {
    try {
      if (_.isString(obj)) {
        obj = JSON.parse(obj);
      }
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return obj;
    }
  }

  function _hasJsonAttribute(target) {
    return _.any(_.map(target, function(attrib) {
      return _.contains(attrib, 'json');
    }));
  }

  /**
   * @todo Pretty query string
   */
  function _buildCurl(request) {
    var command = 'curl '
      , linefeed = '\\\n'
      , method = request.method.toUpperCase()
      , url = Url.parse(request.url)
      , header = request.header
      , data = _hasJsonAttribute(header) ? _prettifyJson(request.send) : request.send;
    command += util.format('--request %s %s %s', method, url.href, linefeed);
    command += _.map(header, function(value, key) {
      return util.format('--header \'%s: %s\' %s', key, value, linefeed);
    }).join('');
    command += data ? util.format('--data \'%s\'', data) : '';
    command = _.trimRight(command, linefeed);
    return _.trim(command);
  }

  function _execute(resolve, reject) {
    var resource = this.resource
      , filename = path.join(this.docPath, _createFilename(this.resource.name))
      , source, template, outputString;
    return fs.readFile(TEMPLATE_PATH, function(err, data){
      if (err) {
        reject(err);
      }
      source = data.toString();
      template = Handlebars.compile(source);
      outputString = template(resource);
      return fs.writeFile(filename, outputString, function (e) {
        if (e) {
          reject(e);
        }
        resolve(outputString);
      });
    });
  }

  function _createFilename(resourceName) {
    var filename = resourceName ? _.trim(resourceName.toLowerCase()) : '';
    filename = filename.replace(/\s+/g, '_').replace(/\W+/g, '');
    filename = filename.length > 0 ? filename : _.now();
    filename += '.md';
    return filename;
  }

  exports.create = function(args) {
    return new Document(args);
  };

}());
