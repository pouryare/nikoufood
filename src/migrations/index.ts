import * as migration_20261111_115438_initial from './20261111_115438_initial';
import * as migration_20261112_000501_wow_effects from './20261112_000501_wow_effects';

export const migrations = [
  {
    up: migration_20261111_115438_initial.up,
    down: migration_20261111_115438_initial.down,
    name: '20261111_115438_initial',
  },
  {
    up: migration_20261112_000501_wow_effects.up,
    down: migration_20261112_000501_wow_effects.down,
    name: '20261112_000501_wow_effects'
  },
];
