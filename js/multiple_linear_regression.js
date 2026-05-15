// <!-- Application Logic -->
document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    let currentStep = 1;
    const totalSteps = 5;
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const stepCounter = document.getElementById('step-counter');

    // Container height management
    const stepContainer = document.getElementById('step-container');

    function updateNavigation() {
        // Determine heights for all sections, making them briefly visible but hidden
        let targetHeight = 0;

        // First loop: hide everything but the current step to calculate its natural height
        for (let i = 1; i <= totalSteps; i++) {
            const section = document.getElementById(`step-${i}`);
            if (i === currentStep) {
                section.classList.remove('opacity-0', 'pointer-events-none', 'z-0');
                section.classList.add('opacity-100', 'z-10');
                // Briefly make position relative to get true height
                section.classList.remove('absolute');
                targetHeight = section.offsetHeight;
                section.classList.add('absolute');
            } else {
                section.classList.remove('opacity-100', 'z-10');
                section.classList.add('opacity-0', 'pointer-events-none', 'z-0');
            }
        }

        // Animate container to new height
        stepContainer.style.height = `${targetHeight}px`;

        // Update Progress Bar
        for (let i = 1; i <= totalSteps; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) {
                if (i <= currentStep) {
                    dot.classList.remove('bg-slate-300');
                    dot.classList.add('bg-blue-600');
                } else {
                    dot.classList.remove('bg-blue-600');
                    dot.classList.add('bg-slate-300');
                }
            }

            const line = document.getElementById(`line-${i}`);
            if (line) {
                if (i < currentStep) {
                    line.style.width = '100%';
                } else {
                    line.style.width = '0%';
                }
            }
        }

        // Update Buttons
        btnPrev.disabled = currentStep === 1;
        btnNext.disabled = currentStep === totalSteps;
        stepCounter.innerText = `Step ${currentStep} of ${totalSteps}`;

        // Special handling for Plotly graph resize when it becomes visible
        if (currentStep === 3) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateNavigation();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateNavigation();
        }
    });

    // Adjust height on window resize
    window.addEventListener('resize', () => {
        const activeSection = document.getElementById(`step-${currentStep}`);
        if (activeSection) {
            activeSection.classList.remove('absolute');
            stepContainer.style.height = `${activeSection.offsetHeight}px`;
            activeSection.classList.add('absolute');
        }
    });

    // --- Multiple Linear Regression Logic ---
    // Define Model Parameters
    const b0 = 20; // Intercept
    const b1 = 5;  // Weight for Study
    const b2 = 3;  // Weight for Sleep

    // 1. Generate Dummy Data for Scatter Plot (Actual Students)
    const numPoints = 50;
    const x1_data = []; // Study
    const x2_data = []; // Sleep
    const y_data = [];  // Score

    for (let i = 0; i < numPoints; i++) {
        let study = Math.random() * 10;
        let sleep = Math.random() * 10;
        // Actual score = formula + random noise (-5 to +5)
        let noise = (Math.random() * 10) - 5;
        let score = b0 + (b1 * study) + (b2 * sleep) + noise;

        // Cap score at 100
        score = Math.min(100, Math.max(0, score));

        x1_data.push(study);
        x2_data.push(sleep);
        y_data.push(score);
    }

    // 2. Generate Data for Regression Plane
    const plane_x = [0, 10]; // Study range
    const plane_y = [0, 10]; // Sleep range
    const plane_z = [];      // Score values for the plane

    for (let i = 0; i < plane_y.length; i++) {
        let row = [];
        for (let j = 0; j < plane_x.length; j++) {
            let predicted_score = b0 + (b1 * plane_x[j]) + (b2 * plane_y[i]);
            row.push(predicted_score);
        }
        plane_z.push(row);
    }

    // UI Elements
    const studySlider = document.getElementById('study-slider');
    const sleepSlider = document.getElementById('sleep-slider');
    const studyVal = document.getElementById('study-val');
    const sleepVal = document.getElementById('sleep-val');

    // Math Display Elements
    const calcX1 = document.getElementById('calc-x1');
    const calcX2 = document.getElementById('calc-x2');
    const calcM1 = document.getElementById('calc-m1');
    const calcM2 = document.getElementById('calc-m2');
    const calcFinal = document.getElementById('calc-final');

    // Function to calculate and update UI and Graph
    function updatePrediction() {
        const x1 = parseFloat(studySlider.value);
        const x2 = parseFloat(sleepSlider.value);

        // Math Calculate
        const m1 = b1 * x1;
        const m2 = b2 * x2;
        let finalScore = b0 + m1 + m2;
        finalScore = Math.min(100, finalScore); // Cap at 100 for realism

        // Update text UI
        studyVal.innerText = `${x1} hrs`;
        sleepVal.innerText = `${x2} hrs`;
        calcX1.innerText = x1;
        calcX2.innerText = x2;
        calcM1.innerText = m1;
        calcM2.innerText = m2;
        calcFinal.innerText = finalScore.toFixed(1);

        // Re-render Graph with the highlighted predicted point
        renderGraph(x1, x2, finalScore);
    }

    // Function to render Plotly 3D Graph
    function renderGraph(pred_x1, pred_x2, pred_y) {
        // Trace 1: The scatter points (Actual data)
        const trace_scatter = {
            x: x1_data,
            y: x2_data,
            z: y_data,
            mode: 'markers',
            marker: {
                size: 4,
                color: '#60a5fa', // Lighter blue (Tailwind blue-400)
                opacity: 0.8
            },
            type: 'scatter3d',
            name: 'Student Data'
        };

        // Trace 2: The regression plane
        const trace_plane = {
            x: plane_x,
            y: plane_y,
            z: plane_z,
            type: 'surface',
            opacity: 0.7,
            // Custom light blue colorscale so the top of the plane doesn't turn dark navy
            colorscale: [[0, '#eff6ff'], [0.5, '#bfdbfe'], [1, '#60a5fa']],
            showscale: false,
            name: 'Regression Plane'
        };

        // Trace 3: The dynamic prediction point
        const trace_pred = {
            x: [pred_x1],
            y: [pred_x2],
            z: [pred_y],
            mode: 'markers',
            marker: {
                size: 8,
                color: '#ef4444', // Red
                symbol: 'circle'
            },
            type: 'scatter3d',
            name: 'Current Prediction'
        };

        const layout = {
            uirevision: 'true', // Prevents the camera zoom/rotation from resetting when sliders move
            margin: { l: 0, r: 0, b: 0, t: 20 },
            paper_bgcolor: 'transparent',
            scene: {
                xaxis: { title: 'Study (hrs)', range: [0, 10] },
                yaxis: { title: 'Sleep (hrs)', range: [0, 10] },
                zaxis: { title: 'Exam Score', range: [0, 100] },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.2 } // Angle camera nicely
                }
            },
            showlegend: false
        };

        const config = { responsive: true, displayModeBar: false };

        Plotly.react('plotly-graph', [trace_plane, trace_scatter, trace_pred], layout, config);
    }

    // Event Listeners for sliders
    studySlider.addEventListener('input', updatePrediction);
    sleepSlider.addEventListener('input', updatePrediction);

    // Initial render
    updatePrediction();

    // Add a small delay for the initial layout calculation to settle
    setTimeout(updateNavigation, 100);
});