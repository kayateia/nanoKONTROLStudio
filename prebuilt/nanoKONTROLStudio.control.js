/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cc.ts":
/*!*******************!*\
  !*** ./src/cc.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, exports) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CC = void 0;
// CC values for the nanoKONTROL Studio
//
// There are a few types of CCs here:
// - Continuous values (sliders, knobs, etc)
// - Action buttons (e.g. play, pause)
// - Toggle buttons (e.g. mute, solo)
//
// This class just lists out all the constants.
//
// Note that if you edited your KONTROL with the Korg app,
// all bets are off.
var CC = /** @class */ (function () {
    function CC() {
    }
    CC.CYCLE = 54;
    CC.REW = 58;
    CC.FF = 59;
    CC.STOP = 63;
    CC.PLAY = 80;
    CC.REC = 81;
    CC.PREV_TRACK = 60;
    CC.NEXT_TRACK = 61;
    CC.SET = 55;
    CC.PREV_MARKER = 56;
    CC.NEXT_MARKER = 57;
    // These are non-contiguous for some reason.
    CC.SLIDERS = [2, 3, 4, 5, 6, 8, 9, 12];
    CC.KNOBS = [13, 14, 15, 16, 17, 18, 19, 20];
    CC.SOLOS = [29, 30, 31, 32, 33, 34, 35, 36, 37];
    CC.MUTES = [21, 22, 23, 24, 25, 26, 27, 28];
    CC.RECS = [38, 39, 40, 41, 42, 43, 44, 45];
    CC.ALL = [
        [CC.CYCLE, CC.REW, CC.FF, CC.STOP, CC.PLAY, CC.REC,
            CC.PREV_TRACK, CC.NEXT_TRACK, CC.SET, CC.PREV_MARKER,
            CC.NEXT_MARKER],
        CC.SLIDERS,
        CC.KNOBS,
        CC.SOLOS,
        CC.MUTES,
        CC.RECS,
    ].reduce(function (prev, next) { return prev.concat(next); }, []);
    return CC;
}());
exports.CC = CC;


/***/ }),

/***/ "./src/host.ts":
/*!*********************!*\
  !*** ./src/host.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Host = void 0;
var params_1 = __webpack_require__(/*! ./params */ "./src/params.ts");
// Models the connection to the Bitwig host.
var Host = /** @class */ (function () {
    function Host(transportStatus) {
        this.transportStatus = transportStatus;
        this.transport = host.createTransport();
        this.application = host.createApplication();
        this.trackBank = host.createTrackBank(8, 1, 0);
        this.cursorTrack = host.createCursorTrack(2, 0);
        this.primaryDevice = this.cursorTrack.createCursorDevice();
        this.arranger = host.createArranger(0);
        this.params = new params_1.Params();
        this.blink = false;
        this.isPlaying = false;
        this.isLooping = false;
        this.isRecording = false;
        this.isEngineOn = false;
    }
    Host.prototype.init = function () {
        var _this = this;
        this.allIndicationsOff();
        this.setupObservers();
        host.scheduleTask(function () { return _this.blinkTimer(); }, [], 200);
    };
    Host.prototype.shutdown = function () {
        this.allIndicationsOff();
    };
    Host.prototype.blinkTimer = function () {
        this.blink = !this.blink;
    };
    // There are a lot of things marked as deprecated in here, but it's going to be a big
    // change to update most of them, so for now I just want to get it working again.
    Host.prototype.setupObservers = function () {
        var _this = this;
        this.trackBank.followCursorTrack(this.cursorTrack);
        this.transport.addIsPlayingObserver(function (on) {
            _this.isPlaying = on;
        });
        this.transport.addIsRecordingObserver(function (on) {
            _this.isRecording = on;
        });
        this.transport.addIsLoopActiveObserver(function (on) {
            _this.isLooping = on;
        });
        this.application.addHasActiveEngineObserver(function (on) {
            _this.isEngineOn = on;
        });
        var _loop_1 = function (p) {
            var parameter = this_1.primaryDevice.getParameter(p);
            parameter.setLabel('P' + (p + 1));
            // macro.addIsMappingObserver(getObserverIndexFunc(p, isMapping)); //TODO
            // This is likewise deprecated, but I'm not entirely sure how to replace it.
            var macro = this_1.primaryDevice.getMacro(p);
            macro.getModulationSource().addIsMappingObserver(function (state) {
                _this.params.isMacroMapping[p] = state;
            });
        };
        var this_1 = this;
        for (var p = 0; p < 8; p++) {
            _loop_1(p);
        }
        this.primaryDevice.addSelectedPageObserver(0, function (page) {
            _this.params.currentPage = page;
        });
        this.primaryDevice.addPageNamesObserver(function (names) {
            _this.params.pageNames = names;
        });
        var _loop_2 = function (t) {
            var track = this_2.trackBank.getTrack(t);
            track.getVolume().setLabel("V".concat(t + 1));
            track.getPan().setLabel("P".concat(t + 1));
            track.getSolo().addValueObserver(function (state) {
                _this.transportStatus.mixerStatus[t].solo = state;
            });
            track.getMute().addValueObserver(function (state) {
                _this.transportStatus.mixerStatus[t].mute = state;
            });
            track.getArm().addValueObserver(function (state) {
                _this.transportStatus.mixerStatus[t].arm = state;
            });
        };
        var this_2 = this;
        for (var t = 0; t < 8; t++) {
            _loop_2(t);
        }
    };
    Host.prototype.allIndicationsOff = function () {
        for (var p = 0; p < 8; p++) {
            this.primaryDevice.getParameter(p).setIndication(false);
            this.primaryDevice.getMacro(p).getAmount().setIndication(false);
            this.trackBank.getTrack(p).getVolume().setIndication(false);
            this.trackBank.getTrack(p).getPan().setIndication(false);
        }
    };
    Host.prototype.toggleEngineState = function () {
        if (this.isEngineOn) {
            this.application.deactivateEngine();
        }
        else {
            this.application.activateEngine();
        }
    };
    return Host;
}());
exports.Host = Host;


/***/ }),

/***/ "./src/leds.ts":
/*!*********************!*\
  !*** ./src/leds.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LEDs = void 0;
// Models the programmable LEDs on the device.
var cc_1 = __webpack_require__(/*! ./cc */ "./src/cc.ts");
var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var LEDs = /** @class */ (function () {
    function LEDs() {
        this.pendingState = (0, utils_1.fillArray)(false, 8);
        this.outputState = (0, utils_1.fillArray)(false, 8);
    }
    LEDs.prototype.setOutput = function (index, value) {
        this.pendingState[index] = value;
    };
    LEDs.prototype.flush = function () {
        for (var i = 0; i < cc_1.CC.ALL.length; i++) {
            var cc = cc_1.CC.ALL[i];
            if (this.pendingState[cc] !== this.outputState[cc]) {
                sendChannelController(176, cc_1.CC.ALL[cc], this.pendingState[cc] ? 127 : 0);
                this.outputState[cc] = this.pendingState[cc];
            }
        }
    };
    return LEDs;
}());
exports.LEDs = LEDs;


/***/ }),

