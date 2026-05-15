// <!-- Application Script -->
// Data Setup for Visualization
const points = [
    { x: 10, y: 70 },
    { x: 30, y: 35 },
    { x: 50, y: 65 },
    { x: 70, y: 25 },
    { x: 90, y: 40 }
];

// Regression Line Equation
const predictY = (x) => -0.5 * x + 75;
const baselineY = 47;

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
    <line x1="0" y1="${predictY(0)}" x2="100" y2="${predictY(100)}" stroke="#2563eb" stroke-width="1.5" class="draw-line" />
    <text x="80" y="${predictY(80) - 3}" font-size="3" fill="#2563eb" font-weight="bold" class="fade-in">Model Prediction</text>
`;

const drawResiduals = () => points.map(p => {
    const py = predictY(p.x);
    return `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${py}" stroke="#ef4444" stroke-width="1" stroke-dasharray="1" class="draw-line" />`;
}).join('');

const drawSquares = () => points.map(p => {
    const py = predictY(p.x);
    const error = Math.abs(p.y - py);
    return `<rect x="${p.x}" y="${Math.min(p.y, py)}" width="${error}" height="${error}" fill="#ef4444" opacity="0.2" stroke="#ef4444" stroke-width="0.5" class="grow-rect" />`;
}).join('');

const drawBaselineLine = () => `
    <line x1="0" y1="${baselineY}" x2="100" y2="${baselineY}" stroke="#16a34a" stroke-width="1" stroke-dasharray="2" class="draw-line" />
    <text x="5" y="${baselineY - 2}" font-size="3" fill="#16a34a" font-weight="bold" class="fade-in">Baseline (Average)</text>
`;

const drawBaselineResiduals = () => points.map(p => {
    return `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${baselineY}" stroke="#16a34a" stroke-width="0.8" opacity="0.6" class="draw-line" />`;
}).join('');

// --- Equations HTML Generator (Using LaTeX) ---
const equationsHTML = String.raw`
    <div class="flex flex-col gap-4 fade-in pb-8">
        <!-- MAE -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mean Absolute Error (MAE)</h3>
            <div class="text-lg text-slate-800 overflow-x-auto py-2">
                $$ \text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i| $$
            </div>
        </div>

        <!-- MSE -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mean Squared Error (MSE)</h3>
            <div class="text-lg text-slate-800 overflow-x-auto py-2">
                $$ \text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 $$
            </div>
        </div>

        <!-- RMSE -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Root Mean Squared Error (RMSE)</h3>
            <div class="text-lg text-slate-800 overflow-x-auto py-2">
                $$ \text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2} $$
            </div>
        </div>

        <!-- R2 -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">R-Squared (Coefficient of Determination)</h3>
            <div class="text-lg text-slate-800 overflow-x-auto py-2">
                $$ R^2 = 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2} $$
            </div>
            <p class="text-xs text-slate-500 mt-2 font-sans border-t pt-2">Where $ \hat{y} $ is the predicted value, and $ \bar{y} $ is the average (mean) value.</p>
        </div>
    </div>
`;

