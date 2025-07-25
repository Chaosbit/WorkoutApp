# Workout Format Specification

This document defines the official markdown format specification for workout files used by the Workout Timer PWA.

## Table of Contents

- [Overview](#overview)
- [Basic Structure](#basic-structure)
- [Syntax Reference](#syntax-reference)
- [Exercise Types](#exercise-types)
- [Validation Rules](#validation-rules)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

Workout files are written in Markdown format (`.md`) and parsed by the application to create structured workout sessions with timers, exercises, and rest periods. The format supports multiple exercise types including timed exercises, rep-based exercises, and multi-set routines.

## Basic Structure

Every workout file follows this basic structure:

```markdown
# Workout Title

## Exercise 1 - [time|reps|sets]
Optional exercise description

Rest - [time]

## Exercise 2 - [time|reps|sets]
Optional exercise description

Rest - [time]
```

### Required Elements

1. **Workout Title**: Must start with a single `#` (H1 header)
2. **Exercise Headers**: Must start with `##` (H2 header) or `###` (H3 header)
3. **Time Format**: Times must be in `MM:SS` format (e.g., `1:30`, `0:45`)

## Syntax Reference

### Workout Title

```markdown
# Workout Title
```

- **Required**: Yes
- **Format**: Single `#` followed by space and title text
- **Example**: `# Push Day Workout`

### Exercise Headers

Exercise headers define individual exercises and their parameters.

#### Timed Exercise Format

```markdown
## Exercise Name - MM:SS
```

- **Format**: `##` + space + exercise name + ` - ` + time in `MM:SS`
- **Example**: `## Push-ups - 1:30`
- **Time Range**: `0:01` to `59:59`

#### Rep-Based Exercise Format

```markdown
## Exercise Name - N reps
```

- **Format**: `##` + space + exercise name + ` - ` + number + ` reps`
- **Example**: `## Push-ups - 15 reps`
- **Alternative**: `rep` (singular) is also accepted
- **Range**: 1 to 999 reps

#### Sets Format

```markdown
## Exercise Name - N sets x MM:SS / MM:SS
```

- **Format**: `##` + space + exercise name + ` - ` + sets + ` sets x ` + work time + ` / ` + rest time
- **Example**: `## Burpees - 3 sets x 0:45 / 0:15`
- **Alternative**: `set` (singular) is also accepted for N=1
- **Sets Range**: 1 to 99 sets
- **Time Range**: `0:01` to `59:59` for both work and rest periods

### Rest Periods

```markdown
Rest - MM:SS
```

- **Format**: `Rest` (case-insensitive) + ` - ` + time in `MM:SS`
- **Example**: `Rest - 0:30`
- **Placement**: Typically follows exercise blocks
- **Time Range**: `0:01` to `59:59`

### Exercise Descriptions

```markdown
## Exercise Name - 1:30
This is an optional description of the exercise.
It can span multiple lines and provide detailed instructions.

Use proper form and breathe consistently.
```

- **Format**: Plain text lines following an exercise header
- **Termination**: Ends when next header or rest period is encountered
- **Content**: Can include instructions, tips, or exercise details

## Exercise Types

### 1. Timer-Based Exercises

Timer-based exercises run for a specified duration with a countdown timer.

```markdown
## Push-ups - 1:30
## Plank - 2:00
## Mountain Climbers - 0:45
```

**Characteristics:**
- Fixed duration
- Countdown timer display
- Auto-advance to next exercise
- Visual progress indication

### 2. Rep-Based Exercises

Rep-based exercises require the user to complete a specific number of repetitions.

```markdown
## Push-ups - 20 reps
## Squats - 15 reps
## Burpees - 10 reps
```

**Characteristics:**
- No automatic timer
- Manual completion by user
- Checkbox-style completion tracking
- User controls progression

### 3. Set-Based Exercises

Set-based exercises automatically create multiple rounds with rest periods.

```markdown
## Burpees - 3 sets x 0:45 / 0:15
## Jump Squats - 4 sets x 0:30 / 0:10
```

**Expansion:**
The sets format automatically expands into individual exercises:
- Exercise (Set 1/3) - 0:45
- Rest between sets - 0:15
- Exercise (Set 2/3) - 0:45
- Rest between sets - 0:15
- Exercise (Set 3/3) - 0:45

**Characteristics:**
- Automatic expansion into individual exercises
- Labeled with set numbers (e.g., "Set 1/3")
- Consistent rest periods between sets
- No rest after the final set

### 4. Rest Periods

Rest periods provide recovery time between exercises.

```markdown
Rest - 1:00
Rest - 0:30
```

**Characteristics:**
- Countdown timer
- "Rest" label in UI
- Standard rest instructions
- Optional custom descriptions

## Validation Rules

### Time Format Validation

- **Pattern**: `MM:SS` where MM is 0-59 and SS is 00-59
- **Valid**: `0:30`, `1:45`, `10:00`, `59:59`
- **Invalid**: `1:60`, `60:00`, `1:5`, `90:30`

### Exercise Name Validation

- **Required**: Exercise names cannot be empty
- **Format**: Any non-empty string before the ` - ` separator
- **Trimming**: Leading and trailing whitespace is automatically removed

### Sets Validation

- **Range**: 1-99 sets allowed
- **Format**: Must be positive integer followed by ` sets` or ` set`
- **Times**: Both work and rest times must be valid `MM:SS` format

### Reps Validation

- **Range**: 1-999 reps allowed
- **Format**: Must be positive integer followed by ` reps` or ` rep`

### Header Level Validation

- **Exercise Headers**: Must be `##` (H2) or `###` (H3) level
- **Workout Title**: Must be `#` (H1) level
- **Consistency**: H4+ headers are ignored for exercise parsing

## Examples

### Basic Workout

```markdown
# Morning Routine

## Warm-up - 5:00
Light cardio and dynamic stretching to prepare your body.

## Push-ups - 1:00
Rest - 0:30

## Squats - 1:30
Rest - 0:30

## Cool Down - 3:00
```

### Sets-Based Workout

```markdown
# HIIT Training

## Burpees - 4 sets x 0:30 / 0:15
High-intensity full-body exercise.

## Mountain Climbers - 3 sets x 0:45 / 0:20
Keep your core engaged and maintain steady pace.

## Cool Down - 2:00
```

### Mixed Format Workout

```markdown
# Strength Training

## Warm-up - 3:00

## Push-ups - 20 reps
Complete all reps at your own pace.

## Bench Press - 3 sets x 1:00 / 0:30
Focus on controlled movements.

## Plank - 2:00
Hold steady position.

Rest - 1:00

## Cool Down - 5:00
```

### Rep-Only Workout

```markdown
# Bodyweight Challenge

## Push-ups - 50 reps
## Squats - 100 reps
## Sit-ups - 75 reps
## Burpees - 25 reps
```

## Error Handling

### Invalid Exercise Format

When an exercise header doesn't match any supported format:

```markdown
## Invalid Exercise Name
```

**Result**: Throws parsing error with message: 
`Exercise "Invalid Exercise Name" is missing time format (e.g., "- 1:30")`

### Invalid Time Format

Times that don't match `MM:SS` pattern are rejected:

```markdown
## Push-ups - 1:75  # Invalid: seconds > 59
## Squats - 60:00   # Invalid: minutes >= 60
## Plank - 1:5      # Invalid: single digit seconds
```

### Invalid Sets Format

Malformed sets syntax results in parsing errors:

```markdown
## Burpees - 3 sets x 0:30 / 1:75  # Invalid rest time
## Squats - 0 sets x 0:30 / 0:15   # Invalid: zero sets
```

## Best Practices

### Structure

1. **Start with a clear title** using `#` header
2. **Use descriptive exercise names** that clearly identify the movement
3. **Include rest periods** between intense exercises
4. **Add descriptions** for complex or unfamiliar exercises

### Timing

1. **Use realistic durations** that match your fitness level
2. **Include warm-up and cool-down** periods
3. **Balance work and rest** ratios appropriately
4. **Test timing** before finalizing the workout

### Organization

1. **Group similar exercises** together when possible
2. **Use sets format** for repeated exercises with consistent timing
3. **Include variety** to prevent monotony
4. **Consider progression** from easier to more challenging exercises

### File Management

1. **Use descriptive filenames** (e.g., `upper-body-strength.md`)
2. **Keep backups** of tested workout files
3. **Version control** for iterative improvements
4. **Test parsing** before using in live workouts

### Common Patterns

#### HIIT Structure
```markdown
# HIIT Workout
## Warm-up - 3:00
## Exercise 1 - 4 sets x 0:30 / 0:15
## Exercise 2 - 4 sets x 0:30 / 0:15
## Cool Down - 2:00
```

#### Strength Training Structure
```markdown
# Strength Training
## Warm-up - 5:00
## Compound Movement - 3 sets x 1:00 / 0:45
## Isolation Exercise - 3 sets x 0:45 / 0:30
## Cool Down - 3:00
```

#### Endurance Structure
```markdown
# Endurance Training
## Warm-up - 5:00
## Main Exercise - 20:00
Rest - 2:00
## Finisher - 5:00
## Cool Down - 5:00
```

---

This specification is based on the current implementation of the Workout Timer PWA parser and defines all supported syntax patterns and validation rules.