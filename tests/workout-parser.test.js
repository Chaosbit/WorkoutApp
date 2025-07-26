import { WorkoutParser } from '../js/workout-parser.js';

describe('WorkoutParser', () => {
    describe('parseMarkdown', () => {
        it('should parse basic workout with title and exercises', () => {
            const markdown = `# Push Day Workout

## Push Ups - 1:30
Rest - 0:15

## Squats - 0:45
Rest - 0:30`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.title).toBe('Push Day Workout');
            expect(result.exercises).toHaveLength(4);
            
            expect(result.exercises[0]).toMatchObject({
                name: 'Push Ups',
                duration: 90,
                exerciseType: 'timer',
                type: 'exercise'
            });
            
            expect(result.exercises[1]).toMatchObject({
                name: 'Rest',
                duration: 15,
                exerciseType: 'timer',
                type: 'rest'
            });
        });

        it('should parse sets notation correctly', () => {
            const markdown = `# Set Workout

## Burpees - 3 sets x 0:30 / 0:15`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.exercises).toHaveLength(5); // 3 exercise sets + 2 rest periods
            
            expect(result.exercises[0]).toMatchObject({
                name: 'Burpees (Set 1/3)',
                duration: 30,
                type: 'exercise'
            });
            
            expect(result.exercises[1]).toMatchObject({
                name: 'Rest between sets',
                duration: 15,
                type: 'rest'
            });
            
            expect(result.exercises[2]).toMatchObject({
                name: 'Burpees (Set 2/3)',
                duration: 30,
                type: 'exercise'
            });
        });

        it('should parse rep-based exercises', () => {
            const markdown = `# Rep Workout

## Push Ups - 20 reps
## Squats - 15 reps`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.exercises[0]).toMatchObject({
                name: 'Push Ups',
                reps: 20,
                exerciseType: 'reps',
                type: 'exercise'
            });
            
            expect(result.exercises[1]).toMatchObject({
                name: 'Squats',
                reps: 15,
                exerciseType: 'reps',
                type: 'exercise'
            });
        });

        it('should handle exercise descriptions', () => {
            const markdown = `# Workout with Descriptions

## Push Ups - 1:30
Standard push-up form
Keep core tight

## Rest - 0:15`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.exercises[0]).toMatchObject({
                name: 'Push Ups',
                duration: 90,
                description: 'Standard push-up form\nKeep core tight'
            });
        });

        it('should handle empty or invalid input gracefully', () => {
            expect(() => WorkoutParser.parseMarkdown('')).not.toThrow();
            expect(() => WorkoutParser.parseMarkdown('# Just a title')).not.toThrow();
            
            const result = WorkoutParser.parseMarkdown('');
            expect(result.title).toBe('');
            expect(result.exercises).toHaveLength(0);
        });

        it('should parse time formats correctly', () => {
            const markdown = `# Time Format Test

## Exercise 1 - 1:30
## Exercise 2 - 0:45
## Exercise 3 - 2:00`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.exercises[0].duration).toBe(90);  // 1:30
            expect(result.exercises[1].duration).toBe(45);  // 0:45
            expect(result.exercises[2].duration).toBe(120); // 2:00
        });

        it('should handle mixed exercise types', () => {
            const markdown = `# Mixed Workout

## Warm Up - 2:00
## Push Ups - 15 reps
## Plank - 1:30
## Squats - 20 reps`;

            const result = WorkoutParser.parseMarkdown(markdown);
            
            expect(result.exercises[0]).toMatchObject({
                name: 'Warm Up',
                duration: 120,
                exerciseType: 'timer'
            });
            
            expect(result.exercises[1]).toMatchObject({
                name: 'Push Ups',
                reps: 15,
                exerciseType: 'reps'
            });
            
            expect(result.exercises[2]).toMatchObject({
                name: 'Plank',
                duration: 90,
                exerciseType: 'timer'
            });
            
            expect(result.exercises[3]).toMatchObject({
                name: 'Squats',
                reps: 20,
                exerciseType: 'reps'
            });
        });
    });
});