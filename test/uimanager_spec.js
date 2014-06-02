/* globals UIManager, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';

document.write('<div id="sequencer-test-container" style="height: 200px;background: white;border: 1px solid black;"></div>');


var eventManagerMock = {
  'registeredSubs' : {},
  'register': function() {},
  'emit' : function() {}
}

// this should be mocked :)
var eventManager = EventManager.getInstance();

var opts = {
  rootContainerId: 'sequencer-test-container',
  uiContainerId: 'ui-container',
  em: eventManager
};
var uic;
var uimanager = UIManager.getInstance(opts);
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

    it('must contain the `EventManager` instance', function() {
      expect(uimanager.em).toBeDefined();
      expect(uimanager.em.register).toBeDefined();
    });

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
      expect(elemList.hasOwnProperty('knobs')).toBeTruthy();
      expect(elemList.hasOwnProperty('sliders')).toBeTruthy();
      expect(elemList.hasOwnProperty('inputs')).toBeTruthy();
    });
    
    it('constructs `rootContainer` jQuery object', function() {
      expect(uimanager.hasOwnProperty('rootContainer')).toBeTruthy();
      expect(uimanager.rootContainer instanceof jQuery).toBeTruthy();
      
    });

    it('constructs `uiContainer` jQuery object', function() {
      expect(uimanager.hasOwnProperty('uiContainer')).toBeTruthy();
      expect(uimanager.uiContainer instanceof jQuery).toBeTruthy();
    });

    it('.initialize() appends `uiContainer` to rootContainer',
      function() {
        expect(uimanager.rootContainer.children().length).not.toBe(0);
        expect(uimanager.uiContainer.children().length).not.toBe(0);
        expect(uimanager.rootContainer.find(uimanager.uiContainer)
          .length).not.toBe(0)
      });
    it('.initialize() appends `buttons` to rootContainer', function() {
      expect(uimanager.rootContainer.find('.seq-play-button')[0]).toBeDefined();
      expect(uimanager.rootContainer.find('.seq-stop-button')[0]).toBeDefined();
    });   
  });  

  describe('.drawElement() method ', function() {
    uic = uimanager.uiContainer;
    
    beforeEach(function() {
      spyOn(uimanager, 'drawElement').and.callThrough();
      spyOn(uimanager.e, 'emit');
      
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
      // expect(uimanager.em.emit).toHaveBeenCalled();
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

  describe('.drawElements() method', function() {
    uic = uimanager.uiContainer;
    
    var sampleList = {
      "category1" : {
        'play' : {
          'class': 'seq-test-button',
          tagName: 'button',
          label: 'Test paly',
          jqEvent: 'click',
          // component:event or component:toggle:forevent
          // toggles the button play to pause
          emitEvents: ['uiman:play']
        },
      }
    }

    beforeEach(function() {
      
      spyOn(uimanager, 'drawElements').and.callThrough();
      spyOn(uimanager, 'drawElement').and.callThrough();
      spyOn(uimanager.e, 'emit');
      
    });
    afterEach(function() {
      uic.empty();
    })

    it('accepts no params - renders the default elementList', function() {
      expect(uimanager.drawElements).not.toHaveBeenCalled();
      uimanager.drawElements();
      expect(uimanager.drawElements).toHaveBeenCalled();
      expect(uimanager.drawElement).toHaveBeenCalled();
      expect(uimanager.uiContainer.children().length).not.toBe(0)
    });

    it('accepts an empty list param - renders nothing', function() {
      expect(uimanager.drawElements).not.toHaveBeenCalled();
      uimanager.drawElements({});
      expect(uimanager.drawElements).toHaveBeenCalled();
      expect(uimanager.drawElement).not.toHaveBeenCalled();
      expect(uimanager.uiContainer.children().length).toBe(0)
    });

    it('accepts an object with items to be rendered', function() {
      var elem = null;
      expect(uimanager.drawElements).not.toHaveBeenCalled();
      uimanager.drawElements(sampleList);
      expect(uimanager.drawElement).toHaveBeenCalled();
      expect(uimanager.drawElements).toHaveBeenCalled();
      elem = uimanager.uiContainer.find('button');
      expect(uimanager.uiContainer.children().length).not.toBe(0);
      expect(elem).toBeDefined();
      elem.click();
      // expect(uimanager.em.emit).toHaveBeenCalled();
    })
  });
  xdescribe('.drawChannels()', function() {
    uic = uimanager.uiContainer;
    beforeEach(function() {
      spyOn(uimanager, 'drawChannels').and.callThrough();
    })
    it('should be called during the .initialize()', function() {
    });
  });
});