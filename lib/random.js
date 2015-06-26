/**
 * Avoid messy document diffs by fixating random values
 *
 * @see {@link https://www.npmjs.com/package/random-js}
 * @example
 *  var random = Abb.random();
 *  random.integer(1, 100);
 */

(function(){
  'use strict';

  var Random = require('random-js');
  var hasOwnProperty = Object.prototype.hasOwnProperty
    , DEFAULT_SEED = 0x90abcdef;

  function initEngine(config) {
    var seed;
    if (hasOwnProperty.call(config, 'docMode') && config.docMode === false) {
      return Random.engines.nativeMath;
    } else {
      seed = hasOwnProperty.call(config, 'randomSeed') ? config.randomSeed : DEFAULT_SEED;
      return Random.engines.mt19937().seed(seed);
    }
  }

  /**
   * @param {Object} [config]
   * @param {bool} [config.docMode=true] - [Optional] Set "false" to turn off random value fixations
   * @param {bool} [config.randomSeed=0x12345678] - [Optional] A seed for Random.mt19937
   * @return {Random}
   */
  exports.create = function(config) {
    var engine = initEngine(config);
    return new Random(engine);
  };

}());
