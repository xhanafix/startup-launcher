const express = require('express');
const router = express.Router();
const axios = require('axios');

// Store active sessions
const sessions = new Map();

// Clean up old sessions (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.timestamp > 3600000) { // 1 hour
      sessions.delete(sessionId);
    }
  }
}, 300000); // Check every 5 minutes

// API endpoints configuration
const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions'
};

// Provider-specific configurations
const PROVIDER_CONFIGS = {
  openai: {
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (model, prompt) => ({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true
    }),
    validateModel: (model) => {
      // Basic validation for OpenAI models
      return model.startsWith('gpt-') || model.startsWith('ft:gpt-');
    }
  },
  anthropic: {
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    body: (model, prompt) => ({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true
    }),
    validateModel: (model) => {
      // Basic validation for Anthropic models
      return model.startsWith('claude-');
    }
  },
  google: {
    headers: (apiKey) => ({
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    }),
    body: (model, prompt) => ({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    }),
    validateModel: (model) => {
      // Basic validation for Google models
      return model.startsWith('gemini-');
    }
  },
  groq: {
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (model, prompt) => ({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true
    }),
    validateModel: (model) => {
      // Basic validation for Groq models
      return model.includes('llama2') || model.includes('mixtral');
    }
  },
  openrouter: {
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (model, prompt) => ({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true
    }),
    validateModel: (model) => {
      // OpenRouter accepts any model ID
      return true;
    }
  }
};