/***/ "./src/mode.ts":
/*!*********************!*\
  !*** ./src/mode.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MixerMode = exports.DeviceMode = exports.ModeHandler = exports.Mode = void 0;
var cc_1 = __webpack_require__(/*! ./cc */ "./src/cc.ts");
// Tracks the device vs mixer mode. Device mode means stuff is
// mapped to the selected device's controls. Mixer maps stuff to
// the Bitwig mixer sliders.
var Mode = /** @class */ (function () {
    function Mode(host, leds, transportStatus) {
        this.host = host;
        this.leds = leds;
        this.transportStatus = transportStatus;
        this.deviceMode = new DeviceMode(this.host, this.leds, this.transportStatus);
        this.mixerMode = new MixerMode(this.host, this.leds, this.transportStatus);
        this.activeMode = Mode.MIXER;
        this.activeHandler = this.mixerMode;
    }
    Mode.prototype.switchMode = function () {
        if (this.activeMode === Mode.MIXER) {
            this.activeMode = Mode.DEVICE;
        }
        else {
            this.activeMode = Mode.MIXER;
        }
        this.updateMode();
    };
    Mode.prototype.updateMode = function () {
        switch (this.activeMode) {
            case Mode.DEVICE:
                this.activeHandler = this.deviceMode;
                host.showPopupNotification('Device Mode');
                break;
            case Mode.MIXER:
                this.activeHandler = this.mixerMode;
                host.showPopupNotification('Mixer Mode');
                break;
        }
        this.activeHandler.updateIndications();
    };
    Mode.MIXER = 0;
    Mode.DEVICE = 1;
    return Mode;
}());
exports.Mode = Mode;
var ModeHandler = /** @class */ (function () {
    function ModeHandler(host, leds) {
        this.host = host;
        this.leds = leds;
    }
    ModeHandler.prototype.prepareOutput = function () {
        this.leds.setOutput(cc_1.CC.PLAY, this.host.isPlaying);
        this.leds.setOutput(cc_1.CC.STOP, !this.host.isPlaying);
        this.leds.setOutput(cc_1.CC.REC, this.host.isRecording);
        // this.leds.setOutput(CC.CYCLE, activePage == mixerPage ? 127 : 0);
    };
    return ModeHandler;
}());
exports.ModeHandler = ModeHandler;
var DeviceMode = /** @class */ (function (_super) {
    __extends(DeviceMode, _super);
    function DeviceMode(host, leds, transportStatus) {
        var _this = _super.call(this, host, leds) || this;
        _this.transportStatus = transportStatus;
        return _this;
    }
    DeviceMode.prototype.onKnob = function (index, value) {
        var p = this.host.primaryDevice.getParameter(index);
        if (this.transportStatus.setPressed) {
            p.reset();
        }
        else {
            p.set(value, 128);
        }
    };
    DeviceMode.prototype.onSlider = function (index, value) {
        var m = this.host.primaryDevice.getMacro(index).getAmount();
        if (this.transportStatus.setPressed) {
            m.reset();
        }
        else {
            m.set(value, 128);
        }
    };
    DeviceMode.prototype.soloButton = function (index) {
        this.host.primaryDevice.setParameterPage(index);
        if (index < this.host.params.pageNames.length) {
            host.showPopupNotification("Page: ".concat(this.host.params.pageNames[index]));
        }
    };
    DeviceMode.prototype.muteButton = function (index) {
        this.host.primaryDevice.getMacro(index).getModulationSource().toggleIsMapping();
    };
    DeviceMode.prototype.recButton = function () {
    };
    DeviceMode.prototype.prevTrackButton = function () {
        if (this.transportStatus.setPressed) {
            // This doesn't appear to be in the typings.
            this.host.primaryDevice.switchToDevice(API.DeviceType.ANY, API.ChainLocation.PREVIOUS);
        }
        else {
            this.host.cursorTrack.selectPrevious();
        }
    };
    DeviceMode.prototype.nextTrackButton = function () {
        if (this.transportStatus.setPressed) {
            // This doesn't appear to be in the typings.
            this.host.primaryDevice.switchToDevice(API.DeviceType.ANY, API.ChainLocation.NEXT);
        }
        else {
            this.host.cursorTrack.selectNext();
        }
    };
    DeviceMode.prototype.prevMarkerButton = function () {
        if (this.transportStatus.setPressed) {
            this.host.primaryDevice.switchToPreviousPresetCategory();
        }
        else {
            this.host.primaryDevice.switchToPreviousPreset();
        }
    };
    DeviceMode.prototype.nextMarkerButton = function () {
        if (this.transportStatus.setPressed) {
            this.host.primaryDevice.switchToNextPresetCategory();
        }
        else {
            this.host.primaryDevice.switchToNextPreset();
        }
    };
    DeviceMode.prototype.updateIndications = function () {
        for (var p = 0; p < 8; p++) {
            var macro = this.host.primaryDevice.getMacro(p).getAmount();
            var parameter = this.host.primaryDevice.getParameter(p);
            var track = this.host.trackBank.getTrack(p);
            parameter.setIndication(true);
            macro.setIndication(true);
            track.getVolume().setIndication(false);
            track.getPan().setIndication(false);
        }
    };
    DeviceMode.prototype.prepareOutput = function () {
        _super.prototype.prepareOutput.call(this);
        for (var i = 0; i < 8; i++) {
            this.leds.setOutput(cc_1.CC.SOLOS[i], this.host.params.currentPage === i);
            this.leds.setOutput(cc_1.CC.MUTES[i], !!this.host.params.isMacroMapping[i] && this.host.blink);
            this.leds.setOutput(cc_1.CC.RECS[i], false);
        }
    };
    return DeviceMode;
}(ModeHandler));
exports.DeviceMode = DeviceMode;
var MixerMode = /** @class */ (function (_super) {
    __extends(MixerMode, _super);
    function MixerMode(host, leds, transportStatus) {
        var _this = _super.call(this, host, leds) || this;
        _this.transportStatus = transportStatus;
        return _this;
    }
    MixerMode.prototype.onKnob = function (index, value) {
        var p = this.host.trackBank.getTrack(index).getPan();
        if (this.transportStatus.setPressed) {
            p.reset();
        }
        else {
            p.set(value, 128);
        }
    };
    MixerMode.prototype.onSlider = function (index, value) {
        var v = this.host.trackBank.getTrack(index).getVolume();
        if (this.transportStatus.setPressed) {
            v.reset();
        }
        else {
            v.set(value, 128);
        }
    };
    MixerMode.prototype.soloButton = function (index) {
        this.host.trackBank.getTrack(index).getSolo().toggle(false);
    };
    MixerMode.prototype.muteButton = function (index) {
        this.host.trackBank.getTrack(index).getMute().toggle();
    };
    MixerMode.prototype.recButton = function (index) {
        this.host.trackBank.getTrack(index).getArm().toggle();
    };
    MixerMode.prototype.prevTrackButton = function () {
        if (this.transportStatus.setPressed) {
            this.host.trackBank.scrollTracksPageUp();
        }
        else {
            this.host.cursorTrack.selectPrevious();
        }
    };
    MixerMode.prototype.nextTrackButton = function () {
        if (this.transportStatus.setPressed) {
            this.host.trackBank.scrollTracksPageDown();
        }
        else {
            this.host.cursorTrack.selectNext();
        }
    };
    MixerMode.prototype.prevMarkerButton = function () {
        //  transport.previousMarker(); // activate when it exists in the API
    };
    MixerMode.prototype.nextMarkerButton = function () {
        //  transport.nextMarker(); // activate when it exists in the API
    };
    MixerMode.prototype.updateIndications = function () {
        for (var p = 0; p < 8; p++) {
            var macro = this.host.primaryDevice.getMacro(p).getAmount();
            var parameter = this.host.primaryDevice.getCommonParameter(p);
            var track = this.host.trackBank.getTrack(p);
            track.getVolume().setIndication(true);
            track.getPan().setIndication(true);
            parameter.setIndication(false);
            macro.setIndication(false);
        }
    };
    MixerMode.prototype.prepareOutput = function () {
        _super.prototype.prepareOutput.call(this);
        for (var i = 0; i < 8; i++) {
            this.leds.setOutput(cc_1.CC.SOLOS[i], this.transportStatus.mixerStatus[i].solo);
            this.leds.setOutput(cc_1.CC.MUTES[i], this.transportStatus.mixerStatus[i].mute);
            this.leds.setOutput(cc_1.CC.RECS[i], this.transportStatus.mixerStatus[i].arm);
        }
    };
    return MixerMode;
}(ModeHandler));
exports.MixerMode = MixerMode;


