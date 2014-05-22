'use strict';
var MockContext = window.AudioContext;

var MockContextProto = MockContext.prototype;
var ctx = new MockContext();
var synth = new Synth();


describe('AudioContext', function() {

  describe('should be', function() {    
    it('defined as a global function', function() {
      expect(typeof MockContext).toBe('function');
    });
    it('returning an object instance', function() {
      var audioCtx = new MockContext();
      expect(typeof audioCtx).toBe('object');
    });
  });

  describe('should have', function() {

    it('a defined `createWhiteNoise` mehtod', function() {
      var whiteNoiseProp = MockContextProto.hasOwnProperty('createWhiteNoise');
      expect(typeof MockContextProto.createWhiteNoise).toBe('function'); 
      expect(whiteNoiseProp).toBeTruthy();
    });

    it('`createWhiteNoise` implemented to return an object', function() {
      var result = null;
      spyOn(ctx, 'createWhiteNoise').and.callThrough();

      result = ctx.createWhiteNoise();
      expect(ctx.createWhiteNoise).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.constructor.name).toMatch('AudioBufferSourceNode');

    });

    it('an .createFeedbackDelay() method ');
    it('an .createReverb() method ');
    it('an .createPinkNoise() method ');
    it('an .createBrownNoise() method ');
  });
});

/** Requires a synt Instance */
describe('Synth', function() {
  describe('Synth.LFO', function() {});
  describe('Synth.Oscilator', function() {});
  describe('Synth.WaveTable', function() {});
});

describe('Global methods: ', function() {
  describe('getKnwoValue', function(){});
  describe('savePreset', function(){});
  describe('updateKnob', function(){});
  describe('loadPreset', function(){});
  describe('updatePresets', function(){});
  describe('knobChanged', function(){});
  describe('showOscilatorParameters', function(){});
});

describe('UI', function() {
  describe('WaveTable', function(){});
});