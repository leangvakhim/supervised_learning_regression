// --- DATA & CONFIGURATION ---
const stepsData = [
    {
        title: "1. The Goal: Finding the Pattern",
        description: "These blue dots represent our <strong>training data</strong>. In Machine Learning, our goal is to fit a line or curve that captures the underlying pattern of these dots so we can make accurate future predictions. Click 'Next' to see what happens when a model tries too hard.",
        math: null, badgeText: null, badgeStyle: null
    },
    {
        title: "2. The Problem: Overfitting",
        description: "Without constraints, a highly complex model will connect every single dot perfectly. The result is this wild, erratic red line. It has memorized the training data (including the noise), but fails to capture the true underlying trend. This is called <strong class='text-red-500'>Overfitting</strong>.",
        math: null, badgeText: "No Penalty Applied", badgeStyle: "bg-red-100 text-red-700 border-red-200"
    },
    {
        title: "3. L2 Regularization (Ridge)",
        description: "<strong>L2 Regularization</strong> adds a penalty equal to the <em>square</em> of the magnitude of coefficients. This forces the model to distribute weights evenly, punishing extreme spikes. The result is a beautifully <strong>smooth curve</strong> that ignores the noise.",
        math: "J(\\theta) = \\text{MSE} + \\lambda \\sum_{i=1}^{n} \\theta_i^2",
        badgeText: "L2 Penalty Applied", badgeStyle: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        title: "4. L1 Regularization (Lasso)",
        description: "<strong>L1 Regularization</strong> penalizes the <em>absolute value</em> of coefficients. Unlike L2, L1 can force some coefficients <em>exactly to zero</em>, creating a sparse model. Notice how the curve becomes sharper and more piecewise (V-shaped), aggressively simplifying the formula.",
        math: "J(\\theta) = \\text{MSE} + \\lambda \\sum_{i=1}^{n} |\\theta_i|",
        badgeText: "L1 Penalty Applied", badgeStyle: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
        title: "5. Elastic Net Regularization",
        description: "<strong>Elastic Net</strong> combines the best of both worlds. It blends the L1 and L2 penalties together, controlled by a mixing ratio (r). It maintains the stable smoothness of Ridge (L2) while keeping the aggressive feature selection capability of Lasso (L1).",
        math: "J(\\theta) = \\text{MSE} + r\\lambda \\sum_{i=1}^{n} |\\theta_i| + \\frac{1-r}{2}\\lambda \\sum_{i=1}^{n} \\theta_i^2",
        badgeText: "L1 + L2 Applied", badgeStyle: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
        title: "6. The Result: Generalization",
        description: "Why does restricting complexity matter? Let's bring in <strong>new, unseen data</strong> (orange squares). The regularized models perform excellently, safely predicting the true trend. The wild overfit model (faded red) misses them completely. Regularization creates robust, real-world models.",
        math: null, badgeText: "Generalization Success", badgeStyle: "bg-orange-100 text-orange-700 border-orange-200"
    },
    {
        title: "7. Python Implementation",
        description: "In practice, you don't need to write the math from scratch. Modern libraries like <strong>scikit-learn</strong> make applying Regularization as easy as importing a model and setting the <code>alpha</code> parameter (which is equivalent to our penalty term &lambda;).",
        math: null, badgeText: "scikit-learn", badgeStyle: "bg-yellow-100 text-yellow-800 border-yellow-300",
        codeSnippet: `
<pre class="bg-slate-800 text-slate-50 p-4 rounded-xl text-sm sm:text-base overflow-x-auto shadow-inner font-mono leading-relaxed mt-5">
<span class="text-slate-400"># 1. L2 Regularization (Ridge)</span>
<span class="text-blue-400">from</span> sklearn.linear_model <span class="text-blue-400">import</span> Ridge
model_l2 = Ridge(alpha=<span class="text-orange-400">1.0</span>) <span class="text-slate-400"># alpha represents λ</span>

<span class="text-slate-400"># 2. L1 Regularization (Lasso)</span>
<span class="text-blue-400">from</span> sklearn.linear_model <span class="text-blue-400">import</span> Lasso
model_l1 = Lasso(alpha=<span class="text-orange-400">0.1</span>)

<span class="text-slate-400"># 3. Elastic Net (L1 + L2)</span>
<span class="text-blue-400">from</span> sklearn.linear_model <span class="text-blue-400">import</span> ElasticNet
model_en = ElasticNet(alpha=<span class="text-orange-400">0.1</span>, l1_ratio=<span class="text-orange-400">0.5</span>)

<span class="text-slate-400"># Training is identical for all models:</span>
model_en.fit(X_train, y_train)
</pre>`
    }
];

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

