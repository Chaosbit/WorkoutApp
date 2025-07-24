/**
 * AudioManager - Manages audio notifications for workout events
 */
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialize();
    }

    /**
     * Initialize the Web Audio API context
     */
    initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Play a sound with specified parameters
     * @param {number} frequency - Sound frequency in Hz (default: 800)
     * @param {number} duration - Sound duration in ms (default: 500)
     * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
     */
    playSound(frequency = 800, duration = 500, type = 'sine') {
        if (!this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }

    /**
     * Play exercise completion sound (single beep)
     */
    playExerciseComplete() {
        this.playSound(600, 300);
    }

    /**
     * Play workout completion sound (ascending melody)
     */
    playWorkoutComplete() {
        setTimeout(() => this.playSound(523, 200), 0);    // C5
        setTimeout(() => this.playSound(659, 200), 200);  // E5
        setTimeout(() => this.playSound(784, 400), 400);  // G5
    }
}