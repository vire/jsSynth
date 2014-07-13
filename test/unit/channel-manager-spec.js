/*globals ChannelManager  */
var chMan = ChannelManager.getInstance();

describe('ChannelManager ', function() {
  var presetMock, synthMock;
  presetMock = {};
  synthMock = {};

  beforeEach(function() {
    jasmine.addMatchers({
      equalById: function(util, customEqualityTesters) {

        return {
          compare: function(actual, expected) {
            var result = {};
            result.pass =
              util.equals(actual.id, expected.id, customEqualityTesters);
            return result;
          }
        };
      }
    });
  });

  afterEach(function() {
    chMan._audioOutputs = [];
    chMan._patterns = [];
  });

  it('must be defined on global', function() {
    expect(ChannelManager).toBeDefined();
  });

  it('has basic properties', function() {
    expect(chMan._audioOutputs).toBeDefined();
    expect(chMan._patterns).toBeDefined();
  });

  it('assign AudioOutput', function() {
    chMan.assignAudioOutput(presetMock, synthMock);
    expect(chMan._audioOutputs.length).not.toBe(0);
//    expect(chMan._audioOutputs[0] instanceof AudioOutput).toBeTruthy();

  });

  it('initialize Pattern', function() {
    spyOn(chMan, 'initializePattern').and.callThrough();

    chMan.assignAudioOutput(presetMock, synthMock);

    expect(chMan._patterns.length).not.toBe(0);
    expect(chMan.initializePattern).toHaveBeenCalled();
//    expect(chMan._patterns[0] instanceof Pattern).toBeTruthy();
  });

  it('AudioOutput and Pattern IDs must equal', function() {
    chMan.assignAudioOutput(presetMock, synthMock);

    expect(chMan._audioOutputs[0]).equalById(chMan._patterns[0]);
  });

  it('update AudioOutput i in _audioOutputs[i]', function() {
    var err, origAO, updatedAO;

    spyOn(chMan, 'updateAudioOutput').and.callThrough();
    chMan.assignAudioOutput(presetMock, synthMock);

    origAO = chMan._audioOutputs[0];
    updatedAO = Object.create(origAO);

    updatedAO.updated = true;
    chMan.updateAudioOutput(0, updatedAO);

    expect(chMan.updateAudioOutput).toHaveBeenCalled();
    expect(chMan._audioOutputs[0]['updated']).toBeTruthy();
    expect(chMan._audioOutputs[0]['id'] === origAO.id).toBeTruthy();
    expect(chMan._audioOutputs[0]).equalById(origAO);

    try {
      chMan.updateAudioOutput(1, updatedAO);
    } catch (e) {
      err = e;
    }

    expect(err).toEqual('AudioOutput on index: 1 is not defined!');
  });

  it('remove AudioOutput i form _audioOutputs[i]', function() {
    var currentAO, result;

    chMan.assignAudioOutput(presetMock, synthMock);
    currentAO = chMan._audioOutputs[0];
    spyOn(chMan, 'removeAudioOutput').and.callThrough();
    result = chMan.removeAudioOutput(0);
    expect(chMan._audioOutputs.length).toEqual(0);
    expect(currentAO).equalById(result[0]);
    expect(chMan.removeAudioOutput).toHaveBeenCalled();
  });

  it('assign & update freq to channelBar[i][j]', function() {
    var frequencies;
    spyOn(chMan, 'assignChannelBar').and.callThrough();
    chMan.assignAudioOutput(presetMock, synthMock);

    frequencies = [123.45];
    chMan.assignChannelBar(0, 0, frequencies);
    expect(chMan._patterns[0].bars[0].length).not.toEqual(0);
    expect(chMan._patterns[0].bars[0]).toEqual(frequencies);
    expect(chMan.assignChannelBar).toHaveBeenCalled();
  });

  it('clear freq on channelBar[i][j]', function() {
    chMan.assignAudioOutput(presetMock, synthMock);
    spyOn(chMan, 'clearChannelBar').and.callThrough();
    expect(chMan._patterns[0][0]).not.toEqual(null);
    chMan.clearChannelBar(0, 0);
    expect(chMan._patterns[0][0]).toEqual(null);
  });

  it('update pattern length - resize measures', function() {
    var extendResult, shrinkResult;
    chMan.assignAudioOutput(presetMock, synthMock);
    spyOn(chMan, 'updatePatternsLength').and.callThrough();

    expect(chMan._patterns[0].pattLength).toEqual(16);

    extendResult = chMan.updatePatternsLength(32);
    expect(extendResult).toEqual(32);
    expect(chMan.updatePatternsLength).toHaveBeenCalled();
    expect(chMan._patterns[0].pattLength).toEqual(32);

    shrinkResult = chMan.updatePatternsLength(16);
    expect(shrinkResult).toEqual(16);
    expect(chMan.updatePatternsLength).toHaveBeenCalled();
    expect(chMan._patterns[0].pattLength).toEqual(16);

  });

  it('toggleMute channel[i]', function() {
    spyOn(chMan, 'toggleMute').and.callThrough();

    var resultUndef;
    chMan.assignAudioOutput(presetMock, synthMock);

    /** mute */
    chMan.toggleMute(0);
    expect(chMan._audioOutputs[0].isMuted).toBeTruthy();
    expect(chMan.getVol(0)).toEqual(0.0);

    /** unmute */
    chMan.toggleMute(0);
    expect(chMan._audioOutputs[0].isMuted).toBeFalsy();
    expect(chMan.getVol(0)).toEqual(1.0);


    resultUndef = chMan.toggleMute(101);
    expect(resultUndef).toBeUndefined();
  });

  it('toggle solo channel[i]', function() {
    var result;
    chMan.assignAudioOutput(presetMock, synthMock);

    spyOn(chMan, 'toggleSolo').and.callThrough();
    expect(chMan._audioOutputs[0].isSolo).toBeFalsy();
    result = chMan.toggleSolo(0);
    expect(result).toBeTruthy();
    result = chMan.toggleSolo(0);
    expect(result).toBeFalsy();
  });

  it('change volume on channel[i]', function() {
    var resultDown, resultUndef, resultUp;
    chMan.assignAudioOutput(presetMock, synthMock);
    spyOn(chMan, 'changeVol').and.callThrough();

    /** volume down */
    expect(chMan._audioOutputs[0].volume).toEqual(1.0);
    resultDown = chMan.changeVol(0, 0.5);
    expect(chMan.changeVol).toHaveBeenCalled();
    expect(resultDown).toEqual(0.5);

    /** volume up */
    resultUp = chMan.changeVol(0, 1.0);
    expect(chMan.changeVol).toHaveBeenCalled();
    expect(resultUp).toEqual(1.0);

    /** volume change on noexist channel*/
    resultUndef = chMan.changeVol(101, 1.0);
    expect(chMan.changeVol).toHaveBeenCalled();
    expect(resultUndef).toBeUndefined();

  });
  it('clear pattern', function() {
    var result;
    chMan.assignAudioOutput(presetMock, synthMock);
    chMan._patterns[0].bars[0] = [101.00];
    chMan._patterns[0].bars[1] = [102.00];
    chMan._patterns[0].bars[2] = [103.00];

    spyOn(chMan, 'clearPattern').and.callThrough();
    result = chMan.clearPattern(0);
    expect(result).not.toBeUndefined();
    expect(chMan.clearPattern).toHaveBeenCalled();
    expect(chMan._patterns[0].bars[0]).toBeUndefined();
    expect(chMan._patterns[0].bars[1]).toBeUndefined();
    expect(chMan._patterns[0].bars[2]).toBeUndefined();
  });
  it('clear all patterns', function() {
    var result;
    chMan.assignAudioOutput(presetMock, synthMock);
    chMan.assignAudioOutput(presetMock, synthMock);

    chMan._patterns[0].bars[0] = [101.00];
    chMan._patterns[0].bars[1] = [102.00];
    chMan._patterns[0].bars[2] = [103.00];

    chMan._patterns[1].bars[0] = [201.00];
    chMan._patterns[1].bars[1] = [202.00];
    chMan._patterns[1].bars[2] = [203.00];

    spyOn(chMan, 'clearAllPatterns').and.callThrough();

    result = chMan.clearAllPatterns();
    expect(result).not.toBeUndefined();
    expect(chMan.clearAllPatterns).toHaveBeenCalled();
    expect(chMan._patterns[0].bars[0]).toBeUndefined();
    expect(chMan._patterns[0].bars[1]).toBeUndefined();
    expect(chMan._patterns[0].bars[2]).toBeUndefined();

    expect(chMan._patterns[1].bars[0]).toBeUndefined();
    expect(chMan._patterns[1].bars[1]).toBeUndefined();
    expect(chMan._patterns[1].bars[2]).toBeUndefined();
  });

  it('getFreqsAtIndex channelBar[i][j]', function() {
    var resultOne, resultTwo;
    chMan.assignAudioOutput(presetMock, synthMock);
    chMan.assignChannelBar(0, 0, [220.0, 440.0]);
    chMan.assignChannelBar(0, 4, [150.0, 190.0]);
    spyOn(chMan, 'getFreqsAtIndex').and.callThrough();
    resultOne = chMan.getFreqsAtIndex(0, 0);
    resultTwo = chMan.getFreqsAtIndex(0, 4);
    expect(resultOne).toEqual([220.0, 440.0]);
    expect(resultTwo).toEqual([150.0, 190.0]);
  });

  it('trigger audioOuptut play/stop on channelBar[i][j] ', function() {
    chMan.assignAudioOutput(presetMock, synthMock);
    spyOn(chMan, 'playBar').and.callThrough();
    chMan.playBar(0);
    expect(chMan.playBar).toHaveBeenCalled();
  });
  xit('export', function() {
  });
  xit('import', function() {
  });
});