// --- Python Code & Explanations Generator ---
const pythonCodeHTML = String.raw`
    <div class="flex flex-col gap-6 fade-in pb-8">

        <!-- Setup block -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-blue-500">
            <h4 class="font-bold text-slate-800 text-lg mb-2">1. The Setup</h4>
            <p class="text-sm text-slate-600 mb-3">In Python, we rarely write the math from scratch. We use <b>scikit-learn</b>. First, we define actual values (<code class="bg-slate-100 px-1 rounded text-pink-600">y_true</code>) and the model's predictions (<code class="bg-slate-100 px-1 rounded text-pink-600">y_pred</code>).</p>
<pre><code class="language-python">from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

# Let's say these are house prices in thousands ($)
y_true = [300, 450, 200, 600] # Actual true prices
y_pred = [290, 470, 210, 580] # What our model predicted
</code></pre>
        </div>

        <!-- MAE Code -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h4 class="font-bold text-slate-800 text-lg">Mean Absolute Error (MAE)</h4>
            <div class="text-slate-700 py-2">$$ \text{MAE} = \frac{1}{n} \sum |y_i - \hat{y}_i| $$</div>
            <div class="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-900 border border-blue-100">
                <strong>The Simple Explanation:</strong> "On average, how far off is our model?" <br>
                <strong>When to use:</strong> Use this as your default metric. It is the easiest to explain to your boss or clients.
            </div>
<pre><code class="language-python">mae = mean_absolute_error(y_true, y_pred)
print(f"MAE: {mae}")
# Output: MAE: 15.0 (Off by $15k on average)
</code></pre>
        </div>

        <!-- MSE Code -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h4 class="font-bold text-slate-800 text-lg">Mean Squared Error (MSE)</h4>
            <div class="text-slate-700 py-2">$$ \text{MSE} = \frac{1}{n} \sum (y_i - \hat{y}_i)^2 $$</div>
            <div class="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-900 border border-blue-100">
                <strong>The Simple Explanation:</strong> "Square the mistakes, then average them." <br>
                <strong>When to use:</strong> Use when you want to <b>heavily punish large errors</b>. Because it squares the errors, a mistake of 10 becomes a penalty of 100.
            </div>
<pre><code class="language-python">mse = mean_squared_error(y_true, y_pred)
print(f"MSE: {mse}")
</code></pre>
        </div>

        <!-- RMSE Code -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h4 class="font-bold text-slate-800 text-lg">Root Mean Squared Error (RMSE)</h4>
            <div class="text-slate-700 py-2">$$ \text{RMSE} = \sqrt{\text{MSE}} $$</div>
            <div class="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-900 border border-blue-100">
                <strong>The Simple Explanation:</strong> "The square root of MSE." <br>
                <strong>When to use:</strong> Use when you want to punish large mistakes (like MSE), but you want the final number to be back in the <b>original, understandable units</b> (e.g. Dollars, not Dollars-squared).
            </div>
<pre><code class="language-python"># Scikit-learn can calculate RMSE by passing squared=False
rmse = mean_squared_error(y_true, y_pred, squared=False)

# Or simply using numpy:
# rmse = np.sqrt(mean_squared_error(y_true, y_pred))

print(f"RMSE: {rmse}")
</code></pre>
        </div>

        <!-- R2 Code -->
        <div class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h4 class="font-bold text-slate-800 text-lg">R-Squared (R²)</h4>
            <div class="text-slate-700 py-2">$$ R^2 = 1 - \frac{\text{Model Errors}}{\text{Baseline Errors}} $$</div>
            <div class="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-900 border border-blue-100">
                <strong>The Simple Explanation:</strong> "How much better is my model than just guessing the average?" <br>
                <strong>When to use:</strong> Use to understand the overall fit. It outputs a score usually between 0 and 1. <br>
                <ul class="list-disc ml-5 mt-1">
                    <li><b>1.0</b> = Perfect model.</li>
                    <li><b>0.0</b> = Your model is completely useless.</li>
                </ul>
            </div>
<pre><code class="language-python">r2 = r2_score(y_true, y_pred)
print(f"R-Squared: {r2}")
# Output e.g., 0.98 (A very strong model!)
</code></pre>
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
        render: () => drawGrid() + drawPoints() + drawRegressionLine() + drawSquares() + drawResiduals()
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
    },
    {
        badge: "Code",
        title: "Python Implementation",
        desc: "Now you understand the theory and the math! Let's see how you actually implement this in Python.",
        extra: "Scroll through the code snippets on the left to see how <b>scikit-learn</b> makes calculating these metrics incredibly simple.",
        showPythonCode: true
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
const pyContainer = document.getElementById('code-container');
const visualContainer = document.getElementById('visual-container');

const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const stepCounter = document.getElementById('step-counter');
const progressBar = document.getElementById('progress-bar');

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

    // Hide all visual layers first
    svgEl.classList.add('hidden');
    eqContainer.classList.add('hidden');
    pyContainer.classList.add('hidden');

    // Show the correct visual layer
    if (step.showEquations) {
        eqContainer.classList.remove('hidden');
        eqContainer.innerHTML = equationsHTML;
        visualContainer.classList.remove('bg-slate-50/50');
        visualContainer.classList.add('bg-slate-50');

        // Render KaTeX for Summary
        if (window.renderMathInElement) {
            renderMathInElement(eqContainer, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    } else if (step.showPythonCode) {
        pyContainer.classList.remove('hidden');
        pyContainer.innerHTML = pythonCodeHTML;
        visualContainer.classList.remove('bg-slate-50/50');
        visualContainer.classList.add('bg-slate-100'); // Slightly darker for code contrast

        // Render KaTeX for Code Explanations
        if (window.renderMathInElement) {
            renderMathInElement(pyContainer, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }

        // Trigger Prism Syntax Highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(pyContainer);
        }

    } else {
        svgEl.classList.remove('hidden');
        svgEl.innerHTML = step.render();
        visualContainer.classList.add('bg-slate-50/50');
        visualContainer.classList.remove('bg-slate-50', 'bg-slate-100');
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

// Initialize (Delay slightly to ensure external libraries are ready)
setTimeout(() => {
    updateUI();
}, 100);