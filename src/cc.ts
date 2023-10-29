// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

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

export class CC {
  static CYCLE = 54;
  static REW = 58;
  static FF = 59;
  static STOP = 63;
  static PLAY = 80;
  static REC = 81;
  static PREV_TRACK = 60;
  static NEXT_TRACK = 61;
  static SET = 55;
  static PREV_MARKER = 56;
  static NEXT_MARKER = 57;

  // This must be configured using the Korg editor app.
  static JOG_WHEEL_DEC = 85;
  static JOG_WHEEL_INC = 83;

  // These are non-contiguous for some reason.
  static SLIDERS = [2, 3, 4, 5, 6, 8, 9, 12];

  static KNOBS = [13, 14, 15, 16, 17, 18, 19, 20];
  static SOLOS = [29, 30, 31, 32, 33, 34, 35, 36, 37];
  static MUTES = [21, 22, 23, 24, 25, 26, 27, 28];
  static RECS = [38, 39, 40, 41, 42, 43, 44, 45];

  static ALL: number[] = [
    [CC.CYCLE, CC.REW, CC.FF, CC.STOP, CC.PLAY, CC.REC,
      CC.PREV_TRACK, CC.NEXT_TRACK, CC.SET, CC.PREV_MARKER,
      CC.NEXT_MARKER, CC.JOG_WHEEL_DEC, CC.JOG_WHEEL_INC],
    CC.SLIDERS,
    CC.KNOBS,
    CC.SOLOS,
    CC.MUTES,
    CC.RECS,
  ].reduce((prev, next) => prev.concat(next), []);
}
