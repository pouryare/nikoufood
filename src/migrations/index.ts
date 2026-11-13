import * as migration_20261111_115438_initial from './20261111_115438_initial';
import * as migration_20261112_000501_wow_effects from './20261112_000501_wow_effects';
import * as migration_20261112_005019_sound_on_at_start from './20261112_005019_sound_on_at_start';
import * as migration_20261112_040113_section_refresh from './20261112_040113_section_refresh';
import * as migration_20261112_211904_round_four from './20261112_211904_round_four';
import * as migration_20261113_001128_round_five from './20261113_001128_round_five';

export const migrations = [
  {
    up: migration_20261111_115438_initial.up,
    down: migration_20261111_115438_initial.down,
    name: '20261111_115438_initial',
  },
  {
    up: migration_20261112_000501_wow_effects.up,
    down: migration_20261112_000501_wow_effects.down,
    name: '20261112_000501_wow_effects',
  },
  {
    up: migration_20261112_005019_sound_on_at_start.up,
    down: migration_20261112_005019_sound_on_at_start.down,
    name: '20261112_005019_sound_on_at_start',
  },
  {
    up: migration_20261112_040113_section_refresh.up,
    down: migration_20261112_040113_section_refresh.down,
    name: '20261112_040113_section_refresh',
  },
  {
    up: migration_20261112_211904_round_four.up,
    down: migration_20261112_211904_round_four.down,
    name: '20261112_211904_round_four',
  },
  {
    up: migration_20261113_001128_round_five.up,
    down: migration_20261113_001128_round_five.down,
    name: '20261113_001128_round_five',
  },
];
