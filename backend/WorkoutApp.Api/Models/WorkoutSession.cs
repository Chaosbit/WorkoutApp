using System.ComponentModel.DataAnnotations;

namespace WorkoutApp.Api.Models;

public class WorkoutSession
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int WorkoutId { get; set; }

    [Required]
    [MaxLength(200)]
    public string WorkoutName { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    public int DurationSeconds { get; set; } = 0;
    public int ExercisesCompleted { get; set; } = 0;
    public int TotalExercises { get; set; } = 0;
    
    public bool IsCompleted { get; set; } = false;

    // Store additional session data as JSON
    public string? SessionData { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual UserWorkout Workout { get; set; } = null!;
}