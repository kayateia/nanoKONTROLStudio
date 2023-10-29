// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

import { Params } from './params';
import { TransportStatus } from './transport';

// Models the connection to the Bitwig host.

export class Host {
  transport = host.createTransport();
  application = host.createApplication();
  trackBank = host.createTrackBank(8, 1, 0);
  cursorTrack = host.createCursorTrack(2, 0);
  primaryDevice = this.cursorTrack.createCursorDevice();
  arranger = host.createArranger(0);
  params = new Params();
  blink = false;
  isPlaying = false;
  isLooping = false;
  isRecording = false;
  isEngineOn = false;

  constructor(
    private transportStatus: TransportStatus
  ) {
  }
  
  init() {
    this.allIndicationsOff();
    this.setupObservers();
    host.scheduleTask(() => this.blinkTimer(), [], 200);
  }

  shutdown() {
    this.allIndicationsOff();
  }

  blinkTimer() {
    this.blink = !this.blink;
  }

  // There are a lot of things marked as deprecated in here, but it's going to be a big
  // change to update most of them, so for now I just want to get it working again.
  setupObservers() {
    this.trackBank.followCursorTrack(this.cursorTrack);

    this.transport.addIsPlayingObserver(on => {
      this.isPlaying = on;
    });
  
    this.transport.addIsRecordingObserver(on => {
      this.isRecording = on;
    });
  
    this.transport.addIsLoopActiveObserver(on => {
      this.isLooping = on;
    });

    this.application.addHasActiveEngineObserver(on => {
      this.isEngineOn = on;
    });
  
    for (let p = 0; p < 8; p++) {
      const parameter = this.primaryDevice.getParameter(p);
  
      parameter.setLabel('P' + (p + 1));
      // macro.addIsMappingObserver(getObserverIndexFunc(p, isMapping)); //TODO
  
      // This is likewise deprecated, but I'm not entirely sure how to replace it.
      const macro = this.primaryDevice.getMacro(p);
      macro.getModulationSource().addIsMappingObserver(state => {
        this.params.isMacroMapping[p] = state;
      });
    }

    this.primaryDevice.addSelectedPageObserver(0, page => {
      this.params.currentPage = page;
    });
  
    this.primaryDevice.addPageNamesObserver(names => {
      this.params.pageNames = names;
    });

    for (let t = 0; t < 8; t++) {
      const track = this.trackBank.getTrack(t);
      track.getVolume().setLabel(`V${t + 1}`);
      track.getPan().setLabel(`P${t + 1}`);

      track.getSolo().addValueObserver(state=> {
        this.transportStatus.mixerStatus[t].solo = state;
      });
      track.getMute().addValueObserver(state=> {
        this.transportStatus.mixerStatus[t].mute = state;
      });
      track.getArm().addValueObserver(state=> {
        this.transportStatus.mixerStatus[t].arm = state;
      });
    }
  }

  allIndicationsOff()  {
    for (let p = 0; p < 8; p++) {
      this.primaryDevice.getParameter(p).setIndication(false);
      this.primaryDevice.getMacro(p).getAmount().setIndication(false);
      this.trackBank.getTrack(p).getVolume().setIndication(false);
      this.trackBank.getTrack(p).getPan().setIndication(false);
    }
  }

  toggleEngineState() {
    if (this.isEngineOn) {
      this.application.deactivateEngine();
    } else {
      this.application.activateEngine();
    }
  }
}
