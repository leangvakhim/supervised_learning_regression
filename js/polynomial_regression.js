// <!-- ORIGINAL SCRIPT SECTION -->
// --- 1. Content & State Definition ---
const steps = [
    {
        title: "The Real-World Scenario",
        desc: "Imagine we are predicting <strong>Crop Yield (Y)</strong> based on the amount of <strong>Fertilizer Applied (X)</strong>.<br><br>The data points show a common reality: a little fertilizer helps crops grow, but <em>too much</em> fertilizer poisons the soil and decreases the yield. Notice how the data forms a hill?",
        type: "points"
    },
    {
        title: "Linear Regression (Degree 1)",
        desc: "If we force a straight line ($y = mx + b$) through this data, it fails terribly. The line assumes that more fertilizer <em>always</em> equals more yield, predicting massive harvests for toxic soil! <br><br>In Machine Learning, failing to capture the underlying pattern is called <strong>Underfitting</strong>.",
        type: "linear"
    },
    {
        title: "Polynomial Regression",
        desc: "By adding a squared term (Degree 2) to our formula, our line can bend! <br><br>This quadratic curve mathematically forms a parabola. It perfectly captures the 'sweet spot' of fertilizer, ignoring the random noise and finding the true agricultural trend.",
        type: "quadratic"
    },
    {
        title: "The Mathematical Formula",
        desc: "To make the line bend, we expand our features. Instead of just using $X$, we create a new feature $X$<sup>2</sup>. The general equation becomes:<br><div class='bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono text-emerald-700 my-4 shadow-inner text-sm sm:text-base'>y = &beta;<sub>0</sub> + &beta;<sub>1</sub>x + &beta;<sub>2</sub>x&sup2; + ... + &beta;<sub>n</sub>x&#8319;</div>Here, <em>n</em> is the Degree. The model's job is to calculate the perfect weights (&beta;) to shape the curve.",
        type: "equation"
    },
    {
        title: "Calculation Step 1: The Matrix",
        desc: "How does a computer actually calculate those &beta; weights? It uses Linear Algebra. First, we arrange all our data inputs into a <strong>Design Matrix (X)</strong>, and outputs into a vector (Y).<br><div class='mt-4 flex justify-center items-center text-sm font-mono space-x-4'><div class='flex'><div class='matrix-bracket-left'></div><div class='flex flex-col px-3 text-center space-y-1 py-1'><div>1 &nbsp; x<sub>1</sub> &nbsp; x<sub>1</sub>&sup2;</div><div>1 &nbsp; x<sub>2</sub> &nbsp; x<sub>2</sub>&sup2;</div><div>... &nbsp; ... &nbsp; ...</div><div>1 &nbsp; x<sub>n</sub> &nbsp; x<sub>n</sub>&sup2;</div></div><div class='matrix-bracket-right'></div></div> <div class='font-bold text-slate-400'>&times;</div> <div class='flex'><div class='matrix-bracket-left'></div><div class='flex flex-col px-2 text-center space-y-1 py-1 text-emerald-600'><div>&beta;<sub>0</sub></div><div>&beta;<sub>1</sub></div><div>&beta;<sub>2</sub></div></div><div class='matrix-bracket-right'></div></div> <div class='font-bold text-slate-400'>=</div> <div class='flex'><div class='matrix-bracket-left'></div><div class='flex flex-col px-2 text-center space-y-1 py-1 text-blue-600'><div>y<sub>1</sub></div><div>y<sub>2</sub></div><div>...</div><div>y<sub>n</sub></div></div><div class='matrix-bracket-right'></div></div></div>",
        type: "matrix"
    },
    {
        title: "Calculation Step 2: Normal Equation",
        desc: "To find the best weights (&beta;) that minimize the error, we use the <strong>Normal Equation</strong>:<br><div class='bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-mono text-slate-700 my-4'>&beta; = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup> Y</div>This directly calculates the optimal curve!<br><br>For our farming data, the math roughly outputs:<br><span class='font-mono text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded'>y = 0 + 1.2x - 0.0015x&sup2;</span><br><span class='text-sm text-slate-500'>(Notice the negative squared term? That turns our parabola upside down to form the hill!)</span>",
        type: "calculation"
    },
    {
        title: "High-Degree (Overfitting)",
        desc: "What if we use a Degree 15 equation ($x$<sup>15</sup>)? The Design Matrix gets huge, and the math perfectly hits nearly every single data point.<br><br>But look at the curve! It wiggles wildly. If we use this to predict next year's yield, it will fail miserably. This is <strong>Overfitting</strong>—memorizing the noise instead of learning the trend.",
        type: "overfit"
    },
    {
        title: "Python Implementation (1/2)",
        desc: "In Python, we don't calculate the Design Matrix manually. We use the <code>PolynomialFeatures</code> transformer from <strong>Scikit-Learn</strong>.<br><br>First, import libraries and prepare our data arrays:<br><div class='bg-slate-900 rounded-xl p-3 overflow-x-auto shadow-inner text-sm font-mono text-slate-300 mt-3 mb-3'><pre><code><span class='text-pink-400'>import</span> numpy <span class='text-pink-400'>as</span> np\n<span class='text-pink-400'>from</span> sklearn.preprocessing <span class='text-pink-400'>import</span> PolynomialFeatures\n<span class='text-pink-400'>from</span> sklearn.linear_model <span class='text-pink-400'>import</span> LinearRegression</code></pre></div><div class='bg-slate-900 rounded-xl p-3 overflow-x-auto shadow-inner text-sm font-mono text-slate-300'><pre><code><span class='text-slate-500'># X: Fertilizer, y: Yield</span>\nX = np.array([[<span class='text-orange-300'>100</span>], [<span class='text-orange-300'>200</span>], [<span class='text-orange-300'>400</span>], [<span class='text-orange-300'>700</span>]])\ny = np.array([[<span class='text-orange-300'>45</span>],  [<span class='text-orange-300'>65</span>],  [<span class='text-orange-300'>80</span>],  [<span class='text-orange-300'>30</span>]])</code></pre></div>",
        type: "quadratic"
    },
    {
        title: "Python Implementation (2/2)",
        desc: "Next, we transform our inputs to include the squared terms, and train a standard Linear Regression model!<br><br><div class='bg-slate-900 rounded-xl p-3 overflow-x-auto shadow-inner text-sm font-mono text-slate-300 mt-3 mb-3'><pre><code><span class='text-slate-500'># 1. Transform: Create X&sup2; feature</span>\npoly = PolynomialFeatures(degree=<span class='text-orange-300'>2</span>)\nX_poly = poly.fit_transform(X)</code></pre></div><div class='bg-slate-900 rounded-xl p-3 overflow-x-auto shadow-inner text-sm font-mono text-slate-300'><pre><code><span class='text-slate-500'># 2. Train and Predict</span>\nmodel = LinearRegression()\nmodel.fit(X_poly, y)\n\npredictions = model.predict(X_poly)</code></pre></div>",
        type: "quadratic"
    },
    {
        title: "The Conclusion",
        desc: "Polynomial Regression is a powerful algorithm for modeling non-linear real-world data like agricultural yields, population growth, or temperature changes.<br><br>The secret to Machine Learning isn't creating the most complex math possible; it's choosing the right 'Degree' to find the true underlying pattern!",
        type: "all"
    }
];

