/**
 New class for checking if something has been done or not
 yet. Has initialize method that tigers polling after the condition specified
 interval or default interval is 1000ms. PollManager accepts a conditions
 hash object - how many iterations === countLimit,
 by default 10sec. TimeLimit specifies the maximal polling duration from
 start till end, by default 15000ms. Then the PollManager also accepts as
 2nd, 3rd and 4th argument functions in order - probeFn, limitFn,
 finalizeFn. ProbeFn is called on each iteration to check if next iteration
 is necessary, limitFn is called when the polling limits are reached,
 finalizeFn is called on tear-down - when the probeFn returns true. FinalizeFn
 can for example pass some polling collected values to other application
 components.
 @class PollManager
 @see {@link PollManager#PollManager}
 */
var PollManager;

PollManager = (function() {

  /**
   * @see {@link PollManager}
   * @param conds {Object} - conditions hash
   * @param probeFn {function} - returns polling condition if continue or stop
   * @param limitFn {function} - called when limits are reached
   * @param finalizeFn {function} - called when polling is done
   * @constructor
   */
  function PollManager(conds, probeFn, limitFn, finalizeFn) {
    conds = conds || {};
    this.countLimit = conds.countLimit || 10;
    this.timeLimit = conds.timeLimit || 15000;
    this.stepTimeOut = conds.stepTimeOut || 1000;
    this.probeFn = probeFn || function() {};
    this.limitFn = limitFn || function() {};
    this.finalizeFn = finalizeFn || function() {};
    this.isRunning = false;
  }

  PollManager.prototype.initialize = function() {
    var self, counter, initTime;

    self = this;
    counter = 0;
    initTime = new Date();

    console.log('Poll started at: %s:%s:%s',
      toDoublePos(initTime.getHours()),
      toDoublePos(initTime.getMinutes()),
      toDoublePos(initTime.getSeconds()));

    function poll() {
      var now, terminateCondition;
      self.isRunning = true;
      now = new Date();
      console.log('Poll now time at: %s:%s:%s',
        toDoublePos(now.getHours()),
        toDoublePos(now.getMinutes()),
        toDoublePos(now.getSeconds()));

      if(++counter === self.countLimit ||
        (now.getTime() - initTime.getTime()) >= self.timeLimit) {
        self.stop();
        self.limitFn();
        return;
      }
      terminateCondition = self.probeFn();

      if(terminateCondition) {
        self.stop();
        self.finalizeFn();
      }
    }

    self.intervalTimer = setInterval(poll, self.stepTimeOut);
  };

  PollManager.prototype.getStatus = function() {
    return this.isRunning;
  };

  PollManager.prototype.stop = function() {
    this.isRunning = false;
    window.clearInterval(this.intervalTimer);
  };

  return PollManager;
})();

function toDoublePos(inp) {
  return (''+ inp).length > 1 ? inp : '0'+ inp;
}
