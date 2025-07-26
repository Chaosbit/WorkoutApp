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
public class WorkoutsController : ControllerBase
{
    private readonly WorkoutAppDbContext _context;

    public WorkoutsController(WorkoutAppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkoutDto>>> GetWorkouts()
    {
        var userId = GetCurrentUserId();
        var workouts = await _context.UserWorkouts
            .Where(w => w.UserId == userId && !w.IsDeleted)
            .Select(w => new WorkoutDto
            {
                Id = w.Id,
                Name = w.Name,
                Content = w.Content,
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt,
                LastUsedAt = w.LastUsedAt
            })
            .ToListAsync();

        return Ok(workouts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkoutDto>> GetWorkout(int id)
    {
        var userId = GetCurrentUserId();
        var workout = await _context.UserWorkouts
            .Where(w => w.Id == id && w.UserId == userId && !w.IsDeleted)
            .Select(w => new WorkoutDto
            {
                Id = w.Id,
                Name = w.Name,
                Content = w.Content,
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt,
                LastUsedAt = w.LastUsedAt
            })
            .FirstOrDefaultAsync();

        if (workout == null)
        {
            return NotFound();
        }

        return Ok(workout);
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> CreateWorkout([FromBody] CreateWorkoutRequest request)
    {
        var userId = GetCurrentUserId();
        var workout = new UserWorkout
        {
            UserId = userId,
            Name = request.Name,
            Content = request.Content
        };

        _context.UserWorkouts.Add(workout);
        await _context.SaveChangesAsync();

        var workoutDto = new WorkoutDto
        {
            Id = workout.Id,
            Name = workout.Name,
            Content = workout.Content,
            CreatedAt = workout.CreatedAt,
            UpdatedAt = workout.UpdatedAt,
            LastUsedAt = workout.LastUsedAt
        };

        return CreatedAtAction(nameof(GetWorkout), new { id = workout.Id }, workoutDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkoutDto>> UpdateWorkout(int id, [FromBody] UpdateWorkoutRequest request)
    {
        var userId = GetCurrentUserId();
        var workout = await _context.UserWorkouts
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId && !w.IsDeleted);

        if (workout == null)
        {
            return NotFound();
        }

        workout.Name = request.Name;
        workout.Content = request.Content;
        workout.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var workoutDto = new WorkoutDto
        {
            Id = workout.Id,
            Name = workout.Name,
            Content = workout.Content,
            CreatedAt = workout.CreatedAt,
            UpdatedAt = workout.UpdatedAt,
            LastUsedAt = workout.LastUsedAt
        };

        return Ok(workoutDto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteWorkout(int id)
    {
        var userId = GetCurrentUserId();
        var workout = await _context.UserWorkouts
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId && !w.IsDeleted);

        if (workout == null)
        {
            return NotFound();
        }

        workout.IsDeleted = true;
        workout.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("sync")]
    public async Task<ActionResult<SyncWorkoutsResponse>> SyncWorkouts([FromBody] SyncWorkoutsRequest request)
    {
        var userId = GetCurrentUserId();
        
        // Get all current workouts from server
        var serverWorkouts = await _context.UserWorkouts
            .Where(w => w.UserId == userId && !w.IsDeleted)
            .ToListAsync();

        // Process client workouts - for simplicity, we'll replace server workouts with client workouts
        // In a production system, you'd want more sophisticated conflict resolution
        foreach (var clientWorkout in request.Workouts)
        {
            var existingWorkout = serverWorkouts.FirstOrDefault(w => w.Id == clientWorkout.Id);
            
            if (existingWorkout != null)
            {
                // Update existing workout if client version is newer
                if (clientWorkout.UpdatedAt > existingWorkout.UpdatedAt)
                {
                    existingWorkout.Name = clientWorkout.Name;
                    existingWorkout.Content = clientWorkout.Content;
                    existingWorkout.UpdatedAt = clientWorkout.UpdatedAt;
                    existingWorkout.LastUsedAt = clientWorkout.LastUsedAt;
                }
            }
            else if (clientWorkout.Id == 0)
            {
                // New workout from client
                var newWorkout = new UserWorkout
                {
                    UserId = userId,
                    Name = clientWorkout.Name,
                    Content = clientWorkout.Content,
                    CreatedAt = clientWorkout.CreatedAt,
                    UpdatedAt = clientWorkout.UpdatedAt,
                    LastUsedAt = clientWorkout.LastUsedAt
                };
                _context.UserWorkouts.Add(newWorkout);
            }
        }

        await _context.SaveChangesAsync();

        // Return updated workout list
        var updatedWorkouts = await _context.UserWorkouts
            .Where(w => w.UserId == userId && !w.IsDeleted)
            .Select(w => new WorkoutDto
            {
                Id = w.Id,
                Name = w.Name,
                Content = w.Content,
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt,
                LastUsedAt = w.LastUsedAt
            })
            .ToListAsync();

        return Ok(new SyncWorkoutsResponse
        {
            Workouts = updatedWorkouts,
            LastSyncAt = DateTime.UtcNow
        });
    }
}