/*global UIManager:true, EventManager:true Handlebars, $, console, synth */

/**
 * Responsible for drawing/rendering items from element list property into DOM
 * elements, attaching event handlers, subscribing to events.
 * @class
 */
UIManager = (function() {
  'use strict';

  /**
   * @constructor
   * @param {Object} opts
   */
  function UIManager(opts) {
    opts = opts || {};

    /** EventManager is a required component */
    this.em = EventManager.getInstance();

    this.defaultMeasureCount = opts.defaultMeasureCount || 1;
    this.signatureBeatCount = opts.signatureBeatCount || 4;
    this.signatureNoteLength = opts.signatureNoteLength || 4;
    this.defaultChannelCount = opts.defaultChannelCount || 4;
    this.defaultBpm = opts.defaultBpm || 140;

    this.eventPrefix = 'uiman';
    this.rootContainerId = this.createRootElement();
    this.rootContainer = $('#' + this.rootContainerId);
    /** Bootstrap the UIManager */
    this.initialize();
  }

  /**
   * Static variable to hold the singleton instance.
   * @type {null}
   * @private
   */
  UIManager._instance = null;

  /**
   * Sets the private _instance property to null and remove root element.
   * @UIManager~destroy
   */
  UIManager.destroy = function() {
    var rootElement;
    this._instance = null;

    rootElement = document.getElementById('sequencer-root');
    if (rootElement) {
      document.body.removeChild(rootElement);
    }
  };

  /**
   * @method UIManager.getInstance - static method for instantiation.
   * @return {Object}
   */
  UIManager.getInstance = function() {
    return this._instance != null ? this._instance : this._instance =
      (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function() {
      });
  };

  /**
   * If not root is specified in constructor options,
   * this fn explicitly adds the seq-root-elem into DOM.
   * @method  UIManager#createRootElement
   * @return {string}
   */
  UIManager.prototype.createRootElement = function() {
    if (!document.getElementById('sequencer-root')) {
      var df = document.createElement('div');
      df.id = 'sequencer-root';
      document.body.insertBefore(df, document.body.firstChild);
      return df.id;
    } else {
      return 'sequencer-root';
    }
  };

  /**
   * Obtains EventManager instance, create uiContainer element and
   * appends it to the Application root container, draws elements from the
   * element list property.
   * @method UIManager#initialize
   */
  UIManager.prototype.initialize = function() {

    /**
     * TODO - refactor channels
     * TODO - introduce channel class, probably pattern class
     * TODO - initialize channels
     * TODO - register handlers
     */

    /** create the base wrappers for sequencer, controls and channels */
    this.rootContainer.append(this.createSeqWrapper());

    $('.seq-controls').append(this.createGeneralControls());

    this.initGeneralControlsHandlers();
    //this.createChannels();
    /** from 15/6/2014 obsolete and will be replaced */
    this.drawChannels(this.defaultChannelCount);

    /** UIManager API for other components  - depends on EventManager */
    this.registerHandlers({
      'uiman:blinkOnTick': this.blinkOnTick,
      'looper:tick': this.highlightItem,
      'uiman:stop': this.removeHighlight,
      'uiman:clear': this.removeArmed
    });

    this.initialized = true;
  };

  /**
   * Add containers for controls and channels of the sequencer.
   * @method UIManager#createSeqWrapper
   * @return {String}   a compiled Handlebars template
   */
  UIManager.prototype.createSeqWrapper = function() {
    var blueprint, blueprintParams, compiled;

    blueprint = '<div id="{{wrapperId}}" class={{wrapperClass}}>' +
      '<div class={{controlsClass}}></div>' +
      '<div class={{channelsClass}}></div>' +
      '</div>';

    compiled = Handlebars.compile(blueprint);
    blueprintParams = {
      wrapperClass: 'wrapper',
      wrapperId: 'seq-ui',
      controlsClass: 'seq-controls',
      channelsClass: 'seq-channels'
    };

    return compiled(blueprintParams);
  };

  /**
   * Append basic control elements - loops, tempo, patterns.
   * This creates only controls for the sequencer not for the channels.
   * @method  UIManager#createGeneralControls
   * @return {String} compiled and interpolated tempalte
   */
  UIManager.prototype.createGeneralControls = function() {
    var blueprint, blueprintParams, compiled, self;

    self = this;

    blueprint = '<div class={{mainCtrClass}}>' +
      '<span class={{addChannelClass}}>add</span>' +
      '<label for=\'measures\' >measures:</label>' +
      '<input type=\'text\' name=\'measures\' class={{measuresClass}} ' +
      'value={{measureCount}}></div>' +
      '<div class={{loopCtrClass}}>' +
      '<span class={{loopPlayClass}}>play</span>' +
      '<span class={{loopPauseClass}}>pause</span>' +
      '<span class={{loopStopClass}}>stop</span></div>' +
      '<div class={{tempoCtrClass}}><label for=\'signature\'>signature:' +
      '</label><input type=\'text\' name=\'measures\' ' +
      'class={{signatureBeatsClass}} value={{signatureBeatCount}}>/' +
      '<input type=\'text\' name=\'measures\' class={{signatureNotesClass}} ' +
      'value={{signatureNoteLength}}><label for=\'bpm-input\'>BPM: </label>' +
      '<input type=\'text\' id=\'bpm-input\' class={{bpmInputClass}} ' +
      'value={{bpmDefaultValue}}><span class={{bpmUpClass}}>+</span>' +
      '<span class={{bpmDownClass}}>-' +
      '</span></div><div class={{patternCtrClass}}>' +
      '<span class={{clearPatternClass}}>clear</span>' +
      '<span class={{importPatternClass}}>import</span>' +
      '<span class={{exportPatternClass}}>export</span>' +
      '</div>';

    blueprintParams = {
      mainCtrClass: 'main-controls',
      addChannelClass: 'main-add-channel',
      measuresClass: 'main-measures-input',
      measureCount: self.defaultMeasureCount,
      signatureBeatsClass: 'tempo-beats-input',
      signatureBeatCount: self.signatureBeatCount,
      signatureNotesClass: 'tempo-notes-input',
      signatureNoteLength: self.signatureNoteLength,
      loopCtrClass: 'loop-controls',
      loopPlayClass: 'loop-play',
      loopPauseClass: 'loop-pause',
      loopStopClass: 'loop-stop',
      tempoCtrClass: 'tempo-controls',
      bpmInputClass: 'tempo-bpm-input',
      bpmDefaultValue: self.defaultBpm,
      bpmUpClass: 'tempo-bpm-up',
      bpmDownClass: 'tempo-bpm-down',
      patternCtrClass: 'pattern-controls',
      clearPatternClass: 'pattern-clear',
      importPatternClass: 'pattern-import',
      exportPatternClass: 'pattern-export'
    };

    compiled = Handlebars.compile(blueprint);

    return compiled(blueprintParams);
  };

  /**
   * Initialize UIManager handler on the sequencer controls elements.
   * @method UIManager#initGeneralControlsHandlers
   */
  UIManager.prototype.initGeneralControlsHandlers = function() {
    var bpmInput, elems, self;

    self = this;
    elems = [
      {
        className: 'loop-play',
        eventName: 'uiman:play'
      },
      {
        className: 'loop-pause',
        eventName: 'uiman:pause'
      },
      {
        className: 'loop-stop',
        eventName: 'uiman:stop'
      },
      {
        className: 'pattern-clear',
        eventName: 'uiman:clear'
      }
    ];

    elems.forEach(function(element) {
      var jqElem = $('.' + element.className);
      if (jqElem.length) {
        jqElem.on(element.eventType ? element.eventType : 'click', function() {
          self.em.emit(element.eventName);
        });
      }
    });

    bpmInput = $('.tempo-bpm-input');
    bpmInput.on('focusout', function() {
      var bpmInputVal;

      bpmInputVal = parseInt($(this).val());
      if (isNaN(bpmInputVal)) {
        self.updateBPM(bpmInput, self.defaultBpm);
      } else if (self.defaultBpm !== bpmInputVal) {
        self.updateBPM(bpmInput, bpmInputVal);
      }
    });

    $('.tempo-bpm-up').click(function() {
      self.updateBPM(bpmInput, parseInt(bpmInput.val()) + 1);
    });

    $('.tempo-bpm-down').click(function() {
      self.updateBPM(bpmInput, parseInt(bpmInput.val()) - 1);
    });
  };

  UIManager.prototype.createChannels = function() {
    var defaultChannels = [
      {
        channelId: 0,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPatter: []
      },
      {
        channelId: 1,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPatter: []
      },
      {
        channelId: 2,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPatter: []
      },
      {
        channelId: 3,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPatter: []
      }
    ];


    return true;
  };

  /**
   * // TODO - implemented per channel it's own controls
   */
  UIManager.prototype.createChannelControls = function() {
    throw 'Not Yet Implemented';
  };

  /**
   * Pass this (UIManager) methods to the EventManager instance,
   * to enable interaction with other components and local binding as well.
   * @method UIManager#registerHandlers
   * @param eventsHash
   */
  UIManager.prototype.registerHandlers = function(eventsHash) {
    try {
      this.em.register(eventsHash, null, this);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Simply removes the armed class from segment items, this is triggered on
   * uiman:clear event by the clear button.
   * @method  UIManager#removeArmed
   */
  UIManager.prototype.removeArmed = function() {

    return $('.seq-channels').find('.armed').removeClass('armed');
  };

  /**
   * Temporary (200ms) highlight the channel indicator whenever an
   * uiman:blinkOnTick event was emited.
   * @method UIManager#blinkOnTick
   */
  UIManager.prototype.blinkOnTick = function() {
    (function toggle() {
      $('.indicator').addClass('active');
      setTimeout(function() {
        $('.indicator').removeClass('active');
      }, 200);
    })();
  };

  /**
   * Adds the given number of segments to the channel.
   * @method UIManager#addSegments
   * @param {number} num - beats per loop
   */
  UIManager.prototype.addSegments = function(num) {
    // TODO - get default segments from LOOPER or constructor
    var j;
    num = num || 4;

    for (j = 0; j < num; j += 1) {
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
    for (k = 0; k < num; k += 1) {
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
   * @param  {number} chCnt - number off channels per container
   */
  UIManager.prototype.drawChannels = function(chCnt) {

    var compileSigStr, stringTmpl, i, obj;
    var channelLabels = ['blast', 'laser', 'speech', 'junk'];
    stringTmpl = '<div class=\'seq-channel-{{idx}}\'>' +
      '<div class={{controlsClass}}><span class={{labelClass}}>' +
      '{{labelText}}</span><div class={{indicatorClass}}></div></div>' +
      '<div class={{patternClass}}></div></div>';

    compileSigStr = Handlebars.compile(stringTmpl);

    obj = {
      controlsClass: 'channel-controls',
      indicatorClass: 'indicator',
      patternClass: 'channel-pattern',
      labelClass: 'channel-label'

    };

    for (i = 0; i < chCnt; i += 1) {
      obj.idx = i;
      obj.labelText = channelLabels[i];
//      this.channelContainer.append(compileSigStr(obj));
      $('.seq-channels').append(compileSigStr(obj));
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
    var itemsToHighlight = chPatterns.find('.segment-item:eq(' + index + ')');

    allItems.not(itemsToHighlight).removeClass('playing');
    itemsToHighlight.addClass('playing');

    // TODO - logic for playing sounds
    // finds the elements to play via hasClass .armed
    // then find the appropriate channel id
    // trigger sound event on corresponding sound array
    if (itemsToHighlight.hasClass('armed')) {
      var channelsToPlay = itemsToHighlight.filter($('.armed'))
        .parent().parent().parent();

      channelsToPlay.each(function(z, e) {
        // console.log('Play tone array index: ',e.className.substr(12));
        // window.soundFn.play(window.SoundArray[e.className.substr(12)])
        // this.playSound(z);
        var ind = $($('.indicator').get($(this).index()));
        $(ind).addClass('active');
        setTimeout(function() {
          ind.removeClass('active');
        }, 50);

        synth.play(z * 50 + 100);
        setTimeout(function() {
          synth.stop(z * 50 + 100);
        }, 200);
      });
    }
  };

  /**
   * Remove all items highlighted to be played.
   * @returns {*|jQuery}
   */
  UIManager.prototype.removeHighlight = function() {
    return $('.segment-item').removeClass('playing');
  };

  UIManager.prototype.updateBPM = function(bpmElem, newTempo) {
    var self = this;
    newTempo = 'number' === typeof newTempo ? newTempo : self.defaultBpm;
    bpmElem.val(newTempo);
    self.em.emit('uiman:tempochange', newTempo);
  };

  return UIManager;
})();