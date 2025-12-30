# 🛡️ AI Decision Risk Engine v3.0

An advanced strategic simulation tool powered by **Google Gemini 3 Flash Preview**. This engine performs a high-stakes "Pre-Mortem" analysis—identifying exactly why a plan might fail, calculating trade-offs, and generating a survival roadmap.

## 🌟 Project Purpose
The **Decision Risk Engine** is designed for high-stakes decision-making. Instead of generic AI advice, this tool stress-tests your logic by simulating worst-case scenarios and forced trade-offs, helping users build more resilient plans before they commit resources.

## 🚀 Key Features
- **Failure Forecast:** Predicts 3 specific, high-probability risks with industry validation.
- **Trade-off Matrix:** Analyzes "Gain vs. Sacrifice" to reveal hidden costs.
- **Survival Roadmap:** A 4-step tactical plan to navigate through identified risks.
- **Strategy Assistant:** A full-screen, mobile-optimized mentor chat interface for deep-dive strategy.

## 🛠️ Installation & Setup

### 1. API Key Configuration
This project requires a **Gemini 3 Flash** API Key.
1. Get your key from [Google AI Studio](https://aistudio.google.com/).
2. Open `config.js` in your project root.
3. Replace the placeholder with your key:
   ```javascript
   export const GEMINI_API_KEY = "AIzaSy...";