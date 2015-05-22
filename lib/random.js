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
    , DEFAULT_SEED = 0x12345678;

  function initEngine(config) {
    var seed;
    if (hasOwnProperty(config, 'engine') && typeof config.engine !== 'undefined') {
      return config.engine;
    } else if (hasOwnProperty(config, 'isDocMode') && config.isDocMode === false) {
      return Random.engines.nativeMath;
    } else {
      seed = hasOwnProperty(config, 'seed') ? config.seed : DEFAULT_SEED;
      return Random.engines.mt19937().seed(seed);
    }
  }

  /**
   * @param {Object} [config]
   * @param {Object} [config.engine=undefined] - [Optional] One of Random.engines
   * @param {bool} [config.isDocMode=true] - [Optional] Set "false" to turn off random value fixations
   * @param {bool} [config.seed=0x12345678] - [Optional] A seed for Random.mt19937
   * @return {Random}
   */
  exports.create = function(config) {
    var engine = initEngine(config);
    return new Random(engine);
  };

}());
