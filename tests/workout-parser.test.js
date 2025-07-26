/**
 * Unit tests for WorkoutParser class
 */

import { WorkoutParser } from '../js/workout-parser.js';

describe('WorkoutParser', () => {
  describe('parseMarkdown', () => {
    test('parses basic workout with title and exercises', () => {
      const markdown = `# Push Day Workout

## Push-ups - 0:30
Rest - 0:15

## Squats - 1:00
Rest - 0:20`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.title).toBe('Push Day Workout');
      expect(result.exercises).toHaveLength(4);
      
      expect(result.exercises[0]).toEqual({
        name: 'Push-ups',
        duration: 30,
        exerciseType: 'timer',
        type: 'exercise',
        description: ''
      });
      
      expect(result.exercises[1]).toEqual({
        name: 'Rest',
        duration: 15,
        exerciseType: 'timer',
        type: 'rest',
        description: 'Take a break and prepare for the next exercise'
      });
      
      expect(result.exercises[2]).toEqual({
        name: 'Squats',
        duration: 60,
        exerciseType: 'timer',
        type: 'exercise',
        description: ''
      });
      
      expect(result.exercises[3]).toEqual({
        name: 'Rest',
        duration: 20,
        exerciseType: 'timer',
        type: 'rest',
        description: 'Take a break and prepare for the next exercise'
      });
    });

    test('parses exercises with descriptions', () => {
      const markdown = `# Workout

## Push-ups - 0:30
Keep your back straight
Focus on proper form
Lower yourself slowly

## Squats - 1:00
Feet shoulder-width apart
Keep your knees over your toes`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises[0].description).toBe('Keep your back straight\nFocus on proper form\nLower yourself slowly');
      expect(result.exercises[1].description).toBe('Feet shoulder-width apart\nKeep your knees over your toes');
    });

    test('parses rep-based exercises', () => {
      const markdown = `# Rep Workout

## Push-ups - 20 reps
## Squats - 15 REPS
## Burpees - 10 Reps`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises).toHaveLength(3);
      
      expect(result.exercises[0]).toEqual({
        name: 'Push-ups',
        reps: 20,
        exerciseType: 'reps',
        type: 'exercise',
        completed: false,
        description: ''
      });
      
      expect(result.exercises[1]).toEqual({
        name: 'Squats',
        reps: 15,
        exerciseType: 'reps',
        type: 'exercise',
        completed: false,
        description: ''
      });
      
      expect(result.exercises[2]).toEqual({
        name: 'Burpees',
        reps: 10,
        exerciseType: 'reps',
        type: 'exercise',
        completed: false,
        description: ''
      });
    });

    test('parses sets syntax', () => {
      const markdown = `# Sets Workout

## Push-ups - 3 sets x 0:30 / 0:15`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises).toHaveLength(5); // 3 exercises + 2 rest periods
      
      // First set
      expect(result.exercises[0]).toEqual({
        name: 'Push-ups (Set 1/3)',
        duration: 30,
        exerciseType: 'timer',
        type: 'exercise',
        description: '',
        setInfo: {
          exerciseName: 'Push-ups',
          setNumber: 1,
          totalSets: 3,
          isSet: true
        }
      });
      
      // First rest
      expect(result.exercises[1]).toEqual({
        name: 'Rest between sets',
        duration: 15,
        exerciseType: 'timer',
        type: 'rest',
        description: 'Rest before the next set',
        setInfo: {
          exerciseName: 'Push-ups',
          setNumber: 1,
          totalSets: 3,
          isRest: true
        }
      });
      
      // Second set
      expect(result.exercises[2]).toEqual({
        name: 'Push-ups (Set 2/3)',
        duration: 30,
        exerciseType: 'timer',
        type: 'exercise',
        description: '',
        setInfo: {
          exerciseName: 'Push-ups',
          setNumber: 2,
          totalSets: 3,
          isSet: true
        }
      });
      
      // Second rest
      expect(result.exercises[3]).toEqual({
        name: 'Rest between sets',
        duration: 15,
        exerciseType: 'timer',
        type: 'rest',
        description: 'Rest before the next set',
        setInfo: {
          exerciseName: 'Push-ups',
          setNumber: 2,
          totalSets: 3,
          isRest: true
        }
      });
      
      // Third set (no rest after)
      expect(result.exercises[4]).toEqual({
        name: 'Push-ups (Set 3/3)',
        duration: 30,
        exerciseType: 'timer',
        type: 'exercise',
        description: '',
        setInfo: {
          exerciseName: 'Push-ups',
          setNumber: 3,
          totalSets: 3,
          isSet: true
        }
      });
    });

    test('handles workout without title', () => {
      const markdown = `## Push-ups - 0:30
## Squats - 1:00`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.title).toBe('');
      expect(result.exercises).toHaveLength(2);
    });

    test('handles empty lines and whitespace', () => {
      const markdown = `# Workout

## Push-ups - 0:30


## Squats - 1:00
   
Rest - 0:15

   `;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.title).toBe('Workout');
      expect(result.exercises).toHaveLength(3);
    });

    test('supports ### headers for exercises', () => {
      const markdown = `# Workout
### Push-ups - 0:30
### Squats - 1:00`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0].name).toBe('Push-ups');
      expect(result.exercises[1].name).toBe('Squats');
    });

    test('throws error for exercises without time format', () => {
      const markdown = `# Workout
## Push-ups`;

      expect(() => {
        WorkoutParser.parseMarkdown(markdown);
      }).toThrow('Exercise "Push-ups" is missing time format (e.g., "- 1:30")');
    });

    test('throws error for exercises with invalid format', () => {
      const markdown = `# Workout
## Push-ups - invalid format`;

      expect(() => {
        WorkoutParser.parseMarkdown(markdown);
      }).toThrow('Exercise "Push-ups - invalid format" is missing time format (e.g., "- 1:30")');
    });

    test('handles complex time formats', () => {
      const markdown = `# Workout
## Exercise 1 - 0:05
## Exercise 2 - 1:30
## Exercise 3 - 10:00
## Exercise 4 - 99:59`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises[0].duration).toBe(5);
      expect(result.exercises[1].duration).toBe(90);
      expect(result.exercises[2].duration).toBe(600);
      expect(result.exercises[3].duration).toBe(5999);
    });

    test('handles rest periods with different cases', () => {
      const markdown = `# Workout
## Push-ups - 0:30
REST - 0:15
## Squats - 1:00
rest - 0:20
## Lunges - 0:45
Rest - 0:10`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises).toHaveLength(6);
      expect(result.exercises[1].name).toBe('Rest');
      expect(result.exercises[1].duration).toBe(15);
      expect(result.exercises[3].name).toBe('Rest');
      expect(result.exercises[3].duration).toBe(20);
      expect(result.exercises[5].name).toBe('Rest');
      expect(result.exercises[5].duration).toBe(10);
    });

    test('handles mixed exercise types', () => {
      const markdown = `# Mixed Workout
## Push-ups - 0:30
Description for push-ups
Rest - 0:15

## Squats - 20 reps
Keep good form

## Burpees - 3 sets x 0:45 / 0:20
High intensity`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      expect(result.exercises).toHaveLength(8); // push-ups, rest, squats, 3 burpee sets + 2 rests
      
      // Timed exercise
      expect(result.exercises[0].exerciseType).toBe('timer');
      expect(result.exercises[0].duration).toBe(30);
      
      // Rep exercise  
      expect(result.exercises[2].exerciseType).toBe('reps');
      expect(result.exercises[2].reps).toBe(20);
      
      // Sets exercise
      expect(result.exercises[3].exerciseType).toBe('timer');
      expect(result.exercises[3].name).toBe('Burpees (Set 1/3)');
    });

    test('preserves exercise descriptions with sets', () => {
      const markdown = `# Workout
## Push-ups - 2 sets x 0:30 / 0:15
Keep your form strict
Focus on the negative`;

      const result = WorkoutParser.parseMarkdown(markdown);
      
      // The description should be added to the last set of the previous exercise
      // Since we process sets immediately, the description will be on the last exercise added
      expect(result.exercises[2].description).toBe('Keep your form strict\nFocus on the negative');
    });

    test('handles empty content', () => {
      const result = WorkoutParser.parseMarkdown('');
      
      expect(result.title).toBe('');
      expect(result.exercises).toHaveLength(0);
    });

    test('handles content with only title', () => {
      const result = WorkoutParser.parseMarkdown('# My Workout');
      
      expect(result.title).toBe('My Workout');
      expect(result.exercises).toHaveLength(0);
    });
  });
});