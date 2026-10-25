const SAVE_KEY = 'shattered-oath-save-v1';

const DEFAULT_SAVE = {
  version: 1,
  inventory: {},
  masteries: {
    melee: { level: 1, xp: 0 },
    parry: { level: 1, xp: 0 }
  },
  skillPoints: 0
};

const cloneDefault = () => JSON.parse(JSON.stringify(DEFAULT_SAVE));

export class SaveSystem {
  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return cloneDefault();
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefault(),
        ...parsed,
        inventory: parsed.inventory || {},
        masteries: { ...DEFAULT_SAVE.masteries, ...(parsed.masteries || {}) }
      };
    } catch {
      return cloneDefault();
    }
  }

  static save({ inventory, masteries, skillPoints }) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 1,
        inventory,
        masteries,
        skillPoints
      }));
    } catch {
      // O jogo continua funcionando mesmo se o navegador bloquear armazenamento.
    }
  }
}