// Utility function to format AI response into structured HTML
function formatAIResponse(text) {
  // Split the text into sections based on common headers
  const sections = text.split(/(?=Strategy Summary|Step-by-Step|Recommended Tools|Sales & Marketing|Monetization)/i);
  
  let formattedHTML = '';
  
  sections.forEach(section => {
    if (section.trim()) {
      // Extract the section title and content
      const [title, ...content] = section.split('\n');
      const contentText = content.join('\n').trim();
      
      // Format based on section type
      if (title.toLowerCase().includes('strategy summary')) {
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <p class="text-gray-700 leading-relaxed">${contentText}</p>
          </div>
        `;
      } else if (title.toLowerCase().includes('step-by-step')) {
        const steps = contentText.split(/\d+\./).filter(step => step.trim());
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <ol class="list-decimal list-inside space-y-3">
              ${steps.map(step => `<li class="text-gray-700">${step.trim()}</li>`).join('')}
            </ol>
          </div>
        `;
      } else if (title.toLowerCase().includes('recommended tools')) {
        const tools = contentText.split(/[•-]/).filter(tool => tool.trim());
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <ul class="list-disc list-inside space-y-2">
              ${tools.map(tool => `<li class="text-gray-700">${tool.trim()}</li>`).join('')}
            </ul>
          </div>
        `;
      } else if (title.toLowerCase().includes('sales & marketing')) {
        const channels = contentText.split(/[•-]/).filter(channel => channel.trim());
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${channels.map(channel => `
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p class="text-gray-700">${channel.trim()}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (title.toLowerCase().includes('monetization')) {
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <div class="space-y-3">
              ${contentText.split(/[•-]/).filter(item => item.trim()).map(item => `
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p class="text-gray-700">${item.trim()}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Default formatting for other sections
        formattedHTML += `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-blue-700 mb-4">${title}</h2>
            <div class="text-gray-700 leading-relaxed">${contentText}</div>
          </div>
        `;
      }
    }
  });
  
  return formattedHTML;
}

router.post('/generate', async (req, res) => {
  try {
    const { idea, model, provider } = req.body;
    
    if (!idea) {
      return res.status(400).json({ error: 'Idea is required' });
    }

    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      throw new Error('Invalid provider');
    }

    // Validate custom model
    if (!config.validateModel(model)) {
      throw new Error(`Invalid model ID for ${provider}. Please check the model ID format.`);
    }

    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
    if (!apiKey) {
      throw new Error(`${provider} API key not configured`);
    }

    // Create or get session
    const currentSessionId = Date.now().toString();
    sessions.set(currentSessionId, {
      timestamp: Date.now(),
      content: '',
      isComplete: false
    });

    const session = sessions.get(currentSessionId);

    const prompt = `You are a startup strategist with extensive experience in launching successful businesses. Your task is to provide a comprehensive launch framework for a 48-hour startup with no capital.

Product/Service: "${idea}"

IMPORTANT: Return ONLY the HTML content below, with no additional text, markdown, or explanations. Do not include any text before or after the HTML. Do not use markdown code blocks or any other formatting.

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Strategy Summary</h2>
  <div class="space-y-4">
    <p class="text-gray-700 leading-relaxed">
      [Provide a detailed overview of the business strategy, including:]
    </p>
    <ul class="list-disc list-inside space-y-2 text-gray-700">
      <li>Target market analysis and ideal customer profile</li>
      <li>Unique value proposition and competitive advantage</li>
      <li>Key success metrics and goals for the 48-hour launch</li>
      <li>Potential challenges and risk mitigation strategies</li>
    </ul>
  </div>
</div>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Step-by-Step Launch Plan</h2>
  <div class="space-y-6">
    <ol class="list-decimal list-inside space-y-4">
      <li class="text-gray-700">
        <span class="font-semibold">[Step Title]</span>
        <p class="ml-6 mt-2">[Detailed explanation of the step]</p>
        <div class="ml-6 mt-2 bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-600">Example: [Provide a specific example of how to execute this step]</p>
        </div>
      </li>
      [Continue with detailed steps]
    </ol>
  </div>
</div>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Recommended Tools & Resources</h2>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">[Tool Category]</h3>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <span class="font-medium">[Tool Name]</span>
            <p class="text-sm text-gray-600">[Detailed explanation of how to use this tool]</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Sales & Marketing Channels</h2>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">[Channel Name]</h3>
        <div class="space-y-3">
          <p class="text-gray-700">[Detailed strategy for this channel]</p>
          <div class="bg-white p-3 rounded-lg">
            <p class="text-sm text-gray-600">Implementation Steps:</p>
            <ol class="list-decimal list-inside text-sm text-gray-600 mt-2">
              <li>[Step 1]</li>
              <li>[Step 2]</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Monetization Strategy</h2>
  <div class="space-y-4">
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 class="font-semibold text-gray-800 mb-2">[Strategy Name]</h3>
      <div class="space-y-3">
        <p class="text-gray-700">[Detailed explanation of the monetization strategy]</p>
        <div class="bg-white p-3 rounded-lg">
          <p class="text-sm text-gray-600">Implementation Guide:</p>
          <ul class="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>[Step 1]</li>
            <li>[Step 2]</li>
          </ul>
        </div>
        <div class="bg-blue-50 p-3 rounded-lg">
          <p class="text-sm text-blue-600">Pro Tip: [Share a valuable insight or best practice]</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold text-blue-700 mb-4">Success Metrics & Tracking</h2>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">[Metric Name]</h3>
        <p class="text-gray-700">[How to measure and track this metric]</p>
        <p class="text-sm text-gray-600 mt-2">Target: [Specific target value]</p>
      </div>
    </div>
  </div>
</div>`;

    const response = await axios.post(API_ENDPOINTS[provider], 
      config.body(model, prompt),
      {
        headers: config.headers(apiKey),
        responseType: 'stream'
      }
    );

    let buffer = '';
    response.data.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            session.isComplete = true;
            return;
          }
          try {
            const parsed = JSON.parse(data);
            let content = '';
            
            // Handle different provider response formats
            switch (provider) {
              case 'google':
                content = parsed.candidates[0].content.parts[0].text;
                break;
              case 'anthropic':
                content = parsed.content[0].text;
                break;
              default:
                content = parsed.choices[0].delta.content;
            }
            
            if (content) {
              buffer += content;
              session.content = buffer;
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    });

    res.json({ 
      sessionId: currentSessionId,
      isComplete: false
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate framework',
      details: error.response?.data || error.message
    });
  }
});

// New endpoint to check session status and get content
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Clean the response
  let cleanContent = session.content;
  cleanContent = cleanContent.replace(/```html\n?|\n?```/g, '');
  cleanContent = cleanContent.substring(cleanContent.indexOf('<div'));
  cleanContent = cleanContent.substring(0, cleanContent.lastIndexOf('</div>') + 6);

  res.json({
    content: cleanContent,
    isComplete: session.isComplete
  });
});

module.exports = router; 