/* globals UIManager, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';



document.write('<div id="sequencer-test-container" style="height: 200px;background: white;border: 1px solid black;"></div>');

var opts = {
  rootContainer: 'sequencer-test-container',
  uiContainer: 'ui-container'
};

var uimanager = UIManager.getInstance(opts);


describe('UIManager', function() {

  beforeEach(function() {
  });
  
  it('needs jquery', function() {
    expect($).toBeDefined();
  });
  it('should be defined on global', function() {
    expect(UIManager).toBeDefined();
    expect(UIManager.prototype.constructor.name).toEqual('UIManager');
  });
  it('should return an instance', function() {
    expect(uimanager).toBeDefined();
  });

  it('should contain the root container', function() {

    expect(uimanager.rootContainer).toBeDefined();
  });

  it('has .initialize() which appends uimanager-container onto parent', function() {
    expect($('#'+opts.rootContainer).length).not.toBe(0);
  });

  it('should contain elements in a element list property', function() {
    var elemList = uimanager.getElementList();
    expect(elemList).not.toBe({});
    expect(elemList).toBeDefined();

    // Dummy properties
    expect(elemList.hasOwnProperty('buttons')).toBeTruthy();
    expect(elemList.hasOwnProperty('channels')).toBeTruthy();
    expect(elemList.hasOwnProperty('knobs')).toBeTruthy();
    expect(elemList.hasOwnProperty('sliders')).toBeTruthy();
    expect(elemList.hasOwnProperty('inputs')).toBeTruthy();
  });
});