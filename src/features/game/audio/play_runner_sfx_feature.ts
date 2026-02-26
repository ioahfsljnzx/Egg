export type RunnerSfxKind =
  | "jump"
  | "land"
  | "hit"
  | "game_over"
  | "restart"
  | "glitch"
  | "score_milestone";

interface RunnerAudioBusState {
  audio_context: AudioContext | null;
  master_gain_node: GainNode | null;
}

interface ToneEnvelopeOptions {
  duration_ms: number;
  volume: number;
  attack_ms?: number;
  release_ms?: number;
  waveform: OscillatorType;
  start_hz: number;
  end_hz?: number;
  detune_cents?: number;
}

const runnerAudioBusState: RunnerAudioBusState = {
  audio_context: null,
  master_gain_node: null,
};

interface LegacyAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const resolveAudioContextFeature = (): AudioContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (runnerAudioBusState.audio_context) {
    return runnerAudioBusState.audio_context;
  }

  const audioContextCtor =
    window.AudioContext ?? (window as LegacyAudioWindow).webkitAudioContext;

  if (!audioContextCtor) {
    return null;
  }

  runnerAudioBusState.audio_context = new audioContextCtor();

  return runnerAudioBusState.audio_context;
};

const resolveMasterGainNodeFeature = (context: AudioContext): GainNode => {
  if (runnerAudioBusState.master_gain_node) {
    return runnerAudioBusState.master_gain_node;
  }

  const masterGainNode = context.createGain();
  masterGainNode.gain.value = 0.18;
  masterGainNode.connect(context.destination);

  runnerAudioBusState.master_gain_node = masterGainNode;

  return masterGainNode;
};

const playToneEnvelopeFeature = (
  context: AudioContext,
  masterGainNode: GainNode,
  options: ToneEnvelopeOptions,
): void => {
  const startAt = context.currentTime;
  const endAt = startAt + options.duration_ms / 1000;
  const attackSeconds = (options.attack_ms ?? 8) / 1000;
  const releaseSeconds = (options.release_ms ?? 40) / 1000;

  const oscillatorNode = context.createOscillator();
  const gainNode = context.createGain();

  oscillatorNode.type = options.waveform;
  oscillatorNode.frequency.setValueAtTime(options.start_hz, startAt);
  if (options.end_hz !== undefined) {
    oscillatorNode.frequency.exponentialRampToValueAtTime(
      Math.max(40, options.end_hz),
      endAt,
    );
  }
  if (options.detune_cents !== undefined) {
    oscillatorNode.detune.setValueAtTime(options.detune_cents, startAt);
  }

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, options.volume),
    startAt + attackSeconds,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    Math.max(startAt + attackSeconds, endAt - releaseSeconds),
  );
  gainNode.gain.setValueAtTime(0.0001, endAt);

  oscillatorNode.connect(gainNode);
  gainNode.connect(masterGainNode);

  oscillatorNode.start(startAt);
  oscillatorNode.stop(endAt + 0.02);

  oscillatorNode.onended = () => {
    oscillatorNode.disconnect();
    gainNode.disconnect();
  };
};

export const unlockRunnerAudioFeature = (): void => {
  const context = resolveAudioContextFeature();

  if (!context) {
    return;
  }

  resolveMasterGainNodeFeature(context);

  if (context.state !== "running") {
    void context.resume();
  }
};

export const playRunnerSfxFeature = (kind: RunnerSfxKind): void => {
  const context = resolveAudioContextFeature();

  if (!context || context.state !== "running") {
    return;
  }

  const masterGainNode = resolveMasterGainNodeFeature(context);

  switch (kind) {
    case "jump": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "triangle",
        start_hz: 470,
        end_hz: 690,
        duration_ms: 120,
        volume: 0.06,
        attack_ms: 6,
        release_ms: 70,
      });
      break;
    }
    case "land": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sine",
        start_hz: 180,
        end_hz: 130,
        duration_ms: 85,
        volume: 0.035,
        attack_ms: 4,
        release_ms: 45,
      });
      break;
    }
    case "hit": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "square",
        start_hz: 190,
        end_hz: 70,
        duration_ms: 150,
        volume: 0.08,
        attack_ms: 2,
        release_ms: 90,
      });
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sawtooth",
        start_hz: 420,
        end_hz: 110,
        duration_ms: 105,
        volume: 0.04,
        attack_ms: 2,
        release_ms: 70,
        detune_cents: 9,
      });
      break;
    }
    case "game_over": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sawtooth",
        start_hz: 320,
        end_hz: 68,
        duration_ms: 380,
        volume: 0.08,
        attack_ms: 10,
        release_ms: 180,
      });
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "triangle",
        start_hz: 160,
        end_hz: 52,
        duration_ms: 460,
        volume: 0.06,
        attack_ms: 14,
        release_ms: 220,
        detune_cents: -6,
      });
      break;
    }
    case "restart": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "triangle",
        start_hz: 240,
        end_hz: 320,
        duration_ms: 90,
        volume: 0.045,
        attack_ms: 6,
        release_ms: 50,
      });
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "triangle",
        start_hz: 360,
        end_hz: 480,
        duration_ms: 110,
        volume: 0.04,
        attack_ms: 6,
        release_ms: 65,
      });
      break;
    }
    case "glitch": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sawtooth",
        start_hz: 180,
        end_hz: 1120,
        duration_ms: 240,
        volume: 0.07,
        attack_ms: 4,
        release_ms: 140,
      });
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "square",
        start_hz: 220,
        end_hz: 760,
        duration_ms: 200,
        volume: 0.04,
        attack_ms: 2,
        release_ms: 120,
        detune_cents: -11,
      });
      break;
    }
    case "score_milestone": {
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sine",
        start_hz: 620,
        end_hz: 780,
        duration_ms: 90,
        volume: 0.038,
        attack_ms: 4,
        release_ms: 55,
      });
      playToneEnvelopeFeature(context, masterGainNode, {
        waveform: "sine",
        start_hz: 840,
        end_hz: 980,
        duration_ms: 70,
        volume: 0.026,
        attack_ms: 2,
        release_ms: 40,
      });
      break;
    }
  }
};