let currentStep = 0;
let animationProgress = 0;
let animationFrameId = null;

// --- STREAMING_CHUNK:Setting up math functions for the data generation... ---
const canvas = document.getElementById('viz-canvas');
const ctx = canvas.getContext('2d');
const points = [];

// Real World Math: Y = Yield, X = Fertilizer.
// We want a hill shape. Higher yield means lower visual Y coordinate on Canvas (0 is top).
// Vertex (peak yield) around X=400.
// Canvas Y = a(x - h)^2 + k.
// To make it open upwards (which visually looks like a hill since Y goes down-to-up in canvas logic), a must be positive.
// Let h = 400. Peak yield is near top, so let k = 100.
const trueCurve = (x) => {
    // y = 0.003 * (x - 400)^2 + 80
    return 0.0035 * Math.pow(x - 400, 2) + 80;
};

// Linear approximation (a line that fails to capture the hill)
// A standard least-squares fit for a perfect parabola sampled evenly is a flat line,
// but let's give it a slight positive slope to show the "more fertilizer = more yield" flawed assumption.
const linearCurve = (x) => {
    return -0.15 * x + 350;
};

// Generate synthetic data points
// X ranges from 80 to 720
// Seeded random approach for consistent "noise"
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
const rand = mulberry32(12345);

for (let x = 80; x <= 720; x += 45) {
    // Add noise to the perfect curve.
    let noise = (rand() - 0.5) * 120;
    points.push({ x: x, y: trueCurve(x) + noise });
}

// --- STREAMING_CHUNK:Implementing the Catmull-Rom Spline for the Overfit visualization... ---
function getSplinePoint(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const t3 = t2 * t;
    const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    return { x, y };
}

// --- STREAMING_CHUNK:Handling DOM interactions and UI updates... ---
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const indicatorEl = document.getElementById('step-indicator');
const dotsContainer = document.getElementById('progress-dots');

// Create navigation dots
steps.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-emerald-500 w-4' : 'bg-slate-200'}`;
    dotsContainer.appendChild(dot);
});
const dots = dotsContainer.children;

// Replace literal tags with HTML entities for display in description
function formatDesc(text) {
    return text.replace(/\$([^$]+)\$/g, '<em class="font-serif italic">$1</em>');
}

