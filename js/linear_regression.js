// --- DATA & STATE ---
const canvas = document.getElementById('lrCanvas');
const ctx = canvas.getContext('2d');
const latexOverlay = document.getElementById('latexOverlay');
const axisLabels = document.getElementById('axisLabels');

let currentStep = 0;

// Dataset (Student Theme: Hours vs Score)
const dataPoints = [
    { x: 15, y: 20 }, { x: 25, y: 35 }, { x: 35, y: 30 },
    { x: 45, y: 50 }, { x: 55, y: 45 }, { x: 65, y: 65 },
    { x: 75, y: 60 }, { x: 85, y: 85 }, { x: 90, y: 80 }
];

// --- REAL MATH CALCULATION ---
// Calculate exact Linear Regression using the (x - x_bar) method
function calculateRegression(points) {
    const n = points.length;
    let sumX = 0, sumY = 0;

    // First pass: find the means
    points.forEach(p => {
        sumX += p.x;
        sumY += p.y;
    });
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Second pass: calculate the components of the conceptual slope formula
    let sumNumerator = 0;   // Sum of (x - x_bar)(y - y_bar)
    let sumDenominator = 0; // Sum of (x - x_bar)^2

    points.forEach(p => {
        const xDiff = p.x - meanX;
        const yDiff = p.y - meanY;
        sumNumerator += xDiff * yDiff;
        sumDenominator += xDiff * xDiff;
    });

    // Least Squares Formula (Conceptual Form)
    const m = sumNumerator / sumDenominator;
    const b = meanY - m * meanX;

    return {
        m, b,
        sumNumerator, sumDenominator,
        n, meanX, meanY, sumX, sumY
    };
}

const stats = calculateRegression(dataPoints);

// Lines (y = mx + b format)
const badLine = { m: 0.3, b: 40 };
const betterLine = { m: 0.6, b: 20 };
// Now using the EXACT calculated line!
const bestFitLine = { m: stats.m, b: stats.b };

// Prediction point for a student studying 80 hours
const predictionX = 80;
const predictionY = bestFitLine.m * predictionX + bestFitLine.b;

// Content for each step
const steps = [
    {
        title: "1. Meet the Data",
        desc: "Imagine we are looking at student data. The horizontal X-axis represents 'Hours Studied', and the vertical Y-axis is their 'Exam Score'. Each blue dot is a real student. Notice how studying more generally leads to higher scores?"
    },
    {
        title: "2. The Initial Guess",
        desc: "We want to predict scores for future students based on their study time. Let's try drawing a random line to guess the trend. As you can see, this gray line doesn't fit the students' actual scores very well."
    },
    {
        title: "3. Measuring the Errors",
        desc: "How do we know the line is bad? We measure the vertical distance from every student's real score to our predicted line. These red dashed lines are 'Errors'. Our goal is to make these errors as small as possible!"
    },
    {
        title: "4. Learning (Adjusting)",
        desc: "The 'Machine Learning' part! Using an algorithm, the computer slowly adjusts the line, constantly checking if the total length of the red error lines is shrinking. It is learning the relationship between study time and scores!"
    },
    {
        title: "5. The Line of Best Fit",
        desc: "The algorithm finds the optimal position. This green line is the 'Line of Best Fit'. It minimizes the errors and gives us a mathematical model that perfectly represents the general trend of our student data."
    },
    {
        title: "6. The Math: y = mx + b",
        desc: "This line is defined by the equation y = mx + b. 'm' is the slope (how much the score increases per hour studied), and 'b' is the base score (expected score with 0 hours). The algorithm just found the perfect numbers for 'm' and 'b'!"
    },
    {
        title: "7. Spotting 'x' and 'y'",
        desc: "Before we use the complex formulas, where do the letters come from? 'x' and 'y' just represent the data of any single student. For example, let's look at this highlighted student: their hours studied is their 'x' (45), and their score is their 'y' (50)."
    },
    {
        title: "8. The Averages: x̄ and ȳ",
        desc: "The formulas also use 'x-bar' (x̄) and 'y-bar' (ȳ). These are simply the average of ALL 'x' values and ALL 'y' values. A magical mathematical rule is that the Line of Best Fit ALWAYS passes exactly through this average center point!"
    },
    {
        title: "9. Making a Prediction!",
        desc: "Now for the magic! If a new student studies for 80 hours (orange dot), we travel straight up to our green line, and look across to the Y-axis. We just predicted their exam score visually using Machine Learning!"
    },
    {
        title: "10. The Formulas in Action",
        desc: `Let's apply the math! The formulas use all those x, y, x̄, and ȳ values to calculate the perfect slope and intercept. If a student studies 80 hours: Score = (${stats.m.toFixed(2)} × 80) + ${stats.b.toFixed(2)} = ${predictionY.toFixed(1)}.`
    }
];

