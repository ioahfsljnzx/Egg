import type * as Phaser from "phaser";

export interface ArcadeTextureKeys {
  egg_key: string;
  frying_pan_key: string;
  obstacle_spike_key: string;
  obstacle_crate_key: string;
  obstacle_flame_key: string;
  ground_strip_key: string;
  parallax_far_key: string;
  parallax_near_key: string;
  haze_band_key: string;
  cloud_key: string;
  dust_particle_key: string;
  spark_particle_key: string;
  ember_particle_key: string;
  shadow_oval_key: string;
}

const createHiddenGraphicsFeature = (scene: Phaser.Scene): Phaser.GameObjects.Graphics => {
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.setVisible(false);
  return graphics;
};

export const buildArcadeTexturesFeature = (
  scene: Phaser.Scene,
): ArcadeTextureKeys => {
  const eggKey = "egg_sprite_generated";
  const panKey = "frying_pan_generated";
  const spikeKey = "obstacle_spike_generated";
  const crateKey = "obstacle_crate_generated";
  const flameKey = "obstacle_flame_generated";
  const groundKey = "ground_tile_generated";
  const farLayerKey = "parallax_far_generated";
  const nearLayerKey = "parallax_near_generated";
  const hazeKey = "haze_band_generated";
  const cloudKey = "cloud_puff_generated";
  const dustKey = "dust_particle_generated";
  const sparkKey = "spark_particle_generated";
  const emberKey = "ember_particle_generated";
  const shadowKey = "shadow_oval_generated";

  if (!scene.textures.exists(eggKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xd8e0ef, 0.35);
    graphics.fillEllipse(18, 36, 18, 10);
    graphics.fillStyle(0xf7f8fb, 1);
    graphics.fillEllipse(20, 22, 27, 33);
    graphics.fillStyle(0xf2c14f, 1);
    graphics.fillCircle(21, 24, 5);
    graphics.fillStyle(0x2a3140, 0.9);
    graphics.fillCircle(25, 20, 1.6);
    graphics.fillCircle(17, 20, 1.4);
    graphics.lineStyle(2, 0xd2dae8, 0.9);
    graphics.strokeEllipse(20, 22, 27, 33);
    graphics.lineStyle(1, 0xffffff, 0.6);
    graphics.strokeEllipse(15, 16, 6, 10);
    graphics.generateTexture(eggKey, 40, 44);
    graphics.destroy();
  }

  if (!scene.textures.exists(panKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x1d2430, 1);
    graphics.fillRoundedRect(2, 14, 40, 16, 7);
    graphics.fillStyle(0x485a6f, 1);
    graphics.fillRoundedRect(36, 18, 20, 5, 2);
    graphics.fillStyle(0x323d4f, 1);
    graphics.fillRoundedRect(4, 16, 36, 12, 5);
    graphics.lineStyle(2, 0xa8bacf, 0.45);
    graphics.strokeRoundedRect(2, 14, 40, 16, 7);
    graphics.lineStyle(1, 0xffd59a, 0.25);
    graphics.strokeEllipse(20, 22, 28, 7);
    graphics.generateTexture(panKey, 58, 34);
    graphics.destroy();
  }

  if (!scene.textures.exists(spikeKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xc43f24, 0.95);
    const spikePoints = [
      [2, 28],
      [11, 15],
      [18, 28],
      [24, 9],
      [31, 28],
      [39, 13],
      [46, 28],
      [50, 28],
      [50, 34],
      [2, 34],
    ];
    graphics.beginPath();
    graphics.moveTo(spikePoints[0][0], spikePoints[0][1]);
    for (const [x, y] of spikePoints.slice(1)) {
      graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(2, 0xffd4be, 0.6);
    graphics.strokePath();
    graphics.generateTexture(spikeKey, 52, 36);
    graphics.destroy();
  }

  if (!scene.textures.exists(crateKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x5b4631, 1);
    graphics.fillRoundedRect(2, 2, 34, 34, 4);
    graphics.fillStyle(0x75593d, 1);
    graphics.fillRect(6, 6, 26, 26);
    graphics.lineStyle(2, 0x9b7956, 0.7);
    graphics.strokeRect(6, 6, 26, 26);
    graphics.lineStyle(2, 0x3d2f22, 0.75);
    graphics.strokeRoundedRect(2, 2, 34, 34, 4);
    graphics.lineBetween(8, 8, 30, 30);
    graphics.lineBetween(30, 8, 8, 30);
    graphics.generateTexture(crateKey, 38, 38);
    graphics.destroy();
  }

  if (!scene.textures.exists(flameKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xff5d2a, 0.95);
    graphics.beginPath();
    graphics.moveTo(16, 32);
    graphics.lineTo(10, 24);
    graphics.lineTo(13, 15);
    graphics.lineTo(11, 5);
    graphics.lineTo(21, 13);
    graphics.lineTo(19, 22);
    graphics.lineTo(28, 12);
    graphics.lineTo(33, 21);
    graphics.lineTo(30, 32);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xffc261, 0.9);
    graphics.beginPath();
    graphics.moveTo(18, 30);
    graphics.lineTo(16, 23);
    graphics.lineTo(18, 15);
    graphics.lineTo(20, 9);
    graphics.lineTo(24, 15);
    graphics.lineTo(22, 21);
    graphics.lineTo(27, 25);
    graphics.lineTo(24, 30);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture(flameKey, 42, 34);
    graphics.destroy();
  }

  if (!scene.textures.exists(groundKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x161f29, 1);
    graphics.fillRect(0, 0, 256, 72);
    graphics.fillStyle(0x223140, 1);
    graphics.fillRect(0, 15, 256, 12);
    graphics.fillStyle(0x10171e, 0.96);
    for (let x = 0; x < 256; x += 32) {
      graphics.fillRect(x + 2, 38, 22, 8);
      graphics.fillRect(x + 10, 52, 18, 6);
    }
    graphics.fillStyle(0xff8e2e, 0.12);
    graphics.fillRect(0, 28, 256, 3);
    graphics.lineStyle(2, 0x526476, 0.55);
    graphics.strokeRect(0, 0, 256, 72);
    graphics.generateTexture(groundKey, 256, 72);
    graphics.destroy();
  }

  if (!scene.textures.exists(farLayerKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x111820, 0.95);
    graphics.fillRect(0, 110, 512, 50);
    graphics.fillStyle(0x1a2430, 0.92);
    const points = [
      [0, 118],
      [38, 104],
      [72, 118],
      [128, 92],
      [182, 120],
      [240, 98],
      [286, 124],
      [342, 90],
      [402, 118],
      [456, 96],
      [512, 124],
      [512, 160],
      [0, 160],
    ];
    graphics.beginPath();
    graphics.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) {
      graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xffb340, 0.06);
    graphics.fillRect(0, 112, 512, 4);
    graphics.generateTexture(farLayerKey, 512, 160);
    graphics.destroy();
  }

  if (!scene.textures.exists(nearLayerKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x17212b, 0.96);
    const points = [
      [0, 144],
      [24, 126],
      [56, 136],
      [92, 102],
      [138, 138],
      [178, 112],
      [214, 134],
      [260, 100],
      [304, 142],
      [350, 116],
      [394, 136],
      [440, 106],
      [486, 142],
      [512, 130],
      [512, 180],
      [0, 180],
    ];
    graphics.beginPath();
    graphics.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) {
      graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xff6b35, 0.08);
    for (let x = 0; x < 512; x += 44) {
      graphics.fillRect(x, 140 + (x % 3), 22, 3);
    }
    graphics.generateTexture(nearLayerKey, 512, 180);
    graphics.destroy();
  }

  if (!scene.textures.exists(hazeKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xff9f3a, 0.05);
    graphics.fillRect(0, 0, 512, 80);
    graphics.fillStyle(0xffffff, 0.035);
    for (let x = -20; x < 540; x += 72) {
      graphics.fillEllipse(x, 38 + (x % 20), 90, 20);
    }
    graphics.fillStyle(0xff6b35, 0.03);
    for (let x = 0; x < 512; x += 96) {
      graphics.fillEllipse(x + 20, 52, 120, 26);
    }
    graphics.generateTexture(hazeKey, 512, 80);
    graphics.destroy();
  }

  if (!scene.textures.exists(cloudKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xdde8f7, 0.2);
    graphics.fillEllipse(20, 26, 32, 18);
    graphics.fillEllipse(42, 20, 34, 24);
    graphics.fillEllipse(66, 28, 36, 20);
    graphics.fillEllipse(50, 32, 64, 22);
    graphics.fillStyle(0xffffff, 0.07);
    graphics.fillEllipse(42, 18, 22, 10);
    graphics.generateTexture(cloudKey, 96, 52);
    graphics.destroy();
  }

  if (!scene.textures.exists(dustKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xf7d6a1, 0.9);
    graphics.fillCircle(4, 4, 3.6);
    graphics.generateTexture(dustKey, 8, 8);
    graphics.destroy();
  }

  if (!scene.textures.exists(sparkKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xffe2b2, 0.95);
    graphics.beginPath();
    graphics.moveTo(5, 0);
    graphics.lineTo(7, 5);
    graphics.lineTo(5, 10);
    graphics.lineTo(3, 5);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture(sparkKey, 10, 10);
    graphics.destroy();
  }

  if (!scene.textures.exists(emberKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0xff7c2e, 0.95);
    graphics.fillCircle(3, 3, 2.6);
    graphics.fillStyle(0xffc66b, 0.55);
    graphics.fillCircle(3, 3, 1.4);
    graphics.generateTexture(emberKey, 6, 6);
    graphics.destroy();
  }

  if (!scene.textures.exists(shadowKey)) {
    const graphics = createHiddenGraphicsFeature(scene);
    graphics.fillStyle(0x000000, 0.28);
    graphics.fillEllipse(30, 8, 54, 12);
    graphics.generateTexture(shadowKey, 60, 16);
    graphics.destroy();
  }

  return {
    egg_key: eggKey,
    frying_pan_key: panKey,
    obstacle_spike_key: spikeKey,
    obstacle_crate_key: crateKey,
    obstacle_flame_key: flameKey,
    ground_strip_key: groundKey,
    parallax_far_key: farLayerKey,
    parallax_near_key: nearLayerKey,
    haze_band_key: hazeKey,
    cloud_key: cloudKey,
    dust_particle_key: dustKey,
    spark_particle_key: sparkKey,
    ember_particle_key: emberKey,
    shadow_oval_key: shadowKey,
  };
};
