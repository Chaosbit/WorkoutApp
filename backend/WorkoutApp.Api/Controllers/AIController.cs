using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace WorkoutApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIController> _logger;

    public AIController(HttpClient httpClient, ILogger<AIController> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    [HttpPost("proxy")]
    public async Task<IActionResult> ProxyAIRequest([FromBody] AIProxyRequest request)
    {
        try
        {
            // Validate the request
            if (string.IsNullOrEmpty(request.Provider) || string.IsNullOrEmpty(request.ApiKey) || string.IsNullOrEmpty(request.Message))
            {
                return BadRequest(new { error = "Provider, ApiKey, and Message are required" });
            }

            // Determine the API endpoint and payload based on provider
            string apiUrl;
            string requestPayload;
            var headers = new Dictionary<string, string>();

            switch (request.Provider.ToLower())
            {
                case "openai":
                    apiUrl = "https://api.openai.com/v1/chat/completions";
                    headers["Authorization"] = $"Bearer {request.ApiKey}";
                    headers["Content-Type"] = "application/json";
                    
                    var openaiPayload = new
                    {
                        model = request.Model ?? "gpt-3.5-turbo",
                        messages = new[]
                        {
                            new { role = "system", content = "You are a helpful fitness assistant specialized in workout advice, exercise modifications, and training guidance. Provide practical, safe, and evidence-based fitness recommendations." },
                            new { role = "user", content = request.Message }
                        },
                        max_tokens = 500,
                        temperature = 0.7
                    };
                    requestPayload = JsonSerializer.Serialize(openaiPayload);
                    break;

                case "anthropic":
                    apiUrl = "https://api.anthropic.com/v1/messages";
                    headers["x-api-key"] = request.ApiKey;
                    headers["Content-Type"] = "application/json";
                    headers["anthropic-version"] = "2023-06-01";
                    
                    var anthropicPayload = new
                    {
                        model = request.Model ?? "claude-3-haiku-20240307",
                        max_tokens = 500,
                        messages = new[]
                        {
                            new { role = "user", content = $"You are a helpful fitness assistant specialized in workout advice, exercise modifications, and training guidance. Provide practical, safe, and evidence-based fitness recommendations.\n\nUser question: {request.Message}" }
                        }
                    };
                    requestPayload = JsonSerializer.Serialize(anthropicPayload);
                    break;

                case "google":
                case "gemini":
                    apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{request.Model ?? "gemini-1.5-flash"}:generateContent?key={request.ApiKey}";
                    headers["Content-Type"] = "application/json";
                    
                    var geminiPayload = new
                    {
                        contents = new[]
                        {
                            new
                            {
                                parts = new[]
                                {
                                    new { text = $"You are a helpful fitness assistant specialized in workout advice, exercise modifications, and training guidance. Provide practical, safe, and evidence-based fitness recommendations.\n\nUser question: {request.Message}" }
                                }
                            }
                        },
                        generationConfig = new
                        {
                            maxOutputTokens = 500,
                            temperature = 0.7
                        }
                    };
                    requestPayload = JsonSerializer.Serialize(geminiPayload);
                    break;

                default:
                    return BadRequest(new { error = $"Unsupported AI provider: {request.Provider}" });
            }

            // Make the API request
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            httpRequest.Content = new StringContent(requestPayload, Encoding.UTF8, "application/json");
            
            foreach (var header in headers)
            {
                if (header.Key == "Content-Type")
                    continue; // Already set above
                httpRequest.Headers.Add(header.Key, header.Value);
            }

            _logger.LogInformation("Making AI API request to {Provider} at {Url}", request.Provider, apiUrl);
            
            var response = await _httpClient.SendAsync(httpRequest);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI API request failed with status {StatusCode}: {Content}", response.StatusCode, responseContent);
                return StatusCode((int)response.StatusCode, new { error = "AI API request failed", details = responseContent });
            }

            // Parse and normalize the response based on provider
            try
            {
                using var jsonDoc = JsonDocument.Parse(responseContent);
                string aiResponse;

                switch (request.Provider.ToLower())
                {
                    case "openai":
                        aiResponse = jsonDoc.RootElement
                            .GetProperty("choices")[0]
                            .GetProperty("message")
                            .GetProperty("content")
                            .GetString() ?? "No response generated";
                        break;

                    case "anthropic":
                        aiResponse = jsonDoc.RootElement
                            .GetProperty("content")[0]
                            .GetProperty("text")
                            .GetString() ?? "No response generated";
                        break;

                    case "google":
                    case "gemini":
                        aiResponse = jsonDoc.RootElement
                            .GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString() ?? "No response generated";
                        break;

                    default:
                        aiResponse = "Unexpected provider in response parsing";
                        break;
                }

                return Ok(new { response = aiResponse });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse AI API response");
                return StatusCode(500, new { error = "Failed to parse AI response", details = ex.Message });
            }
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Network error when calling AI API");
            return StatusCode(500, new { error = "Network error when calling AI API", details = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in AI proxy");
            return StatusCode(500, new { error = "Unexpected error in AI proxy", details = ex.Message });
        }
    }

    [HttpPost("test-connection")]
    public async Task<IActionResult> TestConnection([FromBody] AITestRequest request)
    {
        try
        {
            // Make a simple test request to verify the API key and connection
            var testMessage = "Hello, please respond with a brief confirmation that you're working.";
            var proxyRequest = new AIProxyRequest
            {
                Provider = request.Provider,
                ApiKey = request.ApiKey,
                Model = request.Model,
                Message = testMessage
            };

            var result = await ProxyAIRequest(proxyRequest);
            
            if (result is OkObjectResult okResult)
            {
                return Ok(new { success = true, message = "Connection test successful" });
            }
            else
            {
                return Ok(new { success = false, message = "Connection test failed" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing AI connection");
            return Ok(new { success = false, message = $"Connection test failed: {ex.Message}" });
        }
    }
}

public class AIProxyRequest
{
    public string Provider { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "";
    public string Message { get; set; } = "";
}

public class AITestRequest
{
    public string Provider { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "";
}