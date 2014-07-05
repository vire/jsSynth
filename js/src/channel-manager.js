var ChannelManager;


// todolist 5/7/2011
// todo - introduce API for EventManager

ChannelManager = (function() {
  'use strict';

  function ChannelManager() {
    this._audioOutputs = [];
    this._patterns = [];
    this._patternsLength = 0;
  }

  ChannelManager._instance = null;

  ChannelManager.getInstance = function() {
    return this._instance || (this._instance = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(this, arguments, function(){}));
  };

  ChannelManager.prototype.initializePattern = function(newIndex, id) {
    this._patterns[newIndex] = new Pattern(length, id);
    return this._patterns[newIndex].pattLength;
  };

  ChannelManager.prototype.updateAudioOutput = function(aoIndex, updatedAO) {
    var origAO;
    if(!this._patterns[aoIndex]) {
      throw 'AudioOutput on index: ' + aoIndex + ' is not defined!';
    }
    origAO = this._audioOutputs[aoIndex];
    updatedAO.id = origAO.id;
    this._audioOutputs[aoIndex] = updatedAO;
  };

  ChannelManager.prototype.assignChannelBar =
    function (chIndex, chBarIndex, freq) {
      if(!this._patterns[chIndex]) {
        return false;
      }
      this._patterns[chIndex].bars[chBarIndex] = freq;
  };

  ChannelManager.prototype.clearChannelBar = function(chIndex, chBarIndex) {
    if(!this._patterns[chIndex]) {
      return false;
    }
    this._patterns[chIndex][chBarIndex] = null;
  };

  ChannelManager.prototype.removeAudioOutput = function(index, audioOutput) {
    if(!this._audioOutputs[index]) {
      // todo implement search & removal by AudioOutputs ID
      return;
    }
    // todo - remove the corresponding pattern too
    return this._audioOutputs.splice(index, 1);
  };

  ChannelManager.prototype.assignAudioOutput = function(preset, synthInstance) {
    var audioOutput = new AudioOutput(preset, synthInstance);
    var newIndex = this._audioOutputs.push(audioOutput) - 1;
    this._patternsLength = this.initializePattern(newIndex, audioOutput.id);
  };

  ChannelManager.prototype.updatePatternsLength = function(newLength) {
    var result, self;
    self = this;
    if(this._patternsLength === newLength) {
      return this._patternsLength;
    }
    this._patterns.forEach(function(pattern) {
      self._patternsLength = pattern.updateLength(newLength);
    });
    return self._patternsLength;
  };

  ChannelManager.prototype.toggleMute = function(chIndex) {
    if(!this._audioOutputs[chIndex]) {
      return undefined;
    }

    return this._audioOutputs[chIndex].toggleMute();
  };

  ChannelManager.prototype.changeVol = function(chIndex, newVolVal) {
    if(!this._audioOutputs[chIndex]) {
      return undefined;
    }

    this._audioOutputs[chIndex].volume = newVolVal;
    return this._audioOutputs[chIndex].volume;
  };

  ChannelManager.prototype.getVol = function(chIndex) {
    if(!this._audioOutputs[chIndex]) {
      return undefined;
    }
    return this._audioOutputs[chIndex].volume;
  };

  ChannelManager.prototype.toggleSolo = function(chIndex) {
    if(!this._audioOutputs[chIndex]) {
      return undefined;
    }

    this._audioOutputs[chIndex].isSolo = !this._audioOutputs[chIndex].isSolo;

    this._audioOutputs.forEach(function(audioOutput) {
      if(!audioOutput.isSolo) {
        audioOutput.soloMute();
      } else {
        audioOutput.soloUnMute();
      }
    });

    return this._audioOutputs[chIndex].isSolo;
  };

  ChannelManager.prototype.clearPattern = function(pattIndex) {
    if(!this._patterns[pattIndex]) {
      return undefined;
    }

    this._patterns[pattIndex].clearBars();
    return true;
  };

  ChannelManager.prototype.clearAllPatterns = function() {
    if(!this._patterns.length) {
      return undefined;
    }
    this._patterns.forEach(function(pattern) {
      pattern.clearBars();
    });

    return true;
  };

  ChannelManager.prototype.getFreqsAtIndex = function(pattIndex, chBarIndex) {
    if(!this._patterns[pattIndex].bars[chBarIndex]) {
      return undefined;
    }
    return this._patterns[pattIndex].bars[chBarIndex];
  };

  ChannelManager.prototype.playBar = function(chBarIndex) {
    var self = this;
    self._audioOutputs.forEach(function(audioOut, idx) {
      if(audioOut.isMuted || audioOut.soloMuted) {
        return;
      }
      if(!self.getFreqsAtIndex(idx, chBarIndex)) {
        return;
      }
      audioOut.triggerFreq();
    });
  };

  return ChannelManager;

})();

var AudioOutput;

AudioOutput = (function() {
  function AudioOutput(preset, jsSynthInstance) {
    this.preset = preset || {};
    this.jsSynthInstance = jsSynthInstance || {};
    this.volume = 1.0;
    this.isMuted = false;
    this.isSolo = false;
    this.id = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  AudioOutput.prototype.toggleMute = function() {
    this.isMuted = !this.isMuted;
    /** if becomes muted preserve volume and */
    if(this.isMuted && this.volume !== 0.0) {
      this.preMuteVolume = this.volume;
      this.volume = 0.0;
    }
    if(!this.isMuted && this.volume === 0.0) {
      this.volume = this.preMuteVolume;
      this.preMuteVolume = null;
    }
    return this.isMuted;
  };

  /** TODO - consider remove this fn */
  AudioOutput.prototype.mute = function() {
    if(this.isMuted && this.volume === 0.0) {
      return this.isMuted;
    }
    this.isMuted = true;
    this.preMuteVolume = this.volume;
    this.volume = 0.0;
    return this.isMuted;
  };

  /** TODO - consider remove this fn */
  AudioOutput.prototype.unMute = function() {
    if(!this.isMuted && this.volume !== 0.0) {
      return this.isMuted;
    }
    this.isMuted = false;
    this.volume = this.preMuteVolume !== 0.0 ? this.preMuteVolume : 1.0;
    this.preMuteVolume = null;
    return this.isMuted;
  };

  AudioOutput.prototype.soloMute = function() {
    if(this.isMuted) {
      return;
    }
    this.soloMuted = true;
    this.preSoloMuteVolume = this.volume;
    this.volume = 0.0;
  };

  AudioOutput.prototype.soloUnMute = function() {
    if(!this.soloMuted) {
      return;
    }
    this.soloMuted = false;
    this.volume = this.preSoloMuteVolume;
    this.preSoloMuteVolume = null;
  };

  AudioOutput.prototype.triggerFreq = function(freqArray) {
    freqArray.forEach(function(frequency) {
      return 'played frequency: ' + frequency;
    });
  };

  // todo - add initialize method, where the jsSynth instance is either
  // created from pattern or assigned if passed as argument
  return AudioOutput;

})();

var Pattern;

Pattern = (function() {
  function Pattern(length, id) {
    this.pattLength = length || 16;
    this.id = id;
    this.bars = new Array(this.pattLength);
  }

  Pattern.prototype.updateLength = function(newLength) {
    if(this.pattLength < newLength) {
      this.bars = this.bars.concat(new Array(newLength - this.pattLength));
    } else {
      this.bars = this.bars.splice(0, newLength);
    }
    this.pattLength = this.bars.length;
    return this.pattLength;
  };

  Pattern.prototype.clearBars = function() {
    this.bars = new Array(this.pattLength);
  };

  return Pattern;
})();