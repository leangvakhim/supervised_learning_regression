// Data Setup for Visualization
// We use a coordinate system 0 to 100 for easy plotting.
// Y-axis is inverted in SVG, so 0 is top, 100 is bottom.
const points = [
    { x: 10, y: 70 }, // actual is below pred
    { x: 30, y: 35 }, // actual is above pred
    { x: 50, y: 65 }, // actual is below pred
    { x: 70, y: 25 }, // actual is above pred
    { x: 90, y: 40 }  // actual is below pred
];

// Regression Line Equation: y = -0.5x + 75 (in SVG coords, lower number = higher visually)
const predictY = (x) => -0.5 * x + 75;
const baselineY = 47; // Simple average of all Y points

// --- SVG Helpers ---
const drawGrid = () => `
    <g stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2">
        ${[0, 20, 40, 60, 80, 100].map(i => `<line x1="0" y1="${i}" x2="100" y2="${i}" />`).join('')}
        ${[0, 20, 40, 60, 80, 100].map(i => `<line x1="${i}" y1="0" x2="${i}" y2="100" />`).join('')}
    </g>
    <line x1="0" y1="100" x2="100" y2="100" stroke="#94a3b8" stroke-width="1.5" />
    <line x1="0" y1="0" x2="0" y2="100" stroke="#94a3b8" stroke-width="1.5" />
    <text x="50" y="112" font-size="4" text-anchor="middle" fill="#64748b">Feature (X)</text>
    <text x="-8" y="50" font-size="4" text-anchor="middle" fill="#64748b" transform="rotate(-90, -8, 50)">Target (Y)</text>
`;

const drawPoints = () => points.map((p, i) =>
    `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#334155" class="fade-in" style="animation-delay: ${i * 0.1}s" />`
).join('');

const drawRegressionLine = () => `
    <line x1="0" y1="${predictY(0)}" x2="100" y2="${predictY(100)}"
            stroke="#2563eb" stroke-width="1.5" class="draw-line" />
    <text x="80" y="${predictY(80) - 3}" font-size="3" fill="#2563eb" font-weight="bold" class="fade-in">Model Prediction</text>
`;

const drawResiduals = () => points.map(p => {
    const py = predictY(p.x);
    return `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${py}"
                    stroke="#ef4444" stroke-width="1" stroke-dasharray="1" class="draw-line" />`;
}).join('');

const drawSquares = () => points.map(p => {
    const py = predictY(p.x);
    const error = Math.abs(p.y - py);
    // Draw square to the right
    return `<rect x="${p.x}" y="${Math.min(p.y, py)}" width="${error}" height="${error}"
                    fill="#ef4444" opacity="0.2" stroke="#ef4444" stroke-width="0.5" class="grow-rect" />`;
}).join('');

const drawBaselineLine = () => `
    <line x1="0" y1="${baselineY}" x2="100" y2="${baselineY}"
            stroke="#16a34a" stroke-width="1" stroke-dasharray="2" class="draw-line" />
    <text x="5" y="${baselineY - 2}" font-size="3" fill="#16a34a" font-weight="bold" class="fade-in">Baseline (Average)</text>
`;

const drawBaselineResiduals = () => points.map(p => {
    return `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${baselineY}"
                    stroke="#16a34a" stroke-width="0.8" opacity="0.6" class="draw-line" />`;
}).join('');


// Equations HTML Generator
const mathFraction = (top, bottom) => `
    <div class="inline-flex flex-col items-center justify-center align-middle mx-1">
        <span class="border-b border-slate-400 px-1 text-sm">${top}</span>
        <span class="text-sm">${bottom}</span>
    </div>
`;
const mathSigma = `
    <div class="inline-flex flex-col items-center justify-center align-middle mx-1 text-[10px] leading-none">
        <span>n</span>
        <span class="text-2xl font-serif leading-none mt-[-2px] mb-[-2px]">&Sigma;</span>
        <span>i=1</span>
    </div>
`;

