export class InventorySystem {
  constructor() {
    this.items = new Map();
  }

  add(itemId, amount = 1) {
    const next = (this.items.get(itemId) || 0) + amount;
    this.items.set(itemId, next);
    return next;
  }

  get(itemId) {
    return this.items.get(itemId) || 0;
  }

  snapshot() {
    return Object.fromEntries(this.items.entries());
  }
}
