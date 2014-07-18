var Sequencer;

/**
* Factory that creates an default sequencer into a given DOM container.
* @class Sequencer
*/
Sequencer = (function() {
  'use strict';
  Sequencer._instance = null;

  /**
   * @constructor
   * @param {Function} EventManagerClass
   * @param {Function} TempoMat
   * @param {Function} UiManagerClass
   * @param {Function} ChannelManagerClass
   */
  function Sequencer(EventManagerClass, TempoMat, UiManagerClass,
                     ChannelManagerClass) {
    this.name = name || 'Sequencer';

    this.eventManager = null;
    this.tempo = null;
    this.uiManager = null;
    this.channelManager = null;
    
    /**
     * Composes all together
     * @method  Sequencer#main
     */
    this.main = function() {
      // TODO - define options for each component!!!
      this.eventManager = EventManagerClass.getInstance();

      // those two require eventManager on instantiation time;
      this.tempo = TempoMat.getInstance({
        em : this.eventManager
      });
      this.uiManager = UiManagerClass.getInstance({
        em : this.eventManager
      });
      this.channelManager = ChannelManagerClass.getInstance();
    };

    /**  auto-initialize! */
    this.main();
  }

  /**
   * Static init method to obtain new or already existing instance.
   * @method  Sequencer.getInstance
   * @return {Object} sequencer instance
   */
  Sequencer.getInstance = function() {
    return this._instance != null ? this._instance :
      this._instance = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function() {});
  };

  return Sequencer;

})();
