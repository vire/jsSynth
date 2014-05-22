var Sequencer;

/**
* TODOs:
* add channel support - type of channel, binds to a sound playable instance
* add pattern per channel (array of object with state active/inactive, type)
* implement run method - moves the cursor per channel's pattern 
* implement BPM, timing, notes, tempo
*/
Sequencer = (function() {
  function Sequencer(name, bars, tracks) {
    this.name = name || '';
    this.tracks = tracks || 4;
    this.bars = bars || [];
    this.isPlaying = false;
  }

  Sequencer.prototype.cursor = 'position in bars and bar';

  Sequencer.prototype.getCursor = function() {
    throw new Error("not yet implemented");
  };

  Sequencer.prototype.start = function() {
    return this.isPlaying = true;
  };

  Sequencer.prototype.stop = function() {
    return this.isPlaying = false;
  };

  Sequencer.prototype.pause = function() {
    throw new Error("not yet implemented");
  };

  Sequencer.prototype.addTrack = function() {
    throw new Error("not yet implemented");
  };

  Sequencer.prototype.removeTrack = function(id) {
    throw new Error("NYI");
  };

  Sequencer.prototype.addBar = function() {
    throw new Error("not yet implemented");
  };

  Sequencer.prototype.removeBar = function() {
    throw new Error("not yet implemented");
  };

  return Sequencer;

})();
