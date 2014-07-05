/*global TempoMat, console, debugPanel, Sequencer, EventManager, UIManager */
var bootSequencer, displayDebugPanel, seq;

/**
 * Sequencer loader
 * @function
 */
bootSequencer = function() {
  'use strict';
  var sequencerInstance;
  try {
    sequencerInstance =
      Sequencer.getInstance(EventManager, TempoMat, UIManager);
  } catch (e) {
    console.error('Error during initializing the Sequencer: ', e);
  }
  return sequencerInstance;
};

window.addEventListener('DOMContentLoaded', function() {
  "use strict";
  displayDebugPanel = false;
  seq = bootSequencer();
  if (displayDebugPanel) {
    debugPanel.loadDebugPanel(seq);
  }
});