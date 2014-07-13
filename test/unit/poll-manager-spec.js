/* global PollManager */
function doNothing() {}

describe('Tiny poll Manager', function() {

  /** shift a bit the interval to pass the long isRunning tests */
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 7000;

  it('must be defined', function() {
    expect(PollManager).not.toBeUndefined();
  });

  it('has initialized default properties', function() {
    var pm = new PollManager();
    expect(pm).not.toBeUndefined();

    expect(typeof pm.probeFn).toBe('function');
    expect(typeof pm.limitFn).toBe('function');
    expect(typeof pm.finalizeFn).toBe('function');

    expect(pm.isRunning).toEqual(false);
    expect(pm.countLimit).toEqual(10);
    expect(pm.timeLimit).toEqual(15000);
    expect(pm.stepTimeOut).toEqual(1000);
  });

  it('starts via initialize', function() {
    var pm = new PollManager();
    spyOn(pm, 'initialize');

    pm.initialize();

    expect(pm.initialize).toHaveBeenCalled();

  });

  it('accepts conditions hash', function() {
    var conditions, pm;

    conditions = {
      countLimit: 4,
      timeLimit: 5000,
      stepTimeOut: 800
    };
    pm = new PollManager(conditions);

    expect(pm.countLimit).toEqual(4);
    expect(pm.timeLimit).toEqual(5000);
    expect(pm.stepTimeOut).toEqual(800);
  });

  it('.probeFn checks caller conditions', function(done) {
    var pm, testArray;
    testArray = [];

    function probeFn() {
      return testArray.length > 0;
    }

    function finalizeFn(){
      expect(pm.probeFn).toHaveBeenCalled();
      done();
    }

    pm = new PollManager(null, probeFn, null, finalizeFn);
    spyOn(pm, 'probeFn').and.callThrough();
    pm.initialize();

    setTimeout(function() {
      testArray.push(1);
    }, 2000);
  });

  it('.limitFn called when limits reached', function(done) {
    var pm;
    pm = new PollManager({
      countLimit: 4,
      timeLimit: 3000,
      stepTimeOut: 800
    }, doNothing, limitFn, finalizeFn);

    spyOn(pm, 'limitFn').and.callThrough();

    /** the purpose is to test limitFn */
    spyOn(pm, 'probeFn').and.returnValue(false);

    function verify() {
      expect(pm.limitFn).toHaveBeenCalled();
      expect(pm.limitFn.calls.count()).toEqual(1);
    }

    function limitFn(){

      console.log('limit reached');
      verify();
      done();
    }

    function finalizeFn(){
      console.log('finished should not be called');
    }

    pm.initialize();
  });

  it('.finalize is executed - when noting to check anymore', function(done) {
    var pm;
    pm = new PollManager(null, null, limitFn, finalizeFn);
    spyOn(pm, 'finalizeFn').and.callThrough();
    spyOn(pm, 'probeFn').and.returnValue(true);


    /** for test purpose as async wrapper */
    function verify() {
      expect(pm.finalizeFn).toHaveBeenCalled();
    }

    function limitFn(){
      console.log('limit reached');
    }

    function finalizeFn(){
      console.log('finished');
      verify();
      done();
    }

    pm.initialize();

  });

  it('can return own status', function(done) {
    var pm, result;
    pm = new PollManager();
    result = pm.getStatus();
    expect(result).toBeFalsy();
    pm.initialize();

    /** needs to be wrapped because the PollManager starts with an offset */
    setTimeout(function() {
      result = pm.getStatus();
      expect(result).toBeTruthy();
      pm.stop();
      result = pm.getStatus();
      expect(result).toBeFalsy();

      done();
    }, 2500);

  });

});