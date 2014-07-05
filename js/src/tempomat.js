/*global EventManager, webkitAudioContext, AudioContext, console */

/**
 * Custom impl of https://github.com/cwilso/ metronome.js
 * {@link http://www.html5rocks.com/en/tutorials/audio/scheduling/goodmetronome.html}
 * license MIT
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * @Class TempoMat
 */
var TempoMat;

TempoMat = (function(g) {
  "use strict";

  var context, STD_NOTE_LENGTH;
  STD_NOTE_LENGTH = 16;
  context = new AudioContext();

  /**
   * Initialize default values
   * Notes resolution: 0 == 16th, 1 == 8th, 2 == quarter notes, 3 == half notes
   * 4 == whole notes
   * @constructor
   */
  function TempoMat() {
    this.em = EventManager.getInstance();
    this.measures = 1;
    this.intervalID = 0;
    this.notesInQueue = [];
    this.isPlaying = false;
    this.tempo = 140.0;
    this.lookahead = 25.0;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;
    this.noteLength = 0.05;
    this.noteResolution = 2;

    try {
      this.em.register({
        'uiman:play': this.play,
        'uiman:stop': this.stop,
        'uiman:pause': this.pause,
        'uiman:tempochange': this.changeTempo,
        'uiman:measurechange' : this.measureChange
      }, null, this);
    }
    catch (e) {
      console.error(e);
    }
  }

  TempoMat._instance = null;

  TempoMat.getInstance = function() {
    return this._instance !== null ? this._instance : this._instance =
      (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor,
        result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function() {});
  };

  TempoMat.prototype.computeNextNote = function() {
    var secondPerBeat = 60.0 / this.tempo;

    this.nextNoteTime += 0.25 * secondPerBeat;
    this.current16thNote++;
    if ((STD_NOTE_LENGTH * this.measures) === this.current16thNote) {
      this.current16thNote = 0;
    }
  };

  TempoMat.prototype.scheduleNextNote = function(beatNumber, time) {

    var source = context.createOscillator();
//    source.connect(context.destination);
//    source.frequency.value = 220.0;
//    this.notesInQueue.push({note: beatNumber, time: time});
    this.em.emit('tempo:tick', beatNumber);
    if ((1 === this.noteResolution) && (beatNumber % 2)) {
      return;
    }

    if ((2 === this.noteResolution) && (beatNumber % 4)) {
      return;
    }

    if ((3 === this.noteResolution) && (beatNumber % 8)) {
      return;
    }

    if ((4 === this.noteResolution) && (beatNumber % 16)) {
      return;
    }
//    console.log('beatNumber, time', beatNumber, time);
    source.start(time);
    source.stop(time + this.noteLength);
    this.em.emit('tempo:notetick', beatNumber);
    // Here goes the play / stop command
  };

  TempoMat.prototype.schedule = function() {
    while (this.nextNoteTime < context.currentTime + this.scheduleAheadTime) {
      this.scheduleNextNote(this.current16thNote, this.nextNoteTime);
      this.computeNextNote();
    }
    this.timerID = g.setTimeout(this.schedule.bind(this), this.lookahead);
  };

  TempoMat.prototype.play = function() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.current16thNote = 0;
      this.nextNoteTime = context.currentTime;
      this.schedule();
    } else {
      this.stop();
      this.play();
    }
  };

  TempoMat.prototype.stop = function() {
    this.isPlaying = false;
    return g.clearTimeout(this.timerID);
  };

  TempoMat.prototype.pause = function() {
    if(this.isPlaying) {
      this.isPlaying = !this.isPlaying;
      g.clearTimeout(this.timerID);
    } else {
      this.isPlaying = !this.isPlaying;
      this.nextNoteTime = context.currentTime;
      this.schedule();
    }
  };

  TempoMat.prototype.changeNoteResolution = function(newResolution) {
    this.noteResolution = newResolution;
  };

  TempoMat.prototype.changeTempo = function(newBPM) {
    this.tempo = newBPM;
  };

  TempoMat.prototype.measureChange = function(newLength) {
    if(this.current16thNote >= STD_NOTE_LENGTH * newLength) {
      this.play();
    }
    this.measures = newLength;
  };

  return TempoMat;

})(window);

var tt = TempoMat.getInstance();
