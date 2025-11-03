// A simple sound engine using the Web Audio API to generate futuristic UI sounds.

// Create a singleton AudioContext to avoid creating multiple instances.
// It's initialized on the first sound play request to ensure it's user-initiated.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && (!audioContext || audioContext.state === 'suspended')) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            return null;
        }
    }
    return audioContext;
};

/**
 * Plays a single tone with a given frequency, duration, and waveform.
 * It includes a gain envelope to prevent harsh clicking sounds.
 * @param freq The frequency of the tone in Hz.
 * @param duration The duration of the tone in seconds.
 * @param type The oscillator type (e.g., 'sine', 'sawtooth').
 * @param startTime The delay before the sound starts, in seconds.
 */
const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', startTime: number = 0) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if it was suspended (e.g., by browser auto-play policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    // A simple attack/decay envelope to make the sound less harsh.
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + startTime + 0.01); // Lowered gain for softer sound
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
};

// --- EXPORTED SOUND EFFECTS (Retuned for "cute" theme) ---

/** Sound for starting a mission. A magical, ascending chime. */
export const playDeploySound = () => {
    playTone(523, 0.1, 'sine', 0); // C5
    playTone(659, 0.1, 'sine', 0.1); // E5
    playTone(783, 0.15, 'sine', 0.2); // G5
};

/** Sound for aborting a mission. A soft, descending "poof" sound. */
export const playAbortSound = () => {
    playTone(600, 0.15, 'sine', 0);
    playTone(450, 0.15, 'sine', 0.1);
    playTone(300, 0.2, 'sine', 0.2);
};

/** A gentle, questioning sound for error notifications. */
export const playErrorSound = () => {
    playTone(300, 0.1, 'sine', 0);
    playTone(250, 0.2, 'sine', 0.1);
};

/** A short, high-pitched "blip" for UI interactions. */
export const playClickSound = () => {
    playTone(1500, 0.05, 'triangle');
};

/** A slightly lower "blip" for tab switching. */
export const playTabSwitchSound = () => {
    playTone(1200, 0.08, 'triangle');
};

/** An upbeat, magical sound for success notifications. */
export const playSuccessSound = () => {
    playTone(783.99, 0.1, 'sine', 0); // G5
    playTone(1046.50, 0.15, 'sine', 0.1); // C6
};