// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

import { Host } from './host';
import { log } from './utils';

// The default jog wheel mode for the Studio just sends a linear position
// from 0 to 127, and then it bails. I'm not sure why they thought this
// was a good idea, but to make this work, you'll need to use the Korg
// editor app and switch it to "INC/DEC 1" mode. Otherwise, you'd only
// ever be able to roll around beats 0..127.

export class JogWheel {
  constructor(
    private host: Host,
  ) {
    //this.resetValue(64);
  }

  // This doesn't work.
  /* resetValue(value: number) {
    sendChannelController(176, CC.JOG_WHEEL, value);
  } */

  onJogEvent(value: number) {
    log(`Jog event ${value}`);
    if (value < 0) {
      this.host.transport.incPosition(-1, true);
    } else {
      this.host.transport.incPosition(1, true);
    }
    // this.resetValue(64);
  }
}
