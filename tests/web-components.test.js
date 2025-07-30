/**
 * Tests for Web Components
 * Basic functionality tests for the new web components
 */

// Mock Material Icons
const mockMaterialIcons = document.createElement('style');
mockMaterialIcons.textContent = '.material-icons { font-family: monospace; }';
document.head.appendChild(mockMaterialIcons);

describe('Web Components', () => {
    beforeEach(() => {
        // Clean up DOM before each test
        document.body.innerHTML = '';
    });

    describe('TimerDisplayComponent', () => {
        beforeEach(() => {
            // Import the component module
            if (!customElements.get('timer-display')) {
                require('../js/components/timer-display.js');
            }
        });

        test('should be defined as a custom element', () => {
            expect(customElements.get('timer-display')).toBeDefined();
        });

        test('should render with shadow DOM', () => {
            const element = document.createElement('timer-display');
            document.body.appendChild(element);
            
            expect(element.shadowRoot).toBeDefined();
            expect(element.shadowRoot.querySelector('.timer-display-container')).toBeTruthy();
        });

        test('should update exercise display when setExercise is called', () => {
            const element = document.createElement('timer-display');
            document.body.appendChild(element);
            
            const mockExercise = {
                name: 'Test Exercise',
                duration: 60,
                exerciseType: 'timer'
            };
            
            element.setExercise(mockExercise);
            
            const exerciseName = element.shadowRoot.querySelector('#exerciseName');
            expect(exerciseName.textContent).toBe('Test Exercise');
        });

        test('should handle rep-based exercises', () => {
            const element = document.createElement('timer-display');
            document.body.appendChild(element);
            
            const mockExercise = {
                name: 'Push-ups',
                reps: 20,
                exerciseType: 'reps'
            };
            
            element.setExercise(mockExercise);
            
            const repsDisplay = element.shadowRoot.querySelector('#repsDisplay');
            expect(repsDisplay.style.display).toBe('flex');
        });

        test('should emit rep-completed event when complete button is clicked', () => {
            const element = document.createElement('timer-display');
            document.body.appendChild(element);
            
            const mockExercise = {
                name: 'Squats',
                reps: 15,
                exerciseType: 'reps'
            };
            
            element.setExercise(mockExercise);
            
            let eventFired = false;
            element.addEventListener('rep-completed', () => {
                eventFired = true;
            });
            
            const completeBtn = element.shadowRoot.querySelector('#completeRepBtn');
            completeBtn.click();
            
            expect(eventFired).toBe(true);
        });
    });

    describe('WorkoutControlsComponent', () => {
        beforeEach(() => {
            if (!customElements.get('workout-controls')) {
                require('../js/components/workout-controls.js');
            }
        });

        test('should be defined as a custom element', () => {
            expect(customElements.get('workout-controls')).toBeDefined();
        });

        test('should render control buttons with shadow DOM', () => {
            const element = document.createElement('workout-controls');
            document.body.appendChild(element);
            
            expect(element.shadowRoot).toBeDefined();
            expect(element.shadowRoot.querySelector('#startBtn')).toBeTruthy();
            expect(element.shadowRoot.querySelector('#pauseBtn')).toBeTruthy();
            expect(element.shadowRoot.querySelector('#skipBtn')).toBeTruthy();
            expect(element.shadowRoot.querySelector('#resetBtn')).toBeTruthy();
        });

        test('should emit workout-start event when start button is clicked', () => {
            const element = document.createElement('workout-controls');
            document.body.appendChild(element);
            
            element.setAttribute('can-start', 'true');
            
            let eventFired = false;
            element.addEventListener('workout-start', () => {
                eventFired = true;
            });
            
            const startBtn = element.shadowRoot.querySelector('#startBtn');
            startBtn.click();
            
            expect(eventFired).toBe(true);
        });

        test('should update button states based on attributes', () => {
            const element = document.createElement('workout-controls');
            document.body.appendChild(element);
            
            // Initially buttons should be disabled
            const startBtn = element.shadowRoot.querySelector('#startBtn');
            expect(startBtn.disabled).toBe(true);
            
            // Enable start button
            element.setAttribute('can-start', 'true');
            expect(startBtn.disabled).toBe(false);
            
            // Set running state
            element.setAttribute('is-running', 'true');
            expect(startBtn.disabled).toBe(true);
        });
    });

    describe('ExerciseListComponent', () => {
        beforeEach(() => {
            if (!customElements.get('exercise-list')) {
                require('../js/components/exercise-list.js');
            }
        });

        test('should be defined as a custom element', () => {
            expect(customElements.get('exercise-list')).toBeDefined();
        });

        test('should render with shadow DOM', () => {
            const element = document.createElement('exercise-list');
            document.body.appendChild(element);
            
            expect(element.shadowRoot).toBeDefined();
            expect(element.shadowRoot.querySelector('.exercise-list-container')).toBeTruthy();
        });

        test('should display workout exercises when setWorkout is called', () => {
            const element = document.createElement('exercise-list');
            document.body.appendChild(element);
            
            const mockWorkout = {
                title: 'Test Workout',
                exercises: [
                    { name: 'Warm-up', duration: 300, exerciseType: 'timer' },
                    { name: 'Push-ups', reps: 20, exerciseType: 'reps' },
                    { name: 'Rest', duration: 15, type: 'rest' }
                ]
            };
            
            element.setWorkout(mockWorkout);
            
            const exerciseItems = element.shadowRoot.querySelectorAll('.exercise-item');
            expect(exerciseItems.length).toBe(3);
        });

        test('should emit exercise-selected event when exercise is clicked', () => {
            const element = document.createElement('exercise-list');
            document.body.appendChild(element);
            
            const mockWorkout = {
                title: 'Test Workout',
                exercises: [
                    { name: 'Test Exercise', duration: 60, exerciseType: 'timer' }
                ]
            };
            
            element.setWorkout(mockWorkout);
            
            let selectedIndex = -1;
            element.addEventListener('exercise-selected', (e) => {
                selectedIndex = e.detail.exerciseIndex;
            });
            
            const exerciseItem = element.shadowRoot.querySelector('.exercise-item');
            exerciseItem.click();
            
            expect(selectedIndex).toBe(0);
        });

        test('should update exercise states based on current index', () => {
            const element = document.createElement('exercise-list');
            document.body.appendChild(element);
            
            const mockWorkout = {
                title: 'Test Workout',
                exercises: [
                    { name: 'Exercise 1', duration: 60, exerciseType: 'timer' },
                    { name: 'Exercise 2', duration: 60, exerciseType: 'timer' }
                ]
            };
            
            element.setWorkout(mockWorkout);
            element.setAttribute('current-exercise-index', '1');
            
            const exerciseItems = element.shadowRoot.querySelectorAll('.exercise-item');
            expect(exerciseItems[0].classList.contains('completed')).toBe(false);
            expect(exerciseItems[1].classList.contains('current')).toBe(true);
        });
    });
});