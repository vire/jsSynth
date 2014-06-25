/*global UIManager:true, EventManager:true, Handlebars, $, console, synth */

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

    this.measures = opts.defaultMeasureCount || 1;
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
     * TODO - refactor channels (24/6/2014) move to separate class
     * TODO - introduce pattern class
     */

    /** create the base wrappers for sequencer, controls and channels */
    this.rootContainer.append(this.createSeqWrapper());

    $('.seq-controls').append(this.createGeneralControls());

    this.initGeneralControlsHandlers();

    this.createChannels();
    this.initChannels();

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
      measureCount: self.measures,
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

    $('.main-measures-input').on('change', function() {
      var newVal = $(this).val();
      var channels = $('div[class^=seq-channel-]');
      var measure;
      console.log('measure change');
      if(self.measures < newVal) {
        channels.each(function(ch, i) {
          measure = $(i).find('.ch-measure:last-child');
          measure.clone().appendTo(measure.parent());
        });
      } else {
        console.log('remove measures');
      }

      // todo - emit measure change to looper,
      // todo - update self.measures after measure re-adjustment
    });
  };

  /**
   * Takes an list of channel as param, converts them into DOM objects,
   * wraps them into channel container and initialize channel handlers.
   * @method UIManager#createChannels
   * @param channels
   * @returns {boolean}
   */
  UIManager.prototype.createChannels = function(channels) {
    var loopProperties;
    var Channel, self;

    self = this;
    /**
     * TODO (24/6/2014) not yet implemented!
     * TODO - freq input can be replaced for piano key
     */
    var defaultChannels = channels || [
      {
        channelId: 0,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPattern: []
      },
      {
        channelId: 1,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPattern: []
      },
      {
        channelId: 2,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPattern: []
      },
      {
        channelId: 3,
        channelLabel: 'someLabel',
        channelAudioExit: function() {
        },
        channelPattern: []
      }
    ];

    Channel = (function() {
      function Channel(opts, loopProps) {
        this.channelId = opts.channelId;
        this.channelLabel = opts.channelLabel;
        this.measures = loopProps.measures;
        this.beats = loopProps.beats;
        this.noteLen = loopProps.noteLength;
        this.initialize();
      }

      Channel.prototype.initialize = function() {
        var channelClass, mainTemplate, params, self;
        self = this;
        channelClass =  'seq-channel-' + self.channelId;
        mainTemplate = '<div class=\'' + channelClass + '\'>';
        self.mainTemplate = mainTemplate + self.createChannelControls() +
          self.createChannelContent(self.measures, self.beats, self.noteLen) +
          '</div>';
      };

      Channel.prototype.createChannelControls = function() {
        var playIndicator;
        var buttons, volumeCtrl, freqCtrl, self;
        var template, params;

        self = this;
        // todo - fa-circle-o

        template = '<div class={{chControlsClass}}>' +
          '<span class={{chLabelClass}}>{{chLabelText}}</span>';
        volumeCtrl = '<div class={{volClass}}></div>';
        freqCtrl = '<div class={{freqClass}}></div>';
        playIndicator = '<div class={{indicatorClass}}></div>';
        buttons = '<div class={{buttonsClass}}>' +
          '<span class={{swapClass}} title="sawp sample"></span>' +
          '<span class={{removeClass}} title="remove"></span>' +
          '<span class={{previewClass}} title="preview"></span>' +
          '<span class={{muteClass}} title="mute"></span>' +
          '<span class={{soloClass}} title="solo"></span></div>';

        template = template + volumeCtrl + freqCtrl + playIndicator + buttons +
          '</div>';
        params = {
          chControlsClass: 'ch-controls',
          chLabelClass: 'ch-label',
          chLabelText: self.channelLabel,
          volClass: 'volume-controls',
          freqClass: 'freq-controls',
          indicatorClass: 'ch-indicator',
          buttonsClass: 'ch-buttons',
          swapClass: 'ch-btn-swap',
          removeClass: 'ch-btn-remove',
          previewClass: 'ch-btn-preview',
          muteClass: 'ch-btn-mute',
          soloClass: 'ch-btn-solo'
        };

        return Handlebars.compile(template)(params);
      };

      Channel.prototype.createChannelContent =
        function(measures, beats, noteLength) {
          var template, params;

          params = {
            measureClass: 'ch-measure',
            beatsClass: 'ch-beat',
            noteClass: 'ch-note'
          };

          template = '';
          var i, j, k;
          for(i = 0; i < measures; i++ ) {
            template += '<div class={{measureClass}}>';
            for(j = 0; j < beats; j++) {
              template += '<div class={{beatsClass}}>';
              for(k = 0; k < noteLength; k++) {
                template += '<div class={{noteClass}}></div>';
              }
              template += '</div>';
            }
            template += '</div>';
          }
          return Handlebars.compile(template)(params);
        };

      Channel.prototype.toString = function() {
        return this.mainTemplate;

      };

      return Channel;
    })();

    loopProperties = {
      measures: self.measures,
      beats: self.signatureBeatCount,
      noteLength: self.signatureNoteLength
    };
    defaultChannels.forEach(function(chInfo) {
      $('.seq-channels').append(new Channel(chInfo, loopProperties).toString());
//      console.log(new Channel(chInfo, loopProperties).toString());
    });
//    console.log('ss', new Channel(channelParams, loopProperties).toString());
    return true;
  };


  /**
   * Initialize === add event listeners && handlers.
   * @method UIManager#initChannels
   */
  UIManager.prototype.initChannels = function() {
    $('.ch-note').click(function() {
      $(this).toggleClass('armed');
    });
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
   * On every tick from Looper, this fn adds a highlight to the respective
   * element(item) in the channel's pattern.
   * @param  {number} index - cursor in looper
   */
  UIManager.prototype.highlightItem = function(index) {
    var tracksToPlay;
    var self = this;
    var indicator;
    var tracks = $('.ch-measure');
    var allNotes = tracks.find('.ch-note');

    var selectedNotes = tracks.find('.ch-note:eq(' + index + ')');
    allNotes.not(selectedNotes).removeClass('playing');

    selectedNotes.addClass('playing');
    if(selectedNotes.hasClass('armed')) {

      tracksToPlay = selectedNotes.filter($('.armed'))
        .parent().parent().parent();

      tracksToPlay.each(function(z, e) {
        indicator = e.children[0].children[3];
        indicator.classList.add('active');

        setTimeout(function() {
          indicator.classList.remove('active');
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
    return $('.ch-note').removeClass('playing');
  };

  UIManager.prototype.updateBPM = function(bpmElem, newTempo) {
    var self = this;
    newTempo = 'number' === typeof newTempo ? newTempo : self.defaultBpm;
    bpmElem.val(newTempo);
    self.em.emit('uiman:tempochange', newTempo);
  };

  return UIManager;
})();