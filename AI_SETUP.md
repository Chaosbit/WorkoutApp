# AI Chat Setup Guide

The Workout Timer PWA includes an AI Chat feature that provides personalized workout advice and modifications. However, due to browser security limitations (CORS policy), AI providers cannot be called directly from the browser.

## Why Do I Need a Proxy?

AI providers like OpenAI, Google Gemini, and Anthropic Claude block direct calls from browsers to prevent API key exposure and abuse. You need a simple proxy server to enable AI features.

## Setup Options

### Option 1: Vercel Functions (Recommended)

**Easiest deployment, free tier available**

1. Create a `api/ai-proxy.js` file in your project:

```javascript
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { provider, apiKey, body } = req.body;
  let apiUrl;

  switch (provider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      break;
    case 'gemini':
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      break;
    case 'anthropic':
      apiUrl = 'https://api.anthropic.com/v1/messages';
      break;
    default:
      res.status(400).json({ error: 'Unsupported provider' });
      return;
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
```

2. Deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

3. Update your AI Chat configuration to use: `https://your-app.vercel.app/api/ai-proxy`

### Option 2: Local Node.js Server

**For development and testing**

1. Create `ai-proxy-server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ai-proxy', async (req, res) => {
  const { provider, apiKey, body } = req.body;
  let apiUrl;

  switch (provider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      break;
    case 'gemini':
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      break;
    case 'anthropic':
      apiUrl = 'https://api.anthropic.com/v1/messages';
      break;
    default:
      return res.status(400).json({ error: 'Unsupported provider' });
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Proxy server running on port ${PORT}`);
});
```

2. Install dependencies and run:
```bash
npm install express cors node-fetch
node ai-proxy-server.js
```

3. Use proxy URL: `http://localhost:3001/ai-proxy`

### Option 3: Cloudflare Workers

**Edge-based solution**

1. Create a Cloudflare Worker with this code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { provider, apiKey, body } = await request.json();
  let apiUrl;

  switch (provider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      break;
    case 'gemini':
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      break;
    case 'anthropic':
      apiUrl = 'https://api.anthropic.com/v1/messages';
      break;
    default:
      return new Response('Unsupported provider', { status: 400 });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;
  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.text();
  
  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

2. Deploy and use the worker URL

## Updating the App Configuration

Once you have a proxy server running, you need to update the AI Chat configuration in the app:

1. Open AI Chat in the app
2. Click "Configure AI Assistant"
3. Set your **Proxy URL** to your deployed proxy endpoint
4. Configure your preferred AI provider and API key
5. Test the connection

## Security Considerations

- **API Keys**: Never commit API keys to your repository
- **CORS**: The proxy allows all origins (*) for simplicity. In production, restrict to your domain
- **Rate Limiting**: Consider adding rate limiting to prevent abuse
- **Authentication**: For production apps, add user authentication

## Troubleshooting

**"Connection failed" errors:**
- Verify your proxy server is running and accessible
- Check that your API key is valid
- Ensure the proxy URL is correct (include `/api/ai-proxy` or similar path)

**"Invalid JSON" errors:**
- Check proxy server logs for detailed error messages
- Verify API key format matches provider requirements

**CORS errors still appearing:**
- Ensure proxy server includes proper CORS headers
- Clear browser cache and try again

## Need Help?

If you encounter issues setting up the AI proxy:

1. Check the browser developer console for detailed error messages
2. Test your proxy server directly with a tool like Postman
3. Open an issue in the GitHub repository with error details