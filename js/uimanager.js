/* globals  $ */

  /** 
  * TODOs: 
  * - P1 - replace drawElement with newDrawElement method, check tests and rename back
  * - add listener for `uiman:stop` event - restore the ui to the initial state
  * - add listener for `uiman:play` event - swap the play button to pause  
  * - add listener for `uiman:pause` event - swap the pause button back to play
  * - add listener for `looper:play` event - to start animating the channel  
  */

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
      emit: function(param) {
        console.log(param)
      },
      listenTo: {
        'uiman:toggle:pause' : this.toggleToPause,
        'uiman:toggle:play' : this.toggleToPlay,
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
      'buttons': {
        'play' : {
          'class': 'seq-play-button',
          tagName: 'button',
          label: 'Play',
          jqEvent: 'click',
          // component:event or component:toggle:forevent
          // toggles the button play to pause
          emitEvents: ['uiman:play','uiman:toggle:pause']
        },
        'pause' :{
          'class': 'seq-pause-button',
          tagName: 'button',
          label: 'Pause',
          jqEvent: 'click',
          emitEvents: ['uiman:pause','uiman:toggle:play']
        },
        'stop': {
          'class': 'seq-stop-button',
          tagName: 'button',
          label: 'Stop',
          jqEvent: 'click',
          emitEvents: ['uiman:stop']
        }
      },
      'channels': {},
      'knobs': {},
      'sliders': {},
      'inputs': []
    };
  };


  UIManager.prototype.initialize = function() {
    this.uiContainer = $('<div id=' + this.uiContainerId + '></div>')
    .appendTo( $('#' + this.rootContainerId));
    var elemList = this.getElementList();

    this.newDrawElement(elemList['buttons']['play'], this)
    this.newDrawElement(elemList['buttons']['stop'], this)
  };

  UIManager.prototype.setElementList = function(newList) {
    this.elements = newList;
  };

  UIManager.prototype.newDrawElement = function(el, scope) {
    var className, identifier,handler, emitEvents, label, jqEvent, tagName, parentElem;
    scope = scope || this;
    identifier = el.identifier || '';
    className = el.class || '';
    tagName = el.tagName || 'div';
    label = el.label || 'no-label';
    jqEvent = el.jqEvent || 'click';
    emitEvents = el.emitEvents || 'uiman:fallback';
    parentElem = el.parentElem || this.uiContainer;
    handler = function() {
      emitEvents.forEach(function(ev) {
        scope.e.emit(ev);
      });
    };
    var newElement = '<' + tagName +
      ' id="' + identifier + 
      '" class="' + className + 
      '" >' + label + '</' + tagName + '>';
    $(newElement).on(jqEvent, handler).appendTo(parentElem);
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
        scope.e.emit('uiman:'+ emit);
      };
    } else {
      handler = function() {
        if( $(this).text() === label) {
          $(this).text(el.toggle.label);
          scope.e.emit('uiman:' + emit);
        } else {
          $(this).text(label);
          scope.e.emit('uiman:' + el.toggle.emit);
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