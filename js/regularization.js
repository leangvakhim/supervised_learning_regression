// --- DATA & CONFIGURATION ---
const stepsData = [
    {
        title: "1. The Goal: Finding the Pattern",
        description: "These blue dots represent our <strong>training data</strong>. In Machine Learning, our goal is to draw a line or curve that captures the underlying pattern of these dots so we can make accurate future predictions. Click 'Next' to see what happens when a model tries too hard.",
        showBadge: false
    },
    {
        title: "2. The Problem: Overfitting",
        description: "Without any constraints, a complex model connects every single dot perfectly. The result is this wild, spiky red line. It has memorized the training data (including the random noise), but it's far too complex. This is called <strong class='text-red-500'>Overfitting</strong>.",
        showBadge: false
    },
    {
        title: "3. The Solution: Regularization",
        description: "<strong>Regularization</strong> adds a mathematical penalty for complexity. It tells the model: <em>'Keep the line smooth, even if you miss a few dots.'</em> Watch the line calm down as it stops memorizing and starts generalizing the true pattern.",
        showBadge: true
    },
    {
        title: "4. The Math: The Objective Function",
        description: "To achieve this, we modify the equation the model uses. Instead of just minimizing the error, Regularization adds a <strong>Penalty Term</strong> controlled by a parameter <strong>&lambda; (lambda)</strong>.<br><div class='mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-center font-mono text-sm md:text-base shadow-sm'><span class='text-slate-700 font-semibold'>Total Cost</span> = <span class='text-blue-600'>Error</span> + <span class='text-indigo-600 font-bold'>&lambda; &times; Complexity</span></div>",
        showBadge: true
    },
    {
        title: "5. The Result: Better Generalization",
        description: "Why does this matter? Let's bring in new, unseen data (the orange squares). The simple, regularized model predicts them quite well! The overfit model (faded red) misses them completely. Regularization helps our model perform well in the real world.",
        showBadge: true
    }
];

// Canvas setup
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

// --- ANIMATION STATE ---
let currentStep = 0;

// Current animated values
let state = {
    lineAlpha: 0,
    amplitude: 80, // 80 = wild overfit, 0 = smooth
    testAlpha: 0,
    fadedOverfitAlpha: 0
};

// Target values for smooth interpolation
let targets = {
    lineAlpha: 0,
    amplitude: 80,
    testAlpha: 0,
    fadedOverfitAlpha: 0
};

// --- MATH FUNCTIONS ---
// The base smooth quadratic curve (Regularized model)
function getSmoothY(x) {
    return Math.pow(x - 400, 2) / 600 + 100;
}

// The wild curve with sine waves added (Overfit model)
function getCurveY(x, currentAmp) {
    // Adds a wobble that equals 0 exactly at the training points (100, 250, 400, 550, 700)
    let wobble = currentAmp * Math.sin((x - 100) * Math.PI / 150);
    return getSmoothY(x) - wobble;
}

// Linear interpolation for smooth animations
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

// --- RENDER ENGINE ---
function render() {
    // Update state towards targets
    state.lineAlpha = lerp(state.lineAlpha, targets.lineAlpha, 0.08);
    state.amplitude = lerp(state.amplitude, targets.amplitude, 0.04); // Slower, dramatic curve flattening
    state.testAlpha = lerp(state.testAlpha, targets.testAlpha, 0.05);
    state.fadedOverfitAlpha = lerp(state.fadedOverfitAlpha, targets.fadedOverfitAlpha, 0.05);

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Background Grid
    drawGrid();

    // Draw faded original overfit curve (Visible in step 4 to show contrast)
    if (state.fadedOverfitAlpha > 0.01) {
        drawCurve(80, `rgba(239, 68, 68, ${state.fadedOverfitAlpha})`, 2, true);
    }

    // Draw Main Animated Curve
    if (state.lineAlpha > 0.01) {
        // Color interpolates from Red (Overfit) to Blue (Regularized) based on amplitude
        let colorFactor = state.amplitude / 80;
        let r = Math.round(59 + colorFactor * (239 - 59));
        let g = Math.round(130 + colorFactor * (68 - 130));
        let b = Math.round(246 + colorFactor * (68 - 246));

        drawCurve(state.amplitude, `rgba(${r}, ${g}, ${b}, ${state.lineAlpha})`, 4, false);
    }

    // Draw Training Data
    drawPoints(trainingPoints, '#3b82f6', 'circle', 1);

    // Draw Unseen Test Data
    if (state.testAlpha > 0.01) {
        drawPoints(testPoints, `rgba(249, 115, 22, ${state.testAlpha})`, 'square', state.testAlpha);
    }

    requestAnimationFrame(render);
}

