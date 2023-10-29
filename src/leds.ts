// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Models the programmable LEDs on the device.

import { CC } from './cc';
import { fillArray } from './utils';

export declare function sendChannelController(status: number, cc: number, value: number): void;

export class LEDs {
  pendingState: boolean[] = fillArray(false, 8);
  outputState: boolean[] = fillArray(false, 8);

  constructor() {}

  setOutput(index: number, value: boolean) {
    this.pendingState[index] = value;
  }

  flush() {
    for (let i=0; i<CC.ALL.length; i++) {
      const cc = CC.ALL[i];
      if (this.pendingState[cc] !== this.outputState[cc]) {
        sendChannelController(176, CC.ALL[cc], this.pendingState[cc] ? 127 : 0);
        this.outputState[cc] = this.pendingState[cc];
      }
    }
  }
}
