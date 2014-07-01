/* globals UIManager, EventManager,
 describe, beforeEach, spyOn, afterEach, it, xit, xdescribe, expect */
'use strict';

var result = 0, uic, uimanager, elemList, looper, eventManager;

(function paintPretty() {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/seq-style.css';
  link.type = 'text/css';
  head.appendChild(link);

})();

/**
 * Sometimes it's better to just mock the EventManager
 */
var eventManagerMock = {
  'registeredSubs': {},
  'register': function() {
  },
  'emit': function() {
  }
};

/** Options passed to the .getIntanceMehtod */
var opts = {
  defaultMeasureCount: 10,
  signatureBeatCount: 3,
  signatureNoteLength: 8,
  defaultChannelCount: 10,
  defaultBpm: 176

};

describe('UIManager', function() {
  it('class must be defined on global scope', function() {
    expect(window.UIManager).toBeDefined();
  });
  it('must be callable via .getInstance()', function() {
    var uimanInstance;
    uimanInstance = null;
    uimanInstance = UIManager.getInstance();
    expect(uimanInstance).toBeDefined();
    UIManager.destroy();
  });
  it('must accept an options hash - representing defaults', function() {
    var uimanInstance;
    uimanInstance = UIManager.getInstance(opts);
    expect(uimanInstance.measures).toEqual(10);
    expect(uimanInstance.signatureBeatCount).toEqual(3);
    expect(uimanInstance.signatureNoteLength).toEqual(8);
    expect(uimanInstance.defaultChannelCount).toEqual(10);
    expect(uimanInstance.defaultBpm).toEqual(176);

  });

  describe('instance', function() {
    var uimanInstance;
    beforeEach(function() {
      uimanInstance = UIManager.getInstance();
    });
    afterEach(function() {
      UIManager.destroy();
    });

    it('must contain the EventEmitter instance', function() {
      expect(uimanInstance.em).toBeDefined();
      expect(uimanInstance.em instanceof EventManager).toBeTruthy();
    });

    it('.initialize() method is called from Constructor', function() {
      expect(uimanInstance.initialized).toBeTruthy();
      expect(UIManager._instance).not.toBe(null);
    });
    it('.createSeqWrapper() prepares a DOM template string', function() {
      expect(uimanInstance.createSeqWrapper().length).toBeGreaterThan(0);
    });
  });
});