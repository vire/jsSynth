/*global Handlebars*/
var Channel;

Channel = (function() {
  /**
   *
   * @param opts {Object} - Channel default properties - id, label
   * @param loopProps {Object} - measure properties hash with defaults
   * @constructor
   */
  function Channel(opts, loopProps) {
    this.channelId = opts.channelId;
    this.channelLabel = opts.channelLabel;
    this.measures = loopProps.measures;
    this.beats = loopProps.beats;
    this.noteLen = loopProps.noteLength;
    this.initialize();
  }

  /**
   * Bootstraps the Channel to create a dom object.
   * @method Channel#initialize
   */
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
    playIndicator  = '<div class={{indicatorClass}}></div>';
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