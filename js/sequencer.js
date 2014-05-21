var Sequencer;

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
