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
});