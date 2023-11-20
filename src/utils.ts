// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Utility functions.

const config = {
  enableLogging: true,
  enableKeepalive: true,
};

export function fillArray<T>(initValue: T, count: number): T[] {
  const result: T[] = [];
  for (let i=0; i<count; i++) {
    result.push(initValue);
  }

  return result;
}

export function keepalive() {
  if (config.enableKeepalive) {
    // This has no meaning, it's just to keep the controller from going
    // into the distracting screen saver mode.
    sendChannelController(176, 127, 0);
  }
}

export function log(msg: string) {
  if (config.enableLogging) {
    println(msg);
  }
}
