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
    CC.SOLOS = [29, 30, 31, 33, 34, 35, 36, 37];
    CC.MUTES = [21, 22, 23, 24, 25, 26, 27, 28];
    CC.RECS = [38, 39, 40, 41, 42, 43, 44, 45];
    CC.SELS = [46, 47, 48, 49, 50, 51, 52, 53];
    CC.ALL = [
        [CC.CYCLE, CC.REW, CC.FF, CC.STOP, CC.PLAY, CC.REC,
            CC.PREV_TRACK, CC.NEXT_TRACK, CC.SET, CC.PREV_MARKER,
            CC.NEXT_MARKER, CC.JOG_WHEEL_DEC, CC.JOG_WHEEL_INC],
        CC.SLIDERS,
        CC.KNOBS,
        CC.SOLOS,
        CC.MUTES,
        CC.RECS,
        CC.SELS,
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
/***/ ((__unused_webpack_module, exports) => {


// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JogWheel = void 0;
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
        /*const numerator = this.transportStatus.setPressed
          ? 1
          : 4; // this.host.transport.timeSignature().getNumerator().getAsInt();
        let curPos = this.host.transport.getPosition().get();
        curPos = Math.floor(curPos / numerator) * numerator;
        log(`Jog event ${value} / ${numerator}`);
        if (value < 0) {
          this.host.transport.setPosition(curPos - numerator);
        } else {
          this.host.transport.setPosition(curPos + numerator);
        }
        // this.resetValue(64); */
        if (value < 0) {
            this.host.transport.rewind();
        }
        else {
            this.host.transport.fastForward();
        }
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
    DeviceMode.prototype.selButton = function () {
    };
    DeviceMode.prototype.prevTrackButton = function () {
        if (!this.transportStatus.setPressed) {
            // This doesn't appear to be in the typings.
            this.host.primaryDevice.switchToDevice(DeviceType.ANY, ChainLocation.PREVIOUS);
        }
        else {
            this.host.cursorTrack.selectPrevious();
        }
    };
    DeviceMode.prototype.nextTrackButton = function () {
        if (!this.transportStatus.setPressed) {
            // This doesn't appear to be in the typings.
            this.host.primaryDevice.switchToDevice(DeviceType.ANY, ChainLocation.NEXT);
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
    MixerMode.prototype.selButton = function (index) {
        // this.host.trackBank.getTrack(index).isActivated().set(true);
        this.host.cursorTrack.selectChannel(this.host.trackBank.getTrack(index));
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
        var selIndex = cc_1.CC.SELS.indexOf(cc);
        if (selIndex >= 0) {
            this.mode.activeHandler.selButton(selIndex);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFPLENBQUMsK0JBQVM7QUFDL0Isa0JBQWtCLG1CQUFPLENBQUMsdUNBQWE7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLCtCQUFTO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGtCQUFrQjtBQUNsQjtBQUNBLHFCQUFNO0FBQ047QUFDQTtBQUNBLHFCQUFNO0FBQ047QUFDQTtBQUNBLHFCQUFNO0FBQ047QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2NjLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2hvc3QudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvam9nLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL2xlZHMudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvbW9kZS50cyIsIndlYnBhY2s6Ly9uYW5va29udHJvbHN0dWRpby8uL3NyYy9wYXJhbXMudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvc3lzZXgudHMiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvdHJhbnNwb3J0LnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvLy4vc3JjL3V0aWxzLnRzIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL25hbm9rb250cm9sc3R1ZGlvL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbmFub2tvbnRyb2xzdHVkaW8vLi9zcmMvY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNDID0gdm9pZCAwO1xuLy8gQ0MgdmFsdWVzIGZvciB0aGUgbmFub0tPTlRST0wgU3R1ZGlvXG4vL1xuLy8gVGhlcmUgYXJlIGEgZmV3IHR5cGVzIG9mIENDcyBoZXJlOlxuLy8gLSBDb250aW51b3VzIHZhbHVlcyAoc2xpZGVycywga25vYnMsIGV0Yylcbi8vIC0gQWN0aW9uIGJ1dHRvbnMgKGUuZy4gcGxheSwgcGF1c2UpXG4vLyAtIFRvZ2dsZSBidXR0b25zIChlLmcuIG11dGUsIHNvbG8pXG4vL1xuLy8gVGhpcyBjbGFzcyBqdXN0IGxpc3RzIG91dCBhbGwgdGhlIGNvbnN0YW50cy5cbi8vXG4vLyBOb3RlIHRoYXQgaWYgeW91IGVkaXRlZCB5b3VyIEtPTlRST0wgd2l0aCB0aGUgS29yZyBhcHAsXG4vLyBhbGwgYmV0cyBhcmUgb2ZmLlxudmFyIENDID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENDKCkge1xuICAgIH1cbiAgICBDQy5DWUNMRSA9IDU0O1xuICAgIENDLlJFVyA9IDU4O1xuICAgIENDLkZGID0gNTk7XG4gICAgQ0MuU1RPUCA9IDYzO1xuICAgIENDLlBMQVkgPSA4MDtcbiAgICBDQy5SRUMgPSA4MTtcbiAgICBDQy5QUkVWX1RSQUNLID0gNjA7XG4gICAgQ0MuTkVYVF9UUkFDSyA9IDYxO1xuICAgIENDLlNFVCA9IDU1O1xuICAgIENDLlBSRVZfTUFSS0VSID0gNTY7XG4gICAgQ0MuTkVYVF9NQVJLRVIgPSA1NztcbiAgICAvLyBUaGlzIG11c3QgYmUgY29uZmlndXJlZCB1c2luZyB0aGUgS29yZyBlZGl0b3IgYXBwLlxuICAgIENDLkpPR19XSEVFTF9ERUMgPSA4NTtcbiAgICBDQy5KT0dfV0hFRUxfSU5DID0gODM7XG4gICAgLy8gVGhlc2UgYXJlIG5vbi1jb250aWd1b3VzIGZvciBzb21lIHJlYXNvbi5cbiAgICBDQy5TTElERVJTID0gWzIsIDMsIDQsIDUsIDYsIDgsIDksIDEyXTtcbiAgICBDQy5LTk9CUyA9IFsxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjBdO1xuICAgIENDLlNPTE9TID0gWzI5LCAzMCwgMzEsIDMzLCAzNCwgMzUsIDM2LCAzN107XG4gICAgQ0MuTVVURVMgPSBbMjEsIDIyLCAyMywgMjQsIDI1LCAyNiwgMjcsIDI4XTtcbiAgICBDQy5SRUNTID0gWzM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NV07XG4gICAgQ0MuU0VMUyA9IFs0NiwgNDcsIDQ4LCA0OSwgNTAsIDUxLCA1MiwgNTNdO1xuICAgIENDLkFMTCA9IFtcbiAgICAgICAgW0NDLkNZQ0xFLCBDQy5SRVcsIENDLkZGLCBDQy5TVE9QLCBDQy5QTEFZLCBDQy5SRUMsXG4gICAgICAgICAgICBDQy5QUkVWX1RSQUNLLCBDQy5ORVhUX1RSQUNLLCBDQy5TRVQsIENDLlBSRVZfTUFSS0VSLFxuICAgICAgICAgICAgQ0MuTkVYVF9NQVJLRVIsIENDLkpPR19XSEVFTF9ERUMsIENDLkpPR19XSEVFTF9JTkNdLFxuICAgICAgICBDQy5TTElERVJTLFxuICAgICAgICBDQy5LTk9CUyxcbiAgICAgICAgQ0MuU09MT1MsXG4gICAgICAgIENDLk1VVEVTLFxuICAgICAgICBDQy5SRUNTLFxuICAgICAgICBDQy5TRUxTLFxuICAgIF0ucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0KSB7IHJldHVybiBwcmV2LmNvbmNhdChuZXh0KTsgfSwgW10pO1xuICAgIHJldHVybiBDQztcbn0oKSk7XG5leHBvcnRzLkNDID0gQ0M7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkhvc3QgPSB2b2lkIDA7XG52YXIgcGFyYW1zXzEgPSByZXF1aXJlKFwiLi9wYXJhbXNcIik7XG4vLyBpbXBvcnQgeyBrZWVwYWxpdmUgfSBmcm9tICcuL3V0aWxzJztcbi8vIE1vZGVscyB0aGUgY29ubmVjdGlvbiB0byB0aGUgQml0d2lnIGhvc3QuXG52YXIgSG9zdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIb3N0KHRyYW5zcG9ydFN0YXR1cykge1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgdGhpcy50cmFuc3BvcnQgPSBob3N0LmNyZWF0ZVRyYW5zcG9ydCgpO1xuICAgICAgICB0aGlzLmFwcGxpY2F0aW9uID0gaG9zdC5jcmVhdGVBcHBsaWNhdGlvbigpO1xuICAgICAgICB0aGlzLnRyYWNrQmFuayA9IGhvc3QuY3JlYXRlVHJhY2tCYW5rKDgsIDEsIDApO1xuICAgICAgICB0aGlzLmN1cnNvclRyYWNrID0gaG9zdC5jcmVhdGVDdXJzb3JUcmFjaygyLCAwKTtcbiAgICAgICAgdGhpcy5wcmltYXJ5RGV2aWNlID0gdGhpcy5jdXJzb3JUcmFjay5jcmVhdGVDdXJzb3JEZXZpY2UoKTtcbiAgICAgICAgdGhpcy5hcnJhbmdlciA9IGhvc3QuY3JlYXRlQXJyYW5nZXIoMCk7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbmV3IHBhcmFtc18xLlBhcmFtcygpO1xuICAgICAgICB0aGlzLmJsaW5rID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNMb29waW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNSZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0VuZ2luZU9uID0gZmFsc2U7XG4gICAgfVxuICAgIEhvc3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuYWxsSW5kaWNhdGlvbnNPZmYoKTtcbiAgICAgICAgdGhpcy5zZXR1cE9ic2VydmVycygpO1xuICAgICAgICBob3N0LnNjaGVkdWxlVGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5ibGlua1RpbWVyKCk7XG4gICAgICAgICAgICAvLyBUaGlzIGRvZXNuJ3Qgd29yayB0byBrZWVwIHRoZSBzY3JlZW4gc2F2ZXIgYXdheS4gPV89XG4gICAgICAgICAgICAvLyBrZWVwYWxpdmUoKTtcbiAgICAgICAgfSwgW10sIDIwMCk7XG4gICAgfTtcbiAgICBIb3N0LnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hbGxJbmRpY2F0aW9uc09mZigpO1xuICAgIH07XG4gICAgSG9zdC5wcm90b3R5cGUuYmxpbmtUaW1lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5ibGluayA9ICF0aGlzLmJsaW5rO1xuICAgIH07XG4gICAgLy8gVGhlcmUgYXJlIGEgbG90IG9mIHRoaW5ncyBtYXJrZWQgYXMgZGVwcmVjYXRlZCBpbiBoZXJlLCBidXQgaXQncyBnb2luZyB0byBiZSBhIGJpZ1xuICAgIC8vIGNoYW5nZSB0byB1cGRhdGUgbW9zdCBvZiB0aGVtLCBzbyBmb3Igbm93IEkganVzdCB3YW50IHRvIGdldCBpdCB3b3JraW5nIGFnYWluLlxuICAgIEhvc3QucHJvdG90eXBlLnNldHVwT2JzZXJ2ZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRyYWNrQmFuay5mb2xsb3dDdXJzb3JUcmFjayh0aGlzLmN1cnNvclRyYWNrKTtcbiAgICAgICAgdGhpcy50cmFuc3BvcnQuYWRkSXNQbGF5aW5nT2JzZXJ2ZXIoZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgICAgICBfdGhpcy5pc1BsYXlpbmcgPSBvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0LmFkZElzUmVjb3JkaW5nT2JzZXJ2ZXIoZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgICAgICBfdGhpcy5pc1JlY29yZGluZyA9IG9uO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cmFuc3BvcnQuYWRkSXNMb29wQWN0aXZlT2JzZXJ2ZXIoZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgICAgICBfdGhpcy5pc0xvb3BpbmcgPSBvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXBwbGljYXRpb24uYWRkSGFzQWN0aXZlRW5naW5lT2JzZXJ2ZXIoZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgICAgICBfdGhpcy5pc0VuZ2luZU9uID0gb247XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVyID0gdGhpc18xLnByaW1hcnlEZXZpY2UuZ2V0UGFyYW1ldGVyKHApO1xuICAgICAgICAgICAgcGFyYW1ldGVyLnNldExhYmVsKCdQJyArIChwICsgMSkpO1xuICAgICAgICAgICAgLy8gbWFjcm8uYWRkSXNNYXBwaW5nT2JzZXJ2ZXIoZ2V0T2JzZXJ2ZXJJbmRleEZ1bmMocCwgaXNNYXBwaW5nKSk7IC8vVE9ET1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBsaWtld2lzZSBkZXByZWNhdGVkLCBidXQgSSdtIG5vdCBlbnRpcmVseSBzdXJlIGhvdyB0byByZXBsYWNlIGl0LlxuICAgICAgICAgICAgdmFyIG1hY3JvID0gdGhpc18xLnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8ocCk7XG4gICAgICAgICAgICBtYWNyby5nZXRNb2R1bGF0aW9uU291cmNlKCkuYWRkSXNNYXBwaW5nT2JzZXJ2ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucGFyYW1zLmlzTWFjcm9NYXBwaW5nW3BdID0gc3RhdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRoaXNfMSA9IHRoaXM7XG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgODsgcCsrKSB7XG4gICAgICAgICAgICBfbG9vcF8xKHApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJpbWFyeURldmljZS5hZGRTZWxlY3RlZFBhZ2VPYnNlcnZlcigwLCBmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICAgICAgX3RoaXMucGFyYW1zLmN1cnJlbnRQYWdlID0gcGFnZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJpbWFyeURldmljZS5hZGRQYWdlTmFtZXNPYnNlcnZlcihmdW5jdGlvbiAobmFtZXMpIHtcbiAgICAgICAgICAgIF90aGlzLnBhcmFtcy5wYWdlTmFtZXMgPSBuYW1lcztcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRoaXNfMi50cmFja0JhbmsuZ2V0VHJhY2sodCk7XG4gICAgICAgICAgICB0cmFjay5nZXRWb2x1bWUoKS5zZXRMYWJlbChcIlZcIi5jb25jYXQodCArIDEpKTtcbiAgICAgICAgICAgIHRyYWNrLmdldFBhbigpLnNldExhYmVsKFwiUFwiLmNvbmNhdCh0ICsgMSkpO1xuICAgICAgICAgICAgdHJhY2suZ2V0U29sbygpLmFkZFZhbHVlT2JzZXJ2ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudHJhbnNwb3J0U3RhdHVzLm1peGVyU3RhdHVzW3RdLnNvbG8gPSBzdGF0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJhY2suZ2V0TXV0ZSgpLmFkZFZhbHVlT2JzZXJ2ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudHJhbnNwb3J0U3RhdHVzLm1peGVyU3RhdHVzW3RdLm11dGUgPSBzdGF0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJhY2suZ2V0QXJtKCkuYWRkVmFsdWVPYnNlcnZlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbdF0uYXJtID0gc3RhdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRoaXNfMiA9IHRoaXM7XG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgODsgdCsrKSB7XG4gICAgICAgICAgICBfbG9vcF8yKHQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBIb3N0LnByb3RvdHlwZS5hbGxJbmRpY2F0aW9uc09mZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCA4OyBwKyspIHtcbiAgICAgICAgICAgIHRoaXMucHJpbWFyeURldmljZS5nZXRQYXJhbWV0ZXIocCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnByaW1hcnlEZXZpY2UuZ2V0TWFjcm8ocCkuZ2V0QW1vdW50KCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrQmFuay5nZXRUcmFjayhwKS5nZXRWb2x1bWUoKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tCYW5rLmdldFRyYWNrKHApLmdldFBhbigpLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBIb3N0LnByb3RvdHlwZS50b2dnbGVFbmdpbmVTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNFbmdpbmVPbikge1xuICAgICAgICAgICAgdGhpcy5hcHBsaWNhdGlvbi5kZWFjdGl2YXRlRW5naW5lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFwcGxpY2F0aW9uLmFjdGl2YXRlRW5naW5lKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBIb3N0O1xufSgpKTtcbmV4cG9ydHMuSG9zdCA9IEhvc3Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkpvZ1doZWVsID0gdm9pZCAwO1xuLy8gVGhlIGRlZmF1bHQgam9nIHdoZWVsIG1vZGUgZm9yIHRoZSBTdHVkaW8ganVzdCBzZW5kcyBhIGxpbmVhciBwb3NpdGlvblxuLy8gZnJvbSAwIHRvIDEyNywgYW5kIHRoZW4gaXQgYmFpbHMuIEknbSBub3Qgc3VyZSB3aHkgdGhleSB0aG91Z2h0IHRoaXNcbi8vIHdhcyBhIGdvb2QgaWRlYSwgYnV0IHRvIG1ha2UgdGhpcyB3b3JrLCB5b3UnbGwgbmVlZCB0byB1c2UgdGhlIEtvcmdcbi8vIGVkaXRvciBhcHAgYW5kIHN3aXRjaCBpdCB0byBcIklOQy9ERUMgMVwiIG1vZGUuIE90aGVyd2lzZSwgeW91J2Qgb25seVxuLy8gZXZlciBiZSBhYmxlIHRvIHJvbGwgYXJvdW5kIGJlYXRzIDAuLjEyNy5cbnZhciBKb2dXaGVlbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKb2dXaGVlbChob3N0LCB0cmFuc3BvcnRTdGF0dXMpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMgPSB0cmFuc3BvcnRTdGF0dXM7XG4gICAgICAgIC8vdGhpcy5yZXNldFZhbHVlKDY0KTtcbiAgICB9XG4gICAgLy8gVGhpcyBkb2Vzbid0IHdvcmsuXG4gICAgLyogcmVzZXRWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICBzZW5kQ2hhbm5lbENvbnRyb2xsZXIoMTc2LCBDQy5KT0dfV0hFRUwsIHZhbHVlKTtcbiAgICB9ICovXG4gICAgSm9nV2hlZWwucHJvdG90eXBlLm9uSm9nRXZlbnQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLypjb25zdCBudW1lcmF0b3IgPSB0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkXG4gICAgICAgICAgPyAxXG4gICAgICAgICAgOiA0OyAvLyB0aGlzLmhvc3QudHJhbnNwb3J0LnRpbWVTaWduYXR1cmUoKS5nZXROdW1lcmF0b3IoKS5nZXRBc0ludCgpO1xuICAgICAgICBsZXQgY3VyUG9zID0gdGhpcy5ob3N0LnRyYW5zcG9ydC5nZXRQb3NpdGlvbigpLmdldCgpO1xuICAgICAgICBjdXJQb3MgPSBNYXRoLmZsb29yKGN1clBvcyAvIG51bWVyYXRvcikgKiBudW1lcmF0b3I7XG4gICAgICAgIGxvZyhgSm9nIGV2ZW50ICR7dmFsdWV9IC8gJHtudW1lcmF0b3J9YCk7XG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnNldFBvc2l0aW9uKGN1clBvcyAtIG51bWVyYXRvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zZXRQb3NpdGlvbihjdXJQb3MgKyBudW1lcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMucmVzZXRWYWx1ZSg2NCk7ICovXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmV3aW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LmZhc3RGb3J3YXJkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBKb2dXaGVlbDtcbn0oKSk7XG5leHBvcnRzLkpvZ1doZWVsID0gSm9nV2hlZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxFRHMgPSB2b2lkIDA7XG4vLyBNb2RlbHMgdGhlIHByb2dyYW1tYWJsZSBMRURzIG9uIHRoZSBkZXZpY2UuXG52YXIgY2NfMSA9IHJlcXVpcmUoXCIuL2NjXCIpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBMRURzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExFRHMoKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ1N0YXRlID0gKDAsIHV0aWxzXzEuZmlsbEFycmF5KShmYWxzZSwgOCk7XG4gICAgICAgIHRoaXMub3V0cHV0U3RhdGUgPSAoMCwgdXRpbHNfMS5maWxsQXJyYXkpKGZhbHNlLCA4KTtcbiAgICB9XG4gICAgTEVEcy5wcm90b3R5cGUuc2V0T3V0cHV0ID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBlbmRpbmdTdGF0ZVtpbmRleF0gPSB2YWx1ZTtcbiAgICB9O1xuICAgIExFRHMucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNjXzEuQ0MuQUxMLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2MgPSBjY18xLkNDLkFMTFtpXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlbmRpbmdTdGF0ZVtjY10gIT09IHRoaXMub3V0cHV0U3RhdGVbY2NdKSB7XG4gICAgICAgICAgICAgICAgc2VuZENoYW5uZWxDb250cm9sbGVyKDE3NiwgY2NfMS5DQy5BTExbY2NdLCB0aGlzLnBlbmRpbmdTdGF0ZVtjY10gPyAxMjcgOiAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLm91dHB1dFN0YXRlW2NjXSA9IHRoaXMucGVuZGluZ1N0YXRlW2NjXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIExFRHM7XG59KCkpO1xuZXhwb3J0cy5MRURzID0gTEVEcztcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gbmFub0tPTlRST0wgU3R1ZGlvIGNvbnRyb2wgc3VyZmFjZSBzY3JpcHRzIGZvciBCaXR3aWdcbi8vIENvcHlyaWdodCAyMDE4IEJpdHdpZyBnbWJoXG4vLyBDb3B5cmlnaHQgMjAxOCBvbGFpbXNcbi8vIENvcHlyaWdodCAyMDIzIFNvYXJpYSAvIEtheWF0ZWlhXG4vLyBMaWNlbmNlIGZvciBTb2FyaWEgLyBLYXlhdGVpYSBjaGFuZ2VzOiBNSVRcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1peGVyTW9kZSA9IGV4cG9ydHMuRGV2aWNlTW9kZSA9IGV4cG9ydHMuTW9kZUhhbmRsZXIgPSBleHBvcnRzLk1vZGUgPSB2b2lkIDA7XG52YXIgY2NfMSA9IHJlcXVpcmUoXCIuL2NjXCIpO1xuLy8gVHJhY2tzIHRoZSBkZXZpY2UgdnMgbWl4ZXIgbW9kZS4gRGV2aWNlIG1vZGUgbWVhbnMgc3R1ZmYgaXNcbi8vIG1hcHBlZCB0byB0aGUgc2VsZWN0ZWQgZGV2aWNlJ3MgY29udHJvbHMuIE1peGVyIG1hcHMgc3R1ZmYgdG9cbi8vIHRoZSBCaXR3aWcgbWl4ZXIgc2xpZGVycy5cbnZhciBNb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1vZGUoaG9zdCwgbGVkcywgdHJhbnNwb3J0U3RhdHVzKSB7XG4gICAgICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgICAgIHRoaXMubGVkcyA9IGxlZHM7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzID0gdHJhbnNwb3J0U3RhdHVzO1xuICAgICAgICB0aGlzLmRldmljZU1vZGUgPSBuZXcgRGV2aWNlTW9kZSh0aGlzLmhvc3QsIHRoaXMubGVkcywgdGhpcy50cmFuc3BvcnRTdGF0dXMpO1xuICAgICAgICB0aGlzLm1peGVyTW9kZSA9IG5ldyBNaXhlck1vZGUodGhpcy5ob3N0LCB0aGlzLmxlZHMsIHRoaXMudHJhbnNwb3J0U3RhdHVzKTtcbiAgICAgICAgdGhpcy5hY3RpdmVNb2RlID0gTW9kZS5NSVhFUjtcbiAgICAgICAgdGhpcy5hY3RpdmVIYW5kbGVyID0gdGhpcy5taXhlck1vZGU7XG4gICAgfVxuICAgIE1vZGUucHJvdG90eXBlLnN3aXRjaE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZU1vZGUgPT09IE1vZGUuTUlYRVIpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTW9kZSA9IE1vZGUuREVWSUNFO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVNb2RlID0gTW9kZS5NSVhFUjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZU1vZGUoKTtcbiAgICB9O1xuICAgIE1vZGUucHJvdG90eXBlLnVwZGF0ZU1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5hY3RpdmVNb2RlKSB7XG4gICAgICAgICAgICBjYXNlIE1vZGUuREVWSUNFOlxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlSGFuZGxlciA9IHRoaXMuZGV2aWNlTW9kZTtcbiAgICAgICAgICAgICAgICBob3N0LnNob3dQb3B1cE5vdGlmaWNhdGlvbignRGV2aWNlIE1vZGUnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTW9kZS5NSVhFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUhhbmRsZXIgPSB0aGlzLm1peGVyTW9kZTtcbiAgICAgICAgICAgICAgICBob3N0LnNob3dQb3B1cE5vdGlmaWNhdGlvbignTWl4ZXIgTW9kZScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aXZlSGFuZGxlci51cGRhdGVJbmRpY2F0aW9ucygpO1xuICAgIH07XG4gICAgTW9kZS5NSVhFUiA9IDA7XG4gICAgTW9kZS5ERVZJQ0UgPSAxO1xuICAgIHJldHVybiBNb2RlO1xufSgpKTtcbmV4cG9ydHMuTW9kZSA9IE1vZGU7XG52YXIgTW9kZUhhbmRsZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTW9kZUhhbmRsZXIoaG9zdCwgbGVkcykge1xuICAgICAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgICAgICB0aGlzLmxlZHMgPSBsZWRzO1xuICAgIH1cbiAgICBNb2RlSGFuZGxlci5wcm90b3R5cGUucHJlcGFyZU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlBMQVksIHRoaXMuaG9zdC5pc1BsYXlpbmcpO1xuICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuU1RPUCwgIXRoaXMuaG9zdC5pc1BsYXlpbmcpO1xuICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuUkVDLCB0aGlzLmhvc3QuaXNSZWNvcmRpbmcpO1xuICAgICAgICAvLyB0aGlzLmxlZHMuc2V0T3V0cHV0KENDLkNZQ0xFLCBhY3RpdmVQYWdlID09IG1peGVyUGFnZSA/IDEyNyA6IDApO1xuICAgIH07XG4gICAgcmV0dXJuIE1vZGVIYW5kbGVyO1xufSgpKTtcbmV4cG9ydHMuTW9kZUhhbmRsZXIgPSBNb2RlSGFuZGxlcjtcbnZhciBEZXZpY2VNb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhEZXZpY2VNb2RlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIERldmljZU1vZGUoaG9zdCwgbGVkcywgdHJhbnNwb3J0U3RhdHVzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhvc3QsIGxlZHMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5vbktub2IgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwID0gdGhpcy5ob3N0LnByaW1hcnlEZXZpY2UuZ2V0UGFyYW1ldGVyKGluZGV4KTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHAucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHAuc2V0KHZhbHVlLCAxMjgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEZXZpY2VNb2RlLnByb3RvdHlwZS5vblNsaWRlciA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIG0gPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRNYWNybyhpbmRleCkuZ2V0QW1vdW50KCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICBtLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtLnNldCh2YWx1ZSwgMTI4KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUuc29sb0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zZXRQYXJhbWV0ZXJQYWdlKGluZGV4KTtcbiAgICAgICAgaWYgKGluZGV4IDwgdGhpcy5ob3N0LnBhcmFtcy5wYWdlTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBob3N0LnNob3dQb3B1cE5vdGlmaWNhdGlvbihcIlBhZ2U6IFwiLmNvbmNhdCh0aGlzLmhvc3QucGFyYW1zLnBhZ2VOYW1lc1tpbmRleF0pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUubXV0ZUJ1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRNYWNybyhpbmRleCkuZ2V0TW9kdWxhdGlvblNvdXJjZSgpLnRvZ2dsZUlzTWFwcGluZygpO1xuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUucmVjQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUuc2VsQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUucHJldlRyYWNrQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgaW4gdGhlIHR5cGluZ3MuXG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb0RldmljZShEZXZpY2VUeXBlLkFOWSwgQ2hhaW5Mb2NhdGlvbi5QUkVWSU9VUyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0UHJldmlvdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUubmV4dFRyYWNrQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgaW4gdGhlIHR5cGluZ3MuXG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb0RldmljZShEZXZpY2VUeXBlLkFOWSwgQ2hhaW5Mb2NhdGlvbi5ORVhUKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5jdXJzb3JUcmFjay5zZWxlY3ROZXh0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERldmljZU1vZGUucHJvdG90eXBlLnByZXZNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb1ByZXZpb3VzUHJlc2V0Q2F0ZWdvcnkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnN3aXRjaFRvUHJldmlvdXNQcmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUubmV4dE1hcmtlckJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLnN3aXRjaFRvTmV4dFByZXNldENhdGVnb3J5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QucHJpbWFyeURldmljZS5zd2l0Y2hUb05leHRQcmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUudXBkYXRlSW5kaWNhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgODsgcCsrKSB7XG4gICAgICAgICAgICB2YXIgbWFjcm8gPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRNYWNybyhwKS5nZXRBbW91bnQoKTtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXIgPSB0aGlzLmhvc3QucHJpbWFyeURldmljZS5nZXRQYXJhbWV0ZXIocCk7XG4gICAgICAgICAgICB2YXIgdHJhY2sgPSB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKHApO1xuICAgICAgICAgICAgcGFyYW1ldGVyLnNldEluZGljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICBtYWNyby5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgdHJhY2suZ2V0Vm9sdW1lKCkuc2V0SW5kaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0cmFjay5nZXRQYW4oKS5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGV2aWNlTW9kZS5wcm90b3R5cGUucHJlcGFyZU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5wcmVwYXJlT3V0cHV0LmNhbGwodGhpcyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuU09MT1NbaV0sIHRoaXMuaG9zdC5wYXJhbXMuY3VycmVudFBhZ2UgPT09IGkpO1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLk1VVEVTW2ldLCAhIXRoaXMuaG9zdC5wYXJhbXMuaXNNYWNyb01hcHBpbmdbaV0gJiYgdGhpcy5ob3N0LmJsaW5rKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5SRUNTW2ldLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBEZXZpY2VNb2RlO1xufShNb2RlSGFuZGxlcikpO1xuZXhwb3J0cy5EZXZpY2VNb2RlID0gRGV2aWNlTW9kZTtcbnZhciBNaXhlck1vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE1peGVyTW9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBNaXhlck1vZGUoaG9zdCwgbGVkcywgdHJhbnNwb3J0U3RhdHVzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhvc3QsIGxlZHMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnRyYW5zcG9ydFN0YXR1cyA9IHRyYW5zcG9ydFN0YXR1cztcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm9uS25vYiA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHAgPSB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRQYW4oKTtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHAucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHAuc2V0KHZhbHVlLCAxMjgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLm9uU2xpZGVyID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB2YXIgdiA9IHRoaXMuaG9zdC50cmFja0JhbmsuZ2V0VHJhY2soaW5kZXgpLmdldFZvbHVtZSgpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCkge1xuICAgICAgICAgICAgdi5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdi5zZXQodmFsdWUsIDEyOCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUuc29sb0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRTb2xvKCkudG9nZ2xlKGZhbHNlKTtcbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUubXV0ZUJ1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRNdXRlKCkudG9nZ2xlKCk7XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnJlY0J1dHRvbiA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KS5nZXRBcm0oKS50b2dnbGUoKTtcbiAgICB9O1xuICAgIE1peGVyTW9kZS5wcm90b3R5cGUuc2VsQnV0dG9uID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIC8vIHRoaXMuaG9zdC50cmFja0JhbmsuZ2V0VHJhY2soaW5kZXgpLmlzQWN0aXZhdGVkKCkuc2V0KHRydWUpO1xuICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0Q2hhbm5lbCh0aGlzLmhvc3QudHJhY2tCYW5rLmdldFRyYWNrKGluZGV4KSk7XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXZUcmFja0J1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdC50cmFja0Jhbmsuc2Nyb2xsVHJhY2tzUGFnZVVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0UHJldmlvdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5uZXh0VHJhY2tCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QudHJhY2tCYW5rLnNjcm9sbFRyYWNrc1BhZ2VEb3duKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suc2VsZWN0TmV4dCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXZNYXJrZXJCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICB0cmFuc3BvcnQucHJldmlvdXNNYXJrZXIoKTsgLy8gYWN0aXZhdGUgd2hlbiBpdCBleGlzdHMgaW4gdGhlIEFQSVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS5uZXh0TWFya2VyQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgdHJhbnNwb3J0Lm5leHRNYXJrZXIoKTsgLy8gYWN0aXZhdGUgd2hlbiBpdCBleGlzdHMgaW4gdGhlIEFQSVxuICAgIH07XG4gICAgTWl4ZXJNb2RlLnByb3RvdHlwZS51cGRhdGVJbmRpY2F0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCA4OyBwKyspIHtcbiAgICAgICAgICAgIHZhciBtYWNybyA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldE1hY3JvKHApLmdldEFtb3VudCgpO1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlciA9IHRoaXMuaG9zdC5wcmltYXJ5RGV2aWNlLmdldENvbW1vblBhcmFtZXRlcihwKTtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRoaXMuaG9zdC50cmFja0JhbmsuZ2V0VHJhY2socCk7XG4gICAgICAgICAgICB0cmFjay5nZXRWb2x1bWUoKS5zZXRJbmRpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgdHJhY2suZ2V0UGFuKCkuc2V0SW5kaWNhdGlvbih0cnVlKTtcbiAgICAgICAgICAgIHBhcmFtZXRlci5zZXRJbmRpY2F0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIG1hY3JvLnNldEluZGljYXRpb24oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaXhlck1vZGUucHJvdG90eXBlLnByZXBhcmVPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUucHJlcGFyZU91dHB1dC5jYWxsKHRoaXMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sZWRzLnNldE91dHB1dChjY18xLkNDLlNPTE9TW2ldLCB0aGlzLnRyYW5zcG9ydFN0YXR1cy5taXhlclN0YXR1c1tpXS5zb2xvKTtcbiAgICAgICAgICAgIHRoaXMubGVkcy5zZXRPdXRwdXQoY2NfMS5DQy5NVVRFU1tpXSwgdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbaV0ubXV0ZSk7XG4gICAgICAgICAgICB0aGlzLmxlZHMuc2V0T3V0cHV0KGNjXzEuQ0MuUkVDU1tpXSwgdGhpcy50cmFuc3BvcnRTdGF0dXMubWl4ZXJTdGF0dXNbaV0uYXJtKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIE1peGVyTW9kZTtcbn0oTW9kZUhhbmRsZXIpKTtcbmV4cG9ydHMuTWl4ZXJNb2RlID0gTWl4ZXJNb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QYXJhbXMgPSB2b2lkIDA7XG4vLyBNb2RlbHMgcGFyYW1ldGVyIHBhZ2VzIGFuZCBwYXJhbWV0ZXJzIGZvciBERVZJQ0UgbW9kZS5cbnZhciBQYXJhbXMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyYW1zKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcbiAgICAgICAgdGhpcy5wYWdlTmFtZXMgPSBbXTtcbiAgICAgICAgdGhpcy5pc01hY3JvTWFwcGluZyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gUGFyYW1zO1xufSgpKTtcbmV4cG9ydHMuUGFyYW1zID0gUGFyYW1zO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TWVNFWCA9IHZvaWQgMDtcbnZhciBTWVNFWCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTWVNFWCgpIHtcbiAgICB9XG4gICAgLy8gRW50ZXIgbmF0aXZlIG1vZGUuXG4gICAgU1lTRVguZ29OYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbmRTeXNleChTWVNFWC5IRUFERVIgKyAnMDAgMDAgMDEgRjcnKTtcbiAgICB9O1xuICAgIC8vIEV4aXQgbmF0aXZlIG1vZGUuXG4gICAgU1lTRVgubGVhdmVOYXRpdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbmRTeXNleChTWVNFWC5IRUFERVIgKyAnMDAgMDAgMDAgRjcnKTtcbiAgICB9O1xuICAgIFNZU0VYLkhFQURFUiA9ICdGMCA0MiA0MCAwMCAwMSAxMyAwMCAnO1xuICAgIHJldHVybiBTWVNFWDtcbn0oKSk7XG5leHBvcnRzLlNZU0VYID0gU1lTRVg7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIG5hbm9LT05UUk9MIFN0dWRpbyBjb250cm9sIHN1cmZhY2Ugc2NyaXB0cyBmb3IgQml0d2lnXG4vLyBDb3B5cmlnaHQgMjAxOCBCaXR3aWcgZ21iaFxuLy8gQ29weXJpZ2h0IDIwMTggb2xhaW1zXG4vLyBDb3B5cmlnaHQgMjAyMyBTb2FyaWEgLyBLYXlhdGVpYVxuLy8gTGljZW5jZSBmb3IgU29hcmlhIC8gS2F5YXRlaWEgY2hhbmdlczogTUlUXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRyYW5zcG9ydFN0YXR1cyA9IHZvaWQgMDtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgVHJhbnNwb3J0U3RhdHVzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFRyYW5zcG9ydFN0YXR1cygpIHtcbiAgICAgICAgdGhpcy5zZXRQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RvcFByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5UHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlY1ByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5taXhlclN0YXR1cyA9ICgwLCB1dGlsc18xLmZpbGxBcnJheSkoe1xuICAgICAgICAgICAgc29sbzogZmFsc2UsXG4gICAgICAgICAgICBtdXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGFybTogZmFsc2UsXG4gICAgICAgIH0sIDgpO1xuICAgIH1cbiAgICByZXR1cm4gVHJhbnNwb3J0U3RhdHVzO1xufSgpKTtcbmV4cG9ydHMuVHJhbnNwb3J0U3RhdHVzID0gVHJhbnNwb3J0U3RhdHVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5sb2cgPSBleHBvcnRzLmtlZXBhbGl2ZSA9IGV4cG9ydHMuZmlsbEFycmF5ID0gdm9pZCAwO1xuLy8gVXRpbGl0eSBmdW5jdGlvbnMuXG52YXIgY29uZmlnID0ge1xuICAgIGVuYWJsZUxvZ2dpbmc6IHRydWUsXG4gICAgZW5hYmxlS2VlcGFsaXZlOiB0cnVlLFxufTtcbmZ1bmN0aW9uIGZpbGxBcnJheShpbml0VmFsdWUsIGNvdW50KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICByZXN1bHQucHVzaChpbml0VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy5maWxsQXJyYXkgPSBmaWxsQXJyYXk7XG5mdW5jdGlvbiBrZWVwYWxpdmUoKSB7XG4gICAgaWYgKGNvbmZpZy5lbmFibGVLZWVwYWxpdmUpIHtcbiAgICAgICAgLy8gVGhpcyBoYXMgbm8gbWVhbmluZywgaXQncyBqdXN0IHRvIGtlZXAgdGhlIGNvbnRyb2xsZXIgZnJvbSBnb2luZ1xuICAgICAgICAvLyBpbnRvIHRoZSBkaXN0cmFjdGluZyBzY3JlZW4gc2F2ZXIgbW9kZS5cbiAgICAgICAgc2VuZENoYW5uZWxDb250cm9sbGVyKDE3NiwgMTI3LCAwKTtcbiAgICB9XG59XG5leHBvcnRzLmtlZXBhbGl2ZSA9IGtlZXBhbGl2ZTtcbmZ1bmN0aW9uIGxvZyhtc2cpIHtcbiAgICBpZiAoY29uZmlnLmVuYWJsZUxvZ2dpbmcpIHtcbiAgICAgICAgcHJpbnRsbihtc2cpO1xuICAgIH1cbn1cbmV4cG9ydHMubG9nID0gbG9nO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuYW5vS09OVFJPTCBTdHVkaW8gY29udHJvbCBzdXJmYWNlIHNjcmlwdHMgZm9yIEJpdHdpZ1xuLy8gQ29weXJpZ2h0IDIwMTggQml0d2lnIGdtYmhcbi8vIENvcHlyaWdodCAyMDE4IG9sYWltc1xuLy8gQ29weXJpZ2h0IDIwMjMgU29hcmlhIC8gS2F5YXRlaWFcbi8vIExpY2VuY2UgZm9yIFNvYXJpYSAvIEtheWF0ZWlhIGNoYW5nZXM6IE1JVFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db250cm9sbGVyID0gdm9pZCAwO1xuLy8gTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNjcmlwdHMuXG5sb2FkQVBJKDEpO1xuaG9zdC5kZWZpbmVDb250cm9sbGVyKCdLb3JnJywgJ25hbm9LT05UUk9MIFN0dWRpbyAoU29hcmlhKScsICcxLjAnLCAnN2FiMzdlY2YtNGY0Mi00ODkwLTk1MTUtOTFlMjFiOWYzNTQ1JywgJ1NvYXJpYSwgb2xhaW1zLCBCaXR3aWcnKTtcbmhvc3QuZGVmaW5lTWlkaVBvcnRzKDEsIDEpO1xudmFyIGNjXzEgPSByZXF1aXJlKFwiLi9jY1wiKTtcbnZhciBob3N0XzEgPSByZXF1aXJlKFwiLi9ob3N0XCIpO1xudmFyIGpvZ18xID0gcmVxdWlyZShcIi4vam9nXCIpO1xudmFyIGxlZHNfMSA9IHJlcXVpcmUoXCIuL2xlZHNcIik7XG52YXIgbW9kZV8xID0gcmVxdWlyZShcIi4vbW9kZVwiKTtcbnZhciBzeXNleF8xID0gcmVxdWlyZShcIi4vc3lzZXhcIik7XG52YXIgdHJhbnNwb3J0XzEgPSByZXF1aXJlKFwiLi90cmFuc3BvcnRcIik7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIENvbnRyb2xsZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29udHJvbGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMgPSBuZXcgdHJhbnNwb3J0XzEuVHJhbnNwb3J0U3RhdHVzKCk7XG4gICAgICAgIHRoaXMuaG9zdCA9IG5ldyBob3N0XzEuSG9zdCh0aGlzLnRyYW5zcG9ydFN0YXR1cyk7XG4gICAgICAgIHRoaXMubGVkcyA9IG5ldyBsZWRzXzEuTEVEcygpO1xuICAgICAgICB0aGlzLm1vZGUgPSBuZXcgbW9kZV8xLk1vZGUodGhpcy5ob3N0LCB0aGlzLmxlZHMsIHRoaXMudHJhbnNwb3J0U3RhdHVzKTtcbiAgICAgICAgdGhpcy5qb2dXaGVlbCA9IG5ldyBqb2dfMS5Kb2dXaGVlbCh0aGlzLmhvc3QsIHRoaXMudHJhbnNwb3J0U3RhdHVzKTtcbiAgICAgICAgaG9zdC5nZXRNaWRpSW5Qb3J0KDApLnNldE1pZGlDYWxsYmFjayhmdW5jdGlvbiAoc3RhdHVzLCBkYXRhMSwgZGF0YTIpIHtcbiAgICAgICAgICAgIF90aGlzLm9uTWlkaShzdGF0dXMsIGRhdGExLCBkYXRhMik7XG4gICAgICAgICAgICBfdGhpcy5sZWRzLmZsdXNoKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBzeXNleF8xLlNZU0VYLmdvTmF0aXZlKCk7XG4gICAgICAgIHRoaXMuaG9zdC5pbml0KCk7XG4gICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLnVwZGF0ZUluZGljYXRpb25zKCk7XG4gICAgfVxuICAgIENvbnRyb2xsZXIucHJvdG90eXBlLmV4aXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN5c2V4XzEuU1lTRVgubGVhdmVOYXRpdmUoKTtcbiAgICAgICAgdGhpcy5ob3N0LnNodXRkb3duKCk7XG4gICAgfTtcbiAgICBDb250cm9sbGVyLnByb3RvdHlwZS5vbk1pZGkgPSBmdW5jdGlvbiAoc3RhdHVzLCBkYXRhMSwgZGF0YTIpIHtcbiAgICAgICAgKDAsIHV0aWxzXzEubG9nKShcIk1JREk6IFwiLmNvbmNhdChzdGF0dXMsIFwiIC0gXCIpLmNvbmNhdChkYXRhMSwgXCIgLSBcIikuY29uY2F0KGRhdGEyKSk7XG4gICAgICAgIHZhciBjYyA9IGRhdGExO1xuICAgICAgICB2YXIgdmFsID0gZGF0YTI7XG4gICAgICAgIGlmIChzdGF0dXMgIT09IDE3Nikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoY2MpIHtcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5TRVQ6XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMuc2V0UHJlc3NlZCA9IHZhbCA+IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuU1RPUDpcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5zdG9wUHJlc3NlZCA9IHZhbCA+IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUExBWTpcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5wbGF5UHJlc3NlZCA9IHZhbCA+IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVDOlxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0U3RhdHVzLnJlY1ByZXNzZWQgPSB2YWwgPiAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYyA9PT0gY2NfMS5DQy5KT0dfV0hFRUxfREVDKSB7XG4gICAgICAgICAgICB0aGlzLmpvZ1doZWVsLm9uSm9nRXZlbnQoLTEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYyA9PT0gY2NfMS5DQy5KT0dfV0hFRUxfSU5DKSB7XG4gICAgICAgICAgICB0aGlzLmpvZ1doZWVsLm9uSm9nRXZlbnQoMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkICYmXG4gICAgICAgICAgICB0aGlzLnRyYW5zcG9ydFN0YXR1cy5wbGF5UHJlc3NlZCAmJlxuICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRTdGF0dXMucmVjUHJlc3NlZCkge1xuICAgICAgICAgICAgdGhpcy5ob3N0LnRvZ2dsZUVuZ2luZVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTm8gaWRlYSB3aGF0IHRoaXMgaXMuXG4gICAgICAgIC8vdmFyIGluZGV4ID0gZGF0YTEgJiAweGY7XG4gICAgICAgIC8qaWYgKGRhdGExID4gNil7XG4gICAgICAgICAgc3dpdGNoIChkYXRhMSlcbiAgICAgICAgICB7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgaW5kZXggPSA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgaW5kZXggPSA2O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgaW5kZXggPSA3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpbmRleCA9IGRhdGExLTI7XG4gICAgICAgIH0qL1xuICAgICAgICAvL3ZhciBpbmRleCA9IGRhdGExO1xuICAgICAgICB2YXIgc2xpZGVySW5kZXggPSBjY18xLkNDLlNMSURFUlMuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChzbGlkZXJJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5vblNsaWRlcihzbGlkZXJJbmRleCwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIga25vYkluZGV4ID0gY2NfMS5DQy5LTk9CUy5pbmRleE9mKGNjKTtcbiAgICAgICAgaWYgKGtub2JJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5vbktub2Ioa25vYkluZGV4LCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlnbm9yZSB3aGVuIGJ1dHRvbnMgYXJlIHJlbGVhc2VkXG4gICAgICAgIGlmICh2YWwgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtdXRlSW5kZXggPSBjY18xLkNDLk1VVEVTLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAobXV0ZUluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMubW9kZS5hY3RpdmVIYW5kbGVyLm11dGVCdXR0b24obXV0ZUluZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc29sb0luZGV4ID0gY2NfMS5DQy5TT0xPUy5pbmRleE9mKGNjKTtcbiAgICAgICAgaWYgKHNvbG9JbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5zb2xvQnV0dG9uKHNvbG9JbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlY0luZGV4ID0gY2NfMS5DQy5SRUNTLmluZGV4T2YoY2MpO1xuICAgICAgICBpZiAocmVjSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIucmVjQnV0dG9uKHJlY0luZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VsSW5kZXggPSBjY18xLkNDLlNFTFMuaW5kZXhPZihjYyk7XG4gICAgICAgIGlmIChzZWxJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5zZWxCdXR0b24oc2VsSW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZS5cbiAgICAgICAgc3dpdGNoIChjYykge1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBMQVk6XG4gICAgICAgICAgICAgICAgLy8gT25lIG1pZ2h0IGdldCB0aGUgaW1wcmVzc2lvbiB0aGF0IHRoaXMgYnV0dG9uIGlzIGEgYml0IG92ZXJsb2FkZWQuIF5eO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNFbmdpbmVPbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy50cmFuc3BvcnRTdGF0dXMucmVjUHJlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJldHVyblRvQXJyYW5nZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3QuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuU1RPUDpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudHJhbnNwb3J0U3RhdHVzLnBsYXlQcmVzc2VkICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnRyYW5zcG9ydFN0YXR1cy5yZWNQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlc2V0QXV0b21hdGlvbk92ZXJyaWRlcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LnRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVDOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy50cmFuc3BvcnRTdGF0dXMucGxheVByZXNzZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMudHJhbnNwb3J0U3RhdHVzLnN0b3BQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QuY3Vyc29yVHJhY2suZ2V0QXJtKCkudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LnJlY29yZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLkNZQ0xFOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydFN0YXR1cy5zZXRQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQudG9nZ2xlTG9vcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLnN3aXRjaE1vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuUkVXOlxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdC50cmFuc3BvcnQucmV3aW5kKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuRkY6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNwb3J0U3RhdHVzLnNldFByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0LmFycmFuZ2VyLnRvZ2dsZVBsYXliYWNrRm9sbG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJhbnNwb3J0LmZhc3RGb3J3YXJkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjY18xLkNDLlBSRVZfVFJBQ0s6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIucHJldlRyYWNrQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9UUkFDSzpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5uZXh0VHJhY2tCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY2NfMS5DQy5QUkVWX01BUktFUjpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGUuYWN0aXZlSGFuZGxlci5wcmV2TWFya2VyQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNjXzEuQ0MuTkVYVF9NQVJLRVI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLmFjdGl2ZUhhbmRsZXIubmV4dE1hcmtlckJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ29udHJvbGxlcjtcbn0oKSk7XG5leHBvcnRzLkNvbnRyb2xsZXIgPSBDb250cm9sbGVyO1xudmFyIGNvbnRyb2xsZXI7XG5nbG9iYWwuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG59O1xuZ2xvYmFsLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgY29udHJvbGxlci5sZWRzLmZsdXNoKCk7XG59O1xuZ2xvYmFsLmV4aXQgPSBmdW5jdGlvbiBleGl0KCkge1xuICAgIGNvbnRyb2xsZXIuZXhpdCgpO1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==