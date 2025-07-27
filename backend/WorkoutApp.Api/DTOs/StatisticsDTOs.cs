namespace WorkoutApp.Api.DTOs;

public class StatisticsDto
{
    public int TotalWorkouts { get; set; }
    public int CompletedWorkouts { get; set; }
    public long TotalTimeSeconds { get; set; }
    public int TotalExercises { get; set; }
    public int StreakDays { get; set; }
    public DateTime? LastWorkoutDate { get; set; }
    public DateTime? LastStreakUpdate { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateStatisticsRequest
{
    public int TotalWorkouts { get; set; }
    public int CompletedWorkouts { get; set; }
    public long TotalTimeSeconds { get; set; }
    public int TotalExercises { get; set; }
    public int StreakDays { get; set; }
    public DateTime? LastWorkoutDate { get; set; }
}

public class WorkoutSessionDto
{
    public int Id { get; set; }
    public int WorkoutId { get; set; }
    public string WorkoutName { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int DurationSeconds { get; set; }
    public int ExercisesCompleted { get; set; }
    public int TotalExercises { get; set; }
    public bool IsCompleted { get; set; }
    public string? SessionData { get; set; }
}

public class CreateWorkoutSessionRequest
{
    public int WorkoutId { get; set; }
    public string WorkoutName { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public int ExercisesCompleted { get; set; }
    public int TotalExercises { get; set; }
    public bool IsCompleted { get; set; }
    public string? SessionData { get; set; }
}