/* globals  $ */

UIManager = (function() {
  'use strict';
  
  /**
  * @constructor UIManager
  * Stores list of elements, listens on their events, updates them, 
  * propagates events to other ui components.
  */
  function UIManager(options) {
    options = options || {};
    this.rootContainerId = options.rootContainerId;
    this.uiContainerId = options.uiContainerId;
    this.eventId = 'uiman';
    this.e = options.e || {
      // stub method
      trigger: function(param) {
        throw new Error('event ' + param  + ' not processed!');
      },
      listenTo: {
        'looper:tick': this.updateOnTick
      }
    };
    this.initialize();
  }

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
    };
  };

  UIManager.prototype.initialize = function() {
    this.uiContainer = $('<div id=' + this.uiContainerId + '></div>')
    .appendTo( $('#' + this.rootContainerId));

    this.drawElement({
      tagName:'button',
      className :'seq-play-button',
      label: 'Play',
      eventType: 'click',
      emit: 'play',
      css: {},
      toggle: {
        toggleOn: 'click',
        className: 'seq-pause-button',
        label: 'Pause',
        emit: 'pause',
        css: {}
      }      
    }, this);

    this.drawElement({
          tagName:'button',
          className :'seq-stop-button',
          label: 'Stop',
          eventType: 'click',
          emit: 'stop',
          css: {}
        }, this);
  };

  UIManager.prototype.setElementList = function(newList) {
    this.elements = newList;
  };

  UIManager.prototype.drawElement = function(el, scope) {

    // TODO this is for testing only (daw element will be called from elswhere)
    scope = scope || this;

    // create aprop html element for each eleme, 
    // add classes, add bidnging, and append into apropriate place

    var className, elemId, emit, tagName, label, eventType, parentElem, handler;
    className = el.className || '';
    elemId = el.elemId || '';
    tagName = el.tagName || 'div' ;
    label = el.label || '<no label provided>';
    emit = el.emit || '';
    parentElem = el.parent || this.uiContainer;
    eventType = el.eventType || 'click';
    
    var xxx = '<' + tagName+ ' id="' + elemId+'" class="' + className + '" >' + label + '</' + tagName + '>';
    
    if(!el.toggle) {
      handler = function() {
        scope.e.trigger('uiman:'+ emit);
      };
    } else {
      handler = function() {
        if( $(this).text() === label) {
          $(this).text(el.toggle.label);
          scope.e.trigger('uiman:' + emit);
        } else {
          $(this).text(label);
          scope.e.trigger('uiman:' + el.toggle.emit);
        }
      };
    }

    $(xxx).on(eventType, handler).appendTo(parentElem);
  };
  
  // 
  UIManager.prototype.updateElement = function(oldElem, newElem) {};
  
  // reaction on the looper tick event
  UIManager.prototype.updateOnTick = function(loopCursor) {};

  UIManager.prototype.renderElements = function(elementList, scope) {
    var that = this;
    for(elementgroup in elementList) {
      elementList[elementgroup].forEach(function(element) {
        that.drawElement(element, scope);
      });
    }
  }  

  return UIManager;
})();