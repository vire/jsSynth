/* globals UIManager, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';

document.write('<div id="sequencer-test-container" style="height: 200px;background: white;border: 1px solid black;"></div>');

var opts = {
  rootContainerId: 'sequencer-test-container',
  uiContainerId: 'ui-container'
};

var uimanager = UIManager.getInstance(opts);
var rootContainer = $('#'+opts.uiContainerId);

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

  it('must contain an `uiContainer` property' ,function() {
    expect(uimanager.uiContainer).toBeDefined();
  })

  it('must contain its `uiContainerId` ', function() {
    expect(uimanager.uiContainerId).toBeDefined();
    expect(uimanager.uiContainerId).toMatch('ui-container');
  });

  it('has .initialize() which appends `uiContainerId` onto DOM', function() {
    expect($('#'+opts.uiContainerId).length).not.toBe(0);
  });

  it('should add play stop buttons to this container', function() {
    expect(rootContainer.find('.seq-play-button')[0]).toBeDefined();
    expect(rootContainer.find('.seq-stop-button')[0]).toBeDefined();
  });

  it('.drawElement() a simple(non-toggle) button' , function() {
    
    var simplebutton = {
      tagName:'button',
      className :'seq-stop-button',
      label: 'Stop',
      eventType: 'click',
      emit: 'stop',
    };

    spyOn(uimanager, 'drawElement').and.callThrough();
    // remove the buttons first
    var uic = $('#'+opts.uiContainerId);
    uic.empty();

    expect(uic.children().length).toBe(0);
    uimanager.drawElement(simplebutton);
    expect(uic.children().length).toBe(1);
    expect(uimanager.drawElement).toHaveBeenCalled();

  });

  it('.drawElement() should add a toggle button to the `uiContainer`', function() {
    var toggleButton = {
      tagName:'button',
      className :'seq-play-button',
      label: 'Play',
      eventType: 'click',
      emit: 'play',
      css: {},
      toggle: {
        toggleOn: 'click',
        className: 'seq-pause-button',
        label: 'Pause',
        emit: 'pause',
        css: {}
      }  
    }
    spyOn(uimanager, 'drawElement').and.callThrough();
    // remove the buttons first
    var uic = $('#'+opts.uiContainerId);
    uic.empty();
    uimanager.drawElement(toggleButton);
    expect(uic.children().length).toBe(1);
    var drawnButton = uic.find('button');
    expect(drawnButton).toBeDefined();
    expect(drawnButton.text()).toMatch('Play');
    // just a workaround cause the uimanager.eventer isn't impl yet
    drawnButton.click()
    expect(drawnButton.text()).toMatch('Pause');
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

  it('should have an newDrawElement() mehtod for adding elements', function() {
    var uic = $('#'+opts.uiContainerId);
    var playButton = {
      'class': 'seq-play-button',
      tagName: 'button',
      label: 'Play',
      jqEvent: 'click',
      // component:event or component:toggle:forevent
      emitEvents: ['uiman:play','uiman:toggle:pause']
    };
    spyOn(uimanager, 'newDrawElement').and.callThrough();
    uic.empty();
    uimanager.newDrawElement(playButton);
    expect(uic.children().length).toBe(1);
    var drawnButton = uic.find('button');
    expect(drawnButton).toBeDefined();
    expect(drawnButton.text()).toMatch('Play');
    
  })
});