function updateUI() {
    // Reset CSS animations
    titleEl.classList.remove('fade-in');
    descEl.classList.remove('fade-in');
    void titleEl.offsetWidth; // Reflow hack

    titleEl.innerHTML = steps[currentStep].title;
    descEl.innerHTML = formatDesc(steps[currentStep].desc);
    indicatorEl.textContent = `Step ${currentStep + 1} of ${steps.length}`;

    titleEl.classList.add('fade-in');
    descEl.classList.add('fade-in');

    // Button states
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === steps.length - 1;

    // Dot states
    Array.from(dots).forEach((dot, i) => {
        dot.className = `h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-emerald-500 w-4' : 'bg-slate-200 w-2'}`;
    });

    // Update Legends based on current step type
    const t = steps[currentStep].type;
    const showLin = (t === 'linear' || t === 'all');
    const showPoly = (t === 'quadratic' || t === 'equation' || t === 'matrix' || t === 'calculation' || t === 'all');
    const showOver = (t === 'overfit' || t === 'all');

    document.getElementById('legend-linear').style.opacity = showLin ? '1' : '0.3';
    document.getElementById('legend-poly').style.opacity = showPoly ? '1' : '0.3';
    document.getElementById('legend-overfit').style.opacity = showOver ? '1' : '0.3';

    // Restart Canvas Animation
    animationProgress = 0;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animateCanvas();
}

btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) { currentStep++; updateUI(); }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; updateUI(); }
});

// --- STREAMING_CHUNK:Canvas Drawing Engine configuration... ---
function drawGrid() {
    ctx.strokeStyle = '#f8fafc';
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
        // Drop shadow for points
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fill();

        ctx.shadowColor = 'transparent'; // reset
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawFunction(fn, color, progress, dash = [], thickness = 4) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.setLineDash(dash);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drawing bounds (leaving a bit of margin)
    const startX = 40;
    const endX = 760;
    const currentMaxX = startX + (endX - startX) * progress;

    for (let x = startX; x <= currentMaxX; x += 2) {
        const y = fn(x);
        if (x === startX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset dash
}

// --- STREAMING_CHUNK:Rendering the Overfitting curve specifically... ---
function drawOverfitSpline(progress) {
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7'; // purple-500
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const totalSegments = points.length - 1;
    const targetSegment = progress * totalSegments;
    const fullSegments = Math.floor(targetSegment);
    const partialSegment = targetSegment - fullSegments;

    if (points.length === 0) return;

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < totalSegments; i++) {
        if (i > fullSegments) break;

        const p0 = points[i === 0 ? i : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? i + 1 : i + 2];

        const tMax = (i === fullSegments) ? partialSegment : 1.0;

        // Adjust step size for smoothness
        for (let t = 0.02; t <= tMax; t += 0.02) {
            const pt = getSplinePoint(t, p0, p1, p2, p3);

            // Add some artificial chaotic wiggle for effect between points
            // to exaggerate the "degree 15 polynomial" overfitting visually
            let wiggle = 0;
            if (t > 0.1 && t < 0.9) {
                wiggle = Math.sin(t * Math.PI * 4) * (15 * (1 - Math.abs(0.5 - t) * 2));
            }

            ctx.lineTo(pt.x, pt.y - wiggle);
        }
    }
    ctx.stroke();
}

// --- STREAMING_CHUNK:Main Rendering Loop... ---
function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    const type = steps[currentStep].type;
    const isMathStep = (type === 'equation' || type === 'matrix' || type === 'calculation');

    // Final step: draw all ghosted
    if (type === 'all') {
        drawFunction(linearCurve, 'rgba(239, 68, 68, 0.25)', 1, [8, 8]); // Red dashed
        ctx.globalAlpha = 0.25;
        drawOverfitSpline(1);
        ctx.globalAlpha = 1.0;
    }

    // Draw Linear
    if (type === 'linear' || type === 'all') {
        drawFunction(linearCurve, '#ef4444', type === 'all' ? 1 : animationProgress);
    }

    // Draw Polynomial (Ideal)
    if (type === 'quadratic' || isMathStep || type === 'all') {
        const color = isMathStep ? '#10b981' : '#10b981'; // emerald-500
        const prog = (type === 'all' || isMathStep) ? 1 : animationProgress;
        drawFunction(trueCurve, color, prog, [], isMathStep ? 5 : 4);

        // Add highlight glow during calculation steps
        if (isMathStep && prog === 1) {
            ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
            ctx.shadowBlur = 15;
            drawFunction(trueCurve, color, prog, [], 2);
            ctx.shadowColor = 'transparent';
        }
    }

    // Draw Overfit
    if (type === 'overfit') {
        drawOverfitSpline(animationProgress);
    }

    drawPoints();
}

function animateCanvas() {
    // Speed of the drawing line animation
    animationProgress += 0.025;
    if (animationProgress > 1) animationProgress = 1;

    renderCanvas();

    if (animationProgress < 1) {
        animationFrameId = requestAnimationFrame(animateCanvas);
    }
}

// Boot application
updateUI();