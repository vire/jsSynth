/* globals EventManager, describe, beforeEach, spyOn, afterEach, it,  expect */
'use strict';

var em = null;

describe('EventManager', function() {
  describe('core - ', function() {

    it('should be available on global', function() {
      expect(EventManager).toBeDefined();
    });
    it('should init instance prop only through .getInstance()', function() {
      expect(EventManager.instance).toEqual(null);
      em = EventManager.getInstance();
      expect(EventManager.instance).not.toEqual(null);
      em = null;
    });
  });

  describe('register() method', function() {
    beforeEach(function() {
      em = EventManager.getInstance();
      em.registeredSubs = {};
      spyOn(em, 'register').and.callThrough();
      spyOn(em, 'registerEvents').and.callThrough();
      spyOn(em, 'registerEvent').and.callThrough();
    });
    afterEach(function() {
      em = null;
    });
    it('must be called with params', function() {
      var err = null;
      expect(em instanceof EventManager).toBeTruthy();
      expect(em.registerEvent).not.toHaveBeenCalled();
      try {
        em.registerEvent();
      } catch (e) {
        err = e;
      }
      expect(err).toMatch('You must pass eventName a emitFn to registerEvent()');
    });
    it('delegates a single event input to registerEvent()', function() {
      var eventName = 'first:event';
      var eventFn = function() {
        console.log('first:event');
      };
      em.register(eventName, eventFn);
      expect(em.register).toHaveBeenCalled();
      expect(em.registerEvent).toHaveBeenCalled();
      expect(em.registeredSubs).toBeDefined();
      expect(em.registeredSubs.hasOwnProperty(eventName)).toBeTruthy();
    });

    it('delegates a eventsHash to registerEvents()', function() {
      var eventsHash = {
        'first:event' : function() {return 'i am the first event';},
        'second:event': function() {return 'i am the second event';} 
      }; 

      em.register(eventsHash);
      expect(em.register).toHaveBeenCalled();
      expect(em.registerEvents).toHaveBeenCalled();
      expect(em.registeredSubs).not.toBeUndefined();
      expect(em.registeredSubs.hasOwnProperty('first:event')).toBeTruthy();
      expect(em.registeredSubs.hasOwnProperty('second:event')).toBeTruthy();
    });
  });

  describe('emit() method', function() {
    beforeEach(function() {
      em = EventManager.getInstance()
      em.registeredSubs = {};
      spyOn(em, 'emit').and.callThrough();
      spyOn(em, 'register').and.callThrough();
    });    

    afterEach(function() {
      em = null;
    });

    it('is defined and callable', function() {
      em.emit('first:event', {a:1}, this);
      expect(em.emit).toHaveBeenCalled();
    });
    it('emits an event defined in registeredSubs', function() {
      var eventName = 'first:event';
      var eventFn = function() {
        console.log('first:event');
      };
      em.register(eventName, eventFn);
      spyOn(em.registeredSubs[eventName][0], 'emitFn').and.callThrough();
      em.emit(eventName);
      expect(em.registeredSubs[eventName][0].emitFn).toHaveBeenCalled();
    });
    it('emits all emitFunctions registered under one event', function() {
      var counter = 0;
      var eventName = 'first:event';
      var firstEmitFn = function() {
        return counter += 1;
      };
      var secondEmitFn = function() {
        return counter += 1;
      }

      em.register(eventName, firstEmitFn);
      expect(em.register).toHaveBeenCalled();
      em.register(eventName, secondEmitFn);
      expect(em.register).toHaveBeenCalled();
      spyOn(em.registeredSubs[eventName][0], 'emitFn').and.callThrough();
      spyOn(em.registeredSubs[eventName][1], 'emitFn').and.callThrough();
      em.emit(eventName);
      expect(counter).toEqual(2);
      expect(em.registeredSubs[eventName][0].emitFn).toHaveBeenCalled();
      expect(em.registeredSubs[eventName][1].emitFn).toHaveBeenCalled();
    });
  });
});