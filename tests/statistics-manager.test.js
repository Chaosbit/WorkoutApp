import { StatisticsManager } from '../js/statistics-manager.js';

describe('StatisticsManager', () => {
    let statisticsManager;
    
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        statisticsManager = new StatisticsManager();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('initialization', () => {
        it('should initialize with default stats when no stored data', () => {
            const stats = statisticsManager.getStats();
            
            expect(stats).toMatchObject({
                totalWorkouts: 0,
                completedWorkouts: 0,
                totalTimeSeconds: 0,
                totalExercises: 0,
                streakDays: 0,
                lastWorkoutDate: null
            });
        });

        it('should load existing stats from localStorage', () => {
            const existingStats = {
                totalWorkouts: 5,
                completedWorkouts: 3,
                totalTimeSeconds: 1200,
                totalExercises: 25,
                streakDays: 2,
                lastWorkoutDate: '2024-01-15'
            };
            
            localStorage.setItem('workoutStats', JSON.stringify(existingStats));
            
            const newManager = new StatisticsManager();
            const stats = newManager.getStats();
            
            expect(stats).toMatchObject(existingStats);
        });
    });

    describe('workout session management', () => {
        it('should start a new workout session', () => {
            const exercises = [
                { name: 'Push Ups', duration: 60, exerciseType: 'timer' },
                { name: 'Rest', duration: 30, exerciseType: 'timer' }
            ];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            
            expect(statisticsManager.currentSession).toBeTruthy();
            expect(statisticsManager.currentSession.workoutName).toBe('Test Workout');
            expect(statisticsManager.currentSession.exercises).toHaveLength(2);
            expect(statisticsManager.currentSession.status).toBe('in_progress');
        });

        it('should track exercise completion', () => {
            const exercises = [
                { name: 'Push Ups', duration: 60, exerciseType: 'timer' },
                { name: 'Rest', duration: 30, exerciseType: 'timer' }
            ];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            statisticsManager.startExercise(0);
            statisticsManager.completeExercise(0);
            
            expect(statisticsManager.currentSession.exercises[0].completed).toBe(true);
            expect(statisticsManager.currentSession.exercises[0].endTime).toBeTruthy();
        });

        it('should complete workout and update stats', () => {
            const exercises = [
                { name: 'Push Ups', duration: 60, exerciseType: 'timer' },
                { name: 'Rest', duration: 30, exerciseType: 'timer' }
            ];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            statisticsManager.startExercise(0);
            statisticsManager.completeExercise(0);
            statisticsManager.startExercise(1);
            statisticsManager.completeExercise(1);
            statisticsManager.completeSession();
            
            const stats = statisticsManager.getStats();
            
            expect(stats.totalWorkouts).toBe(1);
            expect(stats.completedWorkouts).toBe(1);
            expect(statisticsManager.currentSession).toBeNull();
        });

        it('should handle abandoned workout', () => {
            const exercises = [
                { name: 'Push Ups', duration: 60, exerciseType: 'timer' },
                { name: 'Rest', duration: 30, exerciseType: 'timer' }
            ];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            statisticsManager.startExercise(0);
            statisticsManager.completeExercise(0);
            statisticsManager.abandonSession(); // Abandon without completing all exercises
            
            const stats = statisticsManager.getStats();
            
            expect(stats.totalWorkouts).toBe(1);
            expect(stats.completedWorkouts).toBe(0); // Not fully completed
            expect(statisticsManager.currentSession).toBeNull();
        });
    });

    describe('streak calculation', () => {
        it('should calculate streak for consecutive days', () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Set up existing stats with yesterday's workout
            const existingStats = {
                totalWorkouts: 1,
                completedWorkouts: 1,
                totalTimeSeconds: 300,
                totalExercises: 5,
                streakDays: 1,
                lastWorkoutDate: yesterday.toISOString().split('T')[0]
            };
            
            localStorage.setItem('workoutStats', JSON.stringify(existingStats));
            
            const newManager = new StatisticsManager();
            
            // Complete a workout today
            const workout = {
                title: 'Test Workout',
                exercises: [{ name: 'Push Ups', duration: 60 }]
            };
            
            newManager.startWorkout(workout);
            newManager.completeExercise(0, 60);
            newManager.completeWorkout();
            
            const stats = newManager.getStats();
            expect(stats.streakDays).toBe(2);
        });

        it('should reset streak for non-consecutive days', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            // Set up existing stats with old workout
            const existingStats = {
                totalWorkouts: 1,
                completedWorkouts: 1,
                totalTimeSeconds: 300,
                totalExercises: 5,
                streakDays: 1,
                lastWorkoutDate: threeDaysAgo.toISOString().split('T')[0]
            };
            
            localStorage.setItem('workoutStats', JSON.stringify(existingStats));
            
            const newManager = new StatisticsManager();
            
            // Complete a workout today
            const workout = {
                title: 'Test Workout',
                exercises: [{ name: 'Push Ups', duration: 60 }]
            };
            
            newManager.startWorkout(workout);
            newManager.completeExercise(0, 60);
            newManager.completeWorkout();
            
            const stats = newManager.getStats();
            expect(stats.streakDays).toBe(1); // Reset to 1
        });
    });

    describe('session storage', () => {
        it('should save workout sessions', () => {
            const exercises = [{ name: 'Push Ups', duration: 60, exerciseType: 'timer' }];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            statisticsManager.startExercise(0);
            statisticsManager.completeExercise(0);
            statisticsManager.completeSession();
            
            const sessions = statisticsManager.getRecentSessions();
            expect(sessions).toHaveLength(1);
            expect(sessions[0].workoutName).toBe('Test Workout');
        });

        it('should limit stored sessions to maximum count', () => {
            // Create many sessions
            for (let i = 0; i < 15; i++) {
                const exercises = [{ name: 'Exercise', duration: 30, exerciseType: 'timer' }];
                
                statisticsManager.startSession(`workout-${i}`, `Workout ${i}`, exercises);
                statisticsManager.startExercise(0);
                statisticsManager.completeExercise(0);
                statisticsManager.completeSession();
            }
            
            const sessions = statisticsManager.getRecentSessions(20);
            expect(sessions.length).toBeLessThanOrEqual(15);
        });
    });

    describe('data persistence', () => {
        it('should persist stats to localStorage', () => {
            const workout = {
                title: 'Test Workout',
                exercises: [{ name: 'Push Ups', duration: 60 }]
            };
            
            statisticsManager.startWorkout(workout);
            statisticsManager.completeExercise(0, 60);
            statisticsManager.completeWorkout();
            
            const storedStats = JSON.parse(localStorage.getItem('workoutStats'));
            expect(storedStats.totalWorkouts).toBe(1);
            expect(storedStats.completedWorkouts).toBe(1);
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('workoutStats', 'invalid json');
            localStorage.setItem('workoutSessions', 'invalid json');
            
            const newManager = new StatisticsManager();
            const stats = newManager.getStats();
            
            expect(stats).toMatchObject({
                totalWorkouts: 0,
                completedWorkouts: 0,
                totalTimeSeconds: 0,
                totalExercises: 0,
                streakDays: 0,
                lastWorkoutDate: null
            });
        });
    });

    describe('utility methods', () => {
        it('should clear all data', () => {
            // Add some data first
            const exercises = [{ name: 'Push Ups', duration: 60, exerciseType: 'timer' }];
            
            statisticsManager.startSession('workout-1', 'Test Workout', exercises);
            statisticsManager.startExercise(0);
            statisticsManager.completeExercise(0);
            statisticsManager.completeSession();
            
            statisticsManager.clearAllData();
            
            const stats = statisticsManager.getStats();
            expect(stats).toMatchObject({
                totalWorkouts: 0,
                completedWorkouts: 0,
                totalTimeSeconds: 0,
                streakDays: 0
            });
        });
    });
});