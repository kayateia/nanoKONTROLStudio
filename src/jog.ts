// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

import { Host } from './host';
import { TransportStatus } from './transport';
import { log } from './utils';

// The default jog wheel mode for the Studio just sends a linear position
// from 0 to 127, and then it bails. I'm not sure why they thought this
// was a good idea, but to make this work, you'll need to use the Korg
// editor app and switch it to "INC/DEC 1" mode. Otherwise, you'd only
// ever be able to roll around beats 0..127.

export class JogWheel {
  constructor(
    private host: Host,
    private transportStatus: TransportStatus,
  ) {
    //this.resetValue(64);
  }

  // This doesn't work.
  /* resetValue(value: number) {
    sendChannelController(176, CC.JOG_WHEEL, value);
  } */

  onJogEvent(value: number) {
    const numerator = this.transportStatus.setPressed
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
    // this.resetValue(64);
  }
}
