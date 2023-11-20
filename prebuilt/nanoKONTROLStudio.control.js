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
    // This must be configured using the Korg editor app.
    CC.JOG_WHEEL_DEC = 85;
    CC.JOG_WHEEL_INC = 83;
    // These are non-contiguous for some reason.
    CC.SLIDERS = [2, 3, 4, 5, 6, 8, 9, 12];
    CC.KNOBS = [13, 14, 15, 16, 17, 18, 19, 20];
    CC.SOLOS = [29, 30, 31, 32, 33, 34, 35, 36, 37];
    CC.MUTES = [21, 22, 23, 24, 25, 26, 27, 28];
    CC.RECS = [38, 39, 40, 41, 42, 43, 44, 45];
    CC.ALL = [
        [CC.CYCLE, CC.REW, CC.FF, CC.STOP, CC.PLAY, CC.REC,
            CC.PREV_TRACK, CC.NEXT_TRACK, CC.SET, CC.PREV_MARKER,
            CC.NEXT_MARKER, CC.JOG_WHEEL_DEC, CC.JOG_WHEEL_INC],
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
// import { keepalive } from './utils';
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
        host.scheduleTask(function () {
            _this.blinkTimer();
            // This doesn't work to keep the screen saver away. =_=
            // keepalive();
        }, [], 200);
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

/***/ "./src/jog.ts":
/*!********************!*\
  !*** ./src/jog.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JogWheel = void 0;
var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
// The default jog wheel mode for the Studio just sends a linear position
// from 0 to 127, and then it bails. I'm not sure why they thought this
// was a good idea, but to make this work, you'll need to use the Korg
// editor app and switch it to "INC/DEC 1" mode. Otherwise, you'd only
// ever be able to roll around beats 0..127.
var JogWheel = /** @class */ (function () {
    function JogWheel(host, transportStatus) {
        this.host = host;
        this.transportStatus = transportStatus;
        //this.resetValue(64);
    }
    // This doesn't work.
    /* resetValue(value: number) {
      sendChannelController(176, CC.JOG_WHEEL, value);
    } */
    JogWheel.prototype.onJogEvent = function (value) {
        var numerator = this.transportStatus.setPressed
            ? 1
            : 4; // this.host.transport.timeSignature().getNumerator().getAsInt();
        var curPos = this.host.transport.getPosition().get();
        curPos = Math.floor(curPos / numerator) * numerator;
        (0, utils_1.log)("Jog event ".concat(value, " / ").concat(numerator));
        if (value < 0) {
            this.host.transport.setPosition(curPos - numerator);
        }
        else {
            this.host.transport.setPosition(curPos + numerator);
        }
        // this.resetValue(64);
    };
    return JogWheel;
}());
exports.JogWheel = JogWheel;


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
exports.log = exports.keepalive = exports.fillArray = void 0;
// Utility functions.
var config = {
    enableLogging: true,
    enableKeepalive: true,
};
function fillArray(initValue, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(initValue);
    }
    return result;
}
exports.fillArray = fillArray;
function keepalive() {
    if (config.enableKeepalive) {
        // This has no meaning, it's just to keep the controller from going
        // into the distracting screen saver mode.
        sendChannelController(176, 127, 0);
    }
}
exports.keepalive = keepalive;
function log(msg) {
    if (config.enableLogging) {
        println(msg);
    }
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
var jog_1 = __webpack_require__(/*! ./jog */ "./src/jog.ts");
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
        this.jogWheel = new jog_1.JogWheel(this.host, this.transportStatus);
        host.getMidiInPort(0).setMidiCallback(function (status, data1, data2) {
            _this.onMidi(status, data1, data2);
            _this.leds.flush();
        });
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
        if (cc === cc_1.CC.JOG_WHEEL_DEC) {
            this.jogWheel.onJogEvent(-1);
            return;
        }
        if (cc === cc_1.CC.JOG_WHEEL_INC) {
            this.jogWheel.onJogEvent(1);
            return;
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
__webpack_require__.g.flush = function flush() {
    controller.leds.flush();
};
__webpack_require__.g.exit = function exit() {
    controller.exit();
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVM7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxrQkFBa0I7QUFDbEI7QUFDQSxxQkFBTTtBQUNOO0FBQ0E7QUFDQSxxQkFBTTtBQUNOO0FBQ0E7QUFDQSxxQkFBTTtBQUNOO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy9jYy50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy9ob3N0LnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2pvZy50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy9sZWRzLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL21vZGUudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvcGFyYW1zLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL3N5c2V4LnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL3RyYW5zcG9ydC50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy91dGlscy50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2NvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DQyA9IHZvaWQgMDtcbi8vIENDIHZhbHVlcyBmb3IgdGhlIG5hbm9LT05UUk9MIFN0dWRpb1xuLy9cbi8vIFRoZXJlIGFyZSBhIGZldyB0eXBlcyBvZiBDQ3MgaGVyZTpcbi8vIC0gQ29udGludW91cyB2YWx1ZXMgKHNsaWRlcnMsIGtub2JzLCBldGMpXG4vLyAtIEFjdGlvbiBidXR0b25zIChlLmcuIHBsYXksIHBhdXNlKVxuLy8gLSBUb2dnbGUgYnV0dG9ucyAoZS5nLiBtdXRlLCBzb2xvKVxuLy9cbi8vIFRoaXMgY2xhc3MganVzdCBsaXN0cyBvdXQgYWxsIHRoZSBjb25zdGFudHMuXG4vL1xuLy8gTm90ZSB0aGF0IGlmIHlvdSBlZGl0ZWQgeW91ciBLT05UUk9MIHdpdGggdGhlIEtvcmcgYXBwLFxuLy8gYWxsIGJldHMgYXJlIG9mZi5cbnZhciBDQyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDQygpIHtcbiAgICB9XG4gICAgQ0MuQ1lDTEUgPSA1NDtcbiAgICBDQy5SRVcgPSA1ODtcbiAgICBDQy5GRiA9IDU5O1xuICAgIENDLlNUT1AgPSA2MztcbiAgICBDQy5QTEFZID0gODA7XG4gICAgQ0MuUkVDID0gODE7XG4gICAgQ0MuUFJFVl9UUkFDSyA9IDYwO1xuICAgIENDLk5FWFRfVFJBQ0sgPSA2MTtcbiAgICBDQy5TRVQgPSA1NTtcbiAgICBDQy5QUkVWX01BUktFUiA9IDU2O1xuICAgIENDLk5FWFRfTUFSS0VSID0gNTc7XG4gICAgLy8gVGhpcyBtdXN0IGJlIGNvbmZpZ3VyZWQgdXNpbmcgdGhlIEtvcmcgZWRpdG9yIGFwcC5cbiAgICBDQy5KT0dfV0hFRUxfREVDID0gODU7XG4gICAgQ0MuSk9HX1dIRUVMX0lOQyA9IDgzO1xuICAgIC8vIFRoZXNlIGFyZSBub24tY29udGlndW91cyBmb3Igc29tZSByZWFzb24uXG4gICAgQ0MuU0xJREVSUyA9IFsyLCAzLCA0LCA1LCA2LCA4LCA5LCAxMl07XG4gICAgQ0MuS05PQlMgPSBbMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwXTtcbiAgICBDQy5TT0xPUyA9IFsyOSwgMzAsIDMxLCAzMiwgMzMsIDM0LCAzNSwgMzYsIDM3XTtcbiAgICBDQy5NVVRFUyA9IFsyMSwgMjIsIDIzLCAyNCwgMjUsIDI2LCAyNywgMjhdO1xuICAgIENDLlJFQ1MgPSBbMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1XTtcbiAgICBDQy5BTEwgPSBbXG4gICAgICAgIFtDQy5DWUNMRSwgQ0MuUkVXLCBDQy5GRiwgQ0MuU1RPUCwgQ0MuUExBWSwgQ0MuUkVDLFxuICAgICAgICAgICAgQ0MuUFJFVl9UUkFDSywgQ0MuTkVYVF9UUkFDSywgQ0MuU0VULCBDQy5QUkVWX01BUktFUixcbiAgICAgICAgICAgIENDLk5FWFRfTUFSS0VSLCBDQy5KT0dfV0hFRUxfREVDLCBDQy5KT0dfV0hFRUxfSU5DXSxcbiAgICAgICAgQ0MuU0xJREVSUyxcbiAgICAgICAgQ0MuS05PQlMsXG4gICAgICAgIENDLlNPTE9TLFxuICAgICAgICBDQy5NVVRFUyxcbiAgICAgICAgQ0MuUkVDUyxcbiAgICBdLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCkgeyByZXR1cm4gcHJldi5jb25jYXQobmV4dCk7IH0sIFtdKTtcbiAgICByZXR1cm4gQ0M7XG59KCkpO1xuZXhwb3J0cy5DQyA9IENDO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Ib3N0ID0gdm9pZCAwO1xudmFyIHBhcmFtc18xID0gcmVxdWlyZShcIi4vcGFyYW1zXCIpO1xuLy8gaW1wb3J0IHsga2VlcGFsaXZlIH0gZnJvbSAnLi91dGlscyc7XG4vLyBNb2RlbHMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIEJpdHdpZyBob3N0LlxudmFyIEhvc3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSG9zdCh0cmFuc3BvcnRTdGF0dXMpIHtcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0ID0gaG9zdC5jcmVhdGVUcmFuc3BvcnQoKTtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbiA9IGhvc3QuY3JlYXRlQXBwbGljYXRpb24oKTtcbiAgICAgICAgdGhpcy50cmFja0JhbmsgPSBob3N0LmNyZWF0ZVRyYWNrQmFuayg4LCAxLCAwKTtcbiAgICAgICAgdGhpcy5jdXJzb3JUcmFjayA9IGhvc3QuY3JlYXRlQ3Vyc29yVHJhY2soMiwgMCk7XG4gICAgICAgIHRoaXMucHJpbWFyeURldmljZSA9IHRoaXMuY3Vyc29yVHJhY2suY3JlYXRlQ3Vyc29yRGV2aWNlKCk7XG4gICAgICAgIHRoaXMuYXJyYW5nZXIgPSBob3N0LmNyZWF0ZUFycmFuZ2VyKDApO1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG5ldyBwYXJhbXNfMS5QYXJhbXMoKTtcbiAgICAgICAgdGhpcy5ibGluayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzTG9vcGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNFbmdpbmVPbiA9IGZhbHNlO1xuICAgIH1cbiAgICBIb3N0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmFsbEluZGljYXRpb25zT2ZmKCk7XG4gICAgICAgIHRoaXMuc2V0dXBPYnNlcnZlcnMoKTtcbiAgICAgICAgaG9zdC5zY2hlZHVsZVRhc2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuYmxpbmtUaW1lcigpO1xuICAgICAgICAgICAgLy8gVGhpcyBkb2Vzbid0IHdvcmsgdG8ga2VlcCB0aGUgc2NyZWVuIHNhdmVyIGF3YXkuID1fPVxuICAgICAgICAgICAgLy8ga2VlcGFsaXZlKCk7XG4gICAgICAgIH0sIFtdLCAyMDApO1xuICAgIH07XG4gICAgSG9zdC5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWxsSW5kaWNhdGlvbnNPZmYoKTtcbiAgICB9O1xuICAgIEhvc3QucHJvdG90eXBlLmJsaW5rVGltZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcbiAgICB9O1xuICAgIC8vIFRoZXJlIGFyZSBhIGxvdCBvZiB0aGluZ3MgbWFya2VkIGFzIGRlcHJlY2F0ZWQgaW4gaGVyZSwgYnV0IGl0J3MgZ29pbmcgdG8gYmUgYSBiaWdcbiAgICAvLyBjaGFuZ2UgdG8gdXBkYXRlIG1vc3Qgb2YgdGhlbSwgc28gZm9yIG5vdyBJIGp1c3Qgd2FudCB0byBnZXQgaXQgd29ya2luZyBhZ2Fpbi5cbiAgICBIb3N0LnByb3RvdHlwZS5zZXR1cE9ic2VydmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50cmFja0JhbmsuZm9sbG93Q3Vyc29yVHJhY2sodGhpcy5jdXJzb3JUcmFjayk7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0LmFkZElzUGxheWluZ09ic2VydmVyKGZ1bmN0aW9uIChvbikge1xuICAgICAgICAgICAgX3RoaXMuaXNQbGF5aW5nID0gb247XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydC5hZGRJc1JlY29yZGluZ09ic2VydmVyKGZ1bmN0aW9uIChvbikge1xuICAgICAgICAgICAgX3RoaXMuaXNSZWNvcmRpbmcgPSBvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0LmFkZElzTG9vcEFjdGl2ZU9ic2VydmVyKGZ1bmN0aW9uIChvbikge1xuICAgICAgICAgICAgX3RoaXMuaXNMb29waW5nID0gb247XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFwcGxpY2F0aW9uLmFkZEhhc0FjdGl2ZUVuZ2luZU9ic2VydmVyKGZ1bmN0aW9uIChvbikge1xuICAgICAgICAgICAgX3RoaXMuaXNFbmdpbmVPbiA9IG9uO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlciA9IHRoaXNfMS5wcmltYXJ5RGV2aWNlLmdldFBhcmFtZXRlcihwKTtcbiAgICAgICAgICAgIHBhcmFtZXRlci5zZXRMYWJlbCgnUCcgKyAocCArIDEpKTtcbiAgICAgICAgICAgIC8vIG1hY3JvLmFkZElzTWFwcGluZ09ic2VydmVyKGdldE9ic2VydmVySW5kZXhGdW5jKHAsIGlzTWFwcGluZykpOyAvL1RPRE9cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgbGlrZXdpc2UgZGVwcmVjYXRlZCwgYnV0IEknbSBub3QgZW50aXJlbHkgc3VyZSBob3cgdG8gcmVwbGFjZSBpdC5cbiAgICAgICAgICAgIHZhciBtYWNybyA9IHRoaXNfMS5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKHApO1xuICAgICAgICAgICAgbWFjcm8uZ2V0TW9kdWxhdGlvblNvdXJjZSgpLmFkZElzTWFwcGluZ09ic2VydmVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnBhcmFtcy5pc01hY3JvTWFwcGluZ1twXSA9IHN0YXRlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0aGlzXzEgPSB0aGlzO1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IDg7IHArKykge1xuICAgICAgICAgICAgX2xvb3BfMShwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByaW1hcnlEZXZpY2UuYWRkU2VsZWN0ZWRQYWdlT2JzZXJ2ZXIoMCwgZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgICAgIF90aGlzLnBhcmFtcy5jdXJyZW50UGFnZSA9IHBhZ2U7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByaW1hcnlEZXZpY2UuYWRkUGFnZU5hbWVzT2JzZXJ2ZXIoZnVuY3Rpb24gKG5hbWVzKSB7XG4gICAgICAgICAgICBfdGhpcy5wYXJhbXMucGFnZU5hbWVzID0gbmFtZXM7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgX2xvb3BfMiA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB2YXIgdHJhY2sgPSB0aGlzXzIudHJhY2tCYW5rLmdldFRyYWNrKHQpO1xuICAgICAgICAgICAgdHJhY2suZ2V0Vm9sdW1lKCkuc2V0TGFiZWwoXCJWXCIuY29uY2F0KHQgKyAxKSk7XG4gICAgICAgICAgICB0cmFjay5nZXRQYW4oKS5zZXRMYWJlbChcIlBcIi5jb25jYXQodCArIDEpKTtcbiAgICAgICAgICAgIHRyYWNrLmdldFNvbG8oKS5hZGRWYWx1ZU9ic2VydmVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1t0XS5zb2xvID0gc3RhdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRyYWNrLmdldE11dGUoKS5hZGRWYWx1ZU9ic2VydmVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1t0XS5tdXRlID0gc3RhdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRyYWNrLmdldEFybSgpLmFkZFZhbHVlT2JzZXJ2ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudHJhbnNwb3J0U3RhdHVzLm1peGVyU3RhdHVzW3RdLmFybSA9IHN0YXRlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0aGlzXzIgPSB0aGlzO1xuICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IDg7IHQrKykge1xuICAgICAgICAgICAgX2xvb3BfMih0KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSG9zdC5wcm90b3R5cGUuYWxsSW5kaWNhdGlvbnNPZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgODsgcCsrKSB7XG4gICAgICAgICAgICB0aGlzLnByaW1hcnlEZXZpY2UuZ2V0UGFyYW1ldGVyKHApLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKHApLmdldEFtb3VudCgpLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy50cmFja0JhbmsuZ2V0VHJhY2socCkuZ2V0Vm9sdW1lKCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrQmFuay5nZXRUcmFjayhwKS5nZXRQYW4oKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSG9zdC5wcm90b3R5cGUudG9nZ2xlRW5naW5lU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRW5naW5lT24pIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbGljYXRpb24uZGVhY3RpdmF0ZUVuZ2luZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hcHBsaWNhdGlvbi5hY3RpdmF0ZUVuZ2luZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gSG9zdDtcbn0oKSk7XG5leHBvcnRzLkhvc3QgPSBIb3N0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Kb2dXaGVlbCA9IHZvaWQgMDtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG4vLyBUaGUgZGVmYXVsdCBqb2cgd2hlZWwgbW9kZSBmb3IgdGhlIFN0dWRpbyBqdXN0IHNlbmRzIGEgbGluZWFyIHBvc2l0aW9uXG4vLyBmcm9tIDAgdG8gMTI3LCBhbmQgdGhlbiBpdCBiYWlscy4gSSdtIG5vdCBzdXJlIHdoeSB0aGV5IHRob3VnaHQgdGhpc1xuLy8gd2FzIGEgZ29vZCBpZGVhLCBidXQgdG8gbWFrZSB0aGlzIHdvcmssIHlvdSdsbCBuZWVkIHRvIHVzZSB0aGUgS29yZ1xuLy8gZWRpdG9yIGFwcCBhbmQgc3dpdGNoIGl0IHRvIFwiSU5DL0RFQyAxXCIgbW9kZS4gT3RoZXJ3aXNlLCB5b3UnZCBvbmx5XG4vLyBldmVyIGJlIGFibGUgdG8gcm9sbCBhcm91bmQgYmVhdHMgMC4uMTI3LlxudmFyIEpvZ1doZWVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEpvZ1doZWVsKGhvc3QsIHRyYW5zcG9ydFN0YXR1cykge1xuICAgICAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgLy90aGlzLnJlc2V0VmFsdWUoNjQpO1xuICAgIH1cbiAgICAvLyBUaGlzIGRvZXNuJ3Qgd29yay5cbiAgICAvKiByZXNldFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgIHNlbmRDaGFubmVsQ29udHJvbGxlcigxNzYsIENDLkpPR19XSEVFTCwgdmFsdWUpO1xuICAgIH0gKi9cbiAgICBKb2dXaGVlbC5wcm90b3R5cGUub25Kb2dFdmVudCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbnVtZXJhdG9yID0gdGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZFxuICAgICAgICAgICAgPyAxXG4gICAgICAgICAgICA6IDQ7IC8vIHRoaXMuaG9zdC50cmFuc3BvcnQudGltZVNpZ25hdHVyZSgpLmdldE51bWVyYXRvcigpLmdldEFzSW50KCk7XG4gICAgICAgIHZhciBjdXJQb3MgPSB0aGlzLmhvc3QudHJhbnNwb3J0LmdldFBvc2l0aW9uKCkuZ2V0KCk7XG4gICAgICAgIGN1clBvcyA9IE1hdGguZmxvb3IoY3VyUG9zIC8gbnVtZXJhdG9yKSAqIG51bWVyYXRvcjtcbiAgICAgICAgKDAsIHV0aWxzXzEubG9nKShcIkpvZyBldmVudCBcIi5jb25jYXQodmFsdWUsIFwiIC8gXCIpLmNvbmNhdChudW1lcmF0b3IpKTtcbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zZXRQb3NpdGlvbihjdXJQb3MgLSBudW1lcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zZXRQb3NpdGlvbihjdXJQb3MgKyBudW1lcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMucmVzZXRWYWx1ZSg2NCk7XG4gICAgfTtcbiAgICByZXR1cm4gSm9nV2hlZWw7XG59KCkpO1xuZXhwb3J0cy5Kb2dXaGVlbCA9IEpvZ1doZWVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5MRURzID0gdm9pZCAwO1xuLy8gTW9kZWxzIHRoZSBwcm9ncmFtbWFibGUgTEVEcyBvbiB0aGUgZGV2aWNlLlxudmFyIGNjXzEgPSByZXF1aXJlKFwiLi9jY1wiKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgTEVEcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMRURzKCkge1xuICAgICAgICB0aGlzLnBlbmRpbmdTdGF0ZSA9ICgwLCB1dGlsc18xLmZpbGxBcnJheSkoZmFsc2UsIDgpO1xuICAgICAgICB0aGlzLm91dHB1dFN0YXRlID0gKDAsIHV0aWxzXzEuZmlsbEFycmF5KShmYWxzZSwgOCk7XG4gICAgfVxuICAgIExFRHMucHJvdG90eXBlLnNldE91dHB1dCA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nU3RhdGVbaW5kZXhdID0gdmFsdWU7XG4gICAgfTtcbiAgICBMRURzLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjY18xLkNDLkFMTC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNjID0gY2NfMS5DQy5BTExbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5wZW5kaW5nU3RhdGVbY2NdICE9PSB0aGlzLm91dHB1dFN0YXRlW2NjXSkge1xuICAgICAgICAgICAgICAgIHNlbmRDaGFubmVsQ29udHJvbGxlcigxNzYsIGNjXzEuQ0MuQUxMW2NjXSwgdGhpcy5wZW5kaW5nU3RhdGVbY2NdID8gMTI3IDogMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRTdGF0ZVtjY10gPSB0aGlzLnBlbmRpbmdTdGF0ZVtjY107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBMRURzO1xufSgpKTtcbmV4cG9ydHMuTEVEcyA9IExFRHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NaXhlck1vZGUgPSBleHBvcnRzLkRldmljZU1vZGUgPSBleHBvcnRzLk1vZGVIYW5kbGVyID0gZXhwb3J0cy5Nb2RlID0gdm9pZCAwO1xudmFyIGNjXzEgPSByZXF1aXJlKFwiLi9jY1wiKTtcbi8vIFRyYWNrcyB0aGUgZGV2aWNlIHZzIG1peGVyIG1vZGUuIERldmljZSBtb2RlIG1lYW5zIHN0dWZmIGlzXG4vLyBtYXBwZWQgdG8gdGhlIHNlbGVjdGVkIGRldmljZSdzIGNvbnRyb2xzLiBNaXhlciBtYXBzIHN0dWZmIHRvXG4vLyB0aGUgQml0d2lnIG1peGVyIHNsaWRlcnMuXG52YXIgTW9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNb2RlKGhvc3QsIGxlZHMsIHRyYW5zcG9ydFN0YXR1cykge1xuICAgICAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgICAgICB0aGlzLmxlZHMgPSBsZWRzO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgdGhpcy5kZXZpY2VNb2RlID0gbmV3IERldmljZU1vZGUodGhpcy5ob3N0LCB0aGlzLmxlZHMsIHRoaXMudHJhbnNwb3J0U3RhdHVzKTtcbiAgICAgICAgdGhpcy5taXhlck1vZGUgPSBuZXcgTWl4ZXJNb2RlKHRoaXMuaG9zdCwgdGhpcy5sZWRzLCB0aGlzLnRyYW5zcG9ydFN0YXR1cyk7XG4gICAgICAgIHRoaXMuYWN0aXZlTW9kZSA9IE1vZGUuTUlYRVI7XG4gICAgICAgIHRoaXMuYWN0aXZlSGFuZGxlciA9IHRoaXMubWl4ZXJNb2RlO1xuICAgIH1cbiAgICBNb2RlLnByb3RvdHlwZS5zd2l0Y2hNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVNb2RlID09PSBNb2RlLk1JWEVSKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU1vZGUgPSBNb2RlLkRFVklDRTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kZSA9IE1vZGUuTUlYRVI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVNb2RlKCk7XG4gICAgfTtcbiAgICBNb2RlLnByb3RvdHlwZS51cGRhdGVNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuYWN0aXZlTW9kZSkge1xuICAgICAgICAgICAgY2FzZSBNb2RlLkRFVklDRTpcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUhhbmRsZXIgPSB0aGlzLmRldmljZU1vZGU7XG4gICAgICAgICAgICAgICAgaG9zdC5zaG93UG9wdXBOb3RpZmljYXRpb24oJ0RldmljZSBNb2RlJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1vZGUuTUlYRVI6XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVIYW5kbGVyID0gdGhpcy5taXhlck1vZGU7XG4gICAgICAgICAgICAgICAgaG9zdC5zaG93UG9wdXBOb3RpZmljYXRpb24oJ01peGVyIE1vZGUnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZUhhbmRsZXIudXBkYXRlSW5kaWNhdGlvbnMoKTtcbiAgICB9O1xuICAgIE1vZGUuTUlYRVIgPSAwO1xuICAgIE1vZGUuREVWSUNFID0gMTtcbiAgICByZXR1cm4gTW9kZTtcbn0oKSk7XG5leHBvcnRzLk1vZGUgPSBNb2RlO1xudmFyIE1vZGVIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1vZGVIYW5kbGVyKGhvc3QsIGxlZHMpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICAgICAgdGhpcy5sZWRzID0gbGVkcztcbiAgICB9XG4gICAgTW9kZUhhbmRsZXIucHJvdG90eXBlLnByZXBhcmVPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5QTEFZLCB0aGlzLmhvc3QuaXNQbGF5aW5nKTtcbiAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlNUT1AsICF0aGlzLmhvc3QuaXNQbGF5aW5nKTtcbiAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlJFQywgdGhpcy5ob3N0LmlzUmVjb3JkaW5nKTtcbiAgICAgICAgLy8gdGhpcy5sZWRzLnNldE91dHB1dChDQy5DWUNMRSwgYWN0aXZlUGFnZSA9PSBtaXhlclBhZ2UgPyAxMjcgOiAwKTtcbiAgICB9O1xuICAgIHJldHVybiBNb2RlSGFuZGxlcjtcbn0oKSk7XG5leHBvcnRzLk1vZGVIYW5kbGVyID0gTW9kZUhhbmRsZXI7XG52YXIgRGV2aWNlTW9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoRGV2aWNlTW9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBEZXZpY2VNb2RlKGhvc3QsIGxlZHMsIHRyYW5zcG9ydFN0YXR1cykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBob3N0LCBsZWRzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUub25Lbm9iID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB2YXIgcCA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldFBhcmFtZXRlcihpbmRleCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICBwLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwLnNldCh2YWx1ZSwgMTI4KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUub25TbGlkZXIgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHZhciBtID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8oaW5kZXgpLmdldEFtb3VudCgpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgbS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbS5zZXQodmFsdWUsIDEyOCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnNvbG9CdXR0b24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2Uuc2V0UGFyYW1ldGVyUGFnZShpbmRleCk7XG4gICAgICAgIGlmIChpbmRleCA8IHRoaXMuaG9zdC5wYXJhbXMucGFnZU5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgaG9zdC5zaG93UG9wdXBOb3RpZmljYXRpb24oXCJQYWdlOiBcIi5jb25jYXQodGhpcy5ob3N0LnBhcmFtcy5wYWdlTmFtZXNbaW5kZXhdKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLm11dGVCdXR0b24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8oaW5kZXgpLmdldE1vZHVsYXRpb25Tb3VyY2UoKS50b2dnbGVJc01hcHBpbmcoKTtcbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnJlY0J1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnByZXZUcmFja0J1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgaW4gdGhlIHR5cGluZ3MuXG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb0RldmljZShBUEkuRGV2aWNlVHlwZS5BTlksIEFQSS5DaGFpbkxvY2F0aW9uLlBSRVZJT1VTKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5jdXJzb3JUcmFjay5zZWxlY3RQcmV2aW91cygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5uZXh0VHJhY2tCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIGluIHRoZSB0eXBpbmdzLlxuICAgICAgICAgICAgdGhpcy5ob3N0LnByaW1hcnlEZXZpY2Uuc3dpdGNoVG9EZXZpY2UoQVBJLkRldmljZVR5cGUuQU5ZLCBBUEkuQ2hhaW5Mb2NhdGlvbi5ORVhUKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5jdXJzb3JUcmFjay5zZWxlY3ROZXh0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnByZXZNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb1ByZXZpb3VzUHJlc2V0Q2F0ZWdvcnkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnN3aXRjaFRvUHJldmlvdXNQcmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUubmV4dE1hcmtlckJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnN3aXRjaFRvTmV4dFByZXNldENhdGVnb3J5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb05leHRQcmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUudXBkYXRlSW5kaWNhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgODsgcCsrKSB7XG4gICAgICAgICAgICB2YXIgbWFjcm8gPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRNYWNybyhwKS5nZXRBbW91bnQoKTtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXIgPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRQYXJhbWV0ZXIocCk7XG4gICAgICAgICAgICB2YXIgdHJhY2sgPSB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKHApO1xuICAgICAgICAgICAgcGFyYW1ldGVyLnNldEluZGljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICBtYWNyby5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgdHJhY2suZ2V0Vm9sdW1lKCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0cmFjay5nZXRQYW4oKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUucHJlcGFyZU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5wcmVwYXJlT3V0cHV0LmNhbGwodGhpcyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuU09MT1NbaV0sIHRoaXMuaG9zdC5wYXJhbXMuY3VycmVudFBhZ2UgPT09IGkpO1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLk1VVEVTW2ldLCAhIXRoaXMuaG9zdC5wYXJhbXMuaXNNYWNyb01hcHBpbmdbaV0gJiYgdGhpcy5ob3N0LmJsaW5rKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5SRUNTW2ldLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBEZXZpY2VNb2RlO1xufShNb2RlSGFuZGxlcikpO1xuZXhwb3J0cy5EZXZpY2VNb2RlID0gRGV2aWNlTW9kZTtcbnZhciBNaXhlck1vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE1peGVyTW9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBNaXhlck1vZGUoaG9zdCwgbGVkcywgdHJhbnNwb3J0U3RhdHVzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhvc3QsIGxlZHMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm9uS25vYiA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHAgPSB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRQYW4oKTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHAucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHAuc2V0KHZhbHVlLCAxMjgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm9uU2xpZGVyID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB2YXIgdiA9IHRoaXMuaG9zdC50cmFja0JhbmsuZ2V0VHJhY2soaW5kZXgpLmdldFZvbHVtZSgpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgdi5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdi5zZXQodmFsdWUsIDEyOCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUuc29sb0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRTb2xvKCkudG9nZ2xlKGZhbHNlKTtcbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUubXV0ZUJ1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRNdXRlKCkudG9nZ2xlKCk7XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnJlY0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRBcm0oKS50b2dnbGUoKTtcbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUucHJldlRyYWNrQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnRyYWNrQmFuay5zY3JvbGxUcmFja3NQYWdlVXAoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5jdXJzb3JUcmFjay5zZWxlY3RQcmV2aW91cygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm5leHRUcmFja0J1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC50cmFja0Jhbmsuc2Nyb2xsVHJhY2tzUGFnZURvd24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5jdXJzb3JUcmFjay5zZWxlY3ROZXh0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUucHJldk1hcmtlckJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gIHRyYW5zcG9ydC5wcmV2aW91c01hcmtlcigpOyAvLyBhY3RpdmF0ZSB3aGVuIGl0IGV4aXN0cyBpbiB0aGUgQVBJXG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm5leHRNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICB0cmFuc3BvcnQubmV4dE1hcmtlcigpOyAvLyBhY3RpdmF0ZSB3aGVuIGl0IGV4aXN0cyBpbiB0aGUgQVBJXG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnVwZGF0ZUluZGljYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IDg7IHArKykge1xuICAgICAgICAgICAgdmFyIG1hY3JvID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8ocCkuZ2V0QW1vdW50KCk7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVyID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0Q29tbW9uUGFyYW1ldGVyKHApO1xuICAgICAgICAgICAgdmFyIHRyYWNrID0gdGhpcy5ob3N0LnRyYWNrQmFuay5nZXRUcmFjayhwKTtcbiAgICAgICAgICAgIHRyYWNrLmdldFZvbHVtZSgpLnNldEluZGljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICB0cmFjay5nZXRQYW4oKS5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgcGFyYW1ldGVyLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgbWFjcm8uc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUucHJlcGFyZU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5wcmVwYXJlT3V0cHV0LmNhbGwodGhpcyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuU09MT1NbaV0sIHRoaXMudHJhbnNwb3J0U3RhdHVzLm1peGVyU3RhdHVzW2ldLnNvbG8pO1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLk1VVEVTW2ldLCB0aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1tpXS5tdXRlKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5SRUNTW2ldLCB0aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1tpXS5hcm0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTWl4ZXJNb2RlO1xufShNb2RlSGFuZGxlcikpO1xuZXhwb3J0cy5NaXhlck1vZGUgPSBNaXhlck1vZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBhcmFtcyA9IHZvaWQgMDtcbi8vIE1vZGVscyBwYXJhbWV0ZXIgcGFnZXMgYW5kIHBhcmFtZXRlcnMgZm9yIERFVklDRSBtb2RlLlxudmFyIFBhcmFtcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xuICAgICAgICB0aGlzLnBhZ2VOYW1lcyA9IFtdO1xuICAgICAgICB0aGlzLmlzTWFjcm9NYXBwaW5nID0gW107XG4gICAgfVxuICAgIHJldHVybiBQYXJhbXM7XG59KCkpO1xuZXhwb3J0cy5QYXJhbXMgPSBQYXJhbXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNZU0VYID0gdm9pZCAwO1xudmFyIFNZU0VYID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNZU0VYKCkge1xuICAgIH1cbiAgICAvLyBFbnRlciBuYXRpdmUgbW9kZS5cbiAgICBTWVNFWC5nb05hdGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VuZFN5c2V4KFNZU0VYLkhFQURFUiArICcwMCAwMCAwMSBGNycpO1xuICAgIH07XG4gICAgLy8gRXhpdCBuYXRpdmUgbW9kZS5cbiAgICBTWVNFWC5sZWF2ZU5hdGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VuZFN5c2V4KFNZU0VYLkhFQURFUiArICcwMCAwMCAwMCBGNycpO1xuICAgIH07XG4gICAgU1lTRVguSEVBREVSID0gJ0YwIDQyIDQwIDAwIDAxIDEzIDAwICc7XG4gICAgcmV0dXJuIFNZU0VYO1xufSgpKTtcbmV4cG9ydHMuU1lTRVggPSBTWVNFWDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gbmFub0tPTlRST0wgU3R1ZGlvIGNvbnRyb2wgc3VyZmFjZSBzY3JpcHRzIGZvciBCaXR3aWdcbi8vIENvcHlyaWdodCAyMDE4IEJpdHdpZyBnbWJoXG4vLyBDb3B5cmlnaHQgMjAxOCBvbGFpbXNcbi8vIENvcHlyaWdodCAyMDIzIFNvYXJpYSAvIEtheWF0ZWlhXG4vLyBMaWNlbmNlIGZvciBTb2FyaWEgLyBLYXlhdGVpYSBjaGFuZ2VzOiBNSVRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVHJhbnNwb3J0U3RhdHVzID0gdm9pZCAwO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBUcmFuc3BvcnRTdGF0dXMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVHJhbnNwb3J0U3RhdHVzKCkge1xuICAgICAgICB0aGlzLnNldFByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdG9wUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXlQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1peGVyU3RhdHVzID0gKDAsIHV0aWxzXzEuZmlsbEFycmF5KSh7XG4gICAgICAgICAgICBzb2xvOiBmYWxzZSxcbiAgICAgICAgICAgIG11dGU6IGZhbHNlLFxuICAgICAgICAgICAgYXJtOiBmYWxzZSxcbiAgICAgICAgfSwgOCk7XG4gICAgfVxuICAgIHJldHVybiBUcmFuc3BvcnRTdGF0dXM7XG59KCkpO1xuZXhwb3J0cy5UcmFuc3BvcnRTdGF0dXMgPSBUcmFuc3BvcnRTdGF0dXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmxvZyA9IGV4cG9ydHMua2VlcGFsaXZlID0gZXhwb3J0cy5maWxsQXJyYXkgPSB2b2lkIDA7XG4vLyBVdGlsaXR5IGZ1bmN0aW9ucy5cbnZhciBjb25maWcgPSB7XG4gICAgZW5hYmxlTG9nZ2luZzogdHJ1ZSxcbiAgICBlbmFibGVLZWVwYWxpdmU6IHRydWUsXG59O1xuZnVuY3Rpb24gZmlsbEFycmF5KGluaXRWYWx1ZSwgY291bnQpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGluaXRWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLmZpbGxBcnJheSA9IGZpbGxBcnJheTtcbmZ1bmN0aW9uIGtlZXBhbGl2ZSgpIHtcbiAgICBpZiAoY29uZmlnLmVuYWJsZUtlZXBhbGl2ZSkge1xuICAgICAgICAvLyBUaGlzIGhhcyBubyBtZWFuaW5nLCBpdCdzIGp1c3QgdG8ga2VlcCB0aGUgY29udHJvbGxlciBmcm9tIGdvaW5nXG4gICAgICAgIC8vIGludG8gdGhlIGRpc3RyYWN0aW5nIHNjcmVlbiBzYXZlciBtb2RlLlxuICAgICAgICBzZW5kQ2hhbm5lbENvbnRyb2xsZXIoMTc2LCAxMjcsIDApO1xuICAgIH1cbn1cbmV4cG9ydHMua2VlcGFsaXZlID0ga2VlcGFsaXZlO1xuZnVuY3Rpb24gbG9nKG1zZykge1xuICAgIGlmIChjb25maWcuZW5hYmxlTG9nZ2luZykge1xuICAgICAgICBwcmludGxuKG1zZyk7XG4gICAgfVxufVxuZXhwb3J0cy5sb2cgPSBsb2c7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbnRyb2xsZXIgPSB2b2lkIDA7XG4vLyBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2NyaXB0cy5cbmxvYWRBUEkoMSk7XG5ob3N0LmRlZmluZUNvbnRyb2xsZXIoJ0tvcmcnLCAnbmFub0tPTlRST0wgU3R1ZGlvIChTb2FyaWEpJywgJzEuMCcsICc3YWIzN2VjZi00ZjQyLTQ4OTAtOTUxNS05MWUyMWI5ZjM1NDUnLCAnU29hcmlhLCBvbGFpbXMsIEJpdHdpZycpO1xuaG9zdC5kZWZpbmVNaWRpUG9ydHMoMSwgMSk7XG52YXIgY2NfMSA9IHJlcXVpcmUoXCIuL2NjXCIpO1xudmFyIGhvc3RfMSA9IHJlcXVpcmUoXCIuL2hvc3RcIik7XG52YXIgam9nXzEgPSByZXF1aXJlKFwiLi9qb2dcIik7XG52YXIgbGVkc18xID0gcmVxdWlyZShcIi4vbGVkc1wiKTtcbnZhciBtb2RlXzEgPSByZXF1aXJlKFwiLi9tb2RlXCIpO1xudmFyIHN5c2V4XzEgPSByZXF1aXJlKFwiLi9zeXNleFwiKTtcbnZhciB0cmFuc3BvcnRfMSA9IHJlcXVpcmUoXCIuL3RyYW5zcG9ydFwiKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgQ29udHJvbGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb250cm9sbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cyA9IG5ldyB0cmFuc3BvcnRfMS5UcmFuc3BvcnRTdGF0dXMoKTtcbiAgICAgICAgdGhpcy5ob3N0ID0gbmV3IGhvc3RfMS5Ib3N0KHRoaXMudHJhbnNwb3J0U3RhdHVzKTtcbiAgICAgICAgdGhpcy5sZWRzID0gbmV3IGxlZHNfMS5MRURzKCk7XG4gICAgICAgIHRoaXMubW9kZSA9IG5ldyBtb2RlXzEuTW9kZSh0aGlzLmhvc3QsIHRoaXMubGVkcywgdGhpcy50cmFuc3BvcnRTdGF0dXMpO1xuICAgICAgICB0aGlzLmpvZ1doZWVsID0gbmV3IGpvZ18xLkpvZ1doZWVsKHRoaXMuaG9zdCwgdGhpcy50cmFuc3BvcnRTdGF0dXMpO1xuICAgICAgICBob3N0LmdldE1pZGlJblBvcnQoMCkuc2V0TWlkaUNhbGxiYWNrKGZ1bmN0aW9uIChzdGF0dXMsIGRhdGExLCBkYXRhMikge1xuICAgICAgICAgICAgX3RoaXMub25NaWRpKHN0YXR1cywgZGF0YTEsIGRhdGEyKTtcbiAgICAgICAgICAgIF90aGlzLmxlZHMuZmx1c2goKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHN5c2V4XzEuU1lTRVguZ29OYXRpdmUoKTtcbiAgICAgICAgdGhpcy5ob3N0LmluaXQoKTtcbiAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIudXBkYXRlSW5kaWNhdGlvbnMoKTtcbiAgICB9XG4gICAgQ29udHJvbGxlci5wcm90b3R5cGUuZXhpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3lzZXhfMS5TWVNFWC5sZWF2ZU5hdGl2ZSgpO1xuICAgICAgICB0aGlzLmhvc3Quc2h1dGRvd24oKTtcbiAgICB9O1xuICAgIENvbnRyb2xsZXIucHJvdG90eXBlLm9uTWlkaSA9IGZ1bmN0aW9uIChzdGF0dXMsIGRhdGExLCBkYXRhMikge1xuICAgICAgICAoMCwgdXRpbHNfMS5sb2cpKFwiTUlESTogXCIuY29uY2F0KHN0YXR1cywgXCIgLSBcIikuY29uY2F0KGRhdGExLCBcIiAtIFwiKS5jb25jYXQoZGF0YTIpKTtcbiAgICAgICAgdmFyIGNjID0gZGF0YTE7XG4gICAgICAgIHZhciB2YWwgPSBkYXRhMjtcbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMTc2KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChjYykge1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlNFVDpcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkID0gdmFsID4gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5TVE9QOlxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkID0gdmFsID4gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5QTEFZOlxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkID0gdmFsID4gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5SRUM6XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMucmVjUHJlc3NlZCA9IHZhbCA+IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNjID09PSBjY18xLkNDLkpPR19XSEVFTF9ERUMpIHtcbiAgICAgICAgICAgIHRoaXMuam9nV2hlZWwub25Kb2dFdmVudCgtMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNjID09PSBjY18xLkNDLkpPR19XSEVFTF9JTkMpIHtcbiAgICAgICAgICAgIHRoaXMuam9nV2hlZWwub25Kb2dFdmVudCgxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc3RvcFByZXNzZWQgJiZcbiAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkICYmXG4gICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QudG9nZ2xlRW5naW5lU3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBObyBpZGVhIHdoYXQgdGhpcyBpcy5cbiAgICAgICAgLy92YXIgaW5kZXggPSBkYXRhMSAmIDB4ZjtcbiAgICAgICAgLyppZiAoZGF0YTEgPiA2KXtcbiAgICAgICAgICBzd2l0Y2ggKGRhdGExKVxuICAgICAgICAgIHtcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICBpbmRleCA9IDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICBpbmRleCA9IDY7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBpbmRleCA9IDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGluZGV4ID0gZGF0YTEtMjtcbiAgICAgICAgfSovXG4gICAgICAgIC8vdmFyIGluZGV4ID0gZGF0YTE7XG4gICAgICAgIHZhciBzbGlkZXJJbmRleCA9IGNjXzEuQ0MuU0xJREVSUy5pbmRleE9mKGNjKTtcbiAgICAgICAgaWYgKHNsaWRlckluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLm9uU2xpZGVyKHNsaWRlckluZGV4LCB2YWwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrbm9iSW5kZXggPSBjY18xLkNDLktOT0JTLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAoa25vYkluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLm9uS25vYihrbm9iSW5kZXgsIHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWdub3JlIHdoZW4gYnV0dG9ucyBhcmUgcmVsZWFzZWRcbiAgICAgICAgaWYgKHZhbCA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG11dGVJbmRleCA9IGNjXzEuQ0MuTVVURVMuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChtdXRlSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIubXV0ZUJ1dHRvbihtdXRlSW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzb2xvSW5kZXggPSBjY18xLkNDLlNPTE9TLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAoc29sb0luZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLnNvbG9CdXR0b24oc29sb0luZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVjSW5kZXggPSBjY18xLkNDLlJFQ1MuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChyZWNJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5yZWNCdXR0b24ocmVjSW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZS5cbiAgICAgICAgc3dpdGNoIChjYykge1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBMQVk6XG4gICAgICAgICAgICAgICAgLy8gT25lIG1pZ2h0IGdldCB0aGUgaW1wcmVzc2lvbiB0aGF0IHRoaXMgYnV0dG9uIGlzIGEgYml0IG92ZXJsb2FkZWQuIF5eO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNFbmdpbmVPbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy50cmFuc3BvcnRTdGF0dXMucmVjUHJlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJldHVyblRvQXJyYW5nZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuU1RPUDpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc2V0QXV0b21hdGlvbk92ZXJyaWRlcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVDOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy50cmFuc3BvcnRTdGF0dXMucGxheVByZXNzZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suZ2V0QXJtKCkudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlY29yZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLkNZQ0xFOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQudG9nZ2xlTG9vcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLnN3aXRjaE1vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVXOlxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmV3aW5kKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuRkY6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LmFycmFuZ2VyLnRvZ2dsZVBsYXliYWNrRm9sbG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LmZhc3RGb3J3YXJkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBSRVZfVFJBQ0s6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIucHJldlRyYWNrQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9UUkFDSzpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5uZXh0VHJhY2tCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5QUkVWX01BUktFUjpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5wcmV2TWFya2VyQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9NQVJLRVI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIubmV4dE1hcmtlckJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ29udHJvbGxlcjtcbn0oKSk7XG5leHBvcnRzLkNvbnRyb2xsZXIgPSBDb250cm9sbGVyO1xudmFyIGNvbnRyb2xsZXI7XG5nbG9iYWwuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG59O1xuZ2xvYmFsLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgY29udHJvbGxlci5sZWRzLmZsdXNoKCk7XG59O1xuZ2xvYmFsLmV4aXQgPSBmdW5jdGlvbiBleGl0KCkge1xuICAgIGNvbnRyb2xsZXIuZXhpdCgpO1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==