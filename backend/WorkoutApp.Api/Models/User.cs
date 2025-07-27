using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkoutApp.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLoginAt { get; set; }
    
    [MaxLength(100)]
    public string? ReferredBy { get; set; }
    
    public bool RequiresApproval { get; set; } = true;
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    
    [MaxLength(100)]
    public string? ApprovedBy { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<UserWorkout> Workouts { get; set; } = [];
    public virtual UserStatistics? Statistics { get; set; }
}