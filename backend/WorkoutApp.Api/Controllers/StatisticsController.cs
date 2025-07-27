using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WorkoutApp.Api.Data;
using WorkoutApp.Api.DTOs;
using WorkoutApp.Api.Models;

namespace WorkoutApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly WorkoutAppDbContext _context;

    public StatisticsController(WorkoutAppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<StatisticsDto>> GetStatistics()
    {
        var userId = GetCurrentUserId();
        var statistics = await _context.UserStatistics
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (statistics == null)
        {
            // Create default statistics if they don't exist
            statistics = new UserStatistics
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.UserStatistics.Add(statistics);
            await _context.SaveChangesAsync();
        }

        var statisticsDto = new StatisticsDto
        {
            TotalWorkouts = statistics.TotalWorkouts,
            CompletedWorkouts = statistics.CompletedWorkouts,
            TotalTimeSeconds = statistics.TotalTimeSeconds,
            TotalExercises = statistics.TotalExercises,
            StreakDays = statistics.StreakDays,
            LastWorkoutDate = statistics.LastWorkoutDate,
            LastStreakUpdate = statistics.LastStreakUpdate,
            UpdatedAt = statistics.UpdatedAt
        };

        return Ok(statisticsDto);
    }

    [HttpPut]
    public async Task<ActionResult<StatisticsDto>> UpdateStatistics([FromBody] UpdateStatisticsRequest request)
    {
        var userId = GetCurrentUserId();
        var statistics = await _context.UserStatistics
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (statistics == null)
        {
            statistics = new UserStatistics
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserStatistics.Add(statistics);
        }

        statistics.TotalWorkouts = request.TotalWorkouts;
        statistics.CompletedWorkouts = request.CompletedWorkouts;
        statistics.TotalTimeSeconds = request.TotalTimeSeconds;
        statistics.TotalExercises = request.TotalExercises;
        statistics.StreakDays = request.StreakDays;
        statistics.LastWorkoutDate = request.LastWorkoutDate;
        statistics.UpdatedAt = DateTime.UtcNow;

        // Update streak if needed
        if (request.LastWorkoutDate.HasValue)
        {
            var today = DateTime.UtcNow.Date;
            var lastWorkoutDate = request.LastWorkoutDate.Value.Date;
            
            if (lastWorkoutDate == today && statistics.LastStreakUpdate?.Date != today)
            {
                // Workout completed today and streak not yet updated
                if (statistics.LastStreakUpdate?.Date == today.AddDays(-1))
                {
                    // Continue streak
                    statistics.StreakDays++;
                }
                else if (statistics.LastStreakUpdate == null || statistics.LastStreakUpdate.Value.Date < today.AddDays(-1))
                {
                    // Start new streak
                    statistics.StreakDays = 1;
                }
                statistics.LastStreakUpdate = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        var statisticsDto = new StatisticsDto
        {
            TotalWorkouts = statistics.TotalWorkouts,
            CompletedWorkouts = statistics.CompletedWorkouts,
            TotalTimeSeconds = statistics.TotalTimeSeconds,
            TotalExercises = statistics.TotalExercises,
            StreakDays = statistics.StreakDays,
            LastWorkoutDate = statistics.LastWorkoutDate,
            LastStreakUpdate = statistics.LastStreakUpdate,
            UpdatedAt = statistics.UpdatedAt
        };

        return Ok(statisticsDto);
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<List<WorkoutSessionDto>>> GetSessions([FromQuery] int? limit = null)
    {
        var userId = GetCurrentUserId();
        var query = _context.WorkoutSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartedAt);

        if (limit.HasValue)
        {
            query = (IOrderedQueryable<WorkoutSession>)query.Take(limit.Value);
        }

        var sessions = await query
            .Select(s => new WorkoutSessionDto
            {
                Id = s.Id,
                WorkoutId = s.WorkoutId,
                WorkoutName = s.WorkoutName,
                StartedAt = s.StartedAt,
                CompletedAt = s.CompletedAt,
                DurationSeconds = s.DurationSeconds,
                ExercisesCompleted = s.ExercisesCompleted,
                TotalExercises = s.TotalExercises,
                IsCompleted = s.IsCompleted,
                SessionData = s.SessionData
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<WorkoutSessionDto>> CreateSession([FromBody] CreateWorkoutSessionRequest request)
    {
        var userId = GetCurrentUserId();
        var session = new WorkoutSession
        {
            UserId = userId,
            WorkoutId = request.WorkoutId,
            WorkoutName = request.WorkoutName,
            StartedAt = DateTime.UtcNow,
            CompletedAt = request.IsCompleted ? DateTime.UtcNow : null,
            DurationSeconds = request.DurationSeconds,
            ExercisesCompleted = request.ExercisesCompleted,
            TotalExercises = request.TotalExercises,
            IsCompleted = request.IsCompleted,
            SessionData = request.SessionData
        };

        _context.WorkoutSessions.Add(session);
        await _context.SaveChangesAsync();

        var sessionDto = new WorkoutSessionDto
        {
            Id = session.Id,
            WorkoutId = session.WorkoutId,
            WorkoutName = session.WorkoutName,
            StartedAt = session.StartedAt,
            CompletedAt = session.CompletedAt,
            DurationSeconds = session.DurationSeconds,
            ExercisesCompleted = session.ExercisesCompleted,
            TotalExercises = session.TotalExercises,
            IsCompleted = session.IsCompleted,
            SessionData = session.SessionData
        };

        return CreatedAtAction(nameof(GetSessions), sessionDto);
    }
}