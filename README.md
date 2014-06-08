jsSynth [![Build Status](https://travis-ci.org/vire/jsSynth.svg?branch=sequencer)](https://travis-ci.org/vire/jsSynth)
=======
OpenSource subtractive synthetizer/web audio API, written in JavaScript - [Live Example](http://dualsoul.net/tmp/jsSynth/)

## installation

1. clone this repo
2. open ```index.html``` in browser


## documentation

1. install dependencies via ```npm install```
2. generate into ./docs ```npm run docs```


## Features

* interactive virtual keyboard controller via mouse or keyboard
* presets - load/save
* oscillators - detune,  semi, volume, type (sine, sawtooth, square, triangle)
* filter - cutoff/resonance
* volume envelope - attack, decay, sustain, release
* parametric LFO - amount, freq, param, type (sine, sawtooth, square, triangle)
* wave graph (freq, time)

## Dependencies

This project is currently dependendent on the following 3rd party libraries:

* [jquery](https://github.com/jquery/jquery/) - MIT
* [jquery-tmpl](https://github.com/BorisMoore/jquery-tmpl) - Dual licensed under the MIT or GPL Version 2 licenses.
* [qwerty-hancock](https://github.com/stuartmemo/qwerty-hancock) - MIT
* [Q - asynchronous promises](https://github.com/kriskowal/q) - MIT 
* [jsdoc](https://github.com/jsdoc3/jsdoc) - Apache 2.0
* [DocStrap](https://github.com/terryweiss/docstrap) - MIT
* [howler](https://github.com/goldfire/howler.js/) - MIT

## License

jsSynth was originally written by [forcer](https://github.com/recrof) and is
licensed under the [GNU GLPv3](LICENSE.md).