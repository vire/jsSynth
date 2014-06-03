/* globals  $ */

/**
* @class - responsible for drawing/rendering items from element list property 
* into DOM elements, attaching event handlers, subscribing to events. 
*
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
   * @param {Object} options
   */
  function UIManager(options) {
    var that = this;
    options = options || {};
    this.rootContainerId = options.rootContainerId ||
      createRootElement();
    this.uiContainerId = options.uiContainerId || 
      'ui-container';
    this.channelContainerId = options.channelContainerId || 
      'seq-channel-container';
    this.eventId = 'uiman';
    this.defaultChannelCount = 4;
    this.rootContainer = $('#'+ this.rootContainerId);
    
    this.e = options.e || {
      // stub method
      emit: function(param) {
        console.log(param);
      },
      listenTo: {
        'looper:tick': this.updateOnTick
      }
    };

    this.em = options.em;
    this.initialize();

    function createRootElement() {
      var df = document.createElement('div');
      df.id = "sequencer-root";
      document.body.insertBefore(df, document.body.childNodes[0]);
    }
  }

  UIManager.instance = null;
  UIManager.destroy = function() {
    this.instance = null;
  }
  /**
   * @method UIManager.getInstance - static method for instantiation.
   * @return {Object}
   */
  UIManager.getInstance = function() {
    return this.instance != null ? this.instance : this.instance = (
      function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  };

  /**
   * @method UIManager#setElementList
   * @return {Object}
   */
  UIManager.prototype.setElementList = function(newList) {
    this.elements = newList;
  };

  /**
   * @method UIManager#getElementList
   * @return {Object}
   */
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
      'knobs': {},
      'sliders': {},
      'inputs': {},
      'containers': {},
    };
  };

  /**
   * Obtains EventManager instance, create uiContainer element and 
   * appends it to the Application root container, draws elements from the 
   * element list property.
   * @method UIManager#initialize 
   */
  UIManager.prototype.initialize = function() {
    this.uiContainer = $('<div id=' + this.uiContainerId + '></div>');
    this.uiContainer.appendTo(this.rootContainer);
    this.channelContainer = $('<div id=' + this.channelContainerId + '>');

    this.uiContainer.append(this.channelContainer);
    
    var elemList = this.getElementList();
    this.drawElements(elemList);
    this.drawChannels();
    
    /** UIManager API for other components  - dedepends on EventManager */
    try {this.em.register({
          'uiman:blinkOnTick' : this.blinkOnTick
        });
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * @method UIManager#drawElement - jqueryize elements
   * @param  {Object} el
   * @param  {Object} scope
   */
  UIManager.prototype.drawElement = function(el, scope) {
    var className, identifier,handler, emitEvents, label, jqEvent, tagName, parentElem;
    


    if(!el) {
      throw new Error('no element for add provided!');
    }
    scope = scope || this;
    identifier = el.identifier || '';
    className = el.class || '';
    tagName = el.tagName || 'div';
    label = el.label || 'no-label';
    jqEvent = el.jqEvent || 'click';
    emitEvents = el.emitEvents || 'uiman:fallback';
    parentElem = el.parentElem || this.uiContainer;
    
    /**
     * Handles the passed event.
     * @function UIManager~handler
     */
    handler = function() {
      emitEvents.forEach(function(ev) {
        scope.em.emit(ev);
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

  /**
   * Iterates over the list of elements (Object and elemes as properties) 
   * and passes them to the drawElement fn.
   * @method UIManager#drawElements
   * @param {Object} elementList
   */
  UIManager.prototype.drawElements = function(elementList) {
    var that = this;


    elementList = elementList ||  this.getElementList();

    for(var elementgroup in elementList) {
      if(elementList.hasOwnProperty(elementgroup)) {
        var items = elementList[elementgroup];

        if('channels' === elementgroup) {
          this.drawChannels(elementList[elementgroup]);
        }

        if(0 !== Object.keys(items).length) {
          // iterate through items and draw tem to the UI : )
          for(var setOfElems in items) {
            if(items.hasOwnProperty(setOfElems)) {
              this.drawElement(items[setOfElems], this);
            }
          }
        }
      }
    }
  };

  /**
   * Method for highlighting the indicator element, whenever an 
   * uiman:blinkOnTick event is played is emited.
   * @method UIManager#blinkOnTick
   * @return {[type]} [description]
   */
  UIManager.prototype.blinkOnTick = function() {
    (function toggle() {
          $('.indicator').addClass('active');
          setTimeout(function() {
            $('.indicator').removeClass('active');
          },200);
        })();    
  };

  /**
   * Adds the given number of segments to the channel.
   * @method UIManager#addSegments
   * @param {numer} num - beats per loop
   */
  UIManager.prototype.addSegments = function(num) {
    var j;
    num = num || 4;

    for(j = 0; j < num; j +=1) {
      $('.channel-pattern').append($('<div class=\'pattern-segment\'>'));
    }
  };

  /**
   * Adds the given number of tick/items to each segment of all channels.
   * @method UIManager#addSegments
   * @param {numer} num - notes per beat
   * @param {string} className - name of the class to be added
   */  
  UIManager.prototype.addSegmentItems = function(num, className) {
    var k, 
      parentElem = 'pattern-segment';
    className = className || 'segment-item';  
    num = num || 4;
    for(k = 0; k < num; k += 1) {
      $('.' + parentElem).append(createSegmentElement(className));
    } 

    /**
     * jQuery util function to preven function calling inside a for lopp.
     * @function UIManager~createSegmentElement
     * @param  {string} className [description]
     * @return {Object}           jQuery object
     */
    function createSegmentElement(className) {
      return $('<div class=' + className + '>').click(function() {
          $(this).toggleClass('armed');
      })
    }   
  };

  /**
   * Just puts the number of channels to the channel container.
   * @method UIManager#drawChannels
   * @param  {numer} num - track representation
   */
  UIManager.prototype.drawChannels = function(num) {
    var chCnt = num || this.defaultChannelCount;
    var i;

    for(i = 0; i < chCnt; i +=1) {
      var channelTemplate = $('<div class=\'seq-channel-0'+ i +'\'>' + 
        '<div class=\'channel-controls\'><div class=\'indicator\'></div></div>' + 
        '<div class=\'channel-pattern\'></div></div>');
      this.channelContainer.append(channelTemplate);
    }

    this.addSegments();
    this.addSegmentItems();    
  };

  return UIManager;
})();