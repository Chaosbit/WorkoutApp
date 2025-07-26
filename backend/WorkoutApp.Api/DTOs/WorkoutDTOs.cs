using System.ComponentModel.DataAnnotations;

namespace WorkoutApp.Api.DTOs;

public class WorkoutDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
}

public class CreateWorkoutRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;
}

public class UpdateWorkoutRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;
}

public class SyncWorkoutsRequest
{
    public List<WorkoutDto> Workouts { get; set; } = [];
}

public class SyncWorkoutsResponse
{
    public List<WorkoutDto> Workouts { get; set; } = [];
    public DateTime LastSyncAt { get; set; } = DateTime.UtcNow;
}