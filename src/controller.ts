// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Main entry point for the scripts.

loadAPI(1);
host.defineController(
  'Korg',
  'nanoKONTROL Studio (Soaria)',
  '1.0',
  '7ab37ecf-4f42-4890-9515-91e21b9f3545',
  'Soaria, olaims, Bitwig'
);
host.defineMidiPorts(1, 1);

import { CC } from './cc';
import { Host } from './host';
import { JogWheel } from './jog';
import { LEDs } from './leds';
import { Mode } from './mode';
import { SYSEX } from './sysex';
import { TransportStatus } from './transport';
import { log } from './utils';

export class Controller {
  host: Host;
  transportStatus: TransportStatus;
  mode: Mode;
  leds: LEDs;
  jogWheel: JogWheel;

  constructor() {
    this.transportStatus = new TransportStatus();
    this.host = new Host(this.transportStatus);
    this.leds = new LEDs();
    this.mode = new Mode(this.host, this.leds, this.transportStatus);
    this.jogWheel = new JogWheel(this.host);

    host.getMidiInPort(0).setMidiCallback(
      (status, data1, data2) => {
        this.onMidi(status, data1, data2);
        this.leds.flush();
      }
    );

    SYSEX.goNative();
    this.host.init();

    this.mode.activeHandler.updateIndications();
  }

  exit() {
    SYSEX.leaveNative();
    this.host.shutdown();
  }

  onMidi(status: number, data1: number, data2: number): void {
    log(`MIDI: ${status} - ${data1} - ${data2}`);

    const cc = data1;
    const val = data2;
  
    if (status !== 176) {
      return;
    }

    switch (cc) {
    case CC.SET:
      this.transportStatus.setPressed = val > 0;
      break;
    case CC.STOP:
      this.transportStatus.stopPressed = val > 0;
      break;
    case CC.PLAY:
      this.transportStatus.playPressed = val > 0;
      break;
    case CC.REC:
      this.transportStatus.recPressed = val > 0;
      break;
    }

    if (cc === CC.JOG_WHEEL_DEC) {
      this.jogWheel.onJogEvent(-1);
      return;
    }
    if (cc === CC.JOG_WHEEL_INC) {
      this.jogWheel.onJogEvent(1);
      return;
    }

    if (
      this.transportStatus.stopPressed &&
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

    const sliderIndex = CC.SLIDERS.indexOf(cc);
    if (sliderIndex >= 0) {
      this.mode.activeHandler.onSlider(sliderIndex, val);
      return;
    }
    
    const knobIndex = CC.KNOBS.indexOf(cc);
    if (knobIndex >= 0) {
      this.mode.activeHandler.onKnob(knobIndex, val);
    }

    // ignore when buttons are released
    if (val <= 0) {
      return;
    }

    const muteIndex = CC.MUTES.indexOf(cc);
    if (muteIndex >= 0) {
      this.mode.activeHandler.muteButton(muteIndex);
      return;
    }

    const soloIndex = CC.SOLOS.indexOf(cc);
    if (soloIndex >= 0) {
      this.mode.activeHandler.soloButton(soloIndex);
      return;
    }

    const recIndex = CC.RECS.indexOf(cc);
    if (recIndex >= 0) {
      this.mode.activeHandler.recButton(recIndex);
      return;
    }

    // Everything else.
    switch (cc) {
    case CC.PLAY:
      // One might get the impression that this button is a bit overloaded. ^^;
      if (this.host.isEngineOn) {
        if (!this.transportStatus.stopPressed &&
            !this.transportStatus.recPressed) {
          if (this.transportStatus.setPressed) {
            this.host.transport.returnToArrangement();
          } else {
            if (this.host.isPlaying) {
              this.host.transport.restart();
            } else {
              this.host.transport.play();
            }
          }
        }
      } else {
        this.host.transport.restart();
      }
      break;

    case CC.STOP:
      if (!this.transportStatus.playPressed &&
          !this.transportStatus.recPressed) {
        if (this.transportStatus.setPressed) {
          this.host.transport.resetAutomationOverrides();
        } else {
          this.host.transport.stop();
        }
      }
      break;

    case CC.REC:
      if (!this.transportStatus.playPressed &&
          !this.transportStatus.stopPressed) {
        if (this.transportStatus.setPressed) {
          this.host.cursorTrack.getArm().toggle();
        } else {
          this.host.transport.record();
        }
      }
      break;

    case CC.CYCLE:
      if (this.transportStatus.setPressed) {
        this.host.transport.toggleLoop();
      } else {
        this.mode.switchMode();
      }
      break;

    case CC.REW:
      this.host.transport.rewind();
      break;

    case CC.FF:
      if (this.transportStatus.setPressed) {
        this.host.arranger.togglePlaybackFollow();
      } else {
        this.host.transport.fastForward();
      }
      break;

    case CC.PREV_TRACK:
      this.mode.activeHandler.prevTrackButton();
      break;

    case CC.NEXT_TRACK:
      this.mode.activeHandler.nextTrackButton();
      break;

    case CC.PREV_MARKER:
      this.mode.activeHandler.prevMarkerButton();
      break;

    case CC.NEXT_MARKER:
      this.mode.activeHandler.nextMarkerButton();
      break;
    }
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */

declare let global: any;
let controller: Controller;
global.init = function init() {
  controller = new Controller();
};

global.flush = function flush() {
  controller.leds.flush();
};

global.exit = function exit() {
  controller.exit();
};
