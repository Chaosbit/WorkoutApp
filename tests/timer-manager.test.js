import { TimerManager } from '../js/timer-manager.js';

describe('TimerManager', () => {
    let timerManager;
    
    beforeEach(() => {
        timerManager = new TimerManager();
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
        timerManager.stop();
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            expect(timerManager.timeRemaining).toBe(0);
            expect(timerManager.isRunning).toBe(false);
            expect(timerManager.intervalId).toBeNull();
            expect(timerManager.currentExercise).toBeNull();
        });
    });

    describe('setExercise', () => {
        it('should set current exercise and time remaining', () => {
            const exercise = { name: 'Push Ups', duration: 60 };
            
            timerManager.setExercise(exercise);
            
            expect(timerManager.currentExercise).toEqual(exercise);
            expect(timerManager.timeRemaining).toBe(60);
        });

        it('should handle exercise without duration', () => {
            const exercise = { name: 'Push Ups' };
            
            timerManager.setExercise(exercise);
            
            expect(timerManager.timeRemaining).toBe(0);
        });
    });

    describe('callbacks', () => {
        it('should set onTick callback', () => {
            const callback = jest.fn();
            
            timerManager.setOnTick(callback);
            
            expect(timerManager.onTick).toBe(callback);
        });

        it('should set onComplete callback', () => {
            const callback = jest.fn();
            
            timerManager.setOnComplete(callback);
            
            expect(timerManager.onComplete).toBe(callback);
        });
    });

    describe('timer functionality', () => {
        it('should start timer and call onTick', () => {
            const exercise = { name: 'Test', duration: 5 };
            const onTick = jest.fn();
            
            timerManager.setExercise(exercise);
            timerManager.setOnTick(onTick);
            timerManager.start();
            
            expect(timerManager.isRunning).toBe(true);
            
            // Advance time by 1100ms to trigger tick
            jest.advanceTimersByTime(1100);
            
            expect(onTick).toHaveBeenCalled();
            expect(timerManager.timeRemaining).toBe(4);
        });

        it('should complete timer and call onComplete', () => {
            const exercise = { name: 'Test', duration: 1 };
            const onComplete = jest.fn();
            
            timerManager.setExercise(exercise);
            timerManager.setOnComplete(onComplete);
            timerManager.start();
            
            // Advance time by more than 1 second
            jest.advanceTimersByTime(1100);
            
            expect(onComplete).toHaveBeenCalled();
            expect(timerManager.isRunning).toBe(false);
            expect(timerManager.timeRemaining).toBe(0);
        });

        it('should pause timer', () => {
            const exercise = { name: 'Test', duration: 60 };
            timerManager.setExercise(exercise);
            timerManager.start();
            
            expect(timerManager.isRunning).toBe(true);
            
            timerManager.pause();
            
            // Note: pause() keeps isRunning true for resume functionality
            expect(timerManager.intervalId).toBeNull();
        });

        it('should stop timer completely', () => {
            const exercise = { name: 'Test', duration: 60 };
            timerManager.setExercise(exercise);
            timerManager.start();
            
            timerManager.stop();
            
            expect(timerManager.isRunning).toBe(false);
            expect(timerManager.intervalId).toBeNull();
        });

        it('should reset timer', () => {
            const exercise = { name: 'Test', duration: 60 };
            const onComplete = jest.fn();
            
            timerManager.setExercise(exercise);
            timerManager.setOnComplete(onComplete);
            timerManager.start();
            
            // Advance time
            jest.advanceTimersByTime(1100);
            
            timerManager.reset();
            
            expect(timerManager.timeRemaining).toBe(60);
            expect(timerManager.isRunning).toBe(false);
        });

        it('should resume timer after pause', () => {
            const exercise = { name: 'Test', duration: 60 };
            timerManager.setExercise(exercise);
            timerManager.start();
            
            timerManager.pause();
            timerManager.resume();
            
            expect(timerManager.isRunning).toBe(true);
            expect(timerManager.intervalId).not.toBeNull();
        });

        it('should get progress percentage', () => {
            const exercise = { name: 'Test', duration: 100 };
            timerManager.setExercise(exercise);
            
            expect(timerManager.getProgress()).toBe(0);
            
            timerManager.timeRemaining = 25;
            expect(timerManager.getProgress()).toBe(75);
            
            timerManager.timeRemaining = 0;
            expect(timerManager.getProgress()).toBe(100);
        });

        it('should format time correctly', () => {
            const exercise = { name: 'Test', duration: 100 };
            timerManager.setExercise(exercise);
            
            expect(timerManager.formatTime(0)).toBe('00:00');
            expect(timerManager.formatTime(30)).toBe('00:30');
            expect(timerManager.formatTime(60)).toBe('01:00');
            expect(timerManager.formatTime(90)).toBe('01:30');
            expect(timerManager.formatTime(3661)).toBe('61:01');
        });

        it('should not go below zero time remaining', () => {
            const exercise = { name: 'Test', duration: 1 };
            timerManager.setExercise(exercise);
            timerManager.start();
            
            // Advance time by much more than duration
            jest.advanceTimersByTime(5000);
            
            expect(timerManager.timeRemaining).toBe(0);
        });

        it('should clear existing timer when starting new one', () => {
            const exercise = { name: 'Test', duration: 60 };
            timerManager.setExercise(exercise);
            timerManager.start();
            
            const firstIntervalId = timerManager.intervalId;
            
            timerManager.start(); // Start again
            
            expect(timerManager.intervalId).not.toBe(firstIntervalId);
        });
    });
});