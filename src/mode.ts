// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

import { CC } from './cc';
import { Host } from './host';
import { LEDs } from './leds';
import { TransportStatus } from './transport';

// Tracks the device vs mixer mode. Device mode means stuff is
// mapped to the selected device's controls. Mixer maps stuff to
// the Bitwig mixer sliders.
export class Mode {
  static MIXER = 0;
  static DEVICE = 1;

  deviceMode: DeviceMode;
  mixerMode: MixerMode;

  activeMode: number;
  activeHandler: ModeHandler;

  constructor(
    private host: Host,
    private leds: LEDs,
    private transportStatus: TransportStatus,
  ) {
    this.deviceMode = new DeviceMode(this.host, this.leds, this.transportStatus);
    this.mixerMode = new MixerMode(this.host, this.leds, this.transportStatus);

    this.activeMode = Mode.MIXER;
    this.activeHandler = this.mixerMode;
  }

  switchMode() {
    if (this.activeMode === Mode.MIXER) {
      this.activeMode = Mode.DEVICE;
    } else {
      this.activeMode = Mode.MIXER;
    }

    this.updateMode();
  }

  updateMode() {
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
  }
}

export abstract class ModeHandler {
  constructor(
    protected host: Host,
    protected leds: LEDs
  ) {
  }

  abstract onKnob(index: number, value: number): void;
  abstract onSlider(index: number, value: number): void;
  abstract soloButton(index: number): void;
  abstract muteButton(index: number): void;
  abstract recButton(index: number): void;
  abstract selButton(index: number): void;
  abstract prevTrackButton(): void;
  abstract nextTrackButton(): void;
  abstract prevMarkerButton(): void;
  abstract nextMarkerButton(): void;
  abstract updateIndications(): void;

  prepareOutput(): void {
    this.leds.setOutput(CC.PLAY, this.host.isPlaying);
    this.leds.setOutput(CC.STOP, !this.host.isPlaying);
    this.leds.setOutput(CC.REC, this.host.isRecording);
    // this.leds.setOutput(CC.CYCLE, activePage == mixerPage ? 127 : 0);
  }
}

declare const DeviceType: typeof API.DeviceType;
declare const ChainLocation: typeof API.ChainLocation;

export class DeviceMode extends ModeHandler {
  constructor(
    host: Host,
    leds: LEDs,
    private transportStatus: TransportStatus
  ) {
    super(host, leds);
  }

  onKnob(index: number, value: number) {
    const p = this.host.primaryDevice.getParameter(index);
    if (this.transportStatus.setPressed) {
      p.reset();
    } else {
      p.set(value, 128);
    }
  }
  
  onSlider(index: number, value: number) {
    const m = this.host.primaryDevice.getMacro(index).getAmount();
    if (this.transportStatus.setPressed) {
      m.reset();
    } else {
      m.set(value, 128);
    }
  }
  
  soloButton(index: number) {
    this.host.primaryDevice.setParameterPage(index);
    if (index < this.host.params.pageNames.length) {
      host.showPopupNotification(`Page: ${this.host.params.pageNames[index]}`);
    }
  }
  
  muteButton(index: number) {
    this.host.primaryDevice.getMacro(index).getModulationSource().toggleIsMapping();
  }
  
  recButton() {
  }

  selButton() {
  }

  prevTrackButton() {
    if (!this.transportStatus.setPressed) {
      // This doesn't appear to be in the typings.
      (this.host.primaryDevice as any).switchToDevice(DeviceType.ANY, ChainLocation.PREVIOUS);
    } else {
      this.host.cursorTrack.selectPrevious();
    }
  }
  
  nextTrackButton() {
    if (!this.transportStatus.setPressed) {
      // This doesn't appear to be in the typings.
      (this.host.primaryDevice as any).switchToDevice(DeviceType.ANY, ChainLocation.NEXT);
    } else {
      this.host.cursorTrack.selectNext();
    }
  }

