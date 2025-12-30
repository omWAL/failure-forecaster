import { GEMINI_API_KEY } from './config.js';
import { runSequence, startLoadingAnimation } from './animation.js';

// If gemini-3-flash is working in your environment, we keep it here.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
const TRADE_API_KEY = GEMINI_API_KEY; 
const TRADE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${TRADE_API_KEY}`;

// Chip logic
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('forecasterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('userInput').value.trim();
    const forecastResults = document.getElementById('forecastResults');
    const tradeoffSection = document.getElementById("tradeoffSection");
    const roadmapSection = document.getElementById("roadmapSection");
    const journeyAction = document.getElementById("journeyAction");

    const type = document.querySelector('#typeGroup .active').dataset.value;
    const level = document.querySelector('#levelGroup .active').dataset.value;

    if (!input) return;

    // Reset UI state
    startLoadingAnimation(forecastResults);
    tradeoffSection.style.display = "none";
    roadmapSection.style.display = "none";
    journeyAction.style.display = "none";

    try {
        // Run calls
        await runFailureForecast(input, level, type);
        await analyzeTradeoffs(input, level, type); 
        
        runSequence();
        
        // Only show journey button if everything succeeded
        if(journeyAction) journeyAction.style.display = "block";

    } catch (err) {
        console.error("Engine Error:", err);
        forecastResults.innerHTML = `
            <div style="color:#dc2626; padding:20px; background:#fee2e2; border-radius:10px; border:1px solid #fecaca;">
                ⚠️ <strong>Engine Busy:</strong> ${err.message}<br>
                <small>Please wait 10 seconds and try again.</small>
            </div>`;
    }
});

async function runFailureForecast(input, level, type) {
    const prompt = `Analyze 3 specific risks for a ${level} pursuing ${type}: "${input}". 
    For each risk, provide a title, description, and a VALID reference URL (McKinsey, Forbes, or HBR).
    Return ONLY JSON: {"goal":"${input}","risks":[{"title":"string","desc":"string","tag":"High/Med","source":"URL"}]}`;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const data = await response.json();
    
    // SAFETY CHECK: This prevents the "Reading '0'" error
    if (!data.candidates || !data.candidates[0]) {
        throw new Error("AI reached a limit or blocked the content. Try again.");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const json = JSON.parse(rawText.replace(/```json|```/gi, ""));
    
    sessionStorage.setItem('lastAnalysis', JSON.stringify(json));
    renderResults(json);
}

async function analyzeTradeoffs(input, level, type) {
    const tbody = document.querySelector("#tradeoffTable tbody");
    const solutionText = document.getElementById("solutionText");
    const roadmapContainer = document.getElementById("roadmapContainer");

    const prompt = `Decision: "${input}" (${level} ${type}). Provide 3 tradeoffs and a 4-step roadmap.
    Return ONLY JSON: {"tradeoffs":[{"factor":"string","gain":"string","give_up":"string","risk":"High/Low"}],"solution":"string","roadmap":["step1","step2","step3","step4"]}`;

    const res = await fetch(TRADE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) throw new Error("Secondary Engine is currently offline.");

    const data = await res.json();
    
    // SAFETY CHECK
    if (!data.candidates || !data.candidates[0]) return;

    const rawText = data.candidates[0].content.parts[0].text;
    const json = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);

    sessionStorage.setItem('roadmap', JSON.stringify(json.roadmap));

    tbody.innerHTML = json.tradeoffs.map(t => `
        <tr>
            <td>${t.factor}</td>
            <td>${t.gain}</td>
            <td>${t.give_up}</td>
            <td class="risk ${t.risk.toLowerCase()}">${t.risk}</td>
        </tr>`).join('');

    solutionText.innerText = json.solution;
    
    roadmapContainer.innerHTML = json.roadmap.map((step, index) => `
        <div class="roadmap-step">
            <div class="step-number">${index + 1}</div>
            <div class="step-content"><div class="step-title">${step}</div></div>
        </div>
    `).join('');

    document.getElementById('tradeoffSection').style.display = "block";
    document.getElementById('roadmapSection').style.display = "block";
}

function renderResults(data) {
    const resultsDiv = document.getElementById('forecastResults');
    let html = `<div class="section-title">Failure Forecast for ${data.goal}</div>`;

    data.risks.forEach(risk => {
        const riskClass = risk.tag.toLowerCase().includes('high') ? 'high' : 'medium';
        html += `
            <div class="item-flow ${riskClass}" style="opacity:0">
                <div class="left-box"><strong>${risk.title}</strong></div>
                <div class="arrow-container">
                    <span class="arrow-text">${risk.tag}</span>
                    <div class="arrow-line"></div>
                </div>
                <div class="right-box">
                    ${risk.desc}
                    <br><a href="${risk.source}" target="_blank" class="source-link">🔗 Proof & Source</a>
                </div>
            </div>`;
    });
    resultsDiv.innerHTML = html;
}

const startBtn = document.getElementById('startJourneyBtn');

if (startBtn) {
    startBtn.onclick = () => {
        // '_blank' instructs the browser to open the URL in a new tab/window
        window.open('chat.html', '_blank');
    };
}