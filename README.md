# 48-Hour Startup Launcher

A powerful web application that helps entrepreneurs transform their ideas into actionable startup launch frameworks using AI. The application provides detailed, structured plans for launching a business in 48 hours, including strategy, tools, marketing channels, and monetization suggestions.

## 🌟 Features

- **Multiple AI Providers**: Support for various AI providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude 3 Opus, Claude 3 Sonnet)
  - Google (Gemini Pro)
  - Groq (Llama2 70B, Mixtral 8x7B)
  - OpenRouter (Access to multiple models)
- **Real-time Generation**: Streams responses with progress tracking
- **Export Options**: 
  - Copy to clipboard
  - Export to PDF
  - Regenerate content
- **Modern UI**: 
  - Responsive design
  - Beautiful animations
  - Progress tracking
  - Error handling

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/startup-launcher.git
cd startup-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.sample .env
```

4. Edit the `.env` file and add your API keys:
```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google API Key
GOOGLE_API_KEY=your_google_api_key_here

# Groq API Key
GROQ_API_KEY=your_groq_api_key_here

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server Configuration
PORT=3000
```

5. Start the server:
```bash
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
startup-launcher/
├── public/
│   └── index.html          # Frontend application
├── routes/
│   └── openrouter.js       # API route handler
├── server.js              # Express server
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── .env.sample           # Sample environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## 📝 Files to Upload to GitHub

### Required Files
Upload these files to GitHub:
```
startup-launcher/
├── public/
│   └── index.html          # Frontend application
├── routes/
│   └── openrouter.js       # API route handler
├── server.js              # Express server
├── package.json           # Project dependencies
├── .env.sample           # Sample environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

### Do NOT Upload
These files should NOT be uploaded to GitHub:
- `.env` file (contains sensitive API keys)
- `node_modules/` directory
- Any IDE-specific files (`.vscode/`, `.idea/`, etc.)
- OS-specific files (`.DS_Store`, `Thumbs.db`, etc.)
- Log files
- Build artifacts
- Any other sensitive or environment-specific files

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `GOOGLE_API_KEY`: Your Google API key
- `GROQ_API_KEY`: Your Groq API key
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `PORT`: Server port (default: 3000)

### Available AI Models

#### OpenAI
- GPT-4 Turbo
- GPT-3.5 Turbo
- Custom models (must start with 'gpt-' or 'ft:gpt-')

#### Anthropic
- Claude 3 Opus
- Claude 3 Sonnet
- Custom models (must start with 'claude-')

#### Google
- Gemini Pro
- Custom models (must start with 'gemini-')

#### Groq
- Llama2 70B
- Mixtral 8x7B
- Custom models (must include 'llama2' or 'mixtral')

#### OpenRouter
- Access to multiple models from different providers
- Custom models (any valid model ID)

### Using Custom Models

You can use custom models from any provider by:

1. Selecting the provider from the dropdown
2. Choosing "Custom [Provider] Model" from the model selection
3. Entering the model ID in the custom model input field

Example custom model IDs:
- OpenAI: `gpt-4-0125-preview`
- Anthropic: `claude-3-opus-20240229`
- Google: `gemini-pro`
- Groq: `llama2-70b-4096`
- OpenRouter: `mistral/mistral-7b-instruct`

## 🛠️ Technologies Used

- **Frontend**:
  - HTML5
  - Tailwind CSS
  - JavaScript (Vanilla)
  - html2pdf.js

- **Backend**:
  - Node.js
  - Express.js
  - Axios
  - dotenv

## 🔒 Security Notes

1. Never commit your `.env` file
2. Keep your API keys secure
3. Use environment variables for sensitive data
4. Add `.env` to your `.gitignore` file
5. Regularly rotate your API keys
6. Monitor API usage and set up alerts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- Google for Gemini Pro
- Groq for Llama2 and Mixtral models
- OpenRouter for multi-model access
- Tailwind CSS for styling
- Express.js for the backend framework 