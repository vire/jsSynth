/* global Synth, describe, it, beforeEach, expect, afterEach, spyOn */

'use strict';
var MockContext = window.AudioContext;
var ctx = new MockContext();
var MockContextProto = MockContext.prototype;
var synth = new Synth();
var buffer, err, ctx, result;

describe('AudioContext', function() {

  beforeEach(function() {
    
  });

  afterEach(function() {
    // ctx = null;
  });

  describe('prototype should', function() {
    it('be defined as a global function', function() {
      expect(window.MockContext).toBeDefined();
      expect(typeof MockContext).toBe('function');
    });

    it('haven an constructor returning a `AudioContext` instance', function() {
      expect(ctx.constructor.name).toMatch('AudioContext');
    });
  });

  describe('.createBuffer() method should', function() {
    beforeEach(function() {
      spyOn(ctx, 'createBuffer').and.callThrough();
      buffer = ctx.createBuffer(2, 88200, 44100);
    });

    afterEach(function() {
      buffer = null;
    });

    it('return an `AudioBuffer` instance', function() {
      expect(buffer).toBeDefined();
      expect(ctx.createBuffer).toHaveBeenCalled();
      expect(buffer.constructor.name).toMatch('AudioBuffer');
    });
  });

  describe('.createWhiteNoise() mehtod should', function() {

    beforeEach(function() {
      result = undefined;
      spyOn(ctx, 'createWhiteNoise').and.callThrough();
      result = ctx.createWhiteNoise();
    });

    afterEach(function() {
      result = null;
    });

    it('be defined on AudioContext', function() {
      var whiteNoiseProp = MockContextProto.hasOwnProperty('createWhiteNoise');
      expect(typeof MockContextProto.createWhiteNoise).toBe('function'); 
      expect(whiteNoiseProp).toBeTruthy();
    });

    it('return an `AudioBufferSourceNode` instance', function() {
      expect(ctx.createWhiteNoise).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.constructor.name).toMatch('AudioBufferSourceNode');
    });    
  });

  describe('.createFeedbackDelay() method', function() {
    beforeEach(function() {
      result = undefined;
      spyOn(ctx, 'createFeedbackDelay').and.callThrough();
      result = ctx.createFeedbackDelay(1);
    });
    afterEach(function() {
      err = null;
      result = null;
    });

    it('must throw an Error when calling without param ', function() {      
      try {
        ctx.createFeedbackDelay();
      } catch(e) {
        err = e;        
      }
      expect(err.message).toBe('Failed to execute \'createDelayNode\' on \'AudioContext\': max delay time (NaN) must be between 0 and 180, exclusive.');
    });

    it('should return an `FeedbackDelayNode` instance', function() {
      expect(ctx.createFeedbackDelay).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.constructor.name).toMatch('DelayNode');      
    });

  });
  describe('.createReverb() method', function() {

    beforeEach(function() {
      result = undefined;
      spyOn(ctx, 'createReverb').and.callThrough();
      result = ctx.createReverb(1);
    });
    afterEach(function() {
      result = null;
    });
    it('must throw an Error when called without param', function() {
      var err = null;
      var failString = 'Failed to execute \'createBuffer\' on \'AudioContext\': number of frames must be greater than 0.';
      try {
        ctx.createReverb();
      } catch(e) {
        err = e;
      }
      expect(err.message).toMatch(failString);
    });
    it('must return a `ConvolverNode` instance', function() {
      expect(result).toBeDefined();
      expect(result.constructor.name).toMatch('ConvolverNode');
    });
  });
  describe('.createPinkNoise() method', function() {});
  describe('.createBrownNoise() method', function() {});
});

/** Requires a synt Instance */
describe('Synth', function() {
  describe('Synth.LFO', function() {});
  describe('Synth.Oscilator', function() {});
  describe('Synth.WaveTable', function() {});
});

describe('Global jsSynth methods: ', function() {
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