// --- DATA & STATE ---
const canvas = document.getElementById('lrCanvas');
const ctx = canvas.getContext('2d');

let currentStep = 0;

// Dataset (normalized coordinates 0-100 for easy plotting)
const dataPoints = [
    { x: 15, y: 20 }, { x: 25, y: 35 }, { x: 35, y: 30 },
    { x: 45, y: 50 }, { x: 55, y: 45 }, { x: 65, y: 65 },
    { x: 75, y: 60 }, { x: 85, y: 85 }, { x: 90, y: 80 }
];

// Lines (y = mx + b format)
// Bad line (initial guess)
const badLine = { m: 0.3, b: 40 };
// Better line (intermediate step)
const betterLine = { m: 0.6, b: 20 };
// Best fit line (calculated roughly for this dataset)
const bestFitLine = { m: 0.85, b: 5 };

// Prediction point
const predictionX = 80;
const predictionY = bestFitLine.m * predictionX + bestFitLine.b;

// Content for each step
const steps = [
    {
        title: "1. Meet the Data",
        desc: "Imagine we have data about houses. The horizontal X-axis represents the size of the house, and the vertical Y-axis is the price. Each blue dot represents a real house we have data for. Notice how larger houses generally cost more?"
    },
    {
        title: "2. The Initial Guess",
        desc: "We want to be able to predict prices for houses we don't have data for. To do this, we try to draw a straight line through the data. Let's draw a random line. As you can see, this gray line doesn't fit the dots very well."
    },
    {
        title: "3. Measuring the Errors",
        desc: "How does the computer know the line is bad? It measures the vertical distance from every real data point to our predicted line. These red dashed lines are called 'Residuals' or 'Errors'. Our goal is to make these red lines as short as possible!"
    },
    {
        title: "4. Learning (Adjusting the Line)",
        desc: "The 'Machine Learning' part happens here. Using an algorithm (like Gradient Descent), the computer slowly tilts and moves the line, constantly checking if the total length of the red error lines is getting smaller. It's getting closer!"
    },
    {
        title: "5. The Line of Best Fit",
        desc: "Finally, the algorithm finds the optimal position. This green line is the 'Line of Best Fit'. It minimizes the total squared errors. We now have a mathematical model that perfectly represents the general trend of our data!"
    },
    {
        title: "6. The Math: y = mx + b",
        desc: "This line is defined by the equation y = mx + b. 'm' is the slope (how steep the line is), and 'b' is the y-intercept (where it crosses the vertical axis). The algorithm's real job was just finding the perfect numbers for 'm' and 'b'!"
    },
    {
        title: "7. Making a Prediction!",
        desc: "Now for the magic! If a new house hits the market and its size is 80 (orange dot on the bottom), we just travel straight up to our green line, and look across to the Y-axis. We just predicted its price using Machine Learning!"
    }
];

// --- DRAWING HELPER FUNCTIONS ---

// Configuration for canvas padding
const padding = 50;
const plotWidth = canvas.width - padding * 2;
const plotHeight = canvas.height - padding * 2;

// Convert normalized data (0-100) to actual canvas pixel coordinates
function toCanvasX(x) { return padding + (x / 100) * plotWidth; }
function toCanvasY(y) { return canvas.height - padding - (y / 100) * plotHeight; }

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1'; // tailwind slate-300
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
        ctx.fillStyle = '#3b82f6'; // tailwind blue-500
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

    // Calculate start and end points of the line extending across the plot area
    const startX = 0;
    const startY = lineParams.m * startX + lineParams.b;
    const endX = 100;
    const endY = lineParams.m * endX + lineParams.b;

    ctx.moveTo(toCanvasX(startX), toCanvasY(startY));
    ctx.lineTo(toCanvasX(endX), toCanvasY(endY));
    ctx.stroke();
    ctx.setLineDash([]); // Reset
}

function drawErrors(lineParams) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444'; // tailwind red-500
    ctx.setLineDash([5, 5]);

    dataPoints.forEach(p => {
        const predictedY = lineParams.m * p.x + lineParams.b;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
        ctx.lineTo(toCanvasX(p.x), toCanvasY(predictedY));
        ctx.stroke();

        // Draw small dot on the line
        ctx.beginPath();
        ctx.arc(toCanvasX(p.x), toCanvasY(predictedY), 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
    });
    ctx.setLineDash([]); // Reset
}