// Logical resolution for sharp rendering
const width = 800;
const height = 400;
canvas.width = width;
canvas.height = height;

// Data Points (X, Y)
const trainingPoints = [
    { x: 100, y: 250 },
    { x: 250, y: 137.5 },
    { x: 400, y: 100 },
    { x: 550, y: 137.5 },
    { x: 700, y: 250 }
];

const testPoints = [
    { x: 175, y: 194 },
    { x: 325, y: 101 },
    { x: 475, y: 121 },
    { x: 625, y: 179 }
];

let currentStep = 0;

// Current animated values
let state = {
    lineAlpha: 0,
    amplitude: 80,    // Wobble amplitude for overfitting
    l1_ratio: 0,      // 0 = Ridge (Smooth), 1 = Lasso (Sharp V), 0.5 = Elastic Net
    testAlpha: 0,
    fadedOverfitAlpha: 0,
    allRegAlpha: 0,   // Controls the shadow models visibility
    r: 239, g: 68, b: 68 // Initial Red color for Overfit
};

// Target values for smooth interpolation
let targets = {
    lineAlpha: 0,
    amplitude: 80,
    l1_ratio: 0,
    testAlpha: 0,
    fadedOverfitAlpha: 0,
    allRegAlpha: 0,
    r: 239, g: 68, b: 68
};

// Linear interpolation helper
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

// The base shape determined by the regularization type
function getRegularizedY(x, l1Ratio) {
    // L2 / Ridge formulation -> Smooth quadratic shape fitting the points perfectly
    let ridgeY = Math.pow(x - 400, 2) / 600 + 100;

    // L1 / Lasso formulation -> Sharp absolute value shape (forcing sparse coefficients)
    let lassoY = Math.abs(x - 400) * 0.5 + 100;

    // Elastic Net is a mathematical blend of the two penalties
    return (1 - l1Ratio) * ridgeY + (l1Ratio) * lassoY;
}

// Applies the overfitting error wave on top of the base shape
function getCurveY(x, currentAmp, l1Ratio) {
    let baseShape = getRegularizedY(x, l1Ratio);
    // Adds a wobble that equals 0 exactly at the training points to simulate overfitting
    let wobble = currentAmp * Math.sin((x - 100) * Math.PI / 150);
    return baseShape - wobble;
}

