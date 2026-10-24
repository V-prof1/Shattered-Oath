import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER } from '../config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveVector = new Phaser.Math.Vector2();
    this.joystickPointerId = null;
  }

  create() {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createArena();
    this.createPlayer();
    this.createHud();
    this.createTouchControls();
    this.bindInputs();
  }

  createArena() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.ground);

    const grid = this.add.graphics();
    grid.lineStyle(1, COLORS.grid, 0.38);
    const size = 64;

    for (let x = 0; x <= GAME_WIDTH; x += size) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }

    for (let y = 0; y <= GAME_HEIGHT; y += size) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.text(GAME_WIDTH / 2, 88, 'SHATTERED OATH', {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: COLORS.text,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.9);

    this.add.text(GAME_WIDTH / 2, 126, 'FIRST PLAYABLE FOUNDATION', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLORS.muted,
      letterSpacing: 3
    }).setOrigin(0.5);
  }

  createPlayer() {
    this.player = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PLAYER.radius, COLORS.player);
    this.player.setStrokeStyle(4, COLORS.accent, 1);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(PLAYER.radius);
    this.player.body.setCollideWorldBounds(true);

    this.facing = this.add.triangle(
      this.player.x + 28,
      this.player.y,
      0, 0,
      17, 8,
      0, 16,
      COLORS.accent
    ).setOrigin(0.5);
  }

  createHud() {
    this.add.rectangle(185, 55, 330, 76, COLORS.ui, 0.86)
      .setStrokeStyle(2, 0xffffff, 0.08);

    this.add.text(38, 27, 'HP', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.text,
      fontStyle: 'bold'
    });

    this.add.rectangle(190, 39, 240, 17, 0x262c33).setOrigin(0.5);
    this.add.rectangle(70, 39, 240, 17, 0xb63b46).setOrigin(0, 0.5);

    this.add.text(38, 57, 'MAESTRIAS: protótipo', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: COLORS.muted
    });

    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 44, 'Movimente-se pelo joystick ou WASD', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: COLORS.muted,
      backgroundColor: '#0c0f13cc',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5);
  }

  createTouchControls() {
    const baseX = 150;
    const baseY = GAME_HEIGHT - 142;

    this.joystickBase = this.add.circle(baseX, baseY, 72, 0x0c0f13, 0.68)
      .setStrokeStyle(3, 0xffffff, 0.12);

    this.joystickKnob = this.add.circle(baseX, baseY, 31, 0xd8dce3, 0.32)
      .setStrokeStyle(2, 0xffffff, 0.22);

    this.joystickOrigin = new Phaser.Math.Vector2(baseX, baseY);

    this.attackButton = this.createActionButton(GAME_WIDTH - 132, GAME_HEIGHT - 142, 58, '⚔', 'ATACAR');
    this.parryButton = this.createActionButton(GAME_WIDTH - 250, GAME_HEIGHT - 102, 48, '◈', 'PARRY');
    this.dashButton = this.createActionButton(GAME_WIDTH - 260, GAME_HEIGHT - 222, 45, '↯', 'DASH');

    this.attackButton.on('pointerdown', () => this.showAction('Ataque — sistema de combate entra na próxima etapa.'));
    this.parryButton.on('pointerdown', () => this.showAction('Parry — reservado para a maestria de Parry.'));
    this.dashButton.on('pointerdown', () => this.performDash());
  }

  createActionButton(x, y, radius, icon, label) {
    const circle = this.add.circle(x, y, radius, 0x11151a, 0.78)
      .setStrokeStyle(3, 0xffffff, 0.12)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y - 5, icon, {
      fontSize: `${Math.floor(radius * 0.74)}px`,
      color: COLORS.text
    }).setOrigin(0.5);

    this.add.text(x, y + radius + 13, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: COLORS.muted
    }).setOrigin(0.5);

    return circle;
  }

  bindInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.on('pointerdown', (pointer) => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickOrigin.x, this.joystickOrigin.y);
      if (distance <= 105 && this.joystickPointerId === null) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer.id === this.joystickPointerId && pointer.isDown) {
        this.updateJoystick(pointer);
      }
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
    const dx = pointer.x - this.joystickOrigin.x;
    const dy = pointer.y - this.joystickOrigin.y;
    const vector = new Phaser.Math.Vector2(dx, dy);
    const maxDistance = 58;

    if (vector.length() > maxDistance) {
      vector.setLength(maxDistance);
    }

    this.joystickKnob.setPosition(
      this.joystickOrigin.x + vector.x,
      this.joystickOrigin.y + vector.y
    );

    this.moveVector.copy(vector).scale(1 / maxDistance);
    if (this.moveVector.length() > 1) this.moveVector.normalize();
  }

  performDash() {
    let direction = this.getMovementInput();
    if (direction.lengthSq() === 0) direction = new Phaser.Math.Vector2(1, 0);
    direction.normalize();

    this.player.x = Phaser.Math.Clamp(this.player.x + direction.x * 95, PLAYER.radius, GAME_WIDTH - PLAYER.radius);
    this.player.y = Phaser.Math.Clamp(this.player.y + direction.y * 95, PLAYER.radius, GAME_HEIGHT - PLAYER.radius);
    this.showAction('Dash!');
  }

  getMovementInput() {
    const keyboard = new Phaser.Math.Vector2(
      (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0) - (this.cursors.left.isDown || this.wasd.A.isDown ? 1 : 0),
      (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0) - (this.cursors.up.isDown || this.wasd.W.isDown ? 1 : 0)
    );

    if (keyboard.lengthSq() > 0) return keyboard.normalize();
    return this.moveVector.clone();
  }

  showAction(message) {
    this.statusText.setText(message);
    this.time.delayedCall(1200, () => {
      this.statusText.setText('Movimente-se pelo joystick ou WASD');
    });
  }

  update() {
    const direction = this.getMovementInput();
    const velocity = direction.clone();
    if (velocity.lengthSq() > 1) velocity.normalize();
    velocity.scale(PLAYER.speed);

    this.player.body.setVelocity(velocity.x, velocity.y);

    if (direction.lengthSq() > 0.01) {
      const angle = direction.angle();
      this.facing.setPosition(
        this.player.x + Math.cos(angle) * 30,
        this.player.y + Math.sin(angle) * 30
      );
      this.facing.setRotation(angle);
    } else {
      this.facing.setPosition(this.player.x + 30, this.player.y);
    }
  }
}
