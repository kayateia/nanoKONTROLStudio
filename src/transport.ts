// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

import { fillArray } from './utils';

// Transport-related button status. (On the controller.)

export interface MixerStatus {
  solo: boolean;
  mute: boolean;
  arm: boolean;
}

export class TransportStatus {
  setPressed = false;
  stopPressed = false;
  playPressed = false;
  recPressed = false;

  mixerStatus = fillArray<MixerStatus>({
    solo: false,
    mute: false,
    arm: false,
  }, 8);
}
