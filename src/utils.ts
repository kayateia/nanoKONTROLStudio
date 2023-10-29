// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Utility functions.

export function fillArray<T>(initValue: T, count: number): T[] {
  const result: T[] = [];
  for (let i=0; i<count; i++) {
    result.push(initValue);
  }

  return result;
}

export function log(msg: string) {
  println(msg);
}
