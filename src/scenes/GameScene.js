import { GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, COLORS, PLAYER } from '../config.js';
import { ENEMIES, rollDrops } from '../data/enemies.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { MasterySystem } from '../systems/MasterySystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveVector = new Phaser.Math.Vector2();
    this.joystickPointerId = null;
  }

  create() {
    this.inventory = new InventorySystem();
    this.masteries = new MasterySystem();
    this.masteries.ensure('melee');
    this.masteries.ensure('parry');

    this.playerState = {
      hp: PLAYER.maxHp,
      facing: new Phaser.Math.Vector2(1, 0),
      lastAttackAt: -Infinity,
      lastDashAt: -Infinity,
      lastParryAt: -Infinity,
      dashUntil: 0,
      parryUntil: 0,
      invulnerableUntil: 0
    };

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.createForestRegion();
    this.createPlayer();
    this.createEnemies();
    this.createHud();
    this.createTouchControls();
    this.bindInputs();

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.enemies, this.obstacles);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyContact, null, this);
    this.physics.add.overlap(this.player, this.drops, this.collectDrop, null, this);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);

    this.showAction('Protótipo da Floresta Antiga — explore, lute e colete fragmentos.');
  }

  createForestRegion() {
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, COLORS.ground);

    const path = this.add.graphics();
    path.fillStyle(COLORS.path, 1);
    path.fillRoundedRect(0, 780, WORLD_WIDTH, 250, 80);
    path.fillRoundedRect(1350, 150, 320, 1500, 90);

    this.add.rectangle(520, 1370, 720, 270, COLORS.water, 0.95).setStrokeStyle(8, 0x182e38, 1);
    this.add.text(250, 1260, 'Lago Velado', { fontFamily: 'monospace', fontSize: '20px', color: '#9fb5bd' });

    this.obstacles = this.physics.add.staticGroup();
    this.makeTreeClusters();
    this.makeRocks();
    this.makeAbandonedVillage();

    this.add.text(150, 690, 'BOSQUE EXTERIOR', {
      fontFamily: 'monospace', fontSize: '24px', color: '#d6dfd1', fontStyle: 'bold'
    });
    this.add.text(1930, 600, 'VILA ABANDONADA', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d8ccc1', fontStyle: 'bold'
    });
    this.add.text(1390, 220, 'TRILHA DO NORTE', {
      fontFamily: 'monospace', fontSize: '18px', color: '#c9c0ae'
    });
  }

  makeTreeClusters() {
    const trees = [
      [160,180],[270,220],[390,150],[520,220],[660,170],[820,230],[980,160],[1120,240],
      [1850,170],[2010,210],[2170,150],[2360,230],[2540,170],[2740,250],[2960,170],
      [180,520],[330,570],[520,500],[760,560],[1000,520],[1160,600],
      [1850,470],[2100,510],[2350,450],[2640,520],[2910,490],
      [170,1110],[360,1160],[960,1110],[1160,1210],[1810,1110],[2050,1190],[2360,1120],[2620,1200],[2940,1110],
      [170,1620],[380,1570],[720,1640],[1050,1580],[1810,1580],[2070,1650],[2450,1580],[2780,1650],[3020,1550]
    ];

    for (const [x, y] of trees) this.createTree(x, y);
  }

  createTree(x, y) {
    this.add.circle(x, y - 28, 48, COLORS.tree).setDepth(y + 1);
    this.add.circle(x - 25, y - 35, 30, 0x3d6844).setDepth(y + 1);
    this.add.circle(x + 25, y - 35, 32, 0x294e31).setDepth(y + 1);
    const trunk = this.add.rectangle(x, y + 17, 30, 48, COLORS.trunk).setDepth(y);
    this.physics.add.existing(trunk, true);
    this.obstacles.add(trunk);
  }

  makeRocks() {
    const rocks = [[720,720],[890,740],[1110,700],[1750,760],[1850,980],[2460,760],[2840,750],[1250,1430],[1760,1410],[2260,1450],[3000,1380]];
    for (const [x, y] of rocks) {
      const rock = this.add.ellipse(x, y, 75, 52, COLORS.rock).setStrokeStyle(4, 0x41484c, 1).setDepth(y);
      this.physics.add.existing(rock, true);
      this.obstacles.add(rock);
    }
  }

  makeAbandonedVillage() {
    this.createHouse(2070, 820, 230, 150);
    this.createHouse(2410, 930, 260, 170);
    this.createHouse(2780, 820, 210, 150);
    this.createHouse(2180, 1260, 220, 155);
    this.createHouse(2700, 1280, 250, 170);
  }

  createHouse(x, y, width, height) {
    const body = this.add.rectangle(x, y, width, height, COLORS.house).setStrokeStyle(5, 0x493529, 1).setDepth(y);
    this.add.triangle(x, y - height * 0.67, -width * 0.58, height * 0.38, 0, -height * 0.38, width * 0.58, height * 0.38, COLORS.roof).setDepth(y + 1);
    this.add.rectangle(x, y + height * 0.18, 42, 62, 0x2a211c).setDepth(y + 1);
    this.physics.add.existing(body, true);
    this.obstacles.add(body);
  }

  createPlayer() {
    this.player = this.add.circle(520, 880, PLAYER.radius, COLORS.player).setDepth(10000);
    this.player.setStrokeStyle(4, COLORS.accent, 1);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(PLAYER.radius);
    this.player.body.setCollideWorldBounds(true);

    this.facingMarker = this.add.triangle(0, 0, 0, 0, 17, 8, 0, 16, COLORS.accent).setOrigin(0.5).setDepth(10001);
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    this.drops = this.physics.add.group({ allowGravity: false });

    const spawns = [
      [930,850],[1120,960],[1560,650],[1780,890],[1940,700],[2280,690],
      [2530,1080],[2910,950],[1180,1280],[1650,1320],[1870,1510]
    ];
    for (const [x, y] of spawns) this.spawnEnemy('mossling', x, y);
  }

  spawnEnemy(type, x, y) {
    const data = ENEMIES[type];
    const enemy = this.add.circle(x, y, data.radius, data.color).setStrokeStyle(3, 0x1b281d, 1).setDepth(y);
    this.physics.add.existing(enemy);
    enemy.body.setCircle(data.radius);
    enemy.body.setCollideWorldBounds(true);
    enemy.enemyData = data;
    enemy.hp = data.maxHp;
    enemy.lastHitAt = -Infinity;
    enemy.stunnedUntil = 0;
    this.enemies.add(enemy);
    return enemy;
  }

  createHud() {
    this.add.rectangle(205, 58, 380, 92, COLORS.ui, 0.9).setStrokeStyle(2, 0xffffff, 0.08).setScrollFactor(0).setDepth(20000);
    this.hpBarBg = this.add.rectangle(205, 36, 290, 18, 0x262c33).setScrollFactor(0).setDepth(20001);
    this.hpBar = this.add.rectangle(60, 36, 290, 18, COLORS.accent).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20002);
    this.add.text(42, 20, 'HP', { fontFamily: 'monospace', fontSize: '14px', color: COLORS.text, fontStyle: 'bold' }).setScrollFactor(0).setDepth(20003);
    this.masteryText = this.add.text(42, 55, '', { fontFamily: 'monospace', fontSize: '13px', color: COLORS.muted }).setScrollFactor(0).setDepth(20003);
    this.lootText = this.add.text(GAME_WIDTH - 34, 24, '', { fontFamily: 'monospace', fontSize: '14px', color: COLORS.text, align: 'right', backgroundColor: '#0c0f13cc', padding: { x: 10, y: 7 } }).setOrigin(1, 0).setScrollFactor(0).setDepth(20003);
    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, '', { fontFamily: 'monospace', fontSize: '14px', color: COLORS.muted, backgroundColor: '#0c0f13dd', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20003);
    this.updateHud();
  }

  createTouchControls() {
    const baseX = 150;
    const baseY = GAME_HEIGHT - 142;
    this.joystickOrigin = new Phaser.Math.Vector2(baseX, baseY);

    this.joystickBase = this.add.circle(baseX, baseY, 72, 0x0c0f13, 0.68).setStrokeStyle(3, 0xffffff, 0.12).setScrollFactor(0).setDepth(21000);
    this.joystickKnob = this.add.circle(baseX, baseY, 31, 0xd8dce3, 0.32).setStrokeStyle(2, 0xffffff, 0.22).setScrollFactor(0).setDepth(21001);

    this.attackButton = this.createActionButton(GAME_WIDTH - 128, GAME_HEIGHT - 140, 59, '⚔', 'ATACAR');
    this.parryButton = this.createActionButton(GAME_WIDTH - 260, GAME_HEIGHT - 105, 49, '◈', 'PARRY');
    this.dashButton = this.createActionButton(GAME_WIDTH - 255, GAME_HEIGHT - 232, 45, '↯', 'DASH');

    this.attackButton.on('pointerdown', () => this.performAttack());
    this.parryButton.on('pointerdown', () => this.startParry());
    this.dashButton.on('pointerdown', () => this.performDash());
  }

  createActionButton(x, y, radius, icon, label) {
    const circle = this.add.circle(x, y, radius, 0x11151a, 0.8).setStrokeStyle(3, 0xffffff, 0.13).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(21000);
    this.add.text(x, y - 5, icon, { fontSize: `${Math.floor(radius * 0.72)}px`, color: COLORS.text }).setOrigin(0.5).setScrollFactor(0).setDepth(21001);
    this.add.text(x, y + radius + 13, label, { fontFamily: 'monospace', fontSize: '11px', color: COLORS.muted }).setOrigin(0.5).setScrollFactor(0).setDepth(21001);
    return circle;
  }

  bindInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.keyboard.on('keydown-SPACE', () => this.performAttack());
    this.input.keyboard.on('keydown-E', () => this.startParry());
    this.input.keyboard.on('keydown-SHIFT', () => this.performDash());

    this.input.on('pointerdown', (pointer) => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickOrigin.x, this.joystickOrigin.y);
      if (distance <= 105 && this.joystickPointerId === null) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer.id === this.joystickPointerId && pointer.isDown) this.updateJoystick(pointer);
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.joystickPointerId = null;
        this.moveVector.set(0, 0);
        this.joystickKnob.setPosition(this.joystickOrigin.x, this.joystickOrigin.y);
      }
    });
  }

  updateJoystick(pointer) {
    const vector = new Phaser.Math.Vector2(pointer.x - this.joystickOrigin.x, pointer.y - this.joystickOrigin.y);
    const maxDistance = 58;
    if (vector.length() > maxDistance) vector.setLength(maxDistance);
    this.joystickKnob.setPosition(this.joystickOrigin.x + vector.x, this.joystickOrigin.y + vector.y);
    this.moveVector.copy(vector).scale(1 / maxDistance);
    if (this.moveVector.length() > 1) this.moveVector.normalize();
  }

  getMovementInput() {
    const keyboard = new Phaser.Math.Vector2(
      (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0) - (this.cursors.left.isDown || this.wasd.A.isDown ? 1 : 0),
      (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0) - (this.cursors.up.isDown || this.wasd.W.isDown ? 1 : 0)
    );
    if (keyboard.lengthSq() > 0) return keyboard.normalize();
    return this.moveVector.clone();
  }

  performAttack() {
    const now = this.time.now;
    if (now - this.playerState.lastAttackAt < PLAYER.attackCooldown) return;
    if (now < this.playerState.dashUntil) return;
    this.playerState.lastAttackAt = now;

    const facing = this.playerState.facing.clone().normalize();
    const slashX = this.player.x + facing.x * 54;
    const slashY = this.player.y + facing.y * 54;
    const slash = this.add.arc(slashX, slashY, 48, -60, 60, false, 0xe7e1d2, 0.32).setRotation(facing.angle()).setDepth(15000);
    this.tweens.add({ targets: slash, alpha: 0, scale: 1.25, duration: 140, onComplete: () => slash.destroy() });

    let hits = 0;
    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active) continue;
      const toEnemy = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y);
      const distance = toEnemy.length();
      if (distance > PLAYER.attackRange || distance === 0) continue;
      const dot = facing.dot(toEnemy.clone().normalize());
      if (dot < 0.15) continue;
      hits += 1;
      this.damageEnemy(enemy, PLAYER.attackDamage, facing);
    }

    if (hits > 0) this.addMastery('melee', hits * 2);
  }

  damageEnemy(enemy, damage, direction) {
    enemy.hp -= damage;
    enemy.setFillStyle(0xd8c7a5);
    enemy.body.velocity.add(direction.clone().scale(180));
    this.time.delayedCall(90, () => { if (enemy.active) enemy.setFillStyle(enemy.enemyData.color); });

    if (enemy.hp <= 0) this.killEnemy(enemy);
  }

  killEnemy(enemy) {
    const { x, y, enemyData } = enemy;
    for (const drop of rollDrops(enemyData)) this.spawnDrop(x, y, drop);
    enemy.destroy();

    this.time.delayedCall(6000, () => {
      const rx = Phaser.Math.Clamp(x + Phaser.Math.Between(-80, 80), 80, WORLD_WIDTH - 80);
      const ry = Phaser.Math.Clamp(y + Phaser.Math.Between(-80, 80), 80, WORLD_HEIGHT - 80);
      this.spawnEnemy(enemyData.id, rx, ry);
    });
  }

  spawnDrop(x, y, drop) {
    for (let i = 0; i < drop.amount; i += 1) {
      const shard = this.add.rectangle(x + Phaser.Math.Between(-18, 18), y + Phaser.Math.Between(-18, 18), 16, 16, 0xb7d6a6).setRotation(Math.PI / 4).setStrokeStyle(2, 0xeff9e9, 0.7).setDepth(y + 5);
      this.physics.add.existing(shard);
      shard.body.setCircle(10);
      shard.dropData = { id: drop.id, name: drop.name, amount: 1 };
      this.drops.add(shard);
    }
  }

  collectDrop(_player, dropObject) {
    const drop = dropObject.dropData;
    this.inventory.add(drop.id, drop.amount);
    dropObject.destroy();
    this.showAction(`+${drop.amount} ${drop.name}`);
    this.updateHud();
  }

  startParry() {
    const now = this.time.now;
    if (now - this.playerState.lastParryAt < PLAYER.parryCooldown) return;
    this.playerState.lastParryAt = now;
    this.playerState.parryUntil = now + PLAYER.parryWindow;
    this.player.setStrokeStyle(6, 0xdfe8ff, 1);
    this.time.delayedCall(PLAYER.parryWindow, () => this.player.setStrokeStyle(4, COLORS.accent, 1));
  }

  performDash() {
    const now = this.time.now;
    if (now - this.playerState.lastDashAt < PLAYER.dashCooldown) return;
    let direction = this.getMovementInput();
    if (direction.lengthSq() === 0) direction = this.playerState.facing.clone();
    direction.normalize();
    this.playerState.lastDashAt = now;
    this.playerState.dashUntil = now + PLAYER.dashDuration;
    this.playerState.invulnerableUntil = now + PLAYER.dashDuration + 60;
    this.playerState.dashDirection = direction;
    this.player.setAlpha(0.58);
    this.time.delayedCall(PLAYER.dashDuration, () => this.player.setAlpha(1));
  }

  onEnemyContact(_player, enemy) {
    const now = this.time.now;
    if (now < this.playerState.parryUntil) {
      this.playerState.parryUntil = 0;
      enemy.stunnedUntil = now + 900;
      enemy.body.setVelocity(0, 0);
      const away = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
      enemy.body.velocity.add(away.scale(260));
      this.addMastery('parry', 4);
      this.showAction('PARRY PERFEITO');
      return;
    }

    if (now < this.playerState.invulnerableUntil || now - enemy.lastHitAt < enemy.enemyData.attackCooldown) return;
    enemy.lastHitAt = now;
    this.playerState.hp = Math.max(0, this.playerState.hp - enemy.enemyData.damage);
    this.player.setFillStyle(0xd06b6b);
    this.time.delayedCall(120, () => this.player.setFillStyle(COLORS.player));
    this.updateHud();

    if (this.playerState.hp <= 0) this.respawnPlayer();
  }

  respawnPlayer() {
    this.playerState.hp = PLAYER.maxHp;
    this.player.setPosition(520, 880);
    this.player.body.setVelocity(0, 0);
    this.playerState.invulnerableUntil = this.time.now + 1500;
    this.showAction('Você caiu e retornou ao Bosque Exterior.');
    this.updateHud();
  }

  addMastery(id, amount) {
    const result = this.masteries.addProgress(id, amount);
    if (result.levelsGained > 0) this.showAction(`${id.toUpperCase()} subiu para ${result.level} — +${result.levelsGained} ponto de habilidade`);
    this.updateHud();
  }

  updateHud() {
    const hpRatio = Phaser.Math.Clamp(this.playerState.hp / PLAYER.maxHp, 0, 1);
    this.hpBar.setDisplaySize(290 * hpRatio, 18);
    const melee = this.masteries.get('melee');
    const parry = this.masteries.get('parry');
    this.masteryText.setText(`Melee ${melee.level}  •  Parry ${parry.level}  •  Pontos ${this.masteries.skillPoints}`);
    this.lootText.setText(`Fragmentos de Musgo: ${this.inventory.get('moss_fragment')}\nNúcleos Selvagens: ${this.inventory.get('wild_core')}`);
  }

  showAction(message) {
    this.statusText.setText(message);
    if (this.statusTimer) this.statusTimer.remove(false);
    this.statusTimer = this.time.delayedCall(1900, () => this.statusText.setText(''));
  }

  update() {
    const now = this.time.now;
    let direction = this.getMovementInput();

    if (now < this.playerState.dashUntil) {
      direction = this.playerState.dashDirection.clone();
      this.player.body.setVelocity(direction.x * PLAYER.dashSpeed, direction.y * PLAYER.dashSpeed);
    } else {
      if (direction.lengthSq() > 1) direction.normalize();
      this.player.body.setVelocity(direction.x * PLAYER.speed, direction.y * PLAYER.speed);
    }

    if (direction.lengthSq() > 0.01 && now >= this.playerState.dashUntil) this.playerState.facing.copy(direction).normalize();
    const angle = this.playerState.facing.angle();
    this.facingMarker.setPosition(this.player.x + Math.cos(angle) * 31, this.player.y + Math.sin(angle) * 31).setRotation(angle);
    this.player.setDepth(this.player.y + 1000);

    this.updateEnemies(now);
  }

  updateEnemies(now) {
    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active) continue;
      enemy.setDepth(enemy.y);
      if (now < enemy.stunnedUntil) {
        enemy.body.setDrag(700, 700);
        continue;
      }
      enemy.body.setDrag(0, 0);
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (distance <= enemy.enemyData.aggroRange && distance > 34) {
        const direction = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y).normalize();
        enemy.body.setVelocity(direction.x * enemy.enemyData.speed, direction.y * enemy.enemyData.speed);
      } else {
        enemy.body.setVelocity(0, 0);
      }
    }
  }
}
