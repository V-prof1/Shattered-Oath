import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER } from '../config.js';

export class HubScene extends Phaser.Scene {
  constructor() {
    super('HubScene');
    this.moveVector = new Phaser.Math.Vector2();
    this.joystickPointerId = null;
  }

  create() {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.createCitadel();
    this.createPlayer();
    this.createControls();
    this.bindInputs();

    this.physics.add.overlap(this.player, this.forestPortalZone, () => {
      if (this.transitioning) return;
      this.transitioning = true;
      this.cameras.main.fadeOut(250, 10, 13, 16);
      this.time.delayedCall(260, () => this.scene.start('GameScene'));
    });
  }

  createCitadel() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x16191d);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 740, 440, 0x272a30).setStrokeStyle(8, 0x0d0f12, 0.8);
    this.add.rectangle(GAME_WIDTH / 2, 585, 520, 160, 0x202329);

    this.add.text(GAME_WIDTH / 2, 48, 'CIDADELA DO JURAMENTO', {
      fontFamily: 'monospace', fontSize: '29px', color: COLORS.text, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 82, 'O NÚCLEO FRATURADO', {
      fontFamily: 'monospace', fontSize: '13px', color: COLORS.muted, letterSpacing: 3
    }).setOrigin(0.5);

    this.add.circle(GAME_WIDTH / 2, 310, 78, 0x2b3037).setStrokeStyle(5, 0x59626c, 0.7);
    this.add.polygon(GAME_WIDTH / 2, 300, [0,-58, 33,-12, 18,48, -17,62, -34,-5], 0xb7b5c9, 0.82).setStrokeStyle(4, COLORS.accent, 0.8);
    this.add.text(GAME_WIDTH / 2, 402, 'NÚCLEO', { fontFamily: 'monospace', fontSize: '12px', color: COLORS.muted }).setOrigin(0.5);

    this.createStation(320, 240, 'FERREIRO', '⚒');
    this.createStation(320, 445, 'MERCADOR', '¤');
    this.createStation(960, 445, 'MESTRES', '✦');
    this.createStation(960, 240, 'TREINAMENTO', '◈');

    this.createSealedPortal(210, 590, 'PÂNTANO');
    this.createSealedPortal(475, 615, 'MONTANHAS');
    this.createSealedPortal(805, 615, '???');

    const portalX = 1080;
    const portalY = 585;
    this.add.ellipse(portalX, portalY, 125, 155, 0x294e31, 0.86).setStrokeStyle(6, 0x84b56e, 0.8);
    this.add.ellipse(portalX, portalY, 75, 110, 0x14271a, 1).setStrokeStyle(3, 0xc2d7b8, 0.45);
    this.add.text(portalX, 680, 'FLORESTA ANTIGA', { fontFamily: 'monospace', fontSize: '13px', color: '#c9ddc1', fontStyle: 'bold' }).setOrigin(0.5);
    this.forestPortalZone = this.add.zone(portalX, portalY, 105, 135);
    this.physics.add.existing(this.forestPortalZone, true);
  }

  createStation(x, y, label, icon) {
    this.add.rectangle(x, y, 190, 88, 0x1c2025).setStrokeStyle(3, 0x434a52, 0.7);
    this.add.text(x, y - 11, icon, { fontSize: '28px', color: COLORS.text }).setOrigin(0.5);
    this.add.text(x, y + 26, label, { fontFamily: 'monospace', fontSize: '12px', color: COLORS.muted }).setOrigin(0.5);
  }

  createSealedPortal(x, y, label) {
    this.add.ellipse(x, y, 88, 112, 0x202329).setStrokeStyle(4, 0x454a52, 0.7);
    this.add.text(x, y, '×', { fontFamily: 'monospace', fontSize: '34px', color: '#6c727a' }).setOrigin(0.5);
    this.add.text(x, y + 72, label, { fontFamily: 'monospace', fontSize: '11px', color: '#707780' }).setOrigin(0.5);
  }

  createPlayer() {
    this.player = this.add.circle(640, 540, PLAYER.radius, COLORS.player).setStrokeStyle(4, COLORS.accent, 1);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(PLAYER.radius);
    this.player.body.setCollideWorldBounds(true);
  }

  createControls() {
    const baseX = 145;
    const baseY = GAME_HEIGHT - 132;
    this.joystickOrigin = new Phaser.Math.Vector2(baseX, baseY);
    this.add.circle(baseX, baseY, 68, 0x0c0f13, 0.65).setStrokeStyle(3, 0xffffff, 0.12);
    this.joystickKnob = this.add.circle(baseX, baseY, 29, 0xd8dce3, 0.32).setStrokeStyle(2, 0xffffff, 0.2);

    this.add.text(GAME_WIDTH - 34, 28, 'Entre no portal verde para explorar a Floresta Antiga', {
      fontFamily: 'monospace', fontSize: '13px', color: COLORS.muted, backgroundColor: '#0c0f13cc', padding: { x: 10, y: 7 }
    }).setOrigin(1, 0);
  }

  bindInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.on('pointerdown', (pointer) => {
      const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickOrigin.x, this.joystickOrigin.y);
      if (d <= 100 && this.joystickPointerId === null) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
      }
    });
    this.input.on('pointermove', (pointer) => {
      if (pointer.id === this.joystickPointerId && pointer.isDown) this.updateJoystick(pointer);
    });
    this.input.on('pointerup', (pointer) => {
      if (pointer.id !== this.joystickPointerId) return;
      this.joystickPointerId = null;
      this.moveVector.set(0, 0);
      this.joystickKnob.setPosition(this.joystickOrigin.x, this.joystickOrigin.y);
    });
  }

  updateJoystick(pointer) {
    const v = new Phaser.Math.Vector2(pointer.x - this.joystickOrigin.x, pointer.y - this.joystickOrigin.y);
    const max = 54;
    if (v.length() > max) v.setLength(max);
    this.joystickKnob.setPosition(this.joystickOrigin.x + v.x, this.joystickOrigin.y + v.y);
    this.moveVector.copy(v).scale(1 / max);
  }

  update() {
    const keyboard = new Phaser.Math.Vector2(
      (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0) - (this.cursors.left.isDown || this.wasd.A.isDown ? 1 : 0),
      (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0) - (this.cursors.up.isDown || this.wasd.W.isDown ? 1 : 0)
    );
    const direction = keyboard.lengthSq() > 0 ? keyboard.normalize() : this.moveVector.clone();
    if (direction.lengthSq() > 1) direction.normalize();
    this.player.body.setVelocity(direction.x * PLAYER.speed, direction.y * PLAYER.speed);
  }
}
