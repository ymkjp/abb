(function() {
  'use strict';

  var Oauth = require('oauth'),
    Abb = require('../lib/abb');
  var CONSUMER_KEY = '',
    CONSUMER_SECRET = '',
    ACCESS_TOKEN = '',
    ACCESS_TOKEN_SECRET = '',
    REQUEST_URIS = {
      create: '',
      read: ''
    };

  var oauthClient = new Oauth.OAuth(
    '',
    '',
    CONSUMER_KEY,
    CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  function buildSign(method, url, data, query) {
    var params = oauthClient._prepareParameters(
        ACCESS_TOKEN
        , ACCESS_TOKEN_SECRET
        , method
        , url
        , data || query
      ),
      signature = oauthClient._buildAuthorizationHeaders(params)
    console.log(signature);
    return signature;
  }

  //var body = 'status=Maybe%20he%27ll%20finally%20find%20his%20keys.';
  //var body = {status: 'Maybe%20he%27ll%20finally%20find%20his%20keys.'};
  var body = {status: 'Hello'};

  Abb.create({'docMode': true})
    //.defaultRequest({header: {
    //  'Accept': 'application/json',
    //  'content-type': 'application/json'
    //}})
    //.defaultResponse({header: {'content-type': 'application/json'}})
    .resource({
      name: 'Tweets',
      desc: 'Tweets are the basic atomic building block of all things Twitter. Tweets, also known more generically as "status updates."'
    })
    .request('create', {
      url: REQUEST_URIS.create,
      method: 'POST',
      header: {
        'Authorization': buildSign('POST', REQUEST_URIS.create)
        //, 'Accept-Encoding': 'gzip'
        //'Accept': 'application/json',
        //, 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        , 'content-type': 'application/json;charset=UTF-8'
        //, 'user-agent': 'twitter'
      },
      send: body
    })
    .response({
      status: 201,
      body: {text: 'Maybe he\'ll finally find his keys. #peterfalk'}
    })
    //.request('read', {
    //  header: {Authorization: oauthClient.authHeader(REQUEST_URIS.read, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, 'GET')},
    //  url: REQUEST_URIS.read
    //})
    //.response({
    //  status: 200,
    //  body: {text: 'Maybe he\'ll finally find his keys. #peterfalk'}
    //})
    .exec();

}());
