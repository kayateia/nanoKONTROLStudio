// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Handles the SYSEX messages needed to put the controller in
// and out of native mode.

// Seems not to be defined in the typings?
declare function sendSysex(value: string): void;

export class SYSEX {
  static HEADER = 'F0 42 40 00 01 13 00 ';

  // Enter native mode.
  static goNative() {
    sendSysex(SYSEX.HEADER + '00 00 01 F7');
  }

  // Exit native mode.
  static leaveNative() {
    sendSysex(SYSEX.HEADER + '00 00 00 F7');
  }
}
