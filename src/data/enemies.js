export const ENEMIES = {
  mossling: {
    id: 'mossling',
    name: 'Musgoso',
    maxHp: 60,
    speed: 95,
    damage: 10,
    attackCooldown: 900,
    aggroRange: 520,
    color: 0x6f8f4e,
    radius: 20,
    mastery: 2,
    drops: [
      { id: 'moss_fragment', name: 'Fragmento de Musgo', chance: 0.72, min: 1, max: 2 },
      { id: 'wild_core', name: 'Núcleo Selvagem', chance: 0.12, min: 1, max: 1 }
    ]
  }
};

export function rollDrops(enemy, rng = Math.random) {
  const result = [];
  for (const drop of enemy.drops) {
    if (rng() <= drop.chance) {
      const amount = Phaser.Math.Between(drop.min, drop.max);
      result.push({ ...drop, amount });
    }
  }
  return result;
}
