TodoList:

1. Pull UIChannel logic out from UIManager to the Channel class and rename it to UIChannel (view).
2. Write tests for UIChannel class & AudioOutput in case of adding/ removing measures (stored frequencies, .armed class gets cloned - should not )
3. Implement AudioOutput#triggerFreq to call the passed / stored jsSynth instance
4. Update preview logic according to the new AudioContext Assignment
5. Implement basic drag & drop notes around the channel bar (ctrl + drag === copy)
6. TempoMat - changed noteResolution from 0 to 2 (quarter note) / buggy
7. add notes and qwerty keys as label to the keyboard
8. fix css - all icons aligned horizontally and matching their relative positions
9. make sure gulp uglifyies the dist source.
10. remove console log from: UIManager - functions passed to PollManager.

*0.0.74*
* ChannelManager - added a AudioContext property
* ChannelManager - added assignFreqProxy - used by the EventManager to pass the emit call to the right place
* ChannelManager - AudioOutput#triggerFreq - temporary creates/re-uses AudioContext oscillator instance
* EventManager - documentation fixes, EventManager#emit method changed removed unnecessary context
* UIManager - addChannel method changed to create jQ object from the UIChannel instance, instead of plaintext
* UIManager - channelBar .click handler tearDown method updated - call emit from there and not from finalizeFn
* UIManager - channelBar .click on hancock keyboard changed from .bind -> .on, and added .off to tearDown()
* UIManager - utils added interface method for calling Hancock instance.getNote()
* Gulp - for dev purpose turned off the uglify (debug wasn't working)

0.0.73

* PollManager - added to UIManager's initChannels method
* PollManager - added reset method - when user clicks a note he gets extra time
* PollManager - optionally verbose, to log star/end time of polling
* ChannelManager - added to build, added to Sequencer constructor, added to loader.
* Channel - separated from UIManager to ui-channel.js source, left the original name.
* UIManager - renamed createChannels to createDefaultChannels
* UIManager - added empty methods - add/remove channel
* UIManager - added addChannelHandler - handles the logic for adding new channels

0.0.72

* tests - separated unit tests folder
* UIManager - (CSS) overlay when assigning frequencies to notes,
* UIManager - ESC clears the notes, emit `uiman:clearfreqs` and passes chIndex 
* UIManager - implemented utils hash - obtain channel and channelBar indicesand chBarIndex to the ChannelManager
* UIManager - after assignment is completed, pass new freq array to ChannelManager via `uiman:newfreqs` together with channel and channelBar indices
* PollManager - class for performing actions once per interval, with basic API.
* tests - for the PollManager class

0.0.71

* AudioOutput - trigger frequency (accepts an array of requires to be triggered)
* AudioOutput - toggleMute persist the current volume in _tmp var and restores on un-mute
* ChannelManager - mute/unmute a particular audioOutput
* jshint - added .jshintrc to src and test
* ChannelManager - assign, update, remove an AudioOutput, assign, update and remove frequencies to a ChannelBar in the patterns array
* tests - for ChannelManager basics (defined as global, assign AudioOutput, Pattern)
* AudioOutput - added class as abstraction for jsSynth instance initialized with a specific pattern
* Pattern - added class as abstraction for frequency values (channelBars)
* ChannelManager - added class for orchestration patterns and audioOutputs
* TempoMat - changed the default noteResolution from 0 to 2 (quarter note)
* TempoMat - introduced *tempo:notetick* event to play the current note and left the *tempo:tick* event for painting purpose

0.0.70

* TempoMat - fully integrated into Sequencer
* gulp - recompile on js/src/*.js change
* Looper - removed and purged, removed tests

0.0.69

* TempoMat - integrated added EventManager
* TempoMat - bugfix (same methodName)

0.0.68

* gulp - added for concat and uglify sources