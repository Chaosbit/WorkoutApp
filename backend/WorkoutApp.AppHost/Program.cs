using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);

// Configure logging
builder.Logging.AddConsole();

// Build the host
var host = builder.Build();

var logger = host.Services.GetRequiredService<ILogger<Program>>();

logger.LogInformation("Starting Workout App Orchestrator...");
logger.LogInformation("This would typically orchestrate multiple services in an Aspire-like setup");
logger.LogInformation("For development, run the API directly: dotnet run --project ../WorkoutApp.Api");

// Keep the host running
await host.RunAsync();