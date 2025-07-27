using System.ComponentModel.DataAnnotations;

namespace WorkoutApp.Api.Models;

public class UserStatistics
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public int TotalWorkouts { get; set; } = 0;
    public int CompletedWorkouts { get; set; } = 0;
    public long TotalTimeSeconds { get; set; } = 0;
    public int TotalExercises { get; set; } = 0;
    public int StreakDays { get; set; } = 0;
    public DateTime? LastWorkoutDate { get; set; }
    public DateTime? LastStreakUpdate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}