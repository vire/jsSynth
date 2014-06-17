/* globals  $ */

/**
* responsible for drawing/rendering items from element list property into DOM 
* elements, attaching event handlers, subscribing to events. 
* @class
*/
UIManager = (function() {
  'use strict';
  
  /**
   * @constructor
   * @param {Object} options
   */
  function UIManager(options) {
    options = options || {};
    
    this.uiContainerId = options.uiContainerId || 
      'ui-container';
    this.channelContainerId = options.channelContainerId || 
      'seq-channel-container';
    this.eventId = 'uiman';
    this.defaultChannelCount = 4;
    
    
    /** EventManager is a required component */
    if(!options.em) {
      throw 'Missing EventManager!'
    }
    this.em = options.em;
    
    /**
     * If not root is specified in constructor options, 
     * this fn explicitly adds the seq-root-elem into DOM.
     * @method  UIManager#createRootElement
     */
    this.createRootElement = function() {
      if(!document.getElementById('sequencer-root')) {
        var df = document.createElement('div');
        df.id = 'sequencer-root';
        document.body.insertBefore(df, document.body.firstChild);
        return df.id;
      } else {
        return 'sequencer-root';
      }
    }
    this.rootContainerId = options.rootContainerId ||

      this.createRootElement();
      this.rootContainer = $('#'+ this.rootContainerId);
    /** Bootstrap the UIManager */
    this.initialize();
  }

  UIManager._instance = null;
  
  /**
   * Sets the private _instance property to null
   */
  UIManager.destroy = function() {
    this._instance = null;
  };
  
  /**
   * @method UIManager.getInstance - static method for instantiation.
   * @return {Object}
   */
  UIManager.getInstance = function() {
    return this._instance != null ? this._instance : this._instance = (
      function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  };

  /**
   * Getter for the UIManager element list property.
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
        },
        'clear': {
          'class': 'seq-clear-button',
          tagName: 'button',
          label: 'Clear',
          jqEvent: 'click',
          emitEvents: ['uiman:clear']
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

    // TODO - create sequencer wrapper
    // * core controls
    // * initialize channels
    // * register handlers
    
    /** create the base wrappers for sequencer, controls and channels */
    this.rootContainer.append(this.createSeqWrapper);
    $('.seq-controls').append(this.createGeneralControls());

    this.uiContainer = $('<div id=' + this.uiContainerId + '></div>');
    this.uiContainer.appendTo(this.rootContainer);
    this.channelContainer = $('<div id=' + this.channelContainerId + '>');

    this.uiContainer.append(this.channelContainer);
    
    /** from 15/6/2014 obsolete and will be replaced */
    var elemList = this.getElementList();
    this.drawElements(elemList);
    this.drawChannels();
    this.drawInputs();

    /** UIManager API for other components  - depends on EventManager */
    this.registerHandlers({
          'uiman:blinkOnTick' : this.blinkOnTick,
          'looper:tick' : this.highlightItem,
          'uiman:stop' : this.removeHighlight,
          'uiman:clear' : this.removeArmed,
    });
  };

  /** 
   * Add containers for controls and channels of the sequencer.
   * @method UIManager#createSeqWrapper
   * @return {String}        a compiled Handlebars template
   */
  UIManager.prototype.createSeqWrapper = function() {
    var blueprint = '<div id={{warrperId}} class={{wrapperClass}}>' + 
    '<div class={{controlsClass}}></div>' + 
    '<div class={{channelsClass}}></div>' +
    '</div>';

    var compiled = Handlebars.compile(blueprint);

    var blueprintParams = {
      wrapperClass: 'wrapper',
      warrperId: 'seq-ui',
      controlsClass: 'seq-controls',
      channelsClass: 'seq-channels'
    }

    return compiled(blueprintParams);
  }

  /**
   * Append basic control elements - loops, tempo, patterns.
   * This creates only controls for the sequencer not for the channels.
   * @method  UIManager#createGeneralControls
   * @return {String} compiled and interpolated tempalte
   */
  UIManager.prototype.createGeneralControls = function() {

    // TODO - add measures input
    var blueprint = '<div class={{mainCtrClass}}>' + 
      '<span class={{addChannelClass}}>add</span>' + 
      '<label for=\'measures\' >measures:</label>' + 
      '<input type=\'text\' name=\'measures\' class={{measuresClass}}>' + 
      '</div>' + 
      '<div class={{loopCtrClass}}>' + 
      '<span class={{loopPlayClass}}>play</span>' +
      '<span class={{loopPauseClass}}>pause</span>' + 
      '<span class={{loopStopClass}}>stop</span></div>' + 
      '<div class={{tempoCtrClass}}><label for=\'signature\'>signature:' + 
      '</label><input type=\'text\' name=\'measures\' ' + 
      'class={{signatureBeatsClass}}>/<input type=\'text\' name=\'measures\' '+ 
      'class={{signatureNotesClass}}><label for=\'bpm-input\'>BPM: </label>' + 
      '<input type=\'text\' name=\'bpm-input\' class={{bpmClass}}> ' + 
      '<span class={{bpmUpClass}}>+</span><span class={{bpmDownClass}}>-' + 
      '</span></div><div class={{patternCtrClass}}>' + 
      '<span class={{clearPatternClass}}>clear</span>' +
      '<span class={{importPatternClass}}>import</span>' +
      '<span class={{exportPatternClass}}>export</span>' +
      '</div>';

    var blueprintParams = {
      mainCtrClass: 'main-controls',
      addChannelClass: 'main-add-channel',
      measuresClass: 'main-measures-input',
      signatureBeatsClass: 'tempo-beats-input',
      signatureNotesClass: 'tempo-notes-input',
      loopCtrClass: 'loop-controls',
      loopPlayClass: 'loop-play',
      loopPauseClass: 'loop-pause',
      loopStopClass: 'loop-stop',
      tempoCtrClass: 'tempo-controls',
      bpmInputClass: 'tempo-bpm-input',
      patternCtrClass: 'pattern-controls',
      clearPatternClass: 'pattern-clear',
      importPatternClass: 'pattern-import',
      exportPatternClass: 'pattern-export'
    };

    var compiled = Handlebars.compile(blueprint);

    return compiled(blueprintParams)
  };

  UIManager.prototype.createChannelControls = function() {
    throw 'Not Yet Implemented';
  }

  UIManager.prototype.registerHandlers = function(eventsHash) {
    try {
      this.em.register(eventsHash, null, this);
    } catch(err) {
      console.error(err)
    }
  }

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
   * Simply removes the armed class from segment items, this is trigged on
   * uiman:clear event by the clear button.
   * @method  UIManager#removeArmed
   */
  UIManager.prototype.removeArmed = function() {
    return this.uiContainer.find('.armed').removeClass('armed');
  }
  /**
   * Iterates over the list of elements (Object and elemes as properties) 
   * and passes them to the drawElement fn.
   * @method UIManager#drawElements
   * @param {Object} elementList
   */
  UIManager.prototype.drawElements = function(elementList) {

    elementList = elementList ||  this.getElementList();

    for(var elementgroup in elementList) {
      if(elementList.hasOwnProperty(elementgroup)) {
        var items = elementList[elementgroup];

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
   * uiman:blinkOnTick event is played is going to fire.
   * @method UIManager#blinkOnTick
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
   * @param {number} num - beats per loop
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
   * @param {number} num - notes per beat
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
     * jQuery utility function to prevent function calling inside a for loop.
     * @function UIManager~createSegmentElement
     * @param  {string} className [description]
     * @return {Object}           jQuery object
     */
    function createSegmentElement(className) {
      return $('<div class=' + className + '>').click(function() {
          $(this).toggleClass('armed');
      });
    }   
  };

  /**
   * Just puts the number of channels to the channel container.
   * @method UIManager#drawChannels
   * @param  {number} num - track representation
   */
  UIManager.prototype.drawChannels = function(num) {
    var chCnt = num || this.defaultChannelCount;
    var compileSigStr, stringTmpl, i, obj;
    var channelLabels = ['blast','laser','speech','junk'];
    stringTmpl = '<div class=\'seq-channel-{{idx}}\'>' + 
        '<div class={{controlsClass}}><span class={{labelClass}}>'+
        '{{labelText}}</span><div class={{indicatorClass}}></div></div>' + 
        '<div class={{patternClass}}></div></div>'

    compileSigStr = Handlebars.compile(stringTmpl);
    
    obj = {
      controlsClass: 'channel-controls',
      indicatorClass: 'indicator',
      patternClass: 'channel-pattern',
      labelClass: 'channel-label',
      
    };
    
    for(i = 0; i < chCnt; i +=1) {
      obj.idx = i;
      obj.labelText = channelLabels[i];
      this.channelContainer.append(compileSigStr(obj));
    }
    this.addSegments();
    this.addSegmentItems();    
  };

  /**
   * On every tick from Looper, this fn adds a highlight to the respective
   * element(item) in the channel's pattern.
   * @param  {number} index - cursor in looper
   */
  UIManager.prototype.highlightItem = function(index) {

    var chPatterns = $('.channel-pattern');
    var allItems = chPatterns.find('.segment-item');
    var itemsToHighlight = chPatterns.find('.segment-item:eq('+ index +')');

    allItems.not(itemsToHighlight).removeClass('playing');
    itemsToHighlight.addClass('playing');

    //blinkIndicator();
    
    // TODO - logic for playing sounds
    // finds the elements to play via hasClass .armed
    // then find the appropriate channel id
    // trigger sound event on corresponding sound array
    if(itemsToHighlight.hasClass('armed')) {
      var channelsToPlay = itemsToHighlight.filter($('.armed'))
        .parent().parent().parent();

      channelsToPlay.each(function(z,e) {
        // console.log('Play tone array index: ',e.className.substr(12));
        // window.soundFn.play(window.SoundArray[e.className.substr(12)])
        // this.playSound(z);
        var ind = $($('.indicator').get($(this).index()));
        $(ind).addClass('active')
        setTimeout(function() {
          ind.removeClass('active')
        }, 50)

        synth.play(z * 50  + 100 );
        setTimeout(function() {
          synth.stop(z * 50  + 100 );
        }, 200)
      })
    }
  };

  UIManager.prototype.removeHighlight = function() {
    return $('.segment-item').removeClass('playing');
  }

  /**
   * Draw several input elements.
   * @method UIManager#drawInputs 
   */
  UIManager.prototype.drawInputs = function() {
    var self = this, 
      defalultBpmValue = 140, 
      loopsection = 4, 
      loopsectionlength = 4;

    var signStr = '<span class={{signatureClass}}>' + 
      '<label for={{iName}}>{{labelText}}</label>' + 
      '<input type={{iType}} class={{iClass}} value={{iValue}} ' + 
      'name={{iName}}> / <input type={{iType}} class={{jClass}} ' +
      'value={{jValue}} name={{iName}}></span><span class={{bpmSpanClass}}>' +
      '<label for={{bpmName}}>BPM</label>' +
      '<input type={{iType}} class={{bpmInputClass}} value={{bpmVal}} ' +
      'name={{bpmName}}></span>' + 
      '<button class=\'bpm-button-up\'>+</button>' + 
      '<button class=\'bpm-button-down\'>-</button>';

    var compileSigStr = Handlebars.compile(signStr);
    var tmplValues = {
      signatureClass: 'seq-signature',
      bpmSpanClass: 'seq-bpm',
      bpmInputClass: 'seq-bpm-input',
      bpmVal: defalultBpmValue,
      bpmName: 'bpm',
      iName: 'signature',
      labelText: 'Signature',
      iType: 'text',
      iClass: 'seq-loopsection-input',
      jClass: 'seq-loopsectionlength-input',
      iValue: loopsection,
      jValue: loopsectionlength
    }
    this.uiContainer.append(compileSigStr(tmplValues));

    var bpmInput = $('.seq-bpm-input'); 
    /** add a BPM input watcher if changes occur */
    bpmInput.focusout(function() {
      var bpmInputVal = parseInt($(this).val());
      if(isNaN(bpmInputVal)) {
        self.updateBPM(bpmInput, defalultBpmValue)
      } else if(defalultBpmValue !== bpmInputVal) {
        self.updateBPM(bpmInput, bpmInputVal);
      }
    });

    $('.bpm-button-up').click(function() {
      self.updateBPM(bpmInput,parseInt(bpmInput.val()) + 1);
    });
    $('.bpm-button-down').click(function() {
      self.updateBPM(bpmInput,parseInt(bpmInput.val()) - 1);
    });
  };

  UIManager.prototype.updateBPM = function(bpmElem, newTempo) {
    var self = this;
    newTempo = 'number' === typeof newTempo ? newTempo : 140; 
    bpmElem.val(newTempo);
    self.em.emit('uiman:tempochange', newTempo);
  }

  return UIManager;
})();