  prevMarkerButton() {
    if (this.transportStatus.setPressed) {
      this.host.primaryDevice.switchToPreviousPresetCategory();
    } else {
      this.host.primaryDevice.switchToPreviousPreset();
    }
  }

  nextMarkerButton() {
    if (this.transportStatus.setPressed) {
      this.host.primaryDevice.switchToNextPresetCategory();
    } else {
      this.host.primaryDevice.switchToNextPreset();
    }
  }
  
  updateIndications() {
    for (let p = 0; p < 8; p++) {
      const macro = this.host.primaryDevice.getMacro(p).getAmount();
      const parameter = this.host.primaryDevice.getParameter(p);
      const track = this.host.trackBank.getTrack(p);

      parameter.setIndication(true);
      macro.setIndication(true);
      track.getVolume().setIndication(false);
      track.getPan().setIndication(false);
    }
  }
  
  prepareOutput() {
    super.prepareOutput();
  
    for (let i = 0; i < 8; i++) {
      this.leds.setOutput(CC.SOLOS[i], this.host.params.currentPage === i);
      this.leds.setOutput(CC.MUTES[i], !!this.host.params.isMacroMapping[i] && this.host.blink);
      this.leds.setOutput(CC.RECS[i], false);
    }
  }
}

export class MixerMode extends ModeHandler {
  constructor(
    host: Host,
    leds: LEDs,
    private transportStatus: TransportStatus
  ) {
    super(host, leds);
  }

  onKnob(index: number, value: number) {
    const p = this.host.trackBank.getTrack(index).getPan();
    if (this.transportStatus.setPressed) {
      p.reset();
    } else {
      p.set(value, 128);
    }
  }
  
  onSlider(index: number, value: number) {
    const v = this.host.trackBank.getTrack(index).getVolume();
    if (this.transportStatus.setPressed) {
      v.reset();
    } else {
      v.set(value, 128);
    }
  }
  
  soloButton(index: number) {
    this.host.trackBank.getTrack(index).getSolo().toggle(false);
  }
  
  muteButton(index: number) {
    this.host.trackBank.getTrack(index).getMute().toggle();
  }
  
  recButton(index: number) {
    this.host.trackBank.getTrack(index).getArm().toggle();
  }

  selButton(index: number) {
    // this.host.trackBank.getTrack(index).isActivated().set(true);
    this.host.cursorTrack.selectChannel(this.host.trackBank.getTrack(index));
  }
  
  prevTrackButton() {
    if (this.transportStatus.setPressed) {
      this.host.trackBank.scrollTracksPageUp();
    } else {
      this.host.cursorTrack.selectPrevious();
    }
  }
  
  nextTrackButton() {
    if (this.transportStatus.setPressed) {
      this.host.trackBank.scrollTracksPageDown();
    } else {
      this.host.cursorTrack.selectNext();
    }
  }

  prevMarkerButton() {
  //  transport.previousMarker(); // activate when it exists in the API
  }

  nextMarkerButton() {
  //  transport.nextMarker(); // activate when it exists in the API
  }

  updateIndications() {
    for (let p = 0; p < 8; p++) {
      const macro = this.host.primaryDevice.getMacro(p).getAmount();
      const parameter = this.host.primaryDevice.getCommonParameter(p);
      const track = this.host.trackBank.getTrack(p);

      track.getVolume().setIndication(true);
      track.getPan().setIndication(true);
      parameter.setIndication(false);
      macro.setIndication(false);
    }
  }
  
  prepareOutput() {
    super.prepareOutput();
  
    for (let i = 0; i < 8; i++) {
      this.leds.setOutput(CC.SOLOS[i], this.transportStatus.mixerStatus[i].solo);
      this.leds.setOutput(CC.MUTES[i], this.transportStatus.mixerStatus[i].mute);
      this.leds.setOutput(CC.RECS[i], this.transportStatus.mixerStatus[i].arm);
    }
  }
}
