using System.ComponentModel.DataAnnotations;

namespace WorkoutApp.Api.Models;

public class UserWorkout
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty; // Markdown content

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<WorkoutSession> Sessions { get; set; } = [];
}