// --- 1. Content & State Definition ---
const steps = [
    {
        title: "The Raw Data",
        desc: "Welcome! Here we have some scattered data points. Imagine this shows the relationship between a machine's temperature and its efficiency. Notice how the points curve down and then back up? They don't form a straight line.",
        type: "points"
    },
    {
        title: "Linear Regression (Degree 1)",
        desc: "If we try to draw a standard straight line (Linear Regression) through this data, it doesn't work well. It misses the underlying pattern completely. In Machine Learning, we call this <strong>Underfitting</strong>.",
        type: "linear"
    },
    {
        title: "Polynomial Regression (Degree 2)",
        desc: "By adding a squared term (Degree 2, or <em>x&sup2;</em>) to our formula, our line can bend! This quadratic curve captures the true pattern of the data beautifully. It ignores the random noise and finds the real trend.",
        type: "quadratic"
    },
    {
        title: "The Equation",
        desc: "How does it bend? Using this formula:<br><div class='bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-mono text-blue-600 my-4 text-sm sm:text-base shadow-inner'>y = &beta;<sub>0</sub> + &beta;<sub>1</sub>x + &beta;<sub>2</sub>x&sup2; + ... + &beta;<sub>n</sub>x&#8319;</div>Here, <em>n</em> is the Degree. The model learns the best weights (&beta;) to shape the curve. A degree of 2 gives us the parabola you see here.",
        type: "equation"
    },
    {
        title: "High-Degree Polynomial (Degree 15)",
        desc: "What if we add <em>x<sup>3</sup>, x<sup>4</sup> ... up to x<sup>15</sup></em>? The curve becomes so flexible it touches almost every point perfectly. But look how wildly it wiggles! This is <strong>Overfitting</strong>. It memorized the noise and will fail to predict new data.",
        type: "overfit"
    },
    {
        title: "The Conclusion",
        desc: "Polynomial Regression is a powerful tool for modeling non-linear data. The secret to success in Machine Learning is choosing the right 'Degree'—avoiding the rigidness of underfitting and the chaos of overfitting!",
        type: "all"
    }
];

let currentStep = 0;
let animationProgress = 0;
let animationFrameId = null;

// --- 2. Data Generation & Math Functions ---
const canvas = document.getElementById('viz-canvas');
const ctx = canvas.getContext('2d');
const points = [];

// Base function: y = a(x-h)^2 + k  (A U-shape curve)
const trueCurve = (x) => {
    return 0.0015 * Math.pow(x - 400, 2) + 150 + (x * 0.1);
};

// Linear approximation
const linearCurve = (x) => {
    return 0.15 * x + 180;
};

// Generate synthetic points
// X ranges from 50 to 750 (canvas width is 800)
for (let x = 70; x <= 730; x += 55) {
    // Add some random noise to Y
    let noise = (Math.random() - 0.5) * 80;
    points.push({ x: x, y: trueCurve(x) + noise });
}

// Catmull-Rom Spline calculation for the "Overfit" curve
// This makes a smooth, wiggly line that perfectly hits all data points
function getSplinePoint(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const t3 = t2 * t;
    const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    return { x, y };
}

// --- 3. DOM Elements & Interactions ---
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const indicatorEl = document.getElementById('step-indicator');
const dotsContainer = document.getElementById('progress-dots');

// Create dots
steps.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `w-2 h-2 rounded-full transition-colors duration-300 ${i === 0 ? 'bg-blue-600' : 'bg-slate-200'}`;
    dotsContainer.appendChild(dot);
});
const dots = dotsContainer.children;

