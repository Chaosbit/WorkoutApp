/**
 * WorkoutParser - Parses markdown workout files into structured workout data
 */
export class WorkoutParser {
    /**
     * Parse markdown content into workout structure
     * @param {string} content - Markdown content to parse
     * @returns {Object} Parsed workout with title and exercises
     * @throws {Error} If exercise format is invalid
     */
    static parseMarkdown(content) {
        const lines = content.split('\n').map(line => line.trim());
        const workout = {
            title: '',
            exercises: []
        };
        
        let currentExercise = null;
        let descriptionLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (!line) continue;
            
            if (line.startsWith('# ')) {
                workout.title = line.substring(2).trim();
            } else if (line.startsWith('## ') || line.startsWith('### ')) {
                if (currentExercise && descriptionLines.length > 0) {
                    currentExercise.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                
                const exerciseLine = line.replace(/^#{2,3}\s+/, '');
                
                // Check for sets syntax: "Exercise Name - 3 sets x 0:30 / 0:15"
                const setsMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+)\s+sets?\s*x\s*(\d+):(\d+)\s*\/\s*(\d+):(\d+)$/);
                if (setsMatch) {
                    const [, name, sets, exMinutes, exSeconds, restMinutes, restSeconds] = setsMatch;
                    const exerciseDuration = parseInt(exMinutes) * 60 + parseInt(exSeconds);
                    const restDuration = parseInt(restMinutes) * 60 + parseInt(restSeconds);
                    const numSets = parseInt(sets);
                    
                    // Add each set as separate exercises
                    for (let setNum = 1; setNum <= numSets; setNum++) {
                        currentExercise = {
                            name: `${name.trim()} (Set ${setNum}/${numSets})`,
                            duration: exerciseDuration,
                            exerciseType: 'timer',
                            type: 'exercise',
                            description: '',
                            setInfo: {
                                exerciseName: name.trim(),
                                setNumber: setNum,
                                totalSets: numSets,
                                isSet: true
                            }
                        };
                        workout.exercises.push(currentExercise);
                        
                        // Add rest between sets (except after the last set)
                        if (setNum < numSets) {
                            const restExercise = {
                                name: 'Rest between sets',
                                duration: restDuration,
                                exerciseType: 'timer',
                                type: 'rest',
                                description: 'Rest before the next set',
                                setInfo: {
                                    exerciseName: name.trim(),
                                    setNumber: setNum,
                                    totalSets: numSets,
                                    isRest: true
                                }
                            };
                            workout.exercises.push(restExercise);
                        }
                    }
                    continue;
                }
                
                // Check for regular time syntax: "Exercise Name - 1:30"
                const timeMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+):(\d+)$/);
                // Check for rep syntax: "Exercise Name - 10 reps"
                const repMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+)\s+reps?$/i);
                if (timeMatch) {
                    const [, name, minutes, seconds] = timeMatch;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    currentExercise = {
                        name: name.trim(),
                        duration: duration,
                        exerciseType: 'timer',
                        type: 'exercise',
                        description: ''
                    };
                    workout.exercises.push(currentExercise);
                } else if (repMatch) {
                    const [, name, reps] = repMatch;
                    currentExercise = {
                        name: name.trim(),
                        reps: parseInt(reps),
                        exerciseType: 'reps',
                        type: 'exercise',
                        completed: false,
                        description: ''
                    };
                    workout.exercises.push(currentExercise);
                } else {
                    // For validation purposes, exercises should have explicit time formats
                    // If no time format is found, this could be an error
                    throw new Error(`Exercise "${exerciseLine}" is missing time format (e.g., "- 1:30")`);
                }
            } else if (line.toLowerCase().startsWith('rest') && line.includes('-')) {
                if (currentExercise && descriptionLines.length > 0) {
                    currentExercise.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                
                const match = line.match(/rest\s*-\s*(\d+):(\d+)/i);
                if (match) {
                    const [, minutes, seconds] = match;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    currentExercise = {
                        name: 'Rest',
                        duration: duration,
                        exerciseType: 'timer',
                        type: 'rest',
                        description: 'Take a break and prepare for the next exercise'
                    };
                    workout.exercises.push(currentExercise);
                }
            } else if (currentExercise && line && !line.startsWith('#')) {
                descriptionLines.push(line);
            }
        }
        
        if (currentExercise && descriptionLines.length > 0) {
            currentExercise.description = descriptionLines.join('\n').trim();
        }
        
        return workout;
    }
}