function drawGrid() {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
    for (let j = 0; j <= height; j += 50) { ctx.moveTo(0, j); ctx.lineTo(width, j); }
    ctx.stroke();
}

function drawCurve(amplitude, color, thickness, isDashed) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isDashed) ctx.setLineDash([10, 10]);
    else ctx.setLineDash([]);

    // Draw from x=50 to x=750
    for (let x = 50; x <= 750; x += 5) {
        let y = getCurveY(x, amplitude);
        if (x === 50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset
}

function drawPoints(points, color, shape, alpha) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    points.forEach(p => {
        ctx.beginPath();
        if (shape === 'circle') {
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Add subtle glow/border
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        } else if (shape === 'square') {
            ctx.rect(p.x - 7, p.y - 7, 14, 14);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
    });
    ctx.globalAlpha = 1.0; // reset
}

// --- INTERACTIVITY LOGIC ---
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const dots = document.getElementById('progress-dots').children;
const badge = document.getElementById('penalty-badge');
const contentArea = document.getElementById('text-content');

function updateStep(newStep) {
    // Handle logical jumps for snappy animations
    if (currentStep === 0 && newStep === 1) {
        state.amplitude = 80; // Snap to wild overfit instantly when appearing
    }

    currentStep = newStep;

    // Set Targets based on step
    if (currentStep === 0) {
        targets.lineAlpha = 0;
        targets.amplitude = 80;
        targets.testAlpha = 0;
        targets.fadedOverfitAlpha = 0;
    } else if (currentStep === 1) {
        targets.lineAlpha = 1;
        targets.amplitude = 80;
        targets.testAlpha = 0;
        targets.fadedOverfitAlpha = 0;
    } else if (currentStep === 2) {
        targets.lineAlpha = 1;
        targets.amplitude = 0; // Animates smoothly to 0 (flattening)
        targets.testAlpha = 0;
        targets.fadedOverfitAlpha = 0;
    } else if (currentStep === 3) {
        targets.lineAlpha = 1;
        targets.amplitude = 0;
        targets.testAlpha = 0;
        targets.fadedOverfitAlpha = 0.25; // Introduce the faded red line for comparison
    } else if (currentStep === 4) {
        targets.lineAlpha = 1;
        targets.amplitude = 0;
        targets.testAlpha = 1;
        targets.fadedOverfitAlpha = 0.25;
    }

    updateUI();
}

function updateUI() {
    // Update Text with slight fade effect
    contentArea.style.opacity = 0;
    setTimeout(() => {
        titleEl.innerHTML = stepsData[currentStep].title;
        descEl.innerHTML = stepsData[currentStep].description;
        contentArea.style.opacity = 1;
    }, 150);

    // Update Badge
    if (stepsData[currentStep].showBadge) {
        badge.classList.remove('hidden');
        setTimeout(() => badge.classList.remove('opacity-0'), 50);
    } else {
        badge.classList.add('opacity-0');
        setTimeout(() => badge.classList.add('hidden'), 300);
    }

    // Update Buttons
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === stepsData.length - 1;

    // Update Progress Dots
    Array.from(dots).forEach((dot, index) => {
        if (index === currentStep) {
            dot.className = "w-3 h-3 rounded-full bg-blue-500 transition-colors duration-300 transform scale-125";
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

// Initialize
updateUI();
render(); // Start animation loop