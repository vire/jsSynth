/* globals  $ */

  /** 
  * TODOs: 
  * - add listener for `uiman:stop` event - restore the ui to the initial state
  * - add listener for `uiman:play` event - swap the play button to pause  
  * - add listener for `uiman:pause` event - swap the pause button back to play
  * - add listener for `looper:play` event - to start animating the channel  
  * - add setElementList
  */

UIManager = (function() {
  'use strict';
  
  /**
  * @constructor UIManager
  * Stores list of elements, listens on their events, updates them, 
  * propagates events to other ui components.
  */
  function UIManager(options) {
    var that = this;
    options = options || {};
    this.rootContainerId = options.rootContainerId;
    this.uiContainerId = options.uiContainerId;
    this.channelContainerId = options.channelContainerId || 
    'seq-channel-container' 
    this.eventId = 'uiman';
    this.e = options.e || {
      // stub method
      emit: function(param) {
        console.log(param);
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

  // TODO
  UIManager.prototype.setElementList = function() {};

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
          emitEvents: ['uiman:play']
        },
        'pause' :{
          'class': 'seq-pause-button',
          tagName: 'button',
          label: 'Pause',
          jqEvent: 'click',
          emitEvents: ['uiman:pause']
        },
        'stop': {
          'class': 'seq-stop-button',
          tagName: 'button',
          label: 'Stop',
          jqEvent: 'click',
          emitEvents: ['uiman:stop']
        }
      },
      'channels': {
        '00' : {
          'class' : 'seq-channel',
          'tagName' : 'div',
          'content' : {},
          'parentElem' : '#seq-channel-container'
        }
      },
      'knobs': {},
      'sliders': {},
      'inputs': {}
    };
  };


  UIManager.prototype.initialize = function() {
    this.uiContainer = $('<div id=' + this.uiContainerId + '></div>');

    this.uiContainer.appendTo( $('#' + this.rootContainerId));

    var channelContainer = {
      background: 'red',
      width: '400px',
      height: '150px'
    }
    this.uiContainer.append($('<div id=' + this.channelContainerId +
     '>').css(channelContainer))
    
    var elemList = this.getElementList();


    this.drawElements(elemList)
  };

  UIManager.prototype.setElementList = function(newList) {
    this.elements = newList;
  };

  UIManager.prototype.drawElement = function(el, scope) {
    var className, identifier,handler, emitEvents, label, jqEvent, tagName, parentElem;
    if(!el) {
      throw new Error('no element for add provided!')
    }
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
 
  // 
  UIManager.prototype.updateElement = function(oldElem, newElem) {};
  // reaction on the looper tick event
  UIManager.prototype.updateOnTick = function(loopCursor) {};

  UIManager.prototype.drawElements = function(elementList) {
    var that = this;

    elementList = elementList ||  this.getElementList();
    
    for(var elementgroup in elementList) {
      if(elementList.hasOwnProperty(elementgroup)) {
        var items = elementList[elementgroup];
        if(0 !== Object.keys(items).length) {
          // iterate through items and draw tem to the UI : )
          for(var setOfElems in items) {
            if(items.hasOwnProperty(setOfElems)) {
              this.drawElement(items[setOfElems], this)
            }
          }          
        }
      }
    }
  }  

  return UIManager;
})();