const equationsHTML = `
    <div class="flex flex-col gap-4 fade-in">
        <!-- MAE -->
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mean Absolute Error (MAE)</h3>
            <div class="font-serif text-lg flex items-center text-slate-800">
                <span class="italic font-bold mr-2">MAE</span> =
                ${mathFraction("1", "n")} ${mathSigma}
                <span class="text-xl mx-1 text-slate-400">|</span>
                <span class="italic">y<sub class="text-xs">i</sub></span> - <span class="italic">y&#770;<sub class="text-xs">i</sub></span>
                <span class="text-xl mx-1 text-slate-400">|</span>
            </div>
        </div>

        <!-- MSE -->
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mean Squared Error (MSE)</h3>
            <div class="font-serif text-lg flex items-center text-slate-800">
                <span class="italic font-bold mr-2">MSE</span> =
                ${mathFraction("1", "n")} ${mathSigma}
                <span class="mx-1">(</span>
                <span class="italic">y<sub class="text-xs">i</sub></span> - <span class="italic">y&#770;<sub class="text-xs">i</sub></span>
                <span class="mx-1">)</span><sup class="text-xs">2</sup>
            </div>
        </div>

        <!-- RMSE -->
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Root Mean Squared Error (RMSE)</h3>
            <div class="font-serif text-lg flex items-center text-slate-800">
                <span class="italic font-bold mr-2">RMSE</span> =
                <span class="text-2xl ml-1 leading-none text-slate-400">&radic;</span>
                <span class="border-t border-slate-400 pt-0.5 inline-block">
                    ${mathFraction("1", "n")} ${mathSigma}
                    <span class="mx-1">(</span>
                    <span class="italic">y<sub class="text-xs">i</sub></span> - <span class="italic">y&#770;<sub class="text-xs">i</sub></span>
                    <span class="mx-1">)</span><sup class="text-xs">2</sup>
                </span>
            </div>
        </div>

        <!-- R2 -->
        <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">R-Squared (Coefficient of Determination)</h3>
            <div class="font-serif text-lg flex items-center text-slate-800">
                <span class="italic font-bold mr-2">R<sup class="text-xs">2</sup></span> =
                <span class="mx-2">1 - </span>
                ${mathFraction(
    `${mathSigma} (<span class="italic">y<sub class="text-xs">i</sub></span> - <span class="italic">y&#770;<sub class="text-xs">i</sub></span>)<sup class="text-xs">2</sup>`,
    `${mathSigma} (<span class="italic">y<sub class="text-xs">i</sub></span> - <span class="italic">y&#772;</span>)<sup class="text-xs">2</sup>`
)}
            </div>
            <p class="text-xs text-slate-500 mt-2 font-sans">Where <span class="italic font-serif">y&#770;</span> is predicted value, and <span class="italic font-serif">y&#772;</span> is the average (mean) value.</p>
        </div>
    </div>
