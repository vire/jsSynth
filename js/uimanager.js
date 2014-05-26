  UIManager = (function() {
  'use strict';

  /**
  * @constructor UIManager
  * Stores list of elements, listens on their events, updates them, 
  * propagates events to other ui components.
  */
  function UIManager(options) {
    options = options || {};
    this.eventId = 'uiman';
    this.e = options.e || {
      emit: function() {
        throw new Error('no event emitter!');
      }
    };
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
  UIManager.prototype.updateOnTick = function() {};

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