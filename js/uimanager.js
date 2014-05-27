UIManager = (function() {
  'use strict';
  
  /**
  * @constructor UIManager
  * Stores list of elements, listens on their events, updates them, 
  * propagates events to other ui components.
  */
  function UIManager(options) {
    options = options || {};
    this.rootContainer = options.rootContainer;
    this.uiContainer = options.uiContainer;
    this.eventId = 'uiman';
    this.e = options.e || {
      emit: function() {
        throw new Error('no event emitter!');
      },
      listenTo: {
        'looper:tick': this.updateOnTick
      }
    };
    this.initialize();
  };

  UIManager.instance = null;

  UIManager.getInstance = function() {
    return this._instance != null ? this._instance : this._instance = (
      function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  };

  UIManager.prototype.getElementList = function() {
    return this.elements || {
      'buttons': [],
      'channels': [],
      'knobs': [],
      'sliders': [],
      'inputs': []
    }
  };

  UIManager.prototype.initialize = function() {
    var rootElement = document.createElement('div');
    rootElement.id = this.uiContainer;
    $("#" + this.rootContainer).append(rootElement)
  };

  UIManager.prototype.setElementList = function(newList) {
    this.elements = newList;
  };

  UIManager.prototype.drawElement = function(element, scope) {
    // create aprop html element for each eleme, 
    // add classes, add bidnging, and append into apropriate place
  };
  
  // 
  UIManager.prototype.updateElement = function(oldElem, newElem) {};
  
  // reaction on the looper tick event
  UIManager.prototype.updateOnTick = function(loopCursor) {};

  UIManager.prototype.renderElements = function(elementList) {
    var that = this;
    for(elementgroup in elementList) {
      elementList[elementgroup].forEach(function(element) {
        that.drawElement(element, scope);
      });
    }
  }  

  return UIManager;
})();