`;


// Application Logic & Steps
const steps = [
    {
        badge: "Intro",
        title: "The Goal of Regression",
        desc: "In Machine Learning, regression models try to draw a line that best fits our data. But how do we mathematically measure if this blue prediction line is actually 'good'? We use Evaluation Metrics.",
        extra: "The dark dots are our actual true data points. The blue line represents what our model predicts.",
        render: () => drawGrid() + drawPoints() + drawRegressionLine()
    },
    {
        badge: "Step 1",
        title: "Understanding Errors (Residuals)",
        desc: "The first step for any metric is calculating the mistakes. We measure the vertical distance between the actual true value and our model's predicted line.",
        extra: "These red dashed lines are called 'Errors' or 'Residuals'. If the actual point is above the line, the error is positive. If it's below, the error is negative.",
        render: () => drawGrid() + drawPoints() + drawRegressionLine() + drawResiduals()
    },
    {
        badge: "Metric 1",
        title: "Mean Absolute Error (MAE)",
        desc: "To get an overall score, MAE takes all those errors, turns them into positive numbers (absolute value), and calculates their average.",
        extra: "<b>Why use it?</b> MAE is very easy to understand. If predicting house prices, an MAE of $5,000 means your model is off by $5,000 on average. It treats all errors equally.",
        render: () => drawGrid() + drawPoints() + drawRegressionLine() + drawResiduals()
    },
    {
        badge: "Metric 2",
        title: "Mean Squared Error (MSE)",
        desc: "Instead of just making errors positive, MSE <i>squares</i> them (multiplying the error by itself) before calculating the average.",
        extra: "<b>Why use it?</b> Look at the literal squares! Squaring mathematically punishes larger mistakes heavily. A small mistake forms a tiny square, but a big mistake forms a massive square. We use MSE when large errors are strictly unacceptable.",
        render: () => drawGrid() + drawPoints() + drawRegressionLine() + drawSquares() + drawResiduals()
    },
    {
        badge: "Metric 3",
        title: "Root Mean Squared Error (RMSE)",
        desc: "MSE has a problem: its units are squared (e.g., 'Dollars Squared'). RMSE solves this by taking the square root of the MSE.",
        extra: "<b>Why use it?</b> RMSE gives us the best of both worlds. It heavily penalizes large errors (thanks to the squaring part) but brings the final score back to our original, understandable units (thanks to the square root).",
        render: () => drawGrid() + drawPoints() + drawRegressionLine() + drawSquares() + drawResiduals() // Visually keep squares to show relation
    },
    {
        badge: "Metric 4",
        title: "R-Squared (R²)",
        desc: "R² compares our model (blue) against a 'dumb' baseline model (green) that simply guesses the average of all data points every time.",
        extra: "R² tells us what percentage of the data's variance is explained by our model. <br><br><b>Score meaning:</b><br>1.0 = Perfect prediction<br>0.0 = Model is no better than just guessing the average.",
        render: () => drawGrid() + drawPoints() + drawBaselineLine() + drawBaselineResiduals() + drawRegressionLine() + drawResiduals()
    },
    {
        badge: "Summary",
        title: "The Math Equations",
        desc: "Here is how a computer actually calculates the metrics we just visualized. Don't let the symbols intimidate you; they just represent the steps we walked through!",
        extra: "",
        showEquations: true
    }
];

let currentStep = 0;

// DOM Elements
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const badgeEl = document.getElementById('step-badge');
const extraEl = document.getElementById('extra-info');
const textContentEl = document.getElementById('text-content');
const svgEl = document.getElementById('chart-svg');
const eqContainer = document.getElementById('equations-container');
const visualContainer = document.getElementById('visual-container');

const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const stepCounter = document.getElementById('step-counter');
const progressBar = document.getElementById('progress-bar');
// const indicatorsContainer = document.getElementById('step-indicators');

// Setup indicators
// steps.forEach((_, index) => {
//     const dot = document.createElement('div');
//     dot.className = `h-1 flex-1 mx-0.5 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-transparent'}`;
//     dot.id = `indicator-${index}`;
//     indicatorsContainer.appendChild(dot);
// });

function updateUI() {
    const step = steps[currentStep];

    // Text Animations (Re-triggering CSS animation)
    textContentEl.classList.remove('fade-in');
    void textContentEl.offsetWidth; // Trigger reflow
    textContentEl.classList.add('fade-in');

    // Update Text Data
    badgeEl.innerText = step.badge;
    titleEl.innerText = step.title;
    descEl.innerHTML = step.desc;

    if (step.extra) {
        extraEl.innerHTML = step.extra;
        extraEl.classList.remove('hidden');
    } else {
        extraEl.classList.add('hidden');
    }

    // Update Visuals (SVG vs Equations)
    if (step.showEquations) {
        svgEl.classList.add('hidden');
        eqContainer.classList.remove('hidden');
        eqContainer.innerHTML = equationsHTML;
        visualContainer.classList.remove('bg-slate-50/50');
        visualContainer.classList.add('bg-slate-50'); // slightly darker for eq bg
    } else {
        eqContainer.classList.add('hidden');
        svgEl.classList.remove('hidden');
        svgEl.innerHTML = step.render();
        visualContainer.classList.add('bg-slate-50/50');
        visualContainer.classList.remove('bg-slate-50');
    }

    // Update Navigation state
    btnBack.disabled = currentStep === 0;

    if (currentStep === steps.length - 1) {
        btnNext.disabled = true;
        btnNext.innerText = "Finish";
    } else {
        btnNext.disabled = false;
        btnNext.innerHTML = "Next &rarr;";
    }

    // Update Progress
    stepCounter.innerText = `Step ${currentStep + 1} of ${steps.length}`;
    const progressPct = ((currentStep) / (steps.length - 1)) * 100;
    progressBar.style.width = `${progressPct}%`;
}

// Event Listeners
btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

btnBack.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

// Initialize
updateUI();