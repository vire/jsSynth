/* globals UIManager, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';

document.write('<div id="sequencer-test-container" style="height: 200px;background: white;border: 1px solid black;"></div>');

var opts = {
  rootContainerId: 'sequencer-test-container',
  uiContainerId: 'ui-container'
};
var uic;
var uimanager = UIManager.getInstance(opts);
var rootContainer = $('#'+opts.uiContainerId);
var elemList = uimanager.getElementList();

describe('UIManager', function() {

  describe('core functionality', function() {
    it('should be defined on global', function() {
      expect(UIManager).toBeDefined();
      expect(UIManager.prototype.constructor.name).toEqual('UIManager');
    });
    it('relies on jquery', function() {
      it('needs jquery', function() {
        expect($).toBeDefined();
      });    
    });
    it('should allow .getInstance() returning a singleton instance', 
      function() {
        var anotherUIManager = UIManager.getInstance();
        expect(uimanager).toBeDefined();
        expect(UIManager === UIManager).toBeTruthy();
      }
    );
    it('must contain its `uiContainerId` ', function() {
      expect(uimanager.uiContainerId).toBeDefined();
      expect(uimanager.uiContainerId).toMatch('ui-container');
    });
    it('must contain an `uiContainer` property' ,function() {
      expect(uimanager.uiContainer).toBeDefined();
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
    
    it('.initialize() appends uicontainer to DOM',
      function() {
        var rootContainer = $('#'+opts.rootContainerId)
        var uicontainer = rootContainer.find('#'+opts.uiContainerId);
        expect(rootContainer.children().length).not.toBe(0);
        expect(uicontainer.children().length).not.toBe(0);
      });
    it('.initialize() will draw basic `buttons`', function() {
      expect(rootContainer.find('.seq-play-button')[0]).toBeDefined();
      expect(rootContainer.find('.seq-stop-button')[0]).toBeDefined();
    });   
  });  

  describe('.drawElement() method ', function() {
    uic = $('#'+opts.uiContainerId);
    
    beforeEach(function() {
      spyOn(uimanager, 'drawElement').and.callThrough();
      spyOn(uimanager.e, 'emit');
      uic.empty();
    });
    afterEach(function() {
      uic.empty();
    });
    
    it('should thow error without if no params provided', function() {
      var err = null;
      try {
        uimanager.drawElement();
      } catch (e) {
        err = e;
      }
      expect(uimanager.drawElement).toHaveBeenCalled();
      expect(err).toMatch('no element for add provided!');
    });
    it('should append one elem into a container' ,function() {
      expect(uic.children().length).toBe(0);
      uimanager.drawElement(elemList.buttons.play);
      expect(uic.children().length).toBe(1);
    });
    it('should proper append an button', function() {
      uimanager.drawElement(elemList.buttons.play);
      var drawnButton = uic.find('button');
      expect(drawnButton.text()).toMatch('Play');
      expect(drawnButton.attr('class')).toMatch('seq-play-button')
    })
    it('should process the input - add event handler, and emit', function() {
      uimanager.drawElement(elemList.buttons.play);
      var drawnButton = uic.find('button');
      drawnButton.click();
      expect(uimanager.e.emit).toHaveBeenCalled();
    });
    it('should add more than 1 elements to container', function() {
      uimanager.drawElement(elemList.buttons.play);
      uimanager.drawElement(elemList.buttons.pause);
      uimanager.drawElement(elemList.buttons.stop);
      expect(uic.children().length).toBe(3);
      var drawnButtons = uic.find('button');
      expect(drawnButtons.eq(0).text()).toMatch('Play');
      expect(drawnButtons.eq(1).text()).toMatch('Pause');
      expect(drawnButtons.eq(2).text()).toMatch('Stop');
    });
  });  
});