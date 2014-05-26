/* globals UIManager, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';

var uimanager = new UIManager();

describe('UIManager', function() {
  it('should be defined on global', function() {
    expect(UIManager).toBeDefined();
    expect(UIManager.prototype.constructor.name).toEqual('UIManager');
  });
  it('should return an instance', function() {
    expect(uimanager).toBeDefined();
  });

  it('should contain elements in a element list property', function() {
    var elemList = uimanager.getElementList();
    console.log('uimanager.elementList', elemList.hasOwnProperty('buttons'))
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