function drawPrediction() {
    // Draw point on X axis
    ctx.beginPath();
    ctx.arc(toCanvasX(predictionX), toCanvasY(0), 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316'; // orange-500
    ctx.fill();

    // Animate or draw dashed line up to the green line
    ctx.beginPath();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(toCanvasX(predictionX), toCanvasY(0));
    ctx.lineTo(toCanvasX(predictionX), toCanvasY(predictionY));
    ctx.stroke();

    // Draw dashed line across to Y axis
    ctx.beginPath();
    ctx.moveTo(toCanvasX(predictionX), toCanvasY(predictionY));
    ctx.lineTo(toCanvasX(0), toCanvasY(predictionY));
    ctx.stroke();

    // Highlight intersection point
    ctx.beginPath();
    ctx.arc(toCanvasX(predictionX), toCanvasY(predictionY), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text tag for prediction
    ctx.fillStyle = '#f97316';
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Predicted Price", toCanvasX(0) + 10, toCanvasY(predictionY) - 10);

    ctx.setLineDash([]);
}

function drawEquationInfo() {
    // Highlight Y-intercept (b)
    const interceptX = 0;
    const interceptY = bestFitLine.b;

    ctx.beginPath();
    ctx.arc(toCanvasX(interceptX), toCanvasY(interceptY), 7, 0, Math.PI * 2);
    ctx.fillStyle = '#9333ea'; // purple-600
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#9333ea';
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("b (y-intercept)", toCanvasX(interceptX) + 12, toCanvasY(interceptY) - 5);

    // Highlight Slope (m = rise/run)
    const x1 = 40;
    const y1 = bestFitLine.m * x1 + bestFitLine.b;
    const x2 = 60;
    const y2 = bestFitLine.m * x2 + bestFitLine.b;

    // Draw triangle for slope
    ctx.beginPath();
    ctx.strokeStyle = '#eab308'; // yellow-500
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(y1)); // Run
    ctx.lineTo(toCanvasX(x2), toCanvasY(y2)); // Rise
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    ctx.fillStyle = '#d97706'; // darker yellow text
    ctx.fillText("Run", toCanvasX((x1 + x2) / 2) - 15, toCanvasY(y1) + 20);
    ctx.fillText("Rise", toCanvasX(x2) + 10, toCanvasY((y1 + y2) / 2) + 5);

    // Display Equation Text in the top left
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("y = mx + b", toCanvasX(10), toCanvasY(90));
}

// --- MAIN RENDER FUNCTION ---
function renderScene() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Base layer
    drawAxes();

    // Step specific logic
    if (currentStep >= 0) {
        drawPoints();
    }

    if (currentStep === 1) {
        drawLine(badLine, '#94a3b8'); // slate-400
    }
    else if (currentStep === 2) {
        drawLine(badLine, '#94a3b8');
        drawErrors(badLine);
        // Draw points again so they stay on top of the error lines
        drawPoints();
    }
    else if (currentStep === 3) {
        drawLine(betterLine, '#60a5fa'); // lighter blue
        drawErrors(betterLine);
        drawPoints();
    }
    else if (currentStep === 4) {
        drawLine(bestFitLine, '#22c55e', 4); // green-500
        drawPoints();
    }
    else if (currentStep === 5) {
        drawLine(bestFitLine, '#22c55e', 4);
        drawPoints();
        drawEquationInfo();
    }
    else if (currentStep === 6) {
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
    // Update Text content
    stepTitle.innerText = steps[currentStep].title;
    stepDesc.innerText = steps[currentStep].desc;
    stepIndicator.innerText = `Step ${currentStep + 1} of ${steps.length}`;

    // Update Buttons
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === steps.length - 1;

    if (currentStep === steps.length - 1) {
        btnNext.innerText = "Finish";
    } else {
        btnNext.innerHTML = "Next Step &rarr;";
    }

    // Update Dots
    Array.from(dotsContainer.children).forEach((dot, index) => {
        dot.className = `w-2.5 h-2.5 rounded-full transition-colors duration-300 ${index === currentStep ? 'bg-blue-600 w-5' : 'bg-slate-200'}`;
    });

    // Trigger canvas redraw
    renderScene();
}

// Event Listeners
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

// Initialize application
initDots();
updateUI();