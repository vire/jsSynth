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
    this.defaultChannelCount = opts.defaultChannelCount || 1;
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
     * TODO - refactor channels (5/7/2014) move to separate UI class
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
   * @return {String} compiled and interpolated tempalte
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
      measure.val(parseInt(measure.val(),10) + 1);
      measure.trigger('change');
    });

    $('.main-measures-down').click(function() {
      var measure = $('.main-measures-input');

      var measureCnt = parseInt(measure.val(), 10);

      if(measureCnt <= 1) {
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
      if(newVal <= 0) {
        $(this).val(1);
        return;
      }

      if(self.measures < newVal) {
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
        var channelClass, mainTemplate, self;
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
      $('.seq-channels')
        .append(new Channel(chInfo, loopProperties).toString());
    });
    return true;
  };

  /**
   * Initialize === add event listeners && handlers.
   * @method UIManager#initChannels
   */
  UIManager.prototype.initChannels = function() {
	  var keyboard;
    var chNotes, overlay, self;
    self = this;

    keyboard = $('#keyboard');

    /** append overlay div to body if it does not exist */
    if(!$('.overlay').length) {
      /** capture user input logic */
      $('body').prepend($('<div class="overlay">'))
      overlay = $('.overlay');
    } else {
      overlay = $('.overlay');
    }

    /** select all chNotes === chBars*/
    chNotes = $('.ch-note');

    chNotes.unbind('click');

    chNotes.click(function() {
      var frequencies, el, channelIndex, channelBarIndex;
      /** the clicked channelBar becomes element */
      el = this;

      channelIndex = self.utils.getChannelIndex(el);
      channelBarIndex = self.utils.getChannelBarIndex(el);

      frequencies = [];

      /** listen for keypress druing assignment -
       * ESC means clear the current array */
      $(document).bind('keyup', function(e) {
        if(27 === e.keyCode) {
          frequencies = [];

          self.em.emit('uiman:clearfreqs', channelIndex, channelBarIndex);

          console.log('frequencies',frequencies);
        }
      });

      keyboard.css('z-index','99999');

      /** add the assignment class - z-index and background
       * of the current channelBar
       **/
      $(el).toggleClass('assigned');

      keyboard.bind('click', function(t) {
        frequencies.push(t.target.id);
      });

      overlay.fadeIn(300);

      /**
       * Wait 4 seconds for assigning various notes
       */
      setTimeout(function() {
        overlay.fadeOut(300);
        keyboard.css('z-index','1');

        /** when ESC is captured unbind the handler*/
        $(document).unbind('keyup');

        /** remove the assignment class */
        $(el).toggleClass('assigned');

        /**
         * When no frequencies were assigned just return
         * */
        if(!frequencies.length) {
          return false;
        }

        self.em.emit('uiman:newfreqs', channelIndex, channelBarIndex);
        $(el).toggleClass('armed');

        console.log(frequencies);
      }, 4000);
    });

    $('.ch-btn-swap').click(function() {
      var hancockKeys, swapEl, channelControlsElem, keyToPlay;
      swapEl = $(this);
      channelControlsElem = swapEl.parent().parent();
      swapEl.addClass('active');
      if(window.HancockInstance) {

        /** find Hancock in DOM*/
        hancockKeys = $('#keyboard ul li');

        if(!hancockKeys) {
          return;
        }

        hancockKeys.each(function() {
          $(this).click(function(ev) {
            keyToPlay = ev.target.id;
            if(!keyToPlay) {
              return;
            } else {
              console.log('keyToPlay',keyToPlay);
              channelControlsElem.attr('data-key', keyToPlay);
              channelControlsElem.addClass('assigned');
              channelControlsElem.find('.ch-btn-preview')
                .css('display','inline-block');
            }
            hancockKeys.each(function(){
              $(this).unbind('click');
              swapEl.removeClass('active');

            });
          });
        });
      }
    });

    /**
     * TODO - to be removed when there is nothing to preview on channel level
     */
    $('.ch-btn-preview').click(function() {
      var chControls, keyToTrigger;
      chControls = $(this).parent().parent();
      keyToTrigger = chControls.attr('data-key');
      if(keyToTrigger) {
        self.triggerNote(keyToTrigger);
      }
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
    if(selectedNotes.hasClass('armed')) {

      tracksToPlay = selectedNotes.filter($('.armed'))
        .parent().parent().parent();

      tracksToPlay.each(function(z, e) {
        self.tickIndicator(e.children[0].children[3]);

        self.triggerNote(tracksToPlay.find('.ch-controls')
          .attr('data-key'));
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

  UIManager.prototype.triggerNote = function(note) {
    if(!window.HancockInstance) {
      return;
    }
    var frequency;

    frequency = window.HancockInstance.getFreqI(note);
    if(!frequency) {
      return;
    }

    window.HancockInstance.keyDown(note, frequency);
    setTimeout(function() {
      window.HancockInstance.keyUp(note, frequency);
    },200);
  };

  UIManager.prototype.triggerKey = function(keyToTrigger) {
    if(!keyToTrigger) {
      return;
    }

    keyToTrigger = keyToTrigger.toUpperCase().charCodeAt(0);

    var e1 = $.Event('keydown');
    e1.keyCode= keyToTrigger;
    $(document).trigger(e1);

    var e2 = $.Event('keyup');
    e2.keyCode = keyToTrigger;
    setTimeout(function() {
      $(document).trigger(e2);
    }, 150);

  };

  UIManager.prototype.updateBPM = function(bpmElem, newTempo) {
    var self = this;
    newTempo = 'number' === typeof newTempo ? newTempo : self.defaultBpm;
    bpmElem.val(newTempo);
    self.em.emit('uiman:tempochange', newTempo);
  };

  UIManager.prototype.updateSeqWrapperWidth = function() {
    var self;
    self = this;
    var newWidth = (self.measures * 250) + 250 + 20;
    newWidth = newWidth <= 770 ? 770 : newWidth;
      $('#seq-ui').css('width', newWidth + 'px');
  };

  UIManager.prototype.utils = {
    getChannelIndex: function(chBar) {
      if(!chBar) {
        return -1;
      }
      return + chBar.parentElement.parentElement.parentElement
        .className.substr(12);
    },
    getChannelBarIndex: function(chBar) {
      if(!chBar) {
        return -1;
      }
      return Array.prototype.indexOf.call(chBar.parentNode.parentNode
        .querySelectorAll('.ch-note'), chBar);
    }
  };

  return UIManager;
})();