// --- DRAWING HELPER FUNCTIONS ---
const padding = 50;
const plotWidth = canvas.width - padding * 2;
const plotHeight = canvas.height - padding * 2;

function toCanvasX(x) { return padding + (x / 100) * plotWidth; }
function toCanvasY(y) { return canvas.height - padding - (y / 100) * plotHeight; }

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;

    // Y-axis
    ctx.moveTo(padding, padding / 2);
    ctx.lineTo(padding, canvas.height - padding);

    // X-axis
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding / 2, canvas.height - padding);
    ctx.stroke();

    // Arrow heads
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(padding, padding / 2);
    ctx.lineTo(padding - 5, padding / 2 + 10);
    ctx.lineTo(padding + 5, padding / 2 + 10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width - padding / 2, canvas.height - padding);
    ctx.lineTo(canvas.width - padding / 2 - 10, canvas.height - padding - 5);
    ctx.lineTo(canvas.width - padding / 2 - 10, canvas.height - padding + 5);
    ctx.fill();
}

function drawPoints() {
    dataPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(toCanvasX(p.x), toCanvasY(p.y), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6'; // blue-500
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawLine(lineParams, color, width = 3, dashed = false) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed) ctx.setLineDash([10, 10]);
    else ctx.setLineDash([]);

    const startX = 0;
    const startY = lineParams.m * startX + lineParams.b;
    const endX = 100;
    const endY = lineParams.m * endX + lineParams.b;

    ctx.moveTo(toCanvasX(startX), toCanvasY(startY));
    ctx.lineTo(toCanvasX(endX), toCanvasY(endY));
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawErrors(lineParams) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.setLineDash([5, 5]);

    dataPoints.forEach(p => {
        const predictedY = lineParams.m * p.x + lineParams.b;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
        ctx.lineTo(toCanvasX(p.x), toCanvasY(predictedY));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(toCanvasX(p.x), toCanvasY(predictedY), 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
    });
    ctx.setLineDash([]);
}

function drawSinglePointXY() {
    const p = dataPoints[3]; // Selecting point { x: 45, y: 50 }

    // Highlight the dot
    ctx.beginPath();
    ctx.arc(toCanvasX(p.x), toCanvasY(p.y), 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw dashed lines to the axes
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Line down to X axis
    ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
    ctx.lineTo(toCanvasX(p.x), toCanvasY(0));

    // Line left to Y axis
    ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
    ctx.lineTo(toCanvasX(0), toCanvasY(p.y));
    ctx.stroke();
    ctx.setLineDash([]);

    // Add text labels
    ctx.fillStyle = '#d97706';
    ctx.font = "bold 16px sans-serif";
    // Label on X axis
    ctx.fillText(`x = ${p.x}`, toCanvasX(p.x) + 10, toCanvasY(5));
    // Label on Y axis
    ctx.fillText(`y = ${p.y}`, toCanvasX(5), toCanvasY(p.y) - 10);
}

function drawAverages() {
    // Calculate the actual means from the data
    const meanX = dataPoints.reduce((sum, p) => sum + p.x, 0) / dataPoints.length;
    const meanY = dataPoints.reduce((sum, p) => sum + p.y, 0) / dataPoints.length;

    // Draw crosshairs spanning the graph
    ctx.beginPath();
    ctx.strokeStyle = '#ec4899'; // pink-500
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    // Vertical line for mean X
    ctx.moveTo(toCanvasX(meanX), toCanvasY(0));
    ctx.lineTo(toCanvasX(meanX), toCanvasY(100));

    // Horizontal line for mean Y
    ctx.moveTo(toCanvasX(0), toCanvasY(meanY));
    ctx.lineTo(toCanvasX(100), toCanvasY(meanY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the center intersection point
    ctx.beginPath();
    ctx.arc(toCanvasX(meanX), toCanvasY(meanY), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add text labels for the means
    ctx.fillStyle = '#be185d';
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`x̄ ≈ ${meanX.toFixed(1)}`, toCanvasX(meanX) + 10, toCanvasY(5));
    ctx.fillText(`ȳ ≈ ${meanY.toFixed(1)}`, toCanvasX(5), toCanvasY(meanY) - 10);

    // Annotation box
    ctx.fillStyle = '#fce7f3'; // pink-100
    ctx.fillRect(toCanvasX(meanX) + 15, toCanvasY(meanY) + 15, 230, 30);
    ctx.fillStyle = '#be185d';
    ctx.font = "italic 14px sans-serif";
    ctx.fillText("Line perfectly crosses (x̄, ȳ) !", toCanvasX(meanX) + 25, toCanvasY(meanY) + 35);
}

function drawPrediction() {
    ctx.beginPath();
    ctx.arc(toCanvasX(predictionX), toCanvasY(0), 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316'; // orange-500
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(toCanvasX(predictionX), toCanvasY(0));
    ctx.lineTo(toCanvasX(predictionX), toCanvasY(predictionY));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(predictionX), toCanvasY(predictionY));
    ctx.lineTo(toCanvasX(0), toCanvasY(predictionY));
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(toCanvasX(predictionX), toCanvasY(predictionY), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Predicted Score", toCanvasX(0) + 10, toCanvasY(predictionY) - 10);
    ctx.setLineDash([]);
}

function drawEquationInfo() {
    const interceptX = 0;
    const interceptY = bestFitLine.b;

    ctx.beginPath();
    ctx.arc(toCanvasX(interceptX), toCanvasY(interceptY), 7, 0, Math.PI * 2);
    ctx.fillStyle = '#9333ea';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#9333ea';
    ctx.font = "bold 15px sans-serif";
    // Show the exact dynamic 'b' value on the chart
    ctx.fillText(`b ≈ ${bestFitLine.b.toFixed(1)}`, toCanvasX(interceptX) + 12, toCanvasY(interceptY) - 5);

    const x1 = 40;
    const y1 = bestFitLine.m * x1 + bestFitLine.b;
    const x2 = 60;
    const y2 = bestFitLine.m * x2 + bestFitLine.b;

    ctx.beginPath();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(y1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#d97706';
    ctx.fillText("Run (Hours)", toCanvasX((x1 + x2) / 2) - 30, toCanvasY(y1) + 20);
    ctx.fillText("Rise (Score)", toCanvasX(x2) + 10, toCanvasY((y1 + y2) / 2) + 5);

    ctx.fillStyle = '#1e293b';
    ctx.font = "bold 26px sans-serif";
    // Show the exact dynamic equation on the chart
    ctx.fillText(`y = ${bestFitLine.m.toFixed(2)}x + ${bestFitLine.b.toFixed(2)}`, toCanvasX(10), toCanvasY(90));
}

function renderLatex() {
    if (typeof katex === 'undefined') return;

    const mStr = stats.m.toFixed(2);
    const bStr = stats.b.toFixed(2);
    const predYStr = predictionY.toFixed(1);

    // Render standard regression equations
    katex.render("\\text{Prediction Line: } \\hat{y} = mx + b", document.getElementById('mathPrediction'), { throwOnError: false, displayMode: true });

    // Render Averages (Means)
    const meansLatex = `\\begin{aligned}
    \\text{Mean of } x \\; (\\bar{x}) &= \\frac{\\sum x_i}{n} = \\frac{${stats.sumX}}{${stats.n}} = ${stats.meanX.toFixed(2)} \\\\
    \\text{Mean of } y \\; (\\bar{y}) &= \\frac{\\sum y_i}{n} = \\frac{${stats.sumY}}{${stats.n}} = ${stats.meanY.toFixed(2)}
\\end{aligned}`;
    katex.render(meansLatex, document.getElementById('mathMeans'), { throwOnError: false, displayMode: true });

    // Slope Formula matches the user's uploaded image exactly
    const slopeLatex = `\\begin{aligned}
    \\text{Slope } (m) &= \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2} \\\\
    &= \\frac{${stats.sumNumerator.toFixed(2)}}{${stats.sumDenominator.toFixed(2)}} \\approx ${mStr}
\\end{aligned}`;
    katex.render(slopeLatex, document.getElementById('mathSlope'), { throwOnError: false, displayMode: true });

    const interceptLatex = `\\begin{aligned}
    \\text{Intercept } (b) &= \\bar{y} - m\\bar{x} \\\\
    &= ${stats.meanY.toFixed(2)} - (${mStr} \\times ${stats.meanX.toFixed(2)}) \\approx ${bStr}
\\end{aligned}`;
    katex.render(interceptLatex, document.getElementById('mathIntercept'), { throwOnError: false, displayMode: true });

    // Render example substitutions mapping our data to the formula
    katex.render("\\text{Given a student studies } x = 80 \\text{ hours:}", document.getElementById('mathEx1'), { throwOnError: false, displayMode: true });
    katex.render(`\\hat{y} = (${mStr} \\times 80) + ${bStr}`, document.getElementById('mathEx2'), { throwOnError: false, displayMode: true });
    katex.render(`\\hat{y} \\approx ${predYStr} \\% \\text{ (Predicted Score)}`, document.getElementById('mathEx3'), { throwOnError: false, displayMode: true });
}

// --- MAIN RENDER FUNCTION ---
function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Step 10 (Index 9): Show LaTeX overlay, hiding canvas visuals and axis labels
    if (currentStep === 9) {
        canvas.classList.add('hidden');
        axisLabels.classList.add('opacity-0');
        latexOverlay.classList.remove('hidden');
        latexOverlay.classList.add('flex');
        renderLatex();
        return;
    } else {
        canvas.classList.remove('hidden');
        axisLabels.classList.remove('opacity-0');
        latexOverlay.classList.add('hidden');
        latexOverlay.classList.remove('flex');
    }

    drawAxes();
    if (currentStep >= 0) drawPoints();

    if (currentStep === 1) {
        drawLine(badLine, '#94a3b8');
    }
    else if (currentStep === 2) {
        drawLine(badLine, '#94a3b8');
        drawErrors(badLine);
        drawPoints();
    }
    else if (currentStep === 3) {
        drawLine(betterLine, '#60a5fa');
        drawErrors(betterLine);
        drawPoints();
    }
    else if (currentStep === 4) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawPoints();
    }
    else if (currentStep === 5) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawPoints();
        drawEquationInfo();
    }
    else if (currentStep === 6) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawSinglePointXY();
        drawPoints();
    }
    else if (currentStep === 7) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawPoints();
        drawAverages();
    }
    else if (currentStep === 8) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawPoints();
        drawPrediction();
    }
}

// --- UI & NAVIGATION LOGIC ---
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const stepTitle = document.getElementById('stepTitle');
const stepDesc = document.getElementById('stepDescription');
const stepIndicator = document.getElementById('stepIndicator');
const dotsContainer = document.getElementById('progressDots');

function initDots() {
    dotsContainer.innerHTML = '';
    steps.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `w-2.5 h-2.5 rounded-full transition-colors duration-300 ${index === currentStep ? 'bg-blue-600' : 'bg-slate-200'}`;
        dotsContainer.appendChild(dot);
    });
}

function updateUI() {
    stepTitle.innerText = steps[currentStep].title;
    stepDesc.innerText = steps[currentStep].desc;
    stepIndicator.innerText = `Step ${currentStep + 1} of ${steps.length}`;

    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === steps.length - 1;

    if (currentStep === steps.length - 1) {
        btnNext.innerText = "Finish";
    } else {
        btnNext.innerHTML = "Next Step &rarr;";
    }

    Array.from(dotsContainer.children).forEach((dot, index) => {
        dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentStep ? 'bg-blue-600 w-5' : 'bg-slate-200'}`;
    });

    renderScene();
}

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

// Initialize application on load
initDots();
updateUI();