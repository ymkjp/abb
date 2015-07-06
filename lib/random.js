/**
 * Avoid messy document diffs by fixating random values
 *
 * @see {@link https://www.npmjs.com/package/random-js}
 * @example
 * ```js
 *  var random = Abb.random();
 *  random.integer(1, 100);
 * ```
 */

(function(){
  'use strict';

  var Crypto = require('crypto')
    , Random = require('random-js');
  var hasOwnProperty = Object.prototype.hasOwnProperty
    , DEFAULT_SEED = 0x12345678;

  function createVersionHash32bitInt(version) {
    var max32bit = 2147483647
      , hash = Crypto.createHash('sha1').update(version, 'utf8').digest('hex');
    return (parseInt(hash, 16) % max32bit) + 1;
  }

  function createSeed(config) {
    if (hasOwnProperty.call(config, 'randomSeed')) {
      return config.randomSeed;
    } else if (hasOwnProperty.call(config, 'docVersion')) {
      return createVersionHash32bitInt(config.docVersion);
    } else {
      return DEFAULT_SEED;
    }
  }

  function initEngine(config) {
    if (hasOwnProperty.call(config, 'docMode') && config.docMode === false) {
      return Random.engines.nativeMath;
    } else {
      return Random.engines.mt19937().seed(createSeed(config));
    }
  }

  /**
   * @param {Object} [config]
   * @param {bool} [config.docMode=true] - [Optional] Set "false" to turn off random value fixations
   * @param {bool} [config.randomSeed=0x12345678] - [Optional] A seed for Random.mt19937
   * @param {string|buffer} [config.docVersion] - [Optional] A string for version pinning, such as "v1.0 beta"
   * @return {Random}
   */
  exports.create = function(config) {
    var engine = initEngine(config);
    return new Random(engine);
  };

}());
