/*global console, debugPanel, Sequencer, EventManager, Looper, UIManager */
var bootSequencer, displayDebugPanel, seq;

/**
 * Sequencer loader
 * @function
 */
bootSequencer = function() {
  "use strict";
  var sequencerInstance;
  try {
    sequencerInstance = Sequencer.getInstance(EventManager, Looper, UIManager);
  } catch (e) {
    console.error('Error during initializing the Sequencer: ', e);
  }
  return sequencerInstance;
};

window.addEventListener('DOMContentLoaded', function() {
  "use strict";
  displayDebugPanel = true;
  seq = bootSequencer();
  if (displayDebugPanel) {
    debugPanel.loadDebugPanel(seq);
  }
});