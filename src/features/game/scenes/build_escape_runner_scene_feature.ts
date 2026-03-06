import * as Phaser from "phaser";

import type { RidiculousRewardId } from "@/features/discovery/define_carton_riddle_registry_feature";
import { playRunnerSfxFeature, unlockRunnerAudioFeature } from "@/features/game/audio/play_runner_sfx_feature";
import { buildArcadeTexturesFeature, type ArcadeTextureKeys } from "@/features/game/sprites/build_arcade_textures_feature";
import type {
  EggCollisionGameEvent,
  GameRuntimeEvent,
  GlitchTriggerType,
  TriggerGlitchGameEvent,
} from "@/features/game/define_game_event_type";
import { useVaultStore } from "@/store/use_vault_store";

interface EscapeRunnerSceneOptions {
  on_game_event?: (event: GameRuntimeEvent) => void;
  served_overlay_copy?: RunnerServedOverlayCopy;
}

interface RunnerServedOverlayCopy {
  headline: string;
  critique_lines: string[];
  great_whisking_ready_line?: string;
}

interface RunnerBurstOptions {
  count: number;
  texture_key: string;
  max_distance_px: number;
  duration_ms: number;
  tint_hex?: number;
  scale_min?: number;
  scale_max?: number;
  alpha_start?: number;
}

interface RunnerToastOptions {
  label: string;
  duration_ms: number;
  tint_hex: string;
}

type RunnerObstacleKind = "spike" | "crate" | "flame";
type RunnerRoundEndReason = "pan_catch" | "shell_break";

type ArcadeCollisionParticipant =
  | Phaser.Physics.Arcade.Body
  | Phaser.Physics.Arcade.StaticBody
  | Phaser.Types.Physics.Arcade.GameObjectWithBody
  | Phaser.Tilemaps.Tile;

const worldWidth = 960;
const worldHeight = 540;
const groundY = 472;
const glitchSequenceKey = "GLITCH";
const resizeBurstWindowMs = 1200;
const bestScoreStorageKey = "eggcellent-runner-best-distance";

export class EscapeRunnerScene extends Phaser.Scene {
  private readonly onGameEvent?: (event: GameRuntimeEvent) => void;
  private readonly servedOverlayCopy: RunnerServedOverlayCopy;

  private textureKeys?: ArcadeTextureKeys;

  private eggSprite?: Phaser.Physics.Arcade.Sprite;
  private eggShadowSprite?: Phaser.GameObjects.Image;
  private fryingPanSprite?: Phaser.Physics.Arcade.Sprite;
  private fryingPanShadowSprite?: Phaser.GameObjects.Image;
  private obstacleGroup?: Phaser.Physics.Arcade.Group;
  private groundVisualSprite?: Phaser.GameObjects.TileSprite;
  private farParallaxSprite?: Phaser.GameObjects.TileSprite;
  private nearParallaxSprite?: Phaser.GameObjects.TileSprite;
  private hazeParallaxSprite?: Phaser.GameObjects.TileSprite;
  private cloudSprites: Phaser.GameObjects.Image[] = [];

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private restartKey?: Phaser.Input.Keyboard.Key;
  private bribeKey?: Phaser.Input.Keyboard.Key;
  private kazooKey?: Phaser.Input.Keyboard.Key;

  private scoreText?: Phaser.GameObjects.Text;
  private bestScoreText?: Phaser.GameObjects.Text;
  private shellText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;
  private gameOverContainer?: Phaser.GameObjects.Container;
  private gameOverTitleText?: Phaser.GameObjects.Text;
  private gameOverScoreText?: Phaser.GameObjects.Text;
  private gameOverBestText?: Phaser.GameObjects.Text;
  private gameOverCritiqueText?: Phaser.GameObjects.Text;
  private gameOverPromptText?: Phaser.GameObjects.Text;

  private recentKeyBuffer = "";
  private resizeBurstCount = 0;
  private lastResizeAtMs = 0;
  private pointerJumpQueued = false;
  private pointerRestartQueued = false;

  // platformer helper: track if jump button is currently held
  private jumpButtonHeld = false;

  private pendingButterShieldOnRestart = false;

  private isRoundActive = false;
  private isRoundOver = false;
  private isGlitchActive = false;
  private glitchEndsAtMs = 0;
  private roundStartedAtMs = 0;
  private roundSpeedPxPerSec = 300;
  private nextSpawnAtMs = 0;
  private scoreDistanceMeters = 0;
  private bestDistanceMeters = 0;
  private lastMilestoneScoreMeters = 0;
  private shellIntegrityPoints = 1;
  private readonly maxShellIntegrityPoints = 1;
  private invulnerableUntilMs = 0;
  private wasGroundedLastFrame = false;
  private remainingAirJumps = 0;
  private toastExpiresAtMs = 0;
  private toastStartedAtMs = 0;
  private lastPanEmberBurstAtMs = 0;
  private kazooWaveCooldownEndsAtMs = 0;
  private lastSprinkleRainAtMs = 0;

  private readonly handleWindowResizeFeature = (): void => {
    const now = Date.now();

    if (now - this.lastResizeAtMs <= resizeBurstWindowMs) {
      this.resizeBurstCount += 1;
    } else {
      this.resizeBurstCount = 1;
    }

    this.lastResizeAtMs = now;

    if (this.resizeBurstCount >= 3) {
      this.triggerGlitchFeature("window_resize_burst");
      this.resizeBurstCount = 0;
    }
  };

