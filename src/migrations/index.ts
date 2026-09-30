import * as migration_20260930_203504_inicial from './20260930_203504_inicial';

export const migrations = [
  {
    up: migration_20260930_203504_inicial.up,
    down: migration_20260930_203504_inicial.down,
    name: '20260930_203504_inicial'
  },
];
