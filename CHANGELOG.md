TodoStack:
(1) - split logic for drawing and playing, the current beatNumber (highlight 
index), so i can paint each note according to the noteResolution and play notes
(2) *WIP* - colored assignment, add some mechanism to attach the user attention to 
the keyboard and let him assign 1-2-3-4-5-6-7 notes (chords)
release after a particular timeout)
(3) - add notes and qwerty keys as label to the keyboard
(4) - drag & drop notes around the channel bar (ctrl + drag === copy)
(5) - TempoMat - changed noteResolution from 0 to 2 (quarter note) / buggy
(6) - clear note by click + ESC
(7) - refactor the UIManager - split into smaller pieces (UIChannel, UIControls)
(7) - change assignment mechanism - assign patter via the channel control icon,
assign note (or notes) via clicking on the channel bar


*0.0.72*
* tests - separated unit tests folder
* UIManager - (CSS) overlay when assigning frequencies to notes,
* UIManager - ESC clears the notes, emit `uiman:clearfreqs` and passes chIndex 
* UIManager - implemented utils hash - obtain channel and channelBar indices
and chBarIndex to the ChannelManager
* UIManager - after assignment is completed, pass new freq array to 
ChannelManager via `uiman:newfreqs` together with channel and channelBar indices
* PollManager - class for performing actions once per interval, with basic API.
* tests - for the PollManager class

0.0.71
* AudioOutput - trigger frequency (accepts an array of requires to be triggered)
* AudioOutput - toggleMute persist the current volume in _tmp var and 
restores on un-mute
* ChannelManager - mute/unmute a particular audioOutput
* jshint - added .jshintrc to src and test
* ChannelManager - assign, update, remove an AudioOutput, assign, 
update and remove frequencies to a ChannelBar in the patterns array
* tests - for ChannelManager basics (defined as global, assign AudioOutput, 
Pattern)
* AudioOutput - added class as abstraction for jsSynth instance initialized 
with a specific pattern
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