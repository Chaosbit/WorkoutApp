using Microsoft.EntityFrameworkCore;
using WorkoutApp.Api.Models;

namespace WorkoutApp.Api.Data;

public class WorkoutAppDbContext : DbContext
{
    public WorkoutAppDbContext(DbContextOptions<WorkoutAppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkout> UserWorkouts { get; set; }
    public DbSet<UserStatistics> UserStatistics { get; set; }
    public DbSet<WorkoutSession> WorkoutSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // UserWorkout configuration
        modelBuilder.Entity<UserWorkout>(entity =>
        {
            entity.HasOne(w => w.User)
                  .WithMany(u => u.Workouts)
                  .HasForeignKey(w => w.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // UserStatistics configuration
        modelBuilder.Entity<UserStatistics>(entity =>
        {
            entity.HasOne(s => s.User)
                  .WithOne(u => u.Statistics)
                  .HasForeignKey<UserStatistics>(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // WorkoutSession configuration
        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.HasOne(s => s.User)
                  .WithMany()
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Workout)
                  .WithMany(w => w.Sessions)
                  .HasForeignKey(s => s.WorkoutId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        base.OnModelCreating(modelBuilder);
    }
}