function updateUI() {
    // Re-trigger CSS animations
    titleEl.classList.remove('fade-in');
    descEl.classList.remove('fade-in');
    void titleEl.offsetWidth; // trigger reflow

    titleEl.textContent = steps[currentStep].title;
    descEl.innerHTML = steps[currentStep].desc;
    indicatorEl.textContent = `Step ${currentStep + 1} of ${steps.length}`;

    titleEl.classList.add('fade-in');
    descEl.classList.add('fade-in');

    // Buttons
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === steps.length - 1;

    // Dots
    Array.from(dots).forEach((dot, i) => {
        dot.className = `w-2 h-2 rounded-full transition-colors duration-300 ${i === currentStep ? 'bg-blue-600' : 'bg-slate-200'}`;
    });

    // Legends - Adjusted for the new equation step (index 3)
    document.getElementById('legend-linear').style.opacity = (currentStep === 1 || currentStep === 5) ? '1' : '0.3';
    document.getElementById('legend-poly').style.opacity = (currentStep === 2 || currentStep === 3 || currentStep === 5) ? '1' : '0.3';
    document.getElementById('legend-overfit').style.opacity = (currentStep === 4 || currentStep === 5) ? '1' : '0.3';

    // Start Animation
    animationProgress = 0;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animateCanvas();
}

btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

// --- 4. Canvas Drawing Engine ---
function drawGrid() {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 50) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += 50) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

function drawPoints() {
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawFunction(fn, color, progress, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.setLineDash(dash);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const startX = 50;
    const endX = 750;
    const currentMaxX = startX + (endX - startX) * progress;

    for (let x = startX; x <= currentMaxX; x += 2) {
        const y = fn(x);
        if (x === startX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset
}

function drawOverfitSpline(progress) {
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6'; // purple-500
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // We need to calculate total segments to animate it smoothly
    const totalSegments = points.length - 1;
    const targetSegment = progress * totalSegments;
    const fullSegments = Math.floor(targetSegment);
    const partialSegment = targetSegment - fullSegments;

    if (points.length === 0) return;

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < totalSegments; i++) {
        if (i > fullSegments) break;

        // Handle boundary points for spline calculation
        const p0 = points[i === 0 ? i : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? i + 1 : i + 2];

        const tMax = (i === fullSegments) ? partialSegment : 1.0;

        for (let t = 0.05; t <= tMax; t += 0.05) {
            const pt = getSplinePoint(t, p0, p1, p2, p3);
            ctx.lineTo(pt.x, pt.y);
        }
    }
    ctx.stroke();
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    const type = steps[currentStep].type;

    // Draw background curves in "all" step
    if (type === 'all') {
        drawFunction(linearCurve, 'rgba(239, 68, 68, 0.2)', 1, [10, 10]); // Faded red
        drawOverfitSpline(1); // Full purple but we'll draw over it or lower opacity

        // Redraw overfit with lower opacity
        ctx.globalAlpha = 0.3;
        drawOverfitSpline(1);
        ctx.globalAlpha = 1.0;
    }

    // Draw primary animated curve
    if (type === 'linear' || type === 'all') {
        drawFunction(linearCurve, '#ef4444', type === 'all' ? 1 : animationProgress); // Red
    }

    // Keep the quadratic curve visible when viewing the equation
    if (type === 'quadratic' || type === 'equation' || type === 'all') {
        drawFunction(trueCurve, '#10b981', type === 'all' || type === 'equation' ? 1 : animationProgress); // Green
    }

    if (type === 'overfit') {
        drawOverfitSpline(animationProgress);
    }

    drawPoints();
}

function animateCanvas() {
    // Speed of drawing animation
    animationProgress += 0.03;
    if (animationProgress > 1) animationProgress = 1;

    renderCanvas();

    if (animationProgress < 1) {
        animationFrameId = requestAnimationFrame(animateCanvas);
    }
}

// Initialize
updateUI();

// Handle resizing for high-DPI displays (makes canvas crisp)
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    // We keep the internal coordinate system 800x500
    // but scale it visually using CSS. No JS scaling needed
    // since we defined width/height attributes explicitly.
    renderCanvas();
}
window.addEventListener('resize', resizeCanvas);