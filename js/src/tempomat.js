/*global webkitAudioContext, AudioContext, console */

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
    this.loopLength = 1;
    this.intervalID = 0;
    this.notesInQueue = [];
    this.isPlaying = false;
    this.tempo = 120.0;
    this.lookahead = 25.0;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;
    this.noteLength = 0.05;
    this.noteResolution = 0; // 0 == 16th, 1 == 8th, 2 == quarter, 3 half, 4 whole
  }

  TempoMat.prototype.computeNextNote = function() {
    var secondPerBeat = 60.0 / this.tempo;

    this.nextNoteTime += 0.25 * secondPerBeat;
//    console.log('this.nextNoteTime', this.nextNoteTime);
    this.current16thNote++;
    if ((STD_NOTE_LENGTH * this.loopLength) === this.current16thNote) {
      this.current16thNote = 0;
    }
  };

  TempoMat.prototype.scheduleNextNote = function(beatNumber, time) {

    var source = context.createOscillator();
//    source.connect(context.destination);
//    source.frequency.value = 220.0;
//    this.notesInQueue.push({note: beatNumber, time: time});

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

    // Here goes the play / stop command
  };

  TempoMat.prototype.schedule = function() {
    console.log('while condition: ',this.nextNoteTime < context.currentTime + this.scheduleAheadTime);
    while (this.nextNoteTime < context.currentTime + this.scheduleAheadTime) {
      this.scheduleNextNote(this.current16thNote, this.nextNoteTime);
      this.computeNextNote();
    }
    this.timerID = g.setTimeout(this.schedule.bind(this), this.lookahead);
  };

  TempoMat.prototype.play = function() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.current16thNote = 0;
      this.nextNoteTime = context.currentTime;
      this.schedule();
    }
  };

  TempoMat.prototype.stop = function() {
    this.isPlaying = !this.isPlaying;
    return g.clearTimeout(this.timerID);
  };

  TempoMat.prototype.changeNoteResolution = function(newResolution) {
    this.noteResolution = newResolution;
  };

  TempoMat.prototype.changeTempo = function(newBPM) {
    this.tempo = newBPM;
  };

  TempoMat.prototype.changeLoopLength = function(newLength) {
    this.loopLength = newLength;
  };

  return TempoMat;

})(window);

var tt = new TempoMat();