  constructor(options: EscapeRunnerSceneOptions = {}) {
    super("escape-runner-scene");
    this.onGameEvent = options.on_game_event;
    const critiqueLines = options.served_overlay_copy?.critique_lines;
    this.servedOverlayCopy = {
      headline: options.served_overlay_copy?.headline ?? "SESSION TERMINATED: YOU ARE NOW BRUNCH",
      critique_lines:
        critiqueLines !== undefined && critiqueLines.length > 0
          ? critiqueLines
          : [
              "Sir Toasty is deeply disappointed and claims the Chef is uploading your flavor profile to the cloud.",
            ],
      great_whisking_ready_line: options.served_overlay_copy?.great_whisking_ready_line,
    };
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#070d12");
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.textureKeys = buildArcadeTexturesFeature(this);
    this.buildParallaxStageFeature();
    this.buildGameplayActorsFeature();
    this.buildHudFeature();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.bribeKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.kazooKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    this.input.keyboard?.on("keydown", this.handleKeyboardSequenceFeature);
    this.input.on("pointerdown", this.handlePointerInputFeature, this);
    window.addEventListener("resize", this.handleWindowResizeFeature);

    this.bestDistanceMeters = this.loadBestScoreFeature();
    this.startRoundFeature(true);

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneShutdownFeature,
      this,
    );
  }

  update(_time: number, delta: number): void {
    if (!this.eggSprite || !this.fryingPanSprite) {
      return;
    }

    const deltaSeconds = delta / 1000;
    const eggBody = this.eggSprite.body;

    if (!(eggBody instanceof Phaser.Physics.Arcade.Body)) {
      return;
    }

    const keyboardJumpPressed =
      (this.cursors?.up !== undefined && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.spaceKey !== undefined && Phaser.Input.Keyboard.JustDown(this.spaceKey));

    // capture whether jump is being held for variable-height jumps / quicker gravity
    const jumpHoldDown =
      (this.cursors?.up !== undefined && this.cursors.up.isDown) ||
      (this.spaceKey !== undefined && this.spaceKey.isDown);
    this.jumpButtonHeld = jumpHoldDown;
    const restartPressed =
      (this.restartKey !== undefined && Phaser.Input.Keyboard.JustDown(this.restartKey)) ||
      false;
    const bribePressed =
      (this.bribeKey !== undefined && Phaser.Input.Keyboard.JustDown(this.bribeKey)) || false;
    const kazooPressed =
      (this.kazooKey !== undefined && Phaser.Input.Keyboard.JustDown(this.kazooKey)) ||
      false;
    const pointerJumpPressed = this.pointerJumpQueued;
    const pointerRestartPressed = this.pointerRestartQueued;

    this.pointerJumpQueued = false;
    this.pointerRestartQueued = false;

    this.updateAmbientParallaxFeature(deltaSeconds);
    this.updateCloudsFeature(deltaSeconds);
    this.updateToastFeature();

    const wantsJump = keyboardJumpPressed || pointerJumpPressed;

    if (this.isRoundOver) {
      if (bribePressed && this.canBribeToasterFeature()) {
        this.pendingButterShieldOnRestart = true;
        this.startRoundFeature(false);
        return;
      }

      if (wantsJump || restartPressed || pointerRestartPressed) {
        this.pendingButterShieldOnRestart = false;
        this.startRoundFeature(false);
      }

      this.updatePostRoundActorsFeature();
      this.updateHudFeature();
      return;
    }

    if (!this.isRoundActive) {
      this.updateHudFeature();
      return;
    }

    this.handleJumpInputFeature(wantsJump, eggBody);
    // after processing inputs we can apply modified gravity for better platformer feel
    if (kazooPressed) {
      this.tryKazooSoundwaveFeature();
    }

    if (this.isGlitchActive && this.time.now >= this.glitchEndsAtMs) {
      this.clearGlitchStateFeature();
    }

    this.updateCartonRewardPhysicsFeature(eggBody, deltaSeconds);

    const elapsedSeconds = Math.max(0, (this.time.now - this.roundStartedAtMs) / 1000);
    const baseSpeed = 300 + Math.min(220, elapsedSeconds * 16);
    const glitchSpeedFactor = this.isGlitchActive ? 0.82 : 1;
    const towelWhipstreamFactor = this.hasRidiculousRewardFeature("towel_whipstream_reward")
      ? 0.88
      : 1;
    this.roundSpeedPxPerSec = baseSpeed * glitchSpeedFactor * towelWhipstreamFactor;

    this.scrollWorldFeature(deltaSeconds);
    this.updateFryingPanFeature(deltaSeconds);
    this.updateObstaclesFeature();
    this.spawnObstacleFeature();
    this.updateEggPresentationFeature(eggBody);
    this.updateScoreFeature(deltaSeconds);
    this.updateLandingFeedbackFeature(eggBody);
    this.updateInvulnerabilityBlinkFeature();
    this.updateHudFeature();
    this.emitPanEmberBurstFeature();
    this.emitSprinkleRainFeature();
  }

  private buildParallaxStageFeature(): void {
    if (!this.textureKeys) {
      return;
    }

    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0x060a10);
    this.add.rectangle(worldWidth / 2, 110, worldWidth, 220, 0x0c1520, 0.72);
    this.add.circle(770, 98, 62, 0xff9b34, 0.12);
    this.add.circle(770, 98, 34, 0xffcf6c, 0.14);

    for (let i = 0; i < 26; i += 1) {
      this.add
        .circle(
          Phaser.Math.Between(20, worldWidth - 20),
          Phaser.Math.Between(18, 210),
          Phaser.Math.FloatBetween(0.7, 1.8),
          0xdde8ff,
          Phaser.Math.FloatBetween(0.14, 0.45),
        )
        .setDepth(0);
    }

    this.farParallaxSprite = this.add
      .tileSprite(
        worldWidth / 2,
        groundY - 118,
        worldWidth,
        160,
        this.textureKeys.parallax_far_key,
      )
      .setDepth(0.5)
      .setAlpha(0.95);

    this.hazeParallaxSprite = this.add
      .tileSprite(
        worldWidth / 2,
        groundY - 168,
        worldWidth,
        80,
        this.textureKeys.haze_band_key,
      )
      .setDepth(0.7)
      .setAlpha(0.6);
    this.hazeParallaxSprite.setBlendMode(Phaser.BlendModes.ADD);

    this.nearParallaxSprite = this.add
      .tileSprite(
        worldWidth / 2,
        groundY - 82,
        worldWidth,
        180,
        this.textureKeys.parallax_near_key,
      )
      .setDepth(0.8)
      .setAlpha(0.96);

    for (let i = 0; i < 5; i += 1) {
      const cloudSprite = this.add
        .image(
          Phaser.Math.Between(40, worldWidth - 40),
          Phaser.Math.Between(70, 220),
          this.textureKeys.cloud_key,
        )
        .setDepth(0.6)
        .setAlpha(Phaser.Math.FloatBetween(0.22, 0.44))
        .setScale(Phaser.Math.FloatBetween(0.8, 1.4));

      cloudSprite.setData("speed_factor", Phaser.Math.FloatBetween(0.08, 0.2));
      cloudSprite.setData("drift_direction", Phaser.Math.RND.sign());
      cloudSprite.setData("drift_seed", Phaser.Math.FloatBetween(0, Math.PI * 2));
      this.cloudSprites.push(cloudSprite);
    }

    this.groundVisualSprite = this.add
      .tileSprite(worldWidth / 2, groundY + 34, worldWidth, 72, this.textureKeys.ground_strip_key)
      .setDepth(1);

    this.add.rectangle(worldWidth / 2, groundY + 66, worldWidth, 24, 0x05080d, 0.7).setDepth(0.9);
  }

  private buildGameplayActorsFeature(): void {
    if (!this.textureKeys) {
      return;
    }

    const groundPlatform = this.physics.add.staticGroup();
    groundPlatform
      .create(worldWidth / 2, groundY + 34, this.textureKeys.ground_strip_key)
      .setVisible(false)
      .setAlpha(0);

    this.eggShadowSprite = this.add
      .image(188, groundY - 7, this.textureKeys.shadow_oval_key)
      .setDepth(1.9)
      .setAlpha(0.18);

    this.fryingPanShadowSprite = this.add
      .image(74, groundY - 6, this.textureKeys.shadow_oval_key)
      .setDepth(1.8)
      .setScale(0.9, 0.9)
      .setAlpha(0.16);

    this.eggSprite = this.physics.add.sprite(190, groundY - 70, this.textureKeys.egg_key);
    this.eggSprite.setDepth(4);
    this.eggSprite.setScale(1.05);
    this.eggSprite.setBounce(0.02);
    this.eggSprite.setCollideWorldBounds(true);

    if (this.eggSprite.body instanceof Phaser.Physics.Arcade.Body) {
      this.eggSprite.body.setSize(22, 31);
      this.eggSprite.body.setOffset(9, 8);
    }

    this.fryingPanSprite = this.physics.add.sprite(72, groundY - 58, this.textureKeys.frying_pan_key);
    this.fryingPanSprite.setDepth(3);
    this.fryingPanSprite.setImmovable(true);

    if (this.fryingPanSprite.body instanceof Phaser.Physics.Arcade.Body) {
      this.fryingPanSprite.body.allowGravity = false;
      this.fryingPanSprite.body.setSize(36, 12);
      this.fryingPanSprite.body.setOffset(4, 16);
    }

    this.obstacleGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.physics.add.collider(this.eggSprite, groundPlatform);
    this.physics.add.overlap(
      this.eggSprite,
      this.obstacleGroup,
      this.handleEggCollisionFeature,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.eggSprite,
      this.fryingPanSprite,
      this.handleEggCollisionFeature,
      undefined,
      this,
    );
  }

  private buildHudFeature(): void {
    this.scoreText = this.add
      .text(18, 16, "0000m", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "24px",
        color: "#eff5ff",
      })
      .setDepth(12);

    this.bestScoreText = this.add
      .text(18, 46, "BEST 0000m", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "12px",
        color: "#96a9be",
      })
      .setDepth(12);

    this.shellText = this.add
      .text(worldWidth - 18, 18, "SHELL III", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "13px",
        color: "#ffcf89",
      })
      .setOrigin(1, 0)
      .setDepth(12);

    this.promptText = this.add
      .text(worldWidth / 2, 28, "SPACE / TAP TO JUMP", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "12px",
        color: "#afc2d8",
      })
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setAlpha(0.9);

    this.toastText = this.add
      .text(worldWidth / 2, 62, "", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "13px",
        color: "#ffd58b",
      })
      .setOrigin(0.5, 0)
      .setDepth(13)
      .setAlpha(0);

    const panelBackground = this.add
      .rectangle(worldWidth / 2, worldHeight / 2, 470, 232, 0x060b12, 0.82)
      .setStrokeStyle(1, 0xffffff, 0.12);
    this.gameOverTitleText = this.add
      .text(worldWidth / 2, worldHeight / 2 - 78, this.servedOverlayCopy.headline, {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "16px",
        color: "#fff3df",
        align: "center",
        wordWrap: { width: 410, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5);
    this.gameOverScoreText = this.add
      .text(worldWidth / 2, worldHeight / 2 - 40, "DISTANCE 0000m", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "14px",
        color: "#c6d5e3",
      })
      .setOrigin(0.5, 0.5);
    this.gameOverBestText = this.add
      .text(worldWidth / 2, worldHeight / 2 - 18, "BEST 0000m", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "12px",
        color: "#9eb0c3",
      })
      .setOrigin(0.5, 0.5);
    this.gameOverCritiqueText = this.add
      .text(worldWidth / 2, worldHeight / 2 + 22, "", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "11px",
        color: "#cfdbea",
        align: "center",
        wordWrap: { width: 410, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5);
    this.gameOverPromptText = this.add
      .text(worldWidth / 2, worldHeight / 2 + 78, "SPACE / TAP = RE-SHELL THE DATA", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "11px",
        color: "#ffd58b",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.gameOverContainer = this.add
      .container(worldWidth / 2, worldHeight / 2, [
        panelBackground,
        this.gameOverTitleText,
        this.gameOverScoreText,
        this.gameOverBestText,
        this.gameOverCritiqueText,
        this.gameOverPromptText,
      ])
      .setDepth(14)
      .setVisible(false)
      .setAlpha(0);
    this.gameOverContainer.setPosition(0, 0);
  }

  private startRoundFeature(isInitialRound: boolean): void {
    this.clearRoundObstaclesFeature();

    this.isRoundActive = true;
    this.isRoundOver = false;
    this.isGlitchActive = false;
    this.glitchEndsAtMs = 0;
    this.roundStartedAtMs = this.time.now;
    this.roundSpeedPxPerSec = 300;
    this.nextSpawnAtMs = this.time.now + 950;
    this.scoreDistanceMeters = 0;
    this.lastMilestoneScoreMeters = 0;
    this.shellIntegrityPoints = this.maxShellIntegrityPoints;
    this.invulnerableUntilMs = 0;
    this.wasGroundedLastFrame = true;
    this.remainingAirJumps = this.hasRidiculousRewardFeature("platform_shoes_reward") ? 1 : 0;
    this.kazooWaveCooldownEndsAtMs = 0;
    this.lastPanEmberBurstAtMs = 0;
    this.lastSprinkleRainAtMs = 0;

    if (this.eggSprite) {
      this.eggSprite.setPosition(190, groundY - 70);
      this.eggSprite.setVelocity(0, 0);
      this.eggSprite.setTint(0xffffff);
      this.eggSprite.clearTint();
      this.eggSprite.setAlpha(1);
      this.eggSprite.setScale(1.05);
      this.eggSprite.setAngle(0);
      this.eggSprite.rotation = 0;
      if (this.eggSprite.body instanceof Phaser.Physics.Arcade.Body) {
        this.eggSprite.body.setGravityY(0);
      }
    }

    if (this.eggShadowSprite) {
      this.eggShadowSprite.setPosition(188, groundY - 7);
      this.eggShadowSprite.setAlpha(0.18);
      this.eggShadowSprite.setScale(1, 1);
    }

    if (this.fryingPanSprite) {
      this.fryingPanSprite.setPosition(72, groundY - 58);
      this.fryingPanSprite.setVelocity(0, 0);
      this.fryingPanSprite.clearTint();
      this.fryingPanSprite.setAngle(0);
      if (this.fryingPanSprite.body instanceof Phaser.Physics.Arcade.Body) {
        this.fryingPanSprite.body.allowGravity = false;
      }
    }

    if (this.fryingPanShadowSprite) {
      this.fryingPanShadowSprite.setPosition(74, groundY - 6);
      this.fryingPanShadowSprite.setAlpha(0.16);
    }

    if (this.promptText) {
      const promptSuffix = this.hasRidiculousRewardFeature("kazoo_soundwaves_reward")
        ? " | K = KAZOO"
        : "";
      this.promptText.setText(`SPACE / TAP TO JUMP${promptSuffix}`);
      this.promptText.setAlpha(0.92);
      this.promptText.setVisible(true);
    }

    if (this.toastText) {
      this.toastText.setAlpha(0);
      this.toastText.setText("");
    }
    this.toastStartedAtMs = 0;
    this.toastExpiresAtMs = 0;

    if (this.gameOverContainer) {
      this.gameOverContainer.setVisible(false);
      this.gameOverContainer.setAlpha(0);
    }

    this.cameras.main.setBackgroundColor(this.isGlitchActive ? "#150e14" : "#070d12");

    if (this.pendingButterShieldOnRestart) {
      this.invulnerableUntilMs = this.time.now + 3000;
      this.pendingButterShieldOnRestart = false;
    }

    if (!isInitialRound) {
      playRunnerSfxFeature("restart");
      this.showToastFeature({
        label:
          this.invulnerableUntilMs > this.time.now
            ? "BRIBE ACCEPTED // BUTTER SHIELD 3.0S"
            : "RUN RESUMED",
        duration_ms: 850,
        tint_hex: this.invulnerableUntilMs > this.time.now ? "#ffe7a5" : "#ffd58b",
      });
    }

    if (
      this.countGoldenYolksFeature() >= 5 &&
      this.servedOverlayCopy.great_whisking_ready_line !== undefined
    ) {
      this.time.delayedCall(isInitialRound ? 550 : 980, () => {
        if (!this.isRoundActive || this.isRoundOver) {
          return;
        }

        this.showToastFeature({
          label: "GREAT WHISKING ARMED",
          duration_ms: 1150,
          tint_hex: "#b7ffcb",
        });
      });
    }
  }

  private clearRoundObstaclesFeature(): void {
    if (!this.obstacleGroup) {
      return;
    }

    for (const obstacleObject of this.obstacleGroup.getChildren()) {
      obstacleObject.destroy();
    }
  }

  private hasRidiculousRewardFeature(rewardId: RidiculousRewardId): boolean {
    return useVaultStore.getState().ridiculous_rewards.includes(rewardId);
  }

  private countRidiculousRewardsFeature(): number {
    return useVaultStore.getState().ridiculous_rewards.length;
  }

  private countGoldenYolksFeature(): number {
    return useVaultStore.getState().solved_carton_riddles.length;
  }

  private canBribeToasterFeature(): boolean {
    return this.countGoldenYolksFeature() > 0;
  }

  private updateCartonRewardPhysicsFeature(
    eggBody: Phaser.Physics.Arcade.Body,
    deltaSeconds: number,
  ): void {
    let gravityOffsetY = this.isGlitchActive ? -420 : 0;

    // platformer-style gravity tweaks: faster falling and short hops if jump released early
    if (eggBody.velocity.y > 0) {
      // falling: increase gravity to drop quicker
      gravityOffsetY += 560; // base fall gravity boost
    } else if (eggBody.velocity.y < 0 && !this.jumpButtonHeld) {
      // rising but jump released: apply a modest bump for shorter jump
      gravityOffsetY += 320;
    }

    if (this.hasRidiculousRewardFeature("sprinkle_rain_reward")) {
      gravityOffsetY -= 230;

      if (eggBody.velocity.y > 190) {
        eggBody.setVelocityY(eggBody.velocity.y * (1 - Math.min(0.08, deltaSeconds * 2.4)));
      }
    }

    eggBody.setGravityY(gravityOffsetY);
  }

  private tryKazooSoundwaveFeature(): void {
    if (
      !this.hasRidiculousRewardFeature("kazoo_soundwaves_reward") ||
      !this.obstacleGroup ||
      !this.eggSprite ||
      this.time.now < this.kazooWaveCooldownEndsAtMs
    ) {
      return;
    }

    let targetObstacle: Phaser.Physics.Arcade.Sprite | null = null;

    for (const obstacleObject of this.obstacleGroup.getChildren()) {
      if (!(obstacleObject instanceof Phaser.Physics.Arcade.Sprite)) {
        continue;
      }

      if (obstacleObject.x < this.eggSprite.x - 24 || obstacleObject.x > this.eggSprite.x + 280) {
        continue;
      }

      if (targetObstacle === null || obstacleObject.x < targetObstacle.x) {
        targetObstacle = obstacleObject;
      }
    }

    this.kazooWaveCooldownEndsAtMs = this.time.now + 950;

    const waveRing = this.add
      .circle((this.eggSprite.x ?? 0) + 12, (this.eggSprite.y ?? 0) + 4, 10, 0xffd991, 0.14)
      .setStrokeStyle(2, 0xffd991, 0.5)
      .setDepth(8);

    this.tweens.add({
      targets: waveRing,
      scaleX: 7,
      scaleY: 2.2,
      alpha: 0,
      duration: 260,
      ease: "Quad.Out",
      onComplete: () => {
        waveRing.destroy();
      },
    });

    playRunnerSfxFeature("score_milestone");

    if (!targetObstacle) {
      this.showToastFeature({
        label: "KAZOO: NO TARGET",
        duration_ms: 500,
        tint_hex: "#ffe1a1",
      });
      return;
    }

    this.spawnBurstFeature(targetObstacle.x, targetObstacle.y, {
      count: 10,
      texture_key: this.textureKeys?.spark_particle_key ?? "",
      max_distance_px: 48,
      duration_ms: 280,
      tint_hex: 0xffe3ab,
      scale_min: 0.85,
      scale_max: 1.4,
      alpha_start: 0.9,
    });
    targetObstacle.destroy();
    this.scoreDistanceMeters += 14;

    this.showToastFeature({
      label: "KAZOO SOUNDWAVE",
      duration_ms: 650,
      tint_hex: "#ffe1a1",
    });
  }

  private emitSprinkleRainFeature(): void {
    if (!this.textureKeys || !this.hasRidiculousRewardFeature("sprinkle_rain_reward")) {
      return;
    }

    if (this.time.now - this.lastSprinkleRainAtMs < 140) {
      return;
    }

    this.lastSprinkleRainAtMs = this.time.now;

    const sprinkle = this.add
      .image(
        Phaser.Math.Between(10, worldWidth - 10),
        Phaser.Math.Between(-8, 26),
        this.textureKeys.spark_particle_key,
      )
      .setDepth(0.95)
      .setScale(Phaser.Math.FloatBetween(0.45, 0.75))
      .setRotation(Phaser.Math.FloatBetween(-0.4, 0.4))
      .setTint(Phaser.Utils.Array.GetRandom([0xffe59b, 0xff9bd7, 0x9bdeff, 0xbaffb2]))
      .setAlpha(0.85);

    this.tweens.add({
      targets: sprinkle,
      x: sprinkle.x + Phaser.Math.Between(-26, 26),
      y: worldHeight + 10,
      alpha: 0.05,
      duration: Phaser.Math.Between(650, 980),
      ease: "Quad.In",
      onComplete: () => {
        sprinkle.destroy();
      },
    });
  }

  private updateAmbientParallaxFeature(deltaSeconds: number): void {
    const isIdle = !this.isRoundActive;

    if (this.farParallaxSprite) {
      this.farParallaxSprite.tilePositionX += (isIdle ? 12 : 0) * deltaSeconds;
    }
    if (this.nearParallaxSprite) {
      this.nearParallaxSprite.tilePositionX += (isIdle ? 22 : 0) * deltaSeconds;
    }
    if (this.hazeParallaxSprite) {
      this.hazeParallaxSprite.tilePositionX += (isIdle ? 16 : 0) * deltaSeconds;
      this.hazeParallaxSprite.alpha = 0.46 + Math.sin(this.time.now / 1000) * 0.08;
    }
  }

  private updateCloudsFeature(deltaSeconds: number): void {
    for (const cloudSprite of this.cloudSprites) {
      const speedFactor = Number(cloudSprite.getData("speed_factor") ?? 0.1);
      const driftDirection = Number(cloudSprite.getData("drift_direction") ?? 1);
      const driftSeed = Number(cloudSprite.getData("drift_seed") ?? 0);
      const horizontalVelocity = (this.isRoundActive ? this.roundSpeedPxPerSec : 70) * speedFactor;

      cloudSprite.x -= horizontalVelocity * deltaSeconds;
      cloudSprite.y += Math.sin(this.time.now / 1300 + driftSeed) * 0.08 * driftDirection;

      if (cloudSprite.x < -60) {
        cloudSprite.x = worldWidth + Phaser.Math.Between(30, 120);
        cloudSprite.y = Phaser.Math.Between(70, 220);
      }
    }
  }

  private scrollWorldFeature(deltaSeconds: number): void {
    const speed = this.roundSpeedPxPerSec;

    if (this.groundVisualSprite) {
      this.groundVisualSprite.tilePositionX += speed * deltaSeconds;
    }
    if (this.farParallaxSprite) {
      this.farParallaxSprite.tilePositionX += speed * 0.12 * deltaSeconds;
    }
    if (this.nearParallaxSprite) {
      this.nearParallaxSprite.tilePositionX += speed * 0.24 * deltaSeconds;
    }
    if (this.hazeParallaxSprite) {
      this.hazeParallaxSprite.tilePositionX += speed * 0.18 * deltaSeconds;
    }
  }

  private handleJumpInputFeature(
    wantsJump: boolean,
    eggBody: Phaser.Physics.Arcade.Body,
  ): void {
    if (!wantsJump) {
      return;
    }

    unlockRunnerAudioFeature();

    const isGrounded = eggBody.blocked.down || eggBody.touching.down;
    const hasPlatformShoesReward = this.hasRidiculousRewardFeature("platform_shoes_reward");
    const canAirJump = !isGrounded && hasPlatformShoesReward && this.remainingAirJumps > 0;

    if (!isGrounded && !canAirJump) {
      return;
    }

    if (canAirJump) {
      this.remainingAirJumps -= 1;
      this.showToastFeature({
        label: "PLATFORM-SHOES BOOST",
        duration_ms: 650,
        tint_hex: "#b7ffcb",
      });
      this.spawnBurstFeature(this.eggSprite?.x ?? 0, this.eggSprite?.y ?? 0, {
        count: 7,
        texture_key: this.textureKeys?.spark_particle_key ?? "",
        max_distance_px: 34,
        duration_ms: 260,
        tint_hex: 0xb7ffcb,
        scale_min: 0.65,
        scale_max: 1.15,
        alpha_start: 0.85,
      });
    }

    const platformShoesBoost = hasPlatformShoesReward ? 28 : 0;
    // stronger initial impulse to feel snappier
    const jumpVelocity = (this.isGlitchActive ? -420 : -500) - platformShoesBoost;
    this.eggSprite?.setVelocityY(jumpVelocity);
    this.spawnBurstFeature(this.eggSprite?.x ?? 0, groundY - 10, {
      count: 6,
      texture_key: this.textureKeys?.dust_particle_key ?? "",
      max_distance_px: 34,
      duration_ms: 320,
      tint_hex: 0xf7d8ad,
      scale_min: 0.8,
      scale_max: 1.4,
      alpha_start: 0.65,
    });
    playRunnerSfxFeature("jump");
  }

  private spawnObstacleFeature(): void {
    if (!this.obstacleGroup || !this.textureKeys) {
      return;
    }

    if (this.time.now < this.nextSpawnAtMs) {
      return;
    }

    const roll = Phaser.Math.FloatBetween(0, 1);
    const shouldSpawnCluster = this.roundSpeedPxPerSec > 410 && roll > 0.78;

    this.spawnSingleObstacleFeature(0);

    if (shouldSpawnCluster) {
      this.spawnSingleObstacleFeature(Phaser.Math.Between(120, 170));
    }

    const baseDelay = Phaser.Math.Clamp(
      940 - (this.roundSpeedPxPerSec - 300) * 1.05,
      420,
      960,
    );
    const variance = Phaser.Math.Between(-70, 120);
    const clusterPenalty = shouldSpawnCluster ? 140 : 0;
    const towelWhipstreamDelayBonus = this.hasRidiculousRewardFeature("towel_whipstream_reward")
      ? 90
      : 0;
    this.nextSpawnAtMs =
      this.time.now + baseDelay + variance + clusterPenalty + towelWhipstreamDelayBonus;
  }

  private spawnSingleObstacleFeature(extraOffsetPx: number): void {
    if (!this.obstacleGroup || !this.textureKeys) {
      return;
    }

    const kindRoll = Phaser.Math.FloatBetween(0, 1);
    const obstacleKind: RunnerObstacleKind =
      kindRoll < 0.46 ? "spike" : kindRoll < 0.82 ? "crate" : "flame";

    let textureKey = this.textureKeys.obstacle_spike_key;
    let spawnY = groundY - 18;
    let bodySize: { width_px: number; height_px: number; offset_x_px: number; offset_y_px: number } = {
      width_px: 42,
      height_px: 22,
      offset_x_px: 4,
      offset_y_px: 12,
    };
    let scoreBonus = 6;

    if (obstacleKind === "crate") {
      textureKey = this.textureKeys.obstacle_crate_key;
      spawnY = groundY - 20;
      bodySize = { width_px: 28, height_px: 28, offset_x_px: 5, offset_y_px: 5 };
      scoreBonus = 9;
    }

    if (obstacleKind === "flame") {
      textureKey = this.textureKeys.obstacle_flame_key;
      spawnY = groundY - 22;
      bodySize = { width_px: 26, height_px: 24, offset_x_px: 8, offset_y_px: 8 };
      scoreBonus = 12;
    }

    const obstacle = this.obstacleGroup.create(
      worldWidth + 48 + extraOffsetPx,
      spawnY,
      textureKey,
    );

    if (!(obstacle instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }

    obstacle.setDepth(3.2);
    obstacle.setOrigin(0.5, 0.5);
    obstacle.setImmovable(true);
    obstacle.setDataEnabled();
    obstacle.setData("obstacle_kind", obstacleKind);
    obstacle.setData("is_scored", false);
    obstacle.setData("score_bonus", scoreBonus);
    obstacle.setData("base_y", spawnY);
    obstacle.setData("bob_seed", Phaser.Math.FloatBetween(0, Math.PI * 2));

    if (obstacle.body instanceof Phaser.Physics.Arcade.Body) {
      obstacle.body.allowGravity = false;
      obstacle.body.setVelocityX(-this.roundSpeedPxPerSec);
      obstacle.body.setSize(bodySize.width_px, bodySize.height_px);
      obstacle.body.setOffset(bodySize.offset_x_px, bodySize.offset_y_px);
    }

    if (obstacleKind === "flame") {
      obstacle.setBlendMode(Phaser.BlendModes.ADD);
      obstacle.setAlpha(0.92);
    }
  }

  private updateObstaclesFeature(): void {
    if (!this.obstacleGroup || !this.eggSprite) {
      return;
    }

    const obstacleChildren = this.obstacleGroup.getChildren();

    for (const obstacleObject of obstacleChildren) {
      if (!(obstacleObject instanceof Phaser.Physics.Arcade.Sprite)) {
        continue;
      }

      if (obstacleObject.body instanceof Phaser.Physics.Arcade.Body) {
        obstacleObject.body.setVelocityX(-this.roundSpeedPxPerSec);
      }

      const obstacleKind = String(obstacleObject.getData("obstacle_kind") ?? "spike") as RunnerObstacleKind;
      const baseY = Number(obstacleObject.getData("base_y") ?? obstacleObject.y);
      const bobSeed = Number(obstacleObject.getData("bob_seed") ?? 0);

      if (obstacleKind === "flame") {
        obstacleObject.y = baseY + Math.sin(this.time.now / 70 + bobSeed) * 2.5;
        obstacleObject.setScale(1, 0.92 + Math.sin(this.time.now / 95 + bobSeed) * 0.08);
        obstacleObject.setAngle(Math.sin(this.time.now / 120 + bobSeed) * 4);
      } else if (this.hasRidiculousRewardFeature("sprinkle_rain_reward")) {
        obstacleObject.y = baseY + Math.sin(this.time.now / 160 + bobSeed) * 5;
        obstacleObject.setAngle(Math.sin(this.time.now / 210 + bobSeed) * 6);
      } else if (this.isGlitchActive) {
        obstacleObject.angle += obstacleKind === "crate" ? 3.2 : 2.1;
      } else {
        obstacleObject.setAngle(0);
      }

      if (obstacleObject.x < -64) {
        obstacleObject.destroy();
        continue;
      }

      const alreadyScored = Boolean(obstacleObject.getData("is_scored") ?? false);
      if (!alreadyScored && obstacleObject.x < this.eggSprite.x - 36) {
        obstacleObject.setData("is_scored", true);
        this.scoreDistanceMeters += Number(obstacleObject.getData("score_bonus") ?? 5);
      }
    }
  }

  private updateFryingPanFeature(deltaSeconds: number): void {
    if (!this.fryingPanSprite || !this.eggSprite) {
      return;
    }

    const shellPenaltyPx = (this.maxShellIntegrityPoints - this.shellIntegrityPoints) * 28;
    const mustacheGapBonus = this.hasRidiculousRewardFeature("mustache_disguises_reward")
      ? 110
      : 0;
    const targetGapPx = Math.max(
      88,
      (this.isGlitchActive ? 210 : 148) - shellPenaltyPx + mustacheGapBonus,
    );
    const targetX = Math.max(48, this.eggSprite.x - targetGapPx);
    const mustacheTrackingFactor = this.hasRidiculousRewardFeature("mustache_disguises_reward")
      ? 0.72
      : 1;
    const panVelocityX =
      (targetX - this.fryingPanSprite.x) *
      (2.8 + deltaSeconds * 0.2) *
      mustacheTrackingFactor;

    this.fryingPanSprite.setVelocityX(panVelocityX);
    this.fryingPanSprite.y = groundY - 58 + Math.sin(this.time.now / 170) * 4;
    this.fryingPanSprite.setAngle(Math.sin(this.time.now / 140) * 2.5);

    if (this.fryingPanShadowSprite) {
      this.fryingPanShadowSprite.x = this.fryingPanSprite.x + 2;
      this.fryingPanShadowSprite.y = groundY - 6;
      this.fryingPanShadowSprite.alpha = 0.12 + (this.isGlitchActive ? 0.08 : 0.02);
    }
  }

  private updateEggPresentationFeature(eggBody: Phaser.Physics.Arcade.Body): void {
    if (!this.eggSprite) {
      return;
    }

    const grounded = eggBody.blocked.down || eggBody.touching.down;

    if (grounded) {
      const runPulse = Math.sin(this.time.now / 65);
      this.eggSprite.setScale(1.04 + runPulse * 0.02, 1.06 - runPulse * 0.03);
      this.eggSprite.setAngle(runPulse * 1.8);
    } else {
      const airborneTilt = Phaser.Math.Clamp(eggBody.velocity.y * 0.035, -14, 18);
      this.eggSprite.setScale(1.08, 1.02);
      this.eggSprite.setAngle(airborneTilt);
    }

    if (this.eggShadowSprite) {
      const heightOffset = Math.max(0, groundY - this.eggSprite.y - 18);
      this.eggShadowSprite.x = this.eggSprite.x - 2;
      this.eggShadowSprite.y = groundY - 6;
      this.eggShadowSprite.alpha = Phaser.Math.Clamp(0.22 - heightOffset / 260, 0.05, 0.22);
      this.eggShadowSprite.scaleX = Phaser.Math.Clamp(1 - heightOffset / 220, 0.58, 1.05);
      this.eggShadowSprite.scaleY = Phaser.Math.Clamp(1 - heightOffset / 260, 0.7, 1.0);
    }

    if (this.isGlitchActive) {
      const tintValue =
        0xe6f3ff +
        ((Math.floor((Math.sin(this.time.now / 95) + 1) * 12) & 0xff) << 8) +
        (Math.floor((Math.cos(this.time.now / 120) + 1) * 10) & 0xff);
      this.eggSprite.setTint(tintValue);
      this.eggSprite.rotation = Math.sin(this.time.now / 85) * 0.08;
    } else if (this.time.now >= this.invulnerableUntilMs) {
      this.eggSprite.clearTint();
      this.eggSprite.rotation = 0;
    }
  }

  private updateScoreFeature(deltaSeconds: number): void {
    this.scoreDistanceMeters += this.roundSpeedPxPerSec * deltaSeconds * 0.052;

    const roundedScore = Math.floor(this.scoreDistanceMeters);

    if (roundedScore >= this.lastMilestoneScoreMeters + 100) {
      this.lastMilestoneScoreMeters = roundedScore - (roundedScore % 100);
      playRunnerSfxFeature("score_milestone");
      this.spawnBurstFeature(worldWidth - 80, 42, {
        count: 5,
        texture_key: this.textureKeys?.spark_particle_key ?? "",
        max_distance_px: 22,
        duration_ms: 240,
        tint_hex: 0xffdd9d,
        scale_min: 0.7,
        scale_max: 1.1,
        alpha_start: 0.7,
      });
    }
  }

  private updateLandingFeedbackFeature(eggBody: Phaser.Physics.Arcade.Body): void {
    const grounded = eggBody.blocked.down || eggBody.touching.down;

    if (grounded && this.hasRidiculousRewardFeature("platform_shoes_reward")) {
      this.remainingAirJumps = 1;
    }

    if (grounded && !this.wasGroundedLastFrame && eggBody.velocity.y > 60) {
      this.spawnBurstFeature(this.eggSprite?.x ?? 0, groundY - 11, {
        count: 5,
        texture_key: this.textureKeys?.dust_particle_key ?? "",
        max_distance_px: 26,
        duration_ms: 240,
        tint_hex: 0xf1c98e,
        scale_min: 0.7,
        scale_max: 1.2,
        alpha_start: 0.45,
      });
      playRunnerSfxFeature("land");
    }

    this.wasGroundedLastFrame = grounded;
  }

  private updateInvulnerabilityBlinkFeature(): void {
    if (!this.eggSprite) {
      return;
    }

    if (this.time.now < this.invulnerableUntilMs) {
      const blinkPhase = Math.floor(this.time.now / 65) % 2;
      this.eggSprite.alpha = blinkPhase === 0 ? 0.5 : 0.95;
      return;
    }

    this.eggSprite.alpha = 1;
  }

  private updatePostRoundActorsFeature(): void {
    if (!this.fryingPanSprite || !this.eggSprite) {
      return;
    }

    this.fryingPanSprite.setVelocityX(0);
    this.fryingPanSprite.setAngle(Math.sin(this.time.now / 260) * 1.4);
    this.eggSprite.setAngle(Math.sin(this.time.now / 220) * 1.1);

    if (this.groundVisualSprite) {
      this.groundVisualSprite.tilePositionX += 34 / 60;
    }
  }

  private updateHudFeature(): void {
    const scoreMeters = Math.floor(this.scoreDistanceMeters);
    const bestMeters = Math.max(this.bestDistanceMeters, scoreMeters);

    if (this.scoreText) {
      this.scoreText.setText(`${scoreMeters.toString().padStart(4, "0")}m`);
    }

    if (this.bestScoreText) {
      const rewardCount = this.countRidiculousRewardsFeature();
      const rewardSuffix = rewardCount > 0 ? ` // CARTON ${rewardCount}` : "";
      this.bestScoreText.setText(
        `BEST ${bestMeters.toString().padStart(4, "0")}m${rewardSuffix}`,
      );
    }

    if (this.shellText) {
      const shellLabel = "I".repeat(Math.max(0, this.shellIntegrityPoints));
      this.shellText.setText(
        this.isRoundOver ? "SHELL 0" : `SHELL ${shellLabel || "0"}`,
      );
      this.shellText.setColor(
        this.shellIntegrityPoints >= 2 ? "#ffcf89" : this.shellIntegrityPoints === 1 ? "#ff9f63" : "#ff6b5f",
      );
    }

    if (this.promptText) {
      if (this.isRoundOver) {
        this.promptText.setVisible(false);
      } else {
        const fadeOutStartMs = 3800;
        const elapsedMs = this.time.now - this.roundStartedAtMs;
        if (elapsedMs < fadeOutStartMs) {
          this.promptText.setVisible(true);
          this.promptText.setAlpha(0.92 - elapsedMs / (fadeOutStartMs * 1.12));
        } else {
          this.promptText.setVisible(false);
        }
      }
    }
  }

  private updateToastFeature(): void {
    if (!this.toastText) {
      return;
    }

    if (this.toastExpiresAtMs === 0) {
      return;
    }

    const remainingMs = this.toastExpiresAtMs - this.time.now;

    if (remainingMs <= 0) {
      this.toastText.setAlpha(0);
      this.toastText.setText("");
      this.toastExpiresAtMs = 0;
      return;
    }

    const fadeInMs = 120;
    const fadeOutMs = 180;
    const elapsedMs = Math.max(0, this.time.now - this.toastStartedAtMs);

    if (elapsedMs < fadeInMs) {
      this.toastText.setAlpha(elapsedMs / fadeInMs);
      return;
    }

    if (remainingMs < fadeOutMs) {
      this.toastText.setAlpha(remainingMs / fadeOutMs);
      return;
    }

    this.toastText.setAlpha(1);
  }

  private showToastFeature(options: RunnerToastOptions): void {
    if (!this.toastText) {
      return;
    }

    this.toastText.setText(options.label);
    this.toastText.setColor(options.tint_hex);
    this.toastText.setAlpha(0.01);
    this.toastStartedAtMs = this.time.now;
    this.toastExpiresAtMs = this.time.now + options.duration_ms;
  }

  private emitPanEmberBurstFeature(): void {
    if (!this.textureKeys || !this.fryingPanSprite || !this.isRoundActive) {
      return;
    }

    if (this.time.now - this.lastPanEmberBurstAtMs < (this.isGlitchActive ? 90 : 180)) {
      return;
    }

    this.lastPanEmberBurstAtMs = this.time.now;
    this.spawnBurstFeature(this.fryingPanSprite.x - 8, this.fryingPanSprite.y - 6, {
      count: this.isGlitchActive ? 4 : 2,
      texture_key: this.textureKeys.ember_particle_key,
      max_distance_px: this.isGlitchActive ? 30 : 18,
      duration_ms: this.isGlitchActive ? 260 : 180,
      tint_hex: this.isGlitchActive ? 0xffc27b : 0xff7c2e,
      scale_min: 0.6,
      scale_max: 1.0,
      alpha_start: 0.7,
    });
  }

  private spawnBurstFeature(
    originX: number,
    originY: number,
    options: RunnerBurstOptions,
  ): void {
    if (!options.texture_key) {
      return;
    }

    for (let index = 0; index < options.count; index += 1) {
      const angleRadians = Phaser.Math.FloatBetween(-Math.PI * 0.92, Math.PI * 0.2);
      const distancePx = Phaser.Math.FloatBetween(8, options.max_distance_px);
      const offsetX = Math.cos(angleRadians) * distancePx;
      const offsetY = Math.sin(angleRadians) * distancePx;

      const particleSprite = this.add
        .image(originX, originY, options.texture_key)
        .setDepth(7)
        .setAlpha(options.alpha_start ?? 0.8)
        .setScale(
          Phaser.Math.FloatBetween(options.scale_min ?? 0.8, options.scale_max ?? 1.25),
        )
        .setRotation(Phaser.Math.FloatBetween(-0.3, 0.3));

      if (options.tint_hex !== undefined) {
        particleSprite.setTint(options.tint_hex);
      }

      this.tweens.add({
        targets: particleSprite,
        x: originX + offsetX,
        y: originY + offsetY,
        alpha: 0,
        rotation: particleSprite.rotation + Phaser.Math.FloatBetween(-1.6, 1.6),
        duration: options.duration_ms,
        ease: "Cubic.Out",
        onComplete: () => {
          particleSprite.destroy();
        },
      });
    }
  }

  private handleEggCollisionFeature(
    _eggObject: ArcadeCollisionParticipant,
    hazardObject: ArcadeCollisionParticipant,
  ): void {
    if (!this.eggSprite || !this.fryingPanSprite || !this.isRoundActive) {
      return;
    }

    const hazardKey =
      hazardObject instanceof Phaser.GameObjects.Sprite
        ? hazardObject.texture.key
        : "unknown_hazard";

    const collisionEvent: EggCollisionGameEvent = {
      action: "handle",
      subject: "egg_collision",
      type: "event",
      obstacle_key: hazardKey,
      occurred_at_ms: Date.now(),
    };
    this.emitGameEventFeature(collisionEvent);

    const isPanCatch = hazardKey === (this.textureKeys?.frying_pan_key ?? "");

    if (this.time.now < this.invulnerableUntilMs) {
      this.showToastFeature({
        label: "BUTTER SHIELD",
        duration_ms: 360,
        tint_hex: "#ffe8ad",
      });

      if (isPanCatch && this.fryingPanSprite && this.eggSprite) {
        this.fryingPanSprite.x = Math.max(36, this.fryingPanSprite.x - 28);
        this.fryingPanSprite.setTint(0xffcf71);
        this.time.delayedCall(80, () => {
          if (!this.isGlitchActive) {
            this.fryingPanSprite?.clearTint();
          }
        });
      } else if (hazardObject instanceof Phaser.GameObjects.Sprite) {
        this.spawnBurstFeature(hazardObject.x, hazardObject.y - 4, {
          count: 6,
          texture_key: this.textureKeys?.spark_particle_key ?? "",
          max_distance_px: 32,
          duration_ms: 220,
          tint_hex: 0xffebb8,
          scale_min: 0.75,
          scale_max: 1.15,
          alpha_start: 0.75,
        });
        hazardObject.destroy();
      }

      return;
    }

    if (isPanCatch) {
      this.endRoundFeature("pan_catch");
      return;
    }

    this.cameras.main.shake(120, this.isGlitchActive ? 0.005 : 0.009);
    this.eggSprite.setTintFill(0xff6b35);
    this.eggSprite.setVelocity(-170, -250);
    this.time.delayedCall(90, () => {
      this.eggSprite?.clearTint();
    });

    if (hazardObject instanceof Phaser.GameObjects.Sprite) {
      this.spawnBurstFeature(hazardObject.x, hazardObject.y - 4, {
        count: 8,
        texture_key: this.textureKeys?.spark_particle_key ?? "",
        max_distance_px: 42,
        duration_ms: 300,
        tint_hex: 0xffd7ac,
        scale_min: 0.8,
        scale_max: 1.25,
        alpha_start: 0.85,
      });
      hazardObject.destroy();
    }

    this.spawnBurstFeature((this.eggSprite.x ?? 0) - 2, (this.eggSprite.y ?? 0) + 4, {
      count: 6,
      texture_key: this.textureKeys?.dust_particle_key ?? "",
      max_distance_px: 28,
      duration_ms: 260,
      tint_hex: 0xffa56f,
      scale_min: 0.85,
      scale_max: 1.4,
      alpha_start: 0.6,
    });

    playRunnerSfxFeature("hit");
    this.scoreDistanceMeters = Math.max(0, this.scoreDistanceMeters - 10);
    this.shellIntegrityPoints = 0;

    if (this.fryingPanSprite) {
      this.fryingPanSprite.x = Math.min(this.fryingPanSprite.x + 8, this.eggSprite.x - 74);
      this.fryingPanSprite.setTint(0xff8748);
      this.time.delayedCall(130, () => {
        if (!this.isGlitchActive) {
          this.fryingPanSprite?.clearTint();
        }
      });
    }

    this.endRoundFeature("shell_break");
  }

  private endRoundFeature(reason: RunnerRoundEndReason): void {
    if (!this.isRoundActive || this.isRoundOver) {
      return;
    }

    this.isRoundActive = false;
    this.isRoundOver = true;
    this.isGlitchActive = false;
    this.glitchEndsAtMs = 0;

    const finalScoreMeters = Math.floor(this.scoreDistanceMeters);

    if (finalScoreMeters > this.bestDistanceMeters) {
      this.bestDistanceMeters = finalScoreMeters;
      this.saveBestScoreFeature(this.bestDistanceMeters);
    }

    if (this.obstacleGroup) {
      for (const obstacleObject of this.obstacleGroup.getChildren()) {
        if (obstacleObject instanceof Phaser.Physics.Arcade.Sprite) {
          obstacleObject.setVelocityX(0);
        }
      }
    }

    if (this.fryingPanSprite) {
      this.fryingPanSprite.setVelocityX(0);
      this.fryingPanSprite.setTint(0xff6b35);
    }

    if (this.eggSprite) {
      this.eggSprite.setVelocity(-60, -180);
      this.eggSprite.setAngle(reason === "pan_catch" ? -18 : 12);
      this.eggSprite.clearTint();
    }

    this.spawnBurstFeature(this.eggSprite?.x ?? 0, this.eggSprite?.y ?? 0, {
      count: 12,
      texture_key: this.textureKeys?.spark_particle_key ?? "",
      max_distance_px: 54,
      duration_ms: 360,
      tint_hex: reason === "pan_catch" ? 0xffb57e : 0xffd6af,
      scale_min: 0.7,
      scale_max: 1.3,
      alpha_start: 0.9,
    });
    this.spawnBurstFeature(this.eggSprite?.x ?? 0, groundY - 8, {
      count: 10,
      texture_key: this.textureKeys?.dust_particle_key ?? "",
      max_distance_px: 40,
      duration_ms: 320,
      tint_hex: 0xf7ca86,
      scale_min: 0.9,
      scale_max: 1.6,
      alpha_start: 0.55,
    });

    this.cameras.main.shake(220, 0.012);
    playRunnerSfxFeature("game_over");

    if (this.gameOverScoreText) {
      this.gameOverScoreText.setText(`DISTANCE ${finalScoreMeters.toString().padStart(4, "0")}m`);
    }
    if (this.gameOverBestText) {
      this.gameOverBestText.setText(
        `BEST ${this.bestDistanceMeters.toString().padStart(4, "0")}m`,
      );
    }
    if (this.gameOverTitleText) {
      this.gameOverTitleText.setText(this.servedOverlayCopy.headline);
      this.gameOverTitleText.setColor(reason === "pan_catch" ? "#ffd8b2" : "#fff0d8");
    }
    if (this.gameOverCritiqueText) {
      const critiqueLine =
        Phaser.Utils.Array.GetRandom(this.servedOverlayCopy.critique_lines) ??
        "Sir Toasty is disappointed in a very specific and theatrical way.";
      this.gameOverCritiqueText.setText(critiqueLine);
    }
    if (this.gameOverPromptText) {
      const promptLines = ["[SPACE/TAP] RE-SHELL THE DATA", "[R] RE-SHELL THE DATA"];
      if (this.canBribeToasterFeature()) {
        promptLines.push("[B] BRIBE THE TOASTER (BUTTER SHIELD)");
      }
      this.gameOverPromptText.setText(promptLines.join("\n"));
    }
    if (this.gameOverContainer) {
      this.gameOverContainer.setVisible(true);
      this.gameOverContainer.setAlpha(0);
      this.gameOverContainer.setScale(0.96);
      this.tweens.add({
        targets: this.gameOverContainer,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: "Quad.Out",
      });
    }

    this.showToastFeature({
      label: reason === "pan_catch" ? "CAUGHT BY THE PAN" : "SHELL FRACTURED",
      duration_ms: 1200,
      tint_hex: "#ff9c73",
    });
  }

  private handleKeyboardSequenceFeature = (event: KeyboardEvent): void => {
    unlockRunnerAudioFeature();

    const normalizedKey = event.key.toUpperCase();

    if (!/^[A-Z]$/.test(normalizedKey)) {
      return;
    }

    this.recentKeyBuffer = `${this.recentKeyBuffer}${normalizedKey}`.slice(
      -glitchSequenceKey.length,
    );

    if (this.recentKeyBuffer === glitchSequenceKey) {
      this.triggerGlitchFeature("keyboard_sequence");
    }
  };

  private handlePointerInputFeature(pointer: Phaser.Input.Pointer): void {
    unlockRunnerAudioFeature();

    this.pointerJumpQueued = true;
    if (this.isRoundOver) {
      this.pointerRestartQueued = true;
    }

    if (pointer.x <= 18 && pointer.y <= 18) {
      this.triggerGlitchFeature("hidden_pixel_click");
    }
  }

  private triggerGlitchFeature(triggerType: GlitchTriggerType): void {
    if (this.isGlitchActive) {
      return;
    }

    this.isGlitchActive = true;
    this.glitchEndsAtMs = this.time.now + 8000;

    this.cameras.main.flash(180, 255, 168, 76, false);
    this.cameras.main.shake(220, 0.01);
    this.cameras.main.setBackgroundColor("#140d12");

    if (this.fryingPanSprite) {
      this.fryingPanSprite.x = Math.max(36, this.fryingPanSprite.x - 36);
      this.fryingPanSprite.setTint(0xff6b35);
    }

    if (this.eggSprite?.body instanceof Phaser.Physics.Arcade.Body) {
      this.eggSprite.body.setGravityY(-420);
      this.eggSprite.setVelocityY(-120);
      this.invulnerableUntilMs = this.time.now + 850;
    }

    this.spawnBurstFeature(this.eggSprite?.x ?? worldWidth / 2, this.eggSprite?.y ?? groundY, {
      count: 14,
      texture_key: this.textureKeys?.spark_particle_key ?? "",
      max_distance_px: 58,
      duration_ms: 420,
      tint_hex: 0xffdeaa,
      scale_min: 0.8,
      scale_max: 1.4,
      alpha_start: 0.9,
    });
    this.spawnBurstFeature(this.eggSprite?.x ?? worldWidth / 2, groundY - 8, {
      count: 10,
      texture_key: this.textureKeys?.ember_particle_key ?? "",
      max_distance_px: 44,
      duration_ms: 320,
      tint_hex: 0xff9f4f,
      scale_min: 0.7,
      scale_max: 1.3,
      alpha_start: 0.75,
    });

    this.showToastFeature({
      label: "SIGNAL DISTORTION",
      duration_ms: 1500,
      tint_hex: "#ffd58b",
    });
    playRunnerSfxFeature("glitch");

    const glitchEvent: TriggerGlitchGameEvent = {
      action: "trigger",
      subject: "glitch",
      type: triggerType,
      occurred_at_ms: Date.now(),
    };

    this.emitGameEventFeature(glitchEvent);
  }

  private clearGlitchStateFeature(): void {
    this.isGlitchActive = false;
    this.glitchEndsAtMs = 0;
    this.cameras.main.setBackgroundColor("#070d12");

    if (this.eggSprite?.body instanceof Phaser.Physics.Arcade.Body) {
      this.eggSprite.body.setGravityY(0);
    }

    if (this.fryingPanSprite) {
      this.fryingPanSprite.clearTint();
    }
  }

  private emitGameEventFeature(event: GameRuntimeEvent): void {
    this.onGameEvent?.(event);
  }

  private loadBestScoreFeature(): number {
    if (typeof window === "undefined") {
      return 0;
    }

    try {
      const rawValue = window.localStorage.getItem(bestScoreStorageKey);
      if (!rawValue) {
        return 0;
      }

      const parsedValue = Number.parseInt(rawValue, 10);
      return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
    } catch {
      return 0;
    }
  }

  private saveBestScoreFeature(bestScoreMeters: number): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(bestScoreStorageKey, String(bestScoreMeters));
    } catch {
      // Storage can fail in restricted contexts; gameplay should continue.
    }
  }

  private handleSceneShutdownFeature(): void {
    this.input.keyboard?.off("keydown", this.handleKeyboardSequenceFeature);
    this.input.off("pointerdown", this.handlePointerInputFeature, this);
    window.removeEventListener("resize", this.handleWindowResizeFeature);
  }
}
