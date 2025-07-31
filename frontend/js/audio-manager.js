import { APP_CONFIG } from './constants.js';

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
     * @param {number} frequency - Sound frequency in Hz (default: from config)
     * @param {number} duration - Sound duration in ms (default: from config) 
     * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
     */
    playSound(frequency = APP_CONFIG.AUDIO_FREQUENCIES.EXERCISE_COMPLETE, duration = APP_CONFIG.AUDIO_DURATION, type = 'sine') {
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
        this.playSound(APP_CONFIG.AUDIO_FREQUENCIES.REST_START, 300);
    }

    /**
     * Play workout completion sound (ascending melody)
     */
    playWorkoutComplete() {
        const [c5, e5, g5] = APP_CONFIG.AUDIO_FREQUENCIES.WORKOUT_COMPLETE;
        setTimeout(() => this.playSound(c5, APP_CONFIG.AUDIO_DURATION), 0);    
        setTimeout(() => this.playSound(e5, APP_CONFIG.AUDIO_DURATION), 200);  
        setTimeout(() => this.playSound(g5, APP_CONFIG.AUDIO_DURATION * 2), 400);  
    }
}