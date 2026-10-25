const BASE_REQUIREMENT = 20;

export class MasterySystem {
  constructor() {
    this.masteries = new Map();
    this.skillPoints = 0;
  }

  ensure(id) {
    if (!this.masteries.has(id)) {
      this.masteries.set(id, { level: 1, xp: 0 });
    }
    return this.masteries.get(id);
  }

  requirementFor(level) {
    return Math.floor(BASE_REQUIREMENT * Math.pow(1.14, Math.max(0, level - 1)));
  }

  addProgress(id, amount) {
    const mastery = this.ensure(id);
    mastery.xp += amount;
    let levelsGained = 0;

    while (mastery.xp >= this.requirementFor(mastery.level)) {
      mastery.xp -= this.requirementFor(mastery.level);
      mastery.level += 1;
      this.skillPoints += 1;
      levelsGained += 1;
    }

    return { ...mastery, levelsGained, skillPoints: this.skillPoints };
  }

  get(id) {
    return { ...this.ensure(id) };
  }
}
