// nanoKONTROL Studio control surface scripts for Bitwig
// Copyright 2018 Bitwig gmbh
// Copyright 2018 olaims
// Copyright 2023 Soaria / Kayateia
// Licence for Soaria / Kayateia changes: MIT

// Models parameter pages and parameters for DEVICE mode.
export class Params {
  currentPage = 0;
  pageNames: string[] = [];
  isMacroMapping: (boolean | undefined)[] = [];
}
