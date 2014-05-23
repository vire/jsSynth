'use strict';
var MockContext = window.AudioContext;

var MockContextProto = MockContext.prototype;
var synth = new Synth();
var buffer, ctx, result;

describe('AudioContext', function() {

  beforeEach(function() {
    ctx = new MockContext();
  });

  afterEach(function() {
    ctx = null;
  });

  describe('should', function() {
    it('be defined as a global function', function() {
      expect(window.MockContext).toBeDefined();
      expect(typeof MockContext).toBe('function');
    });

    it('return an `AudioContext` instance', function() {
      expect(ctx.constructor.name).toMatch('AudioContext')
    });
  });

  describe('.createBuffer() method should', function() {
    beforeEach(function() {
      spyOn(ctx, 'createBuffer').and.callThrough()
      buffer = ctx.createBuffer(2, 88200, 44100);
    });

    afterEach(function() {
      buffer = null
    });

    it('return an `AudioBuffer` instance', function() {
      expect(buffer).toBeDefined();
      expect(ctx.createBuffer).toHaveBeenCalled();
      expect(buffer.constructor.name).toMatch('AudioBuffer');
    })

  })

  describe('.createWhiteNoise() mehtod should', function() {

    beforeEach(function() {
      spyOn(ctx, 'createWhiteNoise').and.callThrough();
      result = ctx.createWhiteNoise();
    });

    afterEach(function() {
      result = null
    })

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

  describe('createFeedbackDelay() method', function() {});
  describe('createReverb() method', function() {});
  describe('createPinkNoise() method', function() {});
  describe('createBrownNoise() method', function() {});
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