function render() {
    // Update state towards targets
    state.lineAlpha = lerp(state.lineAlpha, targets.lineAlpha, 0.08);
    state.amplitude = lerp(state.amplitude, targets.amplitude, 0.05); // Smooth flattening
    state.l1_ratio = lerp(state.l1_ratio, targets.l1_ratio, 0.05);    // Shape morphing
    state.testAlpha = lerp(state.testAlpha, targets.testAlpha, 0.05);
    state.fadedOverfitAlpha = lerp(state.fadedOverfitAlpha, targets.fadedOverfitAlpha, 0.05);
    state.allRegAlpha = lerp(state.allRegAlpha, targets.allRegAlpha, 0.05);

    // Interpolate colors smoothly
    state.r = lerp(state.r, targets.r, 0.06);
    state.g = lerp(state.g, targets.g, 0.06);
    state.b = lerp(state.b, targets.b, 0.06);

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    // Draw faded original overfit curve (Visible in later steps to show contrast)
    if (state.fadedOverfitAlpha > 0.01) {
        // Fixed properties of the overfit line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(239, 68, 68, ${state.fadedOverfitAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        for (let x = 50; x <= 750; x += 5) {
            let y = getCurveY(x, 80, 0);
            if (x === 50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw all regularizations simultaneously as shadows (Step 7)
    if (state.allRegAlpha > 0.01) {
        let alpha = 0.6 * state.allRegAlpha;
        drawCurveLine(0, 0, `rgba(59, 130, 246, ${alpha})`, 3);   // L2 Ridge (Blue)
        drawCurveLine(0, 1, `rgba(16, 185, 129, ${alpha})`, 3);   // L1 Lasso (Green)
        drawCurveLine(0, 0.5, `rgba(168, 85, 247, ${alpha})`, 3); // Elastic Net (Purple)
    }

    // Draw Main Animated Curve
    if (state.lineAlpha > 0.01) {
        let mainColor = `rgba(${Math.round(state.r)}, ${Math.round(state.g)}, ${Math.round(state.b)}, ${state.lineAlpha})`;
        drawCurveLine(state.amplitude, state.l1_ratio, mainColor, 4);
    }

    // Draw Unseen Test Data (Bottom layer so they don't cover main points)
    if (state.testAlpha > 0.01) {
        drawPoints(testPoints, `rgba(249, 115, 22, ${state.testAlpha})`, 'square', state.testAlpha);
    }

    // Draw Training Data (Top layer)
    drawPoints(trainingPoints, '#3b82f6', 'circle', 1);

    requestAnimationFrame(render);
}

// Helper to draw a single continuous curve cleanly
function drawCurveLine(amp, ratio, colorStr, lineWidth) {
    ctx.beginPath();
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let x = 50; x <= 750; x += 5) {
        let y = getCurveY(x, amp, ratio);
        if (x === 50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawGrid() {
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
    for (let j = 0; j <= height; j += 50) { ctx.moveTo(0, j); ctx.lineTo(width, j); }
    ctx.stroke();
}

function drawPoints(points, color, shape, alpha) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    points.forEach(p => {
        ctx.beginPath();
        if (shape === 'circle') {
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        } else if (shape === 'square') {
            ctx.rect(p.x - 7, p.y - 7, 14, 14);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
    });
    ctx.globalAlpha = 1.0;
}

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const dotsContainer = document.getElementById('progress-dots');
const badge = document.getElementById('penalty-badge');
const contentArea = document.getElementById('text-content');
const mathBox = document.getElementById('math-box');
const codeBox = document.getElementById('code-box');
const legend = document.getElementById('legend');

// Setup dots dynamically based on number of steps
stepsData.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = "w-3 h-3 rounded-full bg-slate-200 transition-colors duration-300";
    dotsContainer.appendChild(dot);
});
const dots = dotsContainer.children;

function updateStep(newStep) {
    // Handle logical jump from pure points to overfit curve immediately
    if (currentStep === 0 && newStep === 1) {
        state.amplitude = 80;
        state.r = 239; state.g = 68; state.b = 68;
    }

    currentStep = newStep;

    // Target mapping per step
    switch (currentStep) {
        case 0: // Goal
            targets = { ...targets, lineAlpha: 0, amplitude: 80, l1_ratio: 0, testAlpha: 0, fadedOverfitAlpha: 0, allRegAlpha: 0, r: 239, g: 68, b: 68 };
            break;
        case 1: // Overfit
            targets = { ...targets, lineAlpha: 1, amplitude: 80, l1_ratio: 0, testAlpha: 0, fadedOverfitAlpha: 0, allRegAlpha: 0, r: 239, g: 68, b: 68 };
            break;
        case 2: // L2 Ridge (Blue, Smooth)
            targets = { ...targets, lineAlpha: 1, amplitude: 0, l1_ratio: 0, testAlpha: 0, fadedOverfitAlpha: 0.15, allRegAlpha: 0, r: 59, g: 130, b: 246 };
            break;
        case 3: // L1 Lasso (Green, Sharp)
            targets = { ...targets, lineAlpha: 1, amplitude: 0, l1_ratio: 1, testAlpha: 0, fadedOverfitAlpha: 0.15, allRegAlpha: 0, r: 16, g: 185, b: 129 };
            break;
        case 4: // Elastic Net (Purple, Blend)
            targets = { ...targets, lineAlpha: 1, amplitude: 0, l1_ratio: 0.5, testAlpha: 0, fadedOverfitAlpha: 0.15, allRegAlpha: 0, r: 168, g: 85, b: 247 };
            break;
        case 5: // Test Data
            targets = { ...targets, lineAlpha: 1, amplitude: 0, l1_ratio: 0.5, testAlpha: 1, fadedOverfitAlpha: 0.15, allRegAlpha: 0, r: 168, g: 85, b: 247 };
            break;
        case 6: // Python Code (Show all regularizations as shadows)
            targets = { ...targets, lineAlpha: 0, amplitude: 0, l1_ratio: 0.5, testAlpha: 1, fadedOverfitAlpha: 0, allRegAlpha: 1, r: 168, g: 85, b: 247 };
            break;
    }

    updateUI();
}

function updateUI() {
    // Update Text with fade effect
    contentArea.style.opacity = 0;

    setTimeout(() => {
        const step = stepsData[currentStep];
        titleEl.innerHTML = step.title;
        descEl.innerHTML = step.description;

        // Update Badge
        if (step.badgeText) {
            badge.className = `px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-opacity duration-500 border ${step.badgeStyle}`;
            badge.innerHTML = step.badgeText;
        } else {
            badge.className = "hidden";
        }

        // Render Math using KaTeX if available
        if (step.math) {
            try {
                const htmlMath = katex.renderToString(step.math, { displayMode: true, throwOnError: false });
                mathBox.innerHTML = `<div class='mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-inner overflow-x-auto math-container'>${htmlMath}</div>`;
            } catch (e) {
                console.error("KaTeX error", e);
            }
        } else {
            mathBox.innerHTML = '';
        }

        // Render Python Code Snippet if available
        if (step.codeSnippet) {
            codeBox.innerHTML = step.codeSnippet;
            codeBox.classList.remove('hidden');
        } else {
            codeBox.innerHTML = '';
            codeBox.classList.add('hidden');
        }

        // Show legend on the last steps
        if (currentStep >= 5) {
            legend.classList.remove('hidden', 'opacity-0');
            legend.classList.add('opacity-100');

            // Toggle expanded models legend specifically for Step 7
            const legendModels = document.getElementById('legend-models');
            if (currentStep === 6) {
                legendModels.classList.remove('hidden');
            } else {
                legendModels.classList.add('hidden');
            }
        } else {
            legend.classList.add('opacity-0');
            setTimeout(() => legend.classList.add('hidden'), 500);
        }

        contentArea.style.opacity = 1;
    }, 150);

    // Update Navigation
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === stepsData.length - 1;

    // Update Progress Dots
    Array.from(dots).forEach((dot, index) => {
        if (index === currentStep) {
            dot.className = "w-3 h-3 rounded-full bg-blue-500 transition-colors duration-300 transform scale-125 shadow-sm";
        } else {
            dot.className = "w-3 h-3 rounded-full bg-slate-200 transition-colors duration-300";
        }
    });
}

// Event Listeners
btnNext.addEventListener('click', () => {
    if (currentStep < stepsData.length - 1) updateStep(currentStep + 1);
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) updateStep(currentStep - 1);
});

// Initialize once fonts/dom is fully loaded
window.onload = () => {
    updateUI();
    render();
};