/***/ }),

/***/ "./src/params.ts":
/*!***********************!*\
  !*** ./src/params.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Params = void 0;
// Models parameter pages and parameters for DEVICE mode.
var Params = /** @class */ (function () {
    function Params() {
        this.currentPage = 0;
        this.pageNames = [];
        this.isMacroMapping = [];
    }
    return Params;
}());
exports.Params = Params;


/***/ }),

/***/ "./src/sysex.ts":
/*!**********************!*\
  !*** ./src/sysex.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SYSEX = void 0;
var SYSEX = /** @class */ (function () {
    function SYSEX() {
    }
    // Enter native mode.
    SYSEX.goNative = function () {
        sendSysex(SYSEX.HEADER + '00 00 01 F7');
    };
    // Exit native mode.
    SYSEX.leaveNative = function () {
        sendSysex(SYSEX.HEADER + '00 00 00 F7');
    };
    SYSEX.HEADER = 'F0 42 40 00 01 13 00 ';
    return SYSEX;
}());
exports.SYSEX = SYSEX;


/***/ }),

/***/ "./src/transport.ts":
/*!**************************!*\
  !*** ./src/transport.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransportStatus = void 0;
var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var TransportStatus = /** @class */ (function () {
    function TransportStatus() {
        this.setPressed = false;
        this.stopPressed = false;
        this.playPressed = false;
        this.recPressed = false;
        this.mixerStatus = (0, utils_1.fillArray)({
            solo: false,
            mute: false,
            arm: false,
        }, 8);
    }
    return TransportStatus;
}());
exports.TransportStatus = TransportStatus;


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.log = exports.fillArray = void 0;
// Utility functions.
function fillArray(initValue, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(initValue);
    }
    return result;
}
exports.fillArray = fillArray;
function log(msg) {
    println(msg);
}
exports.log = log;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***************************!*\
  !*** ./src/controller.ts ***!
  \***************************/

// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Controller = void 0;
// Main entry point for the scripts.
loadAPI(1);
host.defineController('Korg', 'nanoKONTROL Studio (Soaria)', '1.0', '7ab37ecf-4f42-4890-9515-91e21b9f3545', 'Soaria, olaims, Bitwig');
host.defineMidiPorts(1, 1);
var cc_1 = __webpack_require__(/*! ./cc */ "./src/cc.ts");
var host_1 = __webpack_require__(/*! ./host */ "./src/host.ts");
var leds_1 = __webpack_require__(/*! ./leds */ "./src/leds.ts");
var mode_1 = __webpack_require__(/*! ./mode */ "./src/mode.ts");
var sysex_1 = __webpack_require__(/*! ./sysex */ "./src/sysex.ts");
var transport_1 = __webpack_require__(/*! ./transport */ "./src/transport.ts");
var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var Controller = /** @class */ (function () {
    function Controller() {
        var _this = this;
        this.transportStatus = new transport_1.TransportStatus();
        this.host = new host_1.Host(this.transportStatus);
        this.leds = new leds_1.LEDs();
        this.mode = new mode_1.Mode(this.host, this.leds, this.transportStatus);
        host.getMidiInPort(0).setMidiCallback(function (status, data1, data2) { return _this.onMidi(status, data1, data2); });
        sysex_1.SYSEX.goNative();
        this.host.init();
        this.mode.activeHandler.updateIndications();
    }
    Controller.prototype.exit = function () {
        sysex_1.SYSEX.leaveNative();
        this.host.shutdown();
    };
    Controller.prototype.onMidi = function (status, data1, data2) {
        (0, utils_1.log)("MIDI: ".concat(status, " - ").concat(data1, " - ").concat(data2));
        var cc = data1;
        var val = data2;
        if (status !== 176) {
            return;
        }
        switch (cc) {
            case cc_1.CC.SET:
                this.transportStatus.setPressed = val > 0;
                break;
            case cc_1.CC.STOP:
                this.transportStatus.stopPressed = val > 0;
                break;
            case cc_1.CC.PLAY:
                this.transportStatus.playPressed = val > 0;
                break;
            case cc_1.CC.REC:
                this.transportStatus.recPressed = val > 0;
                break;
        }
        if (this.transportStatus.stopPressed &&
            this.transportStatus.playPressed &&
            this.transportStatus.recPressed) {
            this.host.toggleEngineState();
        }
        // No idea what this is.
        //var index = data1 & 0xf;
        /*if (data1 > 6){
          switch (data1)
          {
          case 8:
            index = 5;
            break;
          case 9:
            index = 6;
            
            break;
          case 12:
            index = 7;
            break;
          }
        }else{
          index = data1-2;
        }*/
        //var index = data1;
        var sliderIndex = cc_1.CC.SLIDERS.indexOf(cc);
        if (sliderIndex >= 0) {
            this.mode.activeHandler.onSlider(sliderIndex, val);
            return;
        }
        var knobIndex = cc_1.CC.KNOBS.indexOf(cc);
        if (knobIndex >= 0) {
            this.mode.activeHandler.onKnob(knobIndex, val);
        }
        // ignore when buttons are released
        if (val <= 0) {
            return;
        }
        var muteIndex = cc_1.CC.MUTES.indexOf(cc);
        if (muteIndex >= 0) {
            this.mode.activeHandler.muteButton(muteIndex);
            return;
        }
        var soloIndex = cc_1.CC.SOLOS.indexOf(cc);
        if (soloIndex >= 0) {
            this.mode.activeHandler.soloButton(soloIndex);
            return;
        }
        var recIndex = cc_1.CC.RECS.indexOf(cc);
        if (recIndex >= 0) {
            this.mode.activeHandler.recButton(recIndex);
            return;
        }
        // Everything else.
        switch (cc) {
            case cc_1.CC.PLAY:
                // One might get the impression that this button is a bit overloaded. ^^;
                if (this.host.isEngineOn) {
                    if (!this.transportStatus.stopPressed &&
                        !this.transportStatus.recPressed) {
                        if (this.transportStatus.setPressed) {
                            this.host.transport.returnToArrangement();
                        }
                        else {
                            if (this.host.isPlaying) {
                                this.host.transport.restart();
                            }
                            else {
                                this.host.transport.play();
                            }
                        }
                    }
                }
                else {
                    this.host.transport.restart();
                }
                break;
            case cc_1.CC.STOP:
                if (!this.transportStatus.playPressed &&
                    !this.transportStatus.recPressed) {
                    if (this.transportStatus.setPressed) {
                        this.host.transport.resetAutomationOverrides();
                    }
                    else {
                        this.host.transport.stop();
                    }
                }
                break;
            case cc_1.CC.REC:
                if (!this.transportStatus.playPressed &&
                    !this.transportStatus.stopPressed) {
                    if (this.transportStatus.setPressed) {
                        this.host.cursorTrack.getArm().toggle();
                    }
                    else {
                        this.host.transport.record();
                    }
                }
                break;
            case cc_1.CC.CYCLE:
                if (this.transportStatus.setPressed) {
                    this.host.transport.toggleLoop();
                }
                else {
                    this.mode.switchMode();
                }
                break;
            case cc_1.CC.REW:
                this.host.transport.rewind();
                break;
            case cc_1.CC.FF:
                if (this.transportStatus.setPressed) {
                    this.host.arranger.togglePlaybackFollow();
                }
                else {
                    this.host.transport.fastForward();
                }
                break;
            case cc_1.CC.PREV_TRACK:
                this.mode.activeHandler.prevTrackButton();
                break;
            case cc_1.CC.NEXT_TRACK:
                this.mode.activeHandler.nextTrackButton();
                break;
            case cc_1.CC.PREV_MARKER:
                this.mode.activeHandler.prevMarkerButton();
                break;
            case cc_1.CC.NEXT_MARKER:
                this.mode.activeHandler.nextMarkerButton();
                break;
        }
    };
    return Controller;
}());
exports.Controller = Controller;
var controller;
__webpack_require__.g.init = function init() {
    controller = new Controller();
};
__webpack_require__.g.flush = function flush() { };
__webpack_require__.g.exit = function exit() {
    controller.exit();
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Qsa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGtCQUFrQjtBQUNsQjtBQUNBLHFCQUFNO0FBQ047QUFDQTtBQUNBLHFCQUFNO0FBQ04scUJBQU07QUFDTjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvY2MudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvaG9zdC50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy9sZWRzLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL21vZGUudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvcGFyYW1zLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL3N5c2V4LnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL3RyYW5zcG9ydC50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy91dGlscy50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2NvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DQyA9IHZvaWQgMDtcbi8vIENDIHZhbHVlcyBmb3IgdGhlIG5hbm9LT05UUk9MIFN0dWRpb1xuLy9cbi8vIFRoZXJlIGFyZSBhIGZldyB0eXBlcyBvZiBDQ3MgaGVyZTpcbi8vIC0gQ29udGludW91cyB2YWx1ZXMgKHNsaWRlcnMsIGtub2JzLCBldGMpXG4vLyAtIEFjdGlvbiBidXR0b25zIChlLmcuIHBsYXksIHBhdXNlKVxuLy8gLSBUb2dnbGUgYnV0dG9ucyAoZS5nLiBtdXRlLCBzb2xvKVxuLy9cbi8vIFRoaXMgY2xhc3MganVzdCBsaXN0cyBvdXQgYWxsIHRoZSBjb25zdGFudHMuXG4vL1xuLy8gTm90ZSB0aGF0IGlmIHlvdSBlZGl0ZWQgeW91ciBLT05UUk9MIHdpdGggdGhlIEtvcmcgYXBwLFxuLy8gYWxsIGJldHMgYXJlIG9mZi5cbnZhciBDQyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDQygpIHtcbiAgICB9XG4gICAgQ0MuQ1lDTEUgPSA1NDtcbiAgICBDQy5SRVcgPSA1ODtcbiAgICBDQy5GRiA9IDU5O1xuICAgIENDLlNUT1AgPSA2MztcbiAgICBDQy5QTEFZID0gODA7XG4gICAgQ0MuUkVDID0gODE7XG4gICAgQ0MuUFJFVl9UUkFDSyA9IDYwO1xuICAgIENDLk5FWFRfVFJBQ0sgPSA2MTtcbiAgICBDQy5TRVQgPSA1NTtcbiAgICBDQy5QUkVWX01BUktFUiA9IDU2O1xuICAgIENDLk5FWFRfTUFSS0VSID0gNTc7XG4gICAgLy8gVGhlc2UgYXJlIG5vbi1jb250aWd1b3VzIGZvciBzb21lIHJlYXNvbi5cbiAgICBDQy5TTElERVJTID0gWzIsIDMsIDQsIDUsIDYsIDgsIDksIDEyXTtcbiAgICBDQy5LTk9CUyA9IFsxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjBdO1xuICAgIENDLlNPTE9TID0gWzI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzddO1xuICAgIENDLk1VVEVTID0gWzIxLCAyMiwgMjMsIDI0LCAyNSwgMjYsIDI3LCAyOF07XG4gICAgQ0MuUkVDUyA9IFszOCwgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDVdO1xuICAgIENDLkFMTCA9IFtcbiAgICAgICAgW0NDLkNZQ0xFLCBDQy5SRVcsIENDLkZGLCBDQy5TVE9QLCBDQy5QTEFZLCBDQy5SRUMsXG4gICAgICAgICAgICBDQy5QUkVWX1RSQUNLLCBDQy5ORVhUX1RSQUNLLCBDQy5TRVQsIENDLlBSRVZfTUFSS0VSLFxuICAgICAgICAgICAgQ0MuTkVYVF9NQVJLRVJdLFxuICAgICAgICBDQy5TTElERVJTLFxuICAgICAgICBDQy5LTk9CUyxcbiAgICAgICAgQ0MuU09MT1MsXG4gICAgICAgIENDLk1VVEVTLFxuICAgICAgICBDQy5SRUNTLFxuICAgIF0ucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0KSB7IHJldHVybiBwcmV2LmNvbmNhdChuZXh0KTsgfSwgW10pO1xuICAgIHJldHVybiBDQztcbn0oKSk7XG5leHBvcnRzLkNDID0gQ0M7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkhvc3QgPSB2b2lkIDA7XG52YXIgcGFyYW1zXzEgPSByZXF1aXJlKFwiLi9wYXJhbXNcIik7XG4vLyBNb2RlbHMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIEJpdHdpZyBob3N0LlxudmFyIEhvc3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSG9zdCh0cmFuc3BvcnRTdGF0dXMpIHtcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0ID0gaG9zdC5jcmVhdGVUcmFuc3BvcnQoKTtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbiA9IGhvc3QuY3JlYXRlQXBwbGljYXRpb24oKTtcbiAgICAgICAgdGhpcy50cmFja0JhbmsgPSBob3N0LmNyZWF0ZVRyYWNrQmFuayg4LCAxLCAwKTtcbiAgICAgICAgdGhpcy5jdXJzb3JUcmFjayA9IGhvc3QuY3JlYXRlQ3Vyc29yVHJhY2soMiwgMCk7XG4gICAgICAgIHRoaXMucHJpbWFyeURldmljZSA9IHRoaXMuY3Vyc29yVHJhY2suY3JlYXRlQ3Vyc29yRGV2aWNlKCk7XG4gICAgICAgIHRoaXMuYXJyYW5nZXIgPSBob3N0LmNyZWF0ZUFycmFuZ2VyKDApO1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG5ldyBwYXJhbXNfMS5QYXJhbXMoKTtcbiAgICAgICAgdGhpcy5ibGluayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzTG9vcGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNFbmdpbmVPbiA9IGZhbHNlO1xuICAgIH1cbiAgICBIb3N0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmFsbEluZGljYXRpb25zT2ZmKCk7XG4gICAgICAgIHRoaXMuc2V0dXBPYnNlcnZlcnMoKTtcbiAgICAgICAgaG9zdC5zY2hlZHVsZVRhc2soZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuYmxpbmtUaW1lcigpOyB9LCBbXSwgMjAwKTtcbiAgICB9O1xuICAgIEhvc3QucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFsbEluZGljYXRpb25zT2ZmKCk7XG4gICAgfTtcbiAgICBIb3N0LnByb3RvdHlwZS5ibGlua1RpbWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJsaW5rID0gIXRoaXMuYmxpbms7XG4gICAgfTtcbiAgICAvLyBUaGVyZSBhcmUgYSBsb3Qgb2YgdGhpbmdzIG1hcmtlZCBhcyBkZXByZWNhdGVkIGluIGhlcmUsIGJ1dCBpdCdzIGdvaW5nIHRvIGJlIGEgYmlnXG4gICAgLy8gY2hhbmdlIHRvIHVwZGF0ZSBtb3N0IG9mIHRoZW0sIHNvIGZvciBub3cgSSBqdXN0IHdhbnQgdG8gZ2V0IGl0IHdvcmtpbmcgYWdhaW4uXG4gICAgSG9zdC5wcm90b3R5cGUuc2V0dXBPYnNlcnZlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudHJhY2tCYW5rLmZvbGxvd0N1cnNvclRyYWNrKHRoaXMuY3Vyc29yVHJhY2spO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydC5hZGRJc1BsYXlpbmdPYnNlcnZlcihmdW5jdGlvbiAob24pIHtcbiAgICAgICAgICAgIF90aGlzLmlzUGxheWluZyA9IG9uO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cmFuc3BvcnQuYWRkSXNSZWNvcmRpbmdPYnNlcnZlcihmdW5jdGlvbiAob24pIHtcbiAgICAgICAgICAgIF90aGlzLmlzUmVjb3JkaW5nID0gb247XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydC5hZGRJc0xvb3BBY3RpdmVPYnNlcnZlcihmdW5jdGlvbiAob24pIHtcbiAgICAgICAgICAgIF90aGlzLmlzTG9vcGluZyA9IG9uO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbi5hZGRIYXNBY3RpdmVFbmdpbmVPYnNlcnZlcihmdW5jdGlvbiAob24pIHtcbiAgICAgICAgICAgIF90aGlzLmlzRW5naW5lT24gPSBvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXIgPSB0aGlzXzEucHJpbWFyeURldmljZS5nZXRQYXJhbWV0ZXIocCk7XG4gICAgICAgICAgICBwYXJhbWV0ZXIuc2V0TGFiZWwoJ1AnICsgKHAgKyAxKSk7XG4gICAgICAgICAgICAvLyBtYWNyby5hZGRJc01hcHBpbmdPYnNlcnZlcihnZXRPYnNlcnZlckluZGV4RnVuYyhwLCBpc01hcHBpbmcpKTsgLy9UT0RPXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGxpa2V3aXNlIGRlcHJlY2F0ZWQsIGJ1dCBJJ20gbm90IGVudGlyZWx5IHN1cmUgaG93IHRvIHJlcGxhY2UgaXQuXG4gICAgICAgICAgICB2YXIgbWFjcm8gPSB0aGlzXzEucHJpbWFyeURldmljZS5nZXRNYWNybyhwKTtcbiAgICAgICAgICAgIG1hY3JvLmdldE1vZHVsYXRpb25Tb3VyY2UoKS5hZGRJc01hcHBpbmdPYnNlcnZlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wYXJhbXMuaXNNYWNyb01hcHBpbmdbcF0gPSBzdGF0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCA4OyBwKyspIHtcbiAgICAgICAgICAgIF9sb29wXzEocCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmltYXJ5RGV2aWNlLmFkZFNlbGVjdGVkUGFnZU9ic2VydmVyKDAsIGZ1bmN0aW9uIChwYWdlKSB7XG4gICAgICAgICAgICBfdGhpcy5wYXJhbXMuY3VycmVudFBhZ2UgPSBwYWdlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcmltYXJ5RGV2aWNlLmFkZFBhZ2VOYW1lc09ic2VydmVyKGZ1bmN0aW9uIChuYW1lcykge1xuICAgICAgICAgICAgX3RoaXMucGFyYW1zLnBhZ2VOYW1lcyA9IG5hbWVzO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdmFyIHRyYWNrID0gdGhpc18yLnRyYWNrQmFuay5nZXRUcmFjayh0KTtcbiAgICAgICAgICAgIHRyYWNrLmdldFZvbHVtZSgpLnNldExhYmVsKFwiVlwiLmNvbmNhdCh0ICsgMSkpO1xuICAgICAgICAgICAgdHJhY2suZ2V0UGFuKCkuc2V0TGFiZWwoXCJQXCIuY29uY2F0KHQgKyAxKSk7XG4gICAgICAgICAgICB0cmFjay5nZXRTb2xvKCkuYWRkVmFsdWVPYnNlcnZlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbdF0uc29sbyA9IHN0YXRlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmFjay5nZXRNdXRlKCkuYWRkVmFsdWVPYnNlcnZlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbdF0ubXV0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmFjay5nZXRBcm0oKS5hZGRWYWx1ZU9ic2VydmVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1t0XS5hcm0gPSBzdGF0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdGhpc18yID0gdGhpcztcbiAgICAgICAgZm9yICh2YXIgdCA9IDA7IHQgPCA4OyB0KyspIHtcbiAgICAgICAgICAgIF9sb29wXzIodCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEhvc3QucHJvdG90eXBlLmFsbEluZGljYXRpb25zT2ZmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IDg7IHArKykge1xuICAgICAgICAgICAgdGhpcy5wcmltYXJ5RGV2aWNlLmdldFBhcmFtZXRlcihwKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucHJpbWFyeURldmljZS5nZXRNYWNybyhwKS5nZXRBbW91bnQoKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tCYW5rLmdldFRyYWNrKHApLmdldFZvbHVtZSgpLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy50cmFja0JhbmsuZ2V0VHJhY2socCkuZ2V0UGFuKCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEhvc3QucHJvdG90eXBlLnRvZ2dsZUVuZ2luZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc0VuZ2luZU9uKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGxpY2F0aW9uLmRlYWN0aXZhdGVFbmdpbmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbGljYXRpb24uYWN0aXZhdGVFbmdpbmUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEhvc3Q7XG59KCkpO1xuZXhwb3J0cy5Ib3N0ID0gSG9zdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gbmFub0tPTlRST0wgU3R1ZGlvIGNvbnRyb2wgc3VyZmFjZSBzY3JpcHRzIGZvciBCaXR3aWdcbi8vIENvcHlyaWdodCAyMDE4IEJpdHdpZyBnbWJoXG4vLyBDb3B5cmlnaHQgMjAxOCBvbGFpbXNcbi8vIENvcHlyaWdodCAyMDIzIFNvYXJpYSAvIEtheWF0ZWlhXG4vLyBMaWNlbmNlIGZvciBTb2FyaWEgLyBLYXlhdGVpYSBjaGFuZ2VzOiBNSVRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTEVEcyA9IHZvaWQgMDtcbi8vIE1vZGVscyB0aGUgcHJvZ3JhbW1hYmxlIExFRHMgb24gdGhlIGRldmljZS5cbnZhciBjY18xID0gcmVxdWlyZShcIi4vY2NcIik7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIExFRHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTEVEcygpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nU3RhdGUgPSAoMCwgdXRpbHNfMS5maWxsQXJyYXkpKGZhbHNlLCA4KTtcbiAgICAgICAgdGhpcy5vdXRwdXRTdGF0ZSA9ICgwLCB1dGlsc18xLmZpbGxBcnJheSkoZmFsc2UsIDgpO1xuICAgIH1cbiAgICBMRURzLnByb3RvdHlwZS5zZXRPdXRwdXQgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ1N0YXRlW2luZGV4XSA9IHZhbHVlO1xuICAgIH07XG4gICAgTEVEcy5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2NfMS5DQy5BTEwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYyA9IGNjXzEuQ0MuQUxMW2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMucGVuZGluZ1N0YXRlW2NjXSAhPT0gdGhpcy5vdXRwdXRTdGF0ZVtjY10pIHtcbiAgICAgICAgICAgICAgICBzZW5kQ2hhbm5lbENvbnRyb2xsZXIoMTc2LCBjY18xLkNDLkFMTFtjY10sIHRoaXMucGVuZGluZ1N0YXRlW2NjXSA/IDEyNyA6IDApO1xuICAgICAgICAgICAgICAgIHRoaXMub3V0cHV0U3RhdGVbY2NdID0gdGhpcy5wZW5kaW5nU3RhdGVbY2NdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTEVEcztcbn0oKSk7XG5leHBvcnRzLkxFRHMgPSBMRURzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTWl4ZXJNb2RlID0gZXhwb3J0cy5EZXZpY2VNb2RlID0gZXhwb3J0cy5Nb2RlSGFuZGxlciA9IGV4cG9ydHMuTW9kZSA9IHZvaWQgMDtcbnZhciBjY18xID0gcmVxdWlyZShcIi4vY2NcIik7XG4vLyBUcmFja3MgdGhlIGRldmljZSB2cyBtaXhlciBtb2RlLiBEZXZpY2UgbW9kZSBtZWFucyBzdHVmZiBpc1xuLy8gbWFwcGVkIHRvIHRoZSBzZWxlY3RlZCBkZXZpY2UncyBjb250cm9scy4gTWl4ZXIgbWFwcyBzdHVmZiB0b1xuLy8gdGhlIEJpdHdpZyBtaXhlciBzbGlkZXJzLlxudmFyIE1vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTW9kZShob3N0LCBsZWRzLCB0cmFuc3BvcnRTdGF0dXMpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICAgICAgdGhpcy5sZWRzID0gbGVkcztcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIHRoaXMuZGV2aWNlTW9kZSA9IG5ldyBEZXZpY2VNb2RlKHRoaXMuaG9zdCwgdGhpcy5sZWRzLCB0aGlzLnRyYW5zcG9ydFN0YXR1cyk7XG4gICAgICAgIHRoaXMubWl4ZXJNb2RlID0gbmV3IE1peGVyTW9kZSh0aGlzLmhvc3QsIHRoaXMubGVkcywgdGhpcy50cmFuc3BvcnRTdGF0dXMpO1xuICAgICAgICB0aGlzLmFjdGl2ZU1vZGUgPSBNb2RlLk1JWEVSO1xuICAgICAgICB0aGlzLmFjdGl2ZUhhbmRsZXIgPSB0aGlzLm1peGVyTW9kZTtcbiAgICB9XG4gICAgTW9kZS5wcm90b3R5cGUuc3dpdGNoTW9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlTW9kZSA9PT0gTW9kZS5NSVhFUikge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVNb2RlID0gTW9kZS5ERVZJQ0U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU1vZGUgPSBNb2RlLk1JWEVSO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlTW9kZSgpO1xuICAgIH07XG4gICAgTW9kZS5wcm90b3R5cGUudXBkYXRlTW9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZU1vZGUpIHtcbiAgICAgICAgICAgIGNhc2UgTW9kZS5ERVZJQ0U6XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVIYW5kbGVyID0gdGhpcy5kZXZpY2VNb2RlO1xuICAgICAgICAgICAgICAgIGhvc3Quc2hvd1BvcHVwTm90aWZpY2F0aW9uKCdEZXZpY2UgTW9kZScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNb2RlLk1JWEVSOlxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlSGFuZGxlciA9IHRoaXMubWl4ZXJNb2RlO1xuICAgICAgICAgICAgICAgIGhvc3Quc2hvd1BvcHVwTm90aWZpY2F0aW9uKCdNaXhlciBNb2RlJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hY3RpdmVIYW5kbGVyLnVwZGF0ZUluZGljYXRpb25zKCk7XG4gICAgfTtcbiAgICBNb2RlLk1JWEVSID0gMDtcbiAgICBNb2RlLkRFVklDRSA9IDE7XG4gICAgcmV0dXJuIE1vZGU7XG59KCkpO1xuZXhwb3J0cy5Nb2RlID0gTW9kZTtcbnZhciBNb2RlSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNb2RlSGFuZGxlcihob3N0LCBsZWRzKSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgICAgIHRoaXMubGVkcyA9IGxlZHM7XG4gICAgfVxuICAgIE1vZGVIYW5kbGVyLnByb3RvdHlwZS5wcmVwYXJlT3V0cHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuUExBWSwgdGhpcy5ob3N0LmlzUGxheWluZyk7XG4gICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5TVE9QLCAhdGhpcy5ob3N0LmlzUGxheWluZyk7XG4gICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5SRUMsIHRoaXMuaG9zdC5pc1JlY29yZGluZyk7XG4gICAgICAgIC8vIHRoaXMubGVkcy5zZXRPdXRwdXQoQ0MuQ1lDTEUsIGFjdGl2ZVBhZ2UgPT0gbWl4ZXJQYWdlID8gMTI3IDogMCk7XG4gICAgfTtcbiAgICByZXR1cm4gTW9kZUhhbmRsZXI7XG59KCkpO1xuZXhwb3J0cy5Nb2RlSGFuZGxlciA9IE1vZGVIYW5kbGVyO1xudmFyIERldmljZU1vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKERldmljZU1vZGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gRGV2aWNlTW9kZShob3N0LCBsZWRzLCB0cmFuc3BvcnRTdGF0dXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgaG9zdCwgbGVkcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMudHJhbnNwb3J0U3RhdHVzID0gdHJhbnNwb3J0U3RhdHVzO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIERldmljZU1vZGUucHJvdG90eXBlLm9uS25vYiA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHAgPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRQYXJhbWV0ZXIoaW5kZXgpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgcC5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcC5zZXQodmFsdWUsIDEyOCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLm9uU2xpZGVyID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB2YXIgbSA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKGluZGV4KS5nZXRBbW91bnQoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIG0ucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG0uc2V0KHZhbHVlLCAxMjgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5zb2xvQnV0dG9uID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnNldFBhcmFtZXRlclBhZ2UoaW5kZXgpO1xuICAgICAgICBpZiAoaW5kZXggPCB0aGlzLmhvc3QucGFyYW1zLnBhZ2VOYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhvc3Quc2hvd1BvcHVwTm90aWZpY2F0aW9uKFwiUGFnZTogXCIuY29uY2F0KHRoaXMuaG9zdC5wYXJhbXMucGFnZU5hbWVzW2luZGV4XSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5tdXRlQnV0dG9uID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKGluZGV4KS5nZXRNb2R1bGF0aW9uU291cmNlKCkudG9nZ2xlSXNNYXBwaW5nKCk7XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5yZWNCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5wcmV2VHJhY2tCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIGluIHRoZSB0eXBpbmdzLlxuICAgICAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2Uuc3dpdGNoVG9EZXZpY2UoQVBJLkRldmljZVR5cGUuQU5ZLCBBUEkuQ2hhaW5Mb2NhdGlvbi5QUkVWSU9VUyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0UHJldmlvdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUubmV4dFRyYWNrQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgLy8gVGhpcyBkb2Vzbid0IGFwcGVhciB0byBiZSBpbiB0aGUgdHlwaW5ncy5cbiAgICAgICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnN3aXRjaFRvRGV2aWNlKEFQSS5EZXZpY2VUeXBlLkFOWSwgQVBJLkNoYWluTG9jYXRpb24uTkVYVCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0TmV4dCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5wcmV2TWFya2VyQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2Uuc3dpdGNoVG9QcmV2aW91c1ByZXNldENhdGVnb3J5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb1ByZXZpb3VzUHJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLm5leHRNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb05leHRQcmVzZXRDYXRlZ29yeSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2Uuc3dpdGNoVG9OZXh0UHJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnVwZGF0ZUluZGljYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IDg7IHArKykge1xuICAgICAgICAgICAgdmFyIG1hY3JvID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8ocCkuZ2V0QW1vdW50KCk7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVyID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0UGFyYW1ldGVyKHApO1xuICAgICAgICAgICAgdmFyIHRyYWNrID0gdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhwKTtcbiAgICAgICAgICAgIHBhcmFtZXRlci5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgbWFjcm8uc2V0SW5kaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgIHRyYWNrLmdldFZvbHVtZSgpLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdHJhY2suZ2V0UGFuKCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnByZXBhcmVPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUucHJlcGFyZU91dHB1dC5jYWxsKHRoaXMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlNPTE9TW2ldLCB0aGlzLmhvc3QucGFyYW1zLmN1cnJlbnRQYWdlID09PSBpKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5NVVRFU1tpXSwgISF0aGlzLmhvc3QucGFyYW1zLmlzTWFjcm9NYXBwaW5nW2ldICYmIHRoaXMuaG9zdC5ibGluayk7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuUkVDU1tpXSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gRGV2aWNlTW9kZTtcbn0oTW9kZUhhbmRsZXIpKTtcbmV4cG9ydHMuRGV2aWNlTW9kZSA9IERldmljZU1vZGU7XG52YXIgTWl4ZXJNb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhNaXhlck1vZGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTWl4ZXJNb2RlKGhvc3QsIGxlZHMsIHRyYW5zcG9ydFN0YXR1cykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBob3N0LCBsZWRzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5vbktub2IgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwID0gdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhpbmRleCkuZ2V0UGFuKCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICBwLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwLnNldCh2YWx1ZSwgMTI4KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5vblNsaWRlciA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHYgPSB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRWb2x1bWUoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHYucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHYuc2V0KHZhbHVlLCAxMjgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnNvbG9CdXR0b24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhpbmRleCkuZ2V0U29sbygpLnRvZ2dsZShmYWxzZSk7XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm11dGVCdXR0b24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhpbmRleCkuZ2V0TXV0ZSgpLnRvZ2dsZSgpO1xuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5yZWNCdXR0b24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhpbmRleCkuZ2V0QXJtKCkudG9nZ2xlKCk7XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXZUcmFja0J1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC50cmFja0Jhbmsuc2Nyb2xsVHJhY2tzUGFnZVVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0UHJldmlvdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5uZXh0VHJhY2tCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLnNjcm9sbFRyYWNrc1BhZ2VEb3duKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0TmV4dCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXZNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICB0cmFuc3BvcnQucHJldmlvdXNNYXJrZXIoKTsgLy8gYWN0aXZhdGUgd2hlbiBpdCBleGlzdHMgaW4gdGhlIEFQSVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5uZXh0TWFya2VyQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgdHJhbnNwb3J0Lm5leHRNYXJrZXIoKTsgLy8gYWN0aXZhdGUgd2hlbiBpdCBleGlzdHMgaW4gdGhlIEFQSVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS51cGRhdGVJbmRpY2F0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCA4OyBwKyspIHtcbiAgICAgICAgICAgIHZhciBtYWNybyA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKHApLmdldEFtb3VudCgpO1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlciA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldENvbW1vblBhcmFtZXRlcihwKTtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRoaXMuaG9zdC50cmFja0JhbmsuZ2V0VHJhY2socCk7XG4gICAgICAgICAgICB0cmFjay5nZXRWb2x1bWUoKS5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgdHJhY2suZ2V0UGFuKCkuc2V0SW5kaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgIHBhcmFtZXRlci5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIG1hY3JvLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXBhcmVPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUucHJlcGFyZU91dHB1dC5jYWxsKHRoaXMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlNPTE9TW2ldLCB0aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1tpXS5zb2xvKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5NVVRFU1tpXSwgdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbaV0ubXV0ZSk7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuUkVDU1tpXSwgdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbaV0uYXJtKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIE1peGVyTW9kZTtcbn0oTW9kZUhhbmRsZXIpKTtcbmV4cG9ydHMuTWl4ZXJNb2RlID0gTWl4ZXJNb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QYXJhbXMgPSB2b2lkIDA7XG4vLyBNb2RlbHMgcGFyYW1ldGVyIHBhZ2VzIGFuZCBwYXJhbWV0ZXJzIGZvciBERVZJQ0UgbW9kZS5cbnZhciBQYXJhbXMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyYW1zKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcbiAgICAgICAgdGhpcy5wYWdlTmFtZXMgPSBbXTtcbiAgICAgICAgdGhpcy5pc01hY3JvTWFwcGluZyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gUGFyYW1zO1xufSgpKTtcbmV4cG9ydHMuUGFyYW1zID0gUGFyYW1zO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TWVNFWCA9IHZvaWQgMDtcbnZhciBTWVNFWCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTWVNFWCgpIHtcbiAgICB9XG4gICAgLy8gRW50ZXIgbmF0aXZlIG1vZGUuXG4gICAgU1lTRVguZ29OYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbmRTeXNleChTWVNFWC5IRUFERVIgKyAnMDAgMDAgMDEgRjcnKTtcbiAgICB9O1xuICAgIC8vIEV4aXQgbmF0aXZlIG1vZGUuXG4gICAgU1lTRVgubGVhdmVOYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbmRTeXNleChTWVNFWC5IRUFERVIgKyAnMDAgMDAgMDAgRjcnKTtcbiAgICB9O1xuICAgIFNZU0VYLkhFQURFUiA9ICdGMCA0MiA0MCAwMCAwMSAxMyAwMCAnO1xuICAgIHJldHVybiBTWVNFWDtcbn0oKSk7XG5leHBvcnRzLlNZU0VYID0gU1lTRVg7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRyYW5zcG9ydFN0YXR1cyA9IHZvaWQgMDtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgVHJhbnNwb3J0U3RhdHVzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFRyYW5zcG9ydFN0YXR1cygpIHtcbiAgICAgICAgdGhpcy5zZXRQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RvcFByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5UHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlY1ByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5taXhlclN0YXR1cyA9ICgwLCB1dGlsc18xLmZpbGxBcnJheSkoe1xuICAgICAgICAgICAgc29sbzogZmFsc2UsXG4gICAgICAgICAgICBtdXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGFybTogZmFsc2UsXG4gICAgICAgIH0sIDgpO1xuICAgIH1cbiAgICByZXR1cm4gVHJhbnNwb3J0U3RhdHVzO1xufSgpKTtcbmV4cG9ydHMuVHJhbnNwb3J0U3RhdHVzID0gVHJhbnNwb3J0U3RhdHVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5sb2cgPSBleHBvcnRzLmZpbGxBcnJheSA9IHZvaWQgMDtcbi8vIFV0aWxpdHkgZnVuY3Rpb25zLlxuZnVuY3Rpb24gZmlsbEFycmF5KGluaXRWYWx1ZSwgY291bnQpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGluaXRWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLmZpbGxBcnJheSA9IGZpbGxBcnJheTtcbmZ1bmN0aW9uIGxvZyhtc2cpIHtcbiAgICBwcmludGxuKG1zZyk7XG59XG5leHBvcnRzLmxvZyA9IGxvZztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuLy8gbmFub0tPTlRST0wgU3R1ZGlvIGNvbnRyb2wgc3VyZmFjZSBzY3JpcHRzIGZvciBCaXR3aWdcbi8vIENvcHlyaWdodCAyMDE4IEJpdHdpZyBnbWJoXG4vLyBDb3B5cmlnaHQgMjAxOCBvbGFpbXNcbi8vIENvcHlyaWdodCAyMDIzIFNvYXJpYSAvIEtheWF0ZWlhXG4vLyBMaWNlbmNlIGZvciBTb2FyaWEgLyBLYXlhdGVpYSBjaGFuZ2VzOiBNSVRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29udHJvbGxlciA9IHZvaWQgMDtcbi8vIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBzY3JpcHRzLlxubG9hZEFQSSgxKTtcbmhvc3QuZGVmaW5lQ29udHJvbGxlcignS29yZycsICduYW5vS09OVFJPTCBTdHVkaW8gKFNvYXJpYSknLCAnMS4wJywgJzdhYjM3ZWNmLTRmNDItNDg5MC05NTE1LTkxZTIxYjlmMzU0NScsICdTb2FyaWEsIG9sYWltcywgQml0d2lnJyk7XG5ob3N0LmRlZmluZU1pZGlQb3J0cygxLCAxKTtcbnZhciBjY18xID0gcmVxdWlyZShcIi4vY2NcIik7XG52YXIgaG9zdF8xID0gcmVxdWlyZShcIi4vaG9zdFwiKTtcbnZhciBsZWRzXzEgPSByZXF1aXJlKFwiLi9sZWRzXCIpO1xudmFyIG1vZGVfMSA9IHJlcXVpcmUoXCIuL21vZGVcIik7XG52YXIgc3lzZXhfMSA9IHJlcXVpcmUoXCIuL3N5c2V4XCIpO1xudmFyIHRyYW5zcG9ydF8xID0gcmVxdWlyZShcIi4vdHJhbnNwb3J0XCIpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBDb250cm9sbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbnRyb2xsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzID0gbmV3IHRyYW5zcG9ydF8xLlRyYW5zcG9ydFN0YXR1cygpO1xuICAgICAgICB0aGlzLmhvc3QgPSBuZXcgaG9zdF8xLkhvc3QodGhpcy50cmFuc3BvcnRTdGF0dXMpO1xuICAgICAgICB0aGlzLmxlZHMgPSBuZXcgbGVkc18xLkxFRHMoKTtcbiAgICAgICAgdGhpcy5tb2RlID0gbmV3IG1vZGVfMS5Nb2RlKHRoaXMuaG9zdCwgdGhpcy5sZWRzLCB0aGlzLnRyYW5zcG9ydFN0YXR1cyk7XG4gICAgICAgIGhvc3QuZ2V0TWlkaUluUG9ydCgwKS5zZXRNaWRpQ2FsbGJhY2soZnVuY3Rpb24gKHN0YXR1cywgZGF0YTEsIGRhdGEyKSB7IHJldHVybiBfdGhpcy5vbk1pZGkoc3RhdHVzLCBkYXRhMSwgZGF0YTIpOyB9KTtcbiAgICAgICAgc3lzZXhfMS5TWVNFWC5nb05hdGl2ZSgpO1xuICAgICAgICB0aGlzLmhvc3QuaW5pdCgpO1xuICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci51cGRhdGVJbmRpY2F0aW9ucygpO1xuICAgIH1cbiAgICBDb250cm9sbGVyLnByb3RvdHlwZS5leGl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzeXNleF8xLlNZU0VYLmxlYXZlTmF0aXZlKCk7XG4gICAgICAgIHRoaXMuaG9zdC5zaHV0ZG93bigpO1xuICAgIH07XG4gICAgQ29udHJvbGxlci5wcm90b3R5cGUub25NaWRpID0gZnVuY3Rpb24gKHN0YXR1cywgZGF0YTEsIGRhdGEyKSB7XG4gICAgICAgICgwLCB1dGlsc18xLmxvZykoXCJNSURJOiBcIi5jb25jYXQoc3RhdHVzLCBcIiAtIFwiKS5jb25jYXQoZGF0YTEsIFwiIC0gXCIpLmNvbmNhdChkYXRhMikpO1xuICAgICAgICB2YXIgY2MgPSBkYXRhMTtcbiAgICAgICAgdmFyIHZhbCA9IGRhdGEyO1xuICAgICAgICBpZiAoc3RhdHVzICE9PSAxNzYpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGNjKSB7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuU0VUOlxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQgPSB2YWwgPiAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlNUT1A6XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMuc3RvcFByZXNzZWQgPSB2YWwgPiAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBMQVk6XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMucGxheVByZXNzZWQgPSB2YWwgPiAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlJFQzpcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkID0gdmFsID4gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc3RvcFByZXNzZWQgJiZcbiAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkICYmXG4gICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QudG9nZ2xlRW5naW5lU3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBObyBpZGVhIHdoYXQgdGhpcyBpcy5cbiAgICAgICAgLy92YXIgaW5kZXggPSBkYXRhMSAmIDB4ZjtcbiAgICAgICAgLyppZiAoZGF0YTEgPiA2KXtcbiAgICAgICAgICBzd2l0Y2ggKGRhdGExKVxuICAgICAgICAgIHtcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICBpbmRleCA9IDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICBpbmRleCA9IDY7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBpbmRleCA9IDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGluZGV4ID0gZGF0YTEtMjtcbiAgICAgICAgfSovXG4gICAgICAgIC8vdmFyIGluZGV4ID0gZGF0YTE7XG4gICAgICAgIHZhciBzbGlkZXJJbmRleCA9IGNjXzEuQ0MuU0xJREVSUy5pbmRleE9mKGNjKTtcbiAgICAgICAgaWYgKHNsaWRlckluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLm9uU2xpZGVyKHNsaWRlckluZGV4LCB2YWwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrbm9iSW5kZXggPSBjY18xLkNDLktOT0JTLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAoa25vYkluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLm9uS25vYihrbm9iSW5kZXgsIHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWdub3JlIHdoZW4gYnV0dG9ucyBhcmUgcmVsZWFzZWRcbiAgICAgICAgaWYgKHZhbCA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG11dGVJbmRleCA9IGNjXzEuQ0MuTVVURVMuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChtdXRlSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIubXV0ZUJ1dHRvbihtdXRlSW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzb2xvSW5kZXggPSBjY18xLkNDLlNPTE9TLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAoc29sb0luZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLnNvbG9CdXR0b24oc29sb0luZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVjSW5kZXggPSBjY18xLkNDLlJFQ1MuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChyZWNJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5yZWNCdXR0b24ocmVjSW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZS5cbiAgICAgICAgc3dpdGNoIChjYykge1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBMQVk6XG4gICAgICAgICAgICAgICAgLy8gT25lIG1pZ2h0IGdldCB0aGUgaW1wcmVzc2lvbiB0aGF0IHRoaXMgYnV0dG9uIGlzIGEgYml0IG92ZXJsb2FkZWQuIF5eO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNFbmdpbmVPbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy50cmFuc3BvcnRTdGF0dXMucmVjUHJlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJldHVyblRvQXJyYW5nZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuU1RPUDpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc2V0QXV0b21hdGlvbk92ZXJyaWRlcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVDOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy50cmFuc3BvcnRTdGF0dXMucGxheVByZXNzZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suZ2V0QXJtKCkudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlY29yZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLkNZQ0xFOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQudG9nZ2xlTG9vcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLnN3aXRjaE1vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVXOlxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmV3aW5kKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuRkY6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LmFycmFuZ2VyLnRvZ2dsZVBsYXliYWNrRm9sbG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LmZhc3RGb3J3YXJkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBSRVZfVFJBQ0s6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIucHJldlRyYWNrQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9UUkFDSzpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5uZXh0VHJhY2tCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5QUkVWX01BUktFUjpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5wcmV2TWFya2VyQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9NQVJLRVI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIubmV4dE1hcmtlckJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ29udHJvbGxlcjtcbn0oKSk7XG5leHBvcnRzLkNvbnRyb2xsZXIgPSBDb250cm9sbGVyO1xudmFyIGNvbnRyb2xsZXI7XG5nbG9iYWwuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG59O1xuZ2xvYmFsLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7IH07XG5nbG9iYWwuZXhpdCA9IGZ1bmN0aW9uIGV4aXQoKSB7XG4gICAgY29udHJvbGxlci5leGl0KCk7XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9