/*global Channel, ChannelManager, PollManager, EventManager:true, Handlebars,
 $, console, synth */

// TODO list


/**
 * Responsible for drawing/rendering items from element list property into DOM
 * elements, attaching event handlers, subscribing to events.
 * @class UIManager
 * @see {@link UIManager#UIManager}
 */
var UIManager;

UIManager = (function() {
  'use strict';

  /**
   * @param opts {Object} options hash
   * @constructor UIManager
   */
  function UIManager(opts) {
    opts = opts || {};

    console.assert('undefined' !== typeof EventManager,
      'EventManager must be defined');
    this.em = EventManager.getInstance();

    /** we need the channel manager to update channels/audiooutputs -
     * pub/sub could casue extra latency when dealing with patterns */

    console.assert('undefined' !== typeof ChannelManager,
      'ChannelManager must be defined');
    this.chm = ChannelManager.getInstance();

    this.measures = opts.defaultMeasureCount || 1;
    this.signatureBeatCount = opts.signatureBeatCount || 4;
    this.signatureNoteLength = opts.signatureNoteLength || 4;
    this.defaultChannelCount = opts.defaultChannelCount || 1;
    this.defaultBpm = opts.defaultBpm || 140;

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

    /** create the base wrappers for sequencer, controls and channels */
    this.rootContainer.append(this.createSeqWrapper());
    $('.seq-controls').append(this.createGeneralControls());
    this.initGeneralControlsHandlers();

    /** create by default 1 channel with one measure
     * which represent the current jsSynth preset.
     */
    this.createDefaultChannels();
    this.initChannels();

    /** UIManager API for other components  - depends on EventManager */
    this.registerHandlers({
      'uiman:blinkOnTick': this.blinkOnTick,
      'tempo:tick': this.highlightItem,
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
   * @return {String} compiled and interpolated template
   */
  UIManager.prototype.createGeneralControls = function() {
    var blueprint, blueprintParams, compiled, self;

    self = this;

    blueprint =
      '<div class={{loopCtrClass}}>' +
      '<span class={{loopPlayClass}}></span>' +
      '<span class={{loopPauseClass}}></span>' +
      '<span class={{loopStopClass}}></span></div>' +
      '<div class={{mainCtrClass}}><span class={{mainAddChClass}}>add channel' +
      '</span><label for=\'measures\' >measures:</label>' +
      '<input type=\'text\' name=\'measures\' class={{measuresClass}} ' +
      'value={{measureCount}} readonly>' +
      '<span class={{measureUpClass}}></span>' +
      '<span class={{measureDownClass}}></span>' +
      '</div>' +
      '<div class={{tempoCtrClass}}><label for=\'signature\'>signature:' +
      '</label><input type=\'text\' name=\'measures\' ' +
      'class={{signatureBeatsClass}} value={{signatureBeatCount}}>/' +
      '<input type=\'text\' name=\'measures\' class={{signatureNotesClass}} ' +
      'value={{signatureNoteLength}}><label for=\'bpm-input\'>BPM: </label>' +
      '<input type=\'text\' id=\'bpm-input\' class={{bpmInputClass}} ' +
      'value={{bpmDefaultValue}}><span class={{bpmUpClass}}></span>' +
      '<span class={{bpmDownClass}}>' +
      '</span></div><div class={{patternCtrClass}}>' +
      '<span class={{clearPatternClass}}></span>' +
      '<span class={{importPatternClass}}></span>' +
      '<span class={{exportPatternClass}}></span>' +
      '</div>';

    blueprintParams = {
      mainCtrClass: 'main-controls',
      measuresClass: 'main-measures-input',
      measureCount: self.measures,
      mainAddChClass: 'main-add-channel',
      measureUpClass: 'main-measures-up',
      measureDownClass: 'main-measures-down',
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

    $('.main-measures-up').click(function() {
      var measure = $('.main-measures-input');
      measure.val(parseInt(measure.val(), 10) + 1);
      measure.trigger('change');
    });

    $('.main-measures-down').click(function() {
      var measure = $('.main-measures-input');

      var measureCnt = parseInt(measure.val(), 10);

      if (measureCnt <= 1) {
        measure.val(1);
        return;
      }
      measure.val(parseInt(measure.val(), 10) - 1);
      measure.trigger('change');
    });

    $('.main-measures-input').on('change', function() {
      var channels, newVal, measure;
      newVal = $(this).val();
      channels = $('div[class^=seq-channel-]');
      if (newVal <= 0) {
        $(this).val(1);
        return;
      }

      if (self.measures < newVal) {
        channels.each(function(ch, i) {
          measure = $(i).find('.ch-measure:last-child');
          measure.clone().appendTo(measure.parent());
        });
      } else {
        channels.each(function(ch, i) {
          $(i).find('.ch-measure:last-child').remove();
        });
      }
      self.measures = newVal;
      self.initChannels();
      self.em.emit('uiman:measurechange', newVal);
      self.updateSeqWrapperWidth();
    });
  };

  /**
   * Takes an list of channel as param, converts them into DOM objects,
   * wraps them into channel container and initialize channel handlers.
   * @method UIManager#createDefaultChannels
   * @returns {boolean}
   */
  UIManager.prototype.createDefaultChannels = function() {
    return this.addChannel();
  };


  UIManager.prototype.addChannel = function() {
    var chInfo, loopProperties, newChannel, self;

    console.assert('undefined' !== typeof Channel, 'Channel must be defined!');

    self = this;

    loopProperties = {
      measures: self.measures,
      beats: self.signatureBeatCount,
      noteLength: self.signatureNoteLength
    };

    // TODO replace this for something more meaningful
    chInfo = {
      channelId: 0, // get next channel ID from ChannelManager
      channelLabel: 'nameOfThePreset' // save the name as the preset
    };

    newChannel = new Channel(chInfo, loopProperties);

    /** render the ui-channel template into DOM */
    $('.seq-channels').append(newChannel.toString());

    // call channelmanager with the current synth instance.
    // assume its done an in the callback we paint this as assigned
    $('.ch-btn-swap').parent().parent().addClass('assigned');

    return true;
  };

  UIManager.prototype.removeChannel = function(channelId, channelIndex) {
    throw 'not yet implemented';
  };

  /**
   * Initialize === add event listeners && handlers. Add handler to the
   * channel instance DOM elements - click, keydown, etc.
   * @method UIManager#initChannels
   */
  UIManager.prototype.initChannels = function() {
    var keyboard;
    var chNotes, overlay, self;
    self = this;

    keyboard = $('#keyboard');
    overlay = self.utils.appendOverlay();

    /** select all chNotes === chBars*/
    chNotes = $('.ch-note');

    chNotes.unbind('click');

    chNotes.click(function() {
      var pm;
      var frequencies, el, channelIndex, channelBarIndex;

      /** the clicked channelBar becomes element */
      el = this;
      frequencies = [];
      channelIndex = self.utils.getChannelIndex(el);
      channelBarIndex = self.utils.getChannelBarIndex(el);
      /** just to make sure we have the class available  */
      console.assert(typeof PollManager !== 'undefined',
        'PollManager must be defined');

      keyboard.css('z-index', '99999');

      function tearDown() {
        console.log('tearDown called');
        overlay.fadeOut(300);
        keyboard.css('z-index', '1');
        /** when ESC is captured unbind the handler*/
        self.utils.stopListenOnKeyPress();
        /** remove the assignment class */
        $(el).removeClass('assigned');
        if (frequencies.length > 0) {
          $(el).addClass('armed');
        } else {
          $(el).removeClass('armed');
        }
      }

      function checkFreqLength() {
        console.log('checkFreqLength', frequencies);
        console.log('frequencies.length', frequencies.length);
        return frequencies.length > 3;
      }

      pm = new PollManager({
        countLimit: 4,
        timeLimit: 15000,
        stepTimeout: 1200
      }, checkFreqLength, limitFn, finalizeFn);

      pm.initialize();

      self.utils.startListenOnKeyPress(self, function(updatedFrequencies) {
        if (!frequencies) {
          return;
        }

        if (!updatedFrequencies.length) {
          console.log('stop should be called');
          // self.em.emit('uiman:clearfreqs', channelIndex, channelBarIndex);
          pm.stop();
          tearDown();
        }

        frequencies = updatedFrequencies;
        console.log('frequencies', frequencies);
      });

      /** add the assignment class - z-index and background
       * of the current channelBar
       **/
      if (!$(el).hasClass('assigned')) {
        $(el).addClass('assigned');
      }

      /** listen on hancock keyboard for clicks and extract frequencies */
      keyboard.bind('click', function(t) {
        frequencies.push(t.target.id);
        pm.reset();
      });

      overlay.fadeIn(300);

      function finalizeFn() {
        console.log('finalizeFn called');
        tearDown();
        self.em.emit('uiman:newfreqs', channelIndex, channelBarIndex);

        // TODO - this will not be called when limit is called
        $(el).data('freqs',frequencies);
        console.log(frequencies);
        console.log($(el));
      }

      function limitFn() {
        console.log('limitFn called');
        tearDown();
        /**
         * When no frequencies were assigned just return
         * */
        if (!frequencies.length) {
          return false;
        }
      }
    });

    /**
     * TODO - to be removed when there is nothing to preview on channel level
     */
    $('.ch-btn-preview').click(function() {
      var chControls, keyToTrigger;
      chControls = $(this).parent().parent();
      keyToTrigger = chControls.attr('data-key');
      if (keyToTrigger) {
        self.triggerNote(keyToTrigger);
      }
    });

    /** bind a handler for adding channels */
    $('.main-add-channel').click(this.utils.addChannelHandler.bind(this));

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
    return $('.ch-measure').find('.armed').removeClass('armed');
  };

  /**
   * Temporary (200ms) highlight the channel indicator whenever an
   * uiman:blinkOnTick event was emited.
   * @method UIManager#blinkOnTick
   */
  UIManager.prototype.blinkOnTick = function() {
    (function toggleClass() {
      $('.ch-indicator').addClass('active');
      setTimeout(function() {
        $('.ch-indicator').removeClass('active');
      }, 50);
    })();
  };

  /**
   * TODO - this will change when audio gets triggered form elsewhere.
   * On every tick from TempoMat, this fn adds a highlight to the respective
   * element(item) in the channel's pattern.
   * @param  {number} index - cursor in tempo
   */
  UIManager.prototype.highlightItem = function(index) {
    var allNotes, self, selectedNotes, tracks, tracksToPlay;

    tracks = $('div[class^=seq-channel-]');
    allNotes = tracks.find('.ch-note');
    selectedNotes = tracks.find('.ch-note:eq(' + index + ')');

    self = this;
    allNotes.not(selectedNotes).removeClass('playing');

    selectedNotes.addClass('playing');
    if (selectedNotes.hasClass('armed')) {

      tracksToPlay = selectedNotes.filter($('.armed'))
        .parent().parent().parent();

      tracksToPlay.each(function(z, e) {
        self.tickIndicator(e.children[0].children[3]);

        console.log('tracksToPlay.data()', $(e));
        console.log('tracksToPlay.data()', $(e).data());
//        self.triggerNote(tracksToPlay.find('.ch-controls')
//          .attr('data-key'));
      });
    }
  };

  /**
   * Remove all items highlighted to be played.
   * @returns {*|jQuery}
   */
  UIManager.prototype.removeHighlight = function() {
    return $('.ch-note').removeClass('playing');
  };

  UIManager.prototype.tickIndicator = function(indicator) {
    indicator.classList.add('active');

    setTimeout(function() {
      indicator.classList.remove('active');
    }, 50);
  };

  /**
   * TODO - this will be removed when audio will be triggered from elsewhere
   * @param note
   */
  UIManager.prototype.triggerNote = function(note) {
    if (!window.HancockInstance) {
      return;
    }
    var frequency;

    frequency = window.HancockInstance.getFreqI(note);
    if (!frequency) {
      return;
    }

    window.HancockInstance.keyDown(note, frequency);
    setTimeout(function() {
      window.HancockInstance.keyUp(note, frequency);
    }, 200);
  };

  UIManager.prototype.updateBPM = function(bpmElem, newTempo) {
    var self = this;
    newTempo = 'number' === typeof newTempo ? newTempo : self.defaultBpm;
    bpmElem.val(newTempo);
    self.em.emit('uiman:tempochange', newTempo);
  };

  /**
   * Adjust the sequencer wrapper width according to no. of measures.
   * @method UIManager#updateSeqWrapperWidth
   */
  UIManager.prototype.updateSeqWrapperWidth = function() {
    var self;
    self = this;
    var newWidth = (self.measures * 250) + 250 + 20;
    newWidth = newWidth <= 770 ? 770 : newWidth;
    $('#seq-ui').css('width', newWidth + 'px');
  };

  UIManager.prototype.utils = {
    addChannelHandler: function() {
      // TODO - implement adding new channels via UIManager
      // this will add a new channel to the channelManager
      // with the current jsSynth preset / instance
      // self.addChannel()
      throw 'not yet implemented';
    },
    getChannelIndex: function(chBar) {
      if (!chBar) {
        return -1;
      }
      return +chBar.parentElement.parentElement.parentElement
        .className.substr(12);
    },
    getChannelBarIndex: function(chBar) {
      if (!chBar) {
        return -1;
      }
      return Array.prototype.indexOf.call(chBar.parentNode.parentNode
        .querySelectorAll('.ch-note'), chBar);
    },
    appendOverlay: function() {
      var _tmpOverlay;

      _tmpOverlay = null;
      /** append overlay div to body if it does not exist */
      if (!$('.overlay').length) {
        /** capture user input logic */
        $('body').prepend($('<div class="overlay">'))
        _tmpOverlay = $('.overlay');
      } else {
        _tmpOverlay = $('.overlay');
      }

      return _tmpOverlay;
    },
    startListenOnKeyPress: function(self, cb) {
      /** listen for keypress events during assignment -
       * ESC means clear the current array */
      $(document).bind('keyup', function(e) {
        /** start listening for ESC */
        if (27 === e.keyCode) {
          cb([]);
        }
        // TODO probalby listen to all hancock keys and turn them into freqs
      });
    },
    stopListenOnKeyPress: function() {
      $(document).unbind('keyup');
    }
  };

  return UIManager;
})();