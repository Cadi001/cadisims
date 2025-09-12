// Cryptographically secure random number generator utility
function secureRandom() {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
}

function secureRandomFloat(min, max) {
    return secureRandom() * (max - min) + min;
}

class MolecularDynamicsSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.maxSteps = 1000;
        this.animationSpeed = 50;
        this.currentScenario = 'drug-protein';
        this.animationId = null;
        
        // System properties
        this.temperature = 300; // Kelvin
        this.pressure = 1.0; // atm
        this.timeStep = 1.0; // femtoseconds
        
        // Molecular data
        this.molecules = [];
        this.bonds = [];
        this.energy = 0;
        this.bindingAffinity = 0;
        
        this.bindEvents();
        this.initializeScenario();
        this.updateScenarioExplanation();
    }

    bindEvents() {
        $('#startBtn').click(() => this.startSimulation());
        $('#pauseBtn').click(() => this.pauseSimulation());
        $('#resetBtn').click(() => this.resetSimulation());
        
        $('#temperature').on('input', (e) => {
            this.temperature = parseInt(e.target.value);
            $('#temperatureValue').text(this.temperature + 'K');
            this.updateSystemProperties();
        });
        
        $('#pressure').on('input', (e) => {
            this.pressure = parseFloat(e.target.value);
            $('#pressureValue').text(this.pressure.toFixed(1) + ' atm');
            this.updateSystemProperties();
        });
        
        $('#timeStep').on('input', (e) => {
            this.timeStep = parseFloat(e.target.value);
            $('#timeStepValue').text(this.timeStep.toFixed(1) + ' fs');
        });
        
        $('#scenarioSelect').change((e) => {
            this.currentScenario = e.target.value;
            this.resetSimulation();
            this.initializeScenario();
            this.updateScenarioExplanation();
        });
        
        $(window).resize(() => this.initializeScenario());
    }

    updateScenarioExplanation() {
        const explanations = {
            'drug-protein': {
                description: 'We simulate how drug molecules bind to protein targets to understand effectiveness and side effects.',
                why: 'Used in: Pharmaceutical research, drug discovery, personalized medicine. When designing new drugs or understanding how existing ones work.',
                realWorld: '💊 Pfizer uses this for COVID vaccine development, cancer drug research, and reducing side effects!'
            },
            'water-boiling': {
                description: 'We study how water molecules behave when heated, showing the transition from liquid to gas phase.',
                why: 'Used in: Power plant design, cooking equipment, industrial heating systems. When optimizing heat transfer and energy efficiency.',
                realWorld: '🏭 Power plants use this to design better steam turbines, food companies optimize cooking processes!'
            },
            'polymer-strength': {
                description: 'We analyze how polymer chains stretch and break under stress to predict material strength and flexibility.',
                why: 'Used in: Plastic manufacturing, tire design, medical implants. When developing stronger, lighter materials.',
                realWorld: '🚗 Car manufacturers design better tires and bumpers, medical companies create stronger surgical implants!'
            },
            'membrane-transport': {
                description: 'We observe how molecules pass through cell membranes, crucial for drug delivery and biological processes.',
                why: 'Used in: Drug delivery systems, disease treatment, biotechnology. When understanding how substances enter cells.',
                realWorld: '🧬 Companies design better insulin delivery, cancer treatments that target specific cells!'
            },
            'catalyst-reaction': {
                description: 'We study how catalysts speed up chemical reactions by providing alternative reaction pathways.',
                why: 'Used in: Chemical manufacturing, environmental cleanup, fuel production. When making industrial processes more efficient.',
                realWorld: '🏭 Oil refineries optimize fuel production, environmental companies design better pollution cleanup systems!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(79, 172, 254, 0.1); border-left: 3px solid #4facfe; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        this.molecules = [];
        this.bonds = [];
        this.currentStep = 0;
        this.energy = 0;
        this.bindingAffinity = 0;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const width = canvasRect.width - 40;
        const height = canvasRect.height - 40;
        
        switch(this.currentScenario) {
            case 'drug-protein':
                this.initDrugProtein(width, height);
                break;
            case 'water-boiling':
                this.initWaterBoiling(width, height);
                break;
            case 'polymer-strength':
                this.initPolymerStrength(width, height);
                break;
            case 'membrane-transport':
                this.initMembraneTransport(width, height);
                break;
            case 'catalyst-reaction':
                this.initCatalystReaction(width, height);
                break;
        }
        
        this.setupScenarioParameters();
        this.updateStats();
        this.draw();
    }

    initDrugProtein(width, height) {
        $('#affinityLabel').text('Binding Affinity');
        
        // Create protein (large structure)
        const proteinCenter = {x: width * 0.3, y: height * 0.5};
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const radius = 60 + secureRandom() * 20;
            this.molecules.push({
                id: `protein_${i}`,
                type: 'protein',
                atomType: 'c',
                x: proteinCenter.x + Math.cos(angle) * radius,
                y: proteinCenter.y + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                size: 8,
                mass: 12,
                fixed: true
            });
        }
        
        // Create drug molecules
        for (let i = 0; i < 8; i++) {
            this.molecules.push({
                id: `drug_${i}`,
                type: 'drug',
                atomType: ['n', 'o', 'c'][Math.floor(secureRandom() * 3)],
                x: width * 0.7 + (secureRandom() - 0.5) * 100,
                y: height * 0.5 + (secureRandom() - 0.5) * 100,
                vx: (secureRandom() - 0.5) * 2,
                vy: (secureRandom() - 0.5) * 2,
                size: 6,
                mass: 8,
                fixed: false
            });
        }
    }

    initWaterBoiling(width, height) {
        $('#affinityLabel').text('Vapor Phase %');
        
        // Create water molecules in liquid formation
        const rows = 8;
        const cols = 12;
        const spacing = 25;
        const startX = (width - cols * spacing) / 2;
        const startY = (height - rows * spacing) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Oxygen atom
                this.molecules.push({
                    id: `water_${row}_${col}_o`,
                    type: 'water',
                    atomType: 'o',
                    x: startX + col * spacing + (secureRandom() - 0.5) * 8,
                    y: startY + row * spacing + (secureRandom() - 0.5) * 8,
                    vx: (secureRandom() - 0.5) * 0.5,
                    vy: (secureRandom() - 0.5) * 0.5,
                    size: 7,
                    mass: 16,
                    fixed: false
                });
                
                // Hydrogen atoms
                for (let h = 0; h < 2; h++) {
                    this.molecules.push({
                        id: `water_${row}_${col}_h${h}`,
                        type: 'water',
                        atomType: 'h',
                        x: startX + col * spacing + (secureRandom() - 0.5) * 12,
                        y: startY + row * spacing + (secureRandom() - 0.5) * 12,
                        vx: (secureRandom() - 0.5) * 0.8,
                        vy: (secureRandom() - 0.5) * 0.8,
                        size: 4,
                        mass: 1,
                        fixed: false
                    });
                }
            }
        }
    }

    initPolymerStrength(width, height) {
        $('#affinityLabel').text('Stretch %');
        
        // Create polymer chain
        const chainLength = 20;
        const bondLength = 20;
        const startX = 50;
        const centerY = height / 2;
        
        for (let i = 0; i < chainLength; i++) {
            this.molecules.push({
                id: `polymer_${i}`,
                type: 'polymer',
                atomType: 'c',
                x: startX + i * bondLength,
                y: centerY + Math.sin(i * 0.3) * 10,
                vx: 0,
                vy: 0,
                size: 6,
                mass: 12,
                fixed: i === 0 || i === chainLength - 1 // Fix ends
            });
            
            // Create bonds between adjacent atoms
            if (i > 0) {
                this.bonds.push({
                    atom1: i - 1,
                    atom2: i,
                    restLength: bondLength,
                    strength: 1.0
                });
            }
        }
    }

    initMembraneTransport(width, height) {
        $('#affinityLabel').text('Transport Rate');
        
        // Create membrane
        const membraneY = height / 2;
        for (let i = 0; i < width; i += 8) {
            this.molecules.push({
                id: `membrane_${i}`,
                type: 'membrane',
                atomType: 'c',
                x: i,
                y: membraneY,
                vx: 0,
                vy: 0,
                size: 5,
                mass: 20,
                fixed: true
            });
        }
        
        // Create molecules to transport
        for (let i = 0; i < 12; i++) {
            this.molecules.push({
                id: `transport_${i}`,
                type: 'transport',
                atomType: i < 6 ? 'n' : 'o',
                x: secureRandom() * width,
                y: i < 6 ? height * 0.25 : height * 0.75,
                vx: (secureRandom() - 0.5) * 1,
                vy: (secureRandom() - 0.5) * 0.5,
                size: 5,
                mass: 10,
                fixed: false
            });
        }
    }

    initCatalystReaction(width, height) {
        $('#affinityLabel').text('Reaction Rate');
        
        // Create catalyst surface
        const catalystY = height * 0.7;
        for (let i = 0; i < width; i += 15) {
            this.molecules.push({
                id: `catalyst_${i}`,
                type: 'catalyst',
                atomType: 'c',
                x: i,
                y: catalystY,
                vx: 0,
                vy: 0,
                size: 7,
                mass: 15,
                fixed: true
            });
        }
        
        // Create reactant molecules
        for (let i = 0; i < 16; i++) {
            this.molecules.push({
                id: `reactant_${i}`,
                type: 'reactant',
                atomType: i % 2 === 0 ? 'n' : 'o',
                x: secureRandom() * width,
                y: secureRandom() * height * 0.6,
                vx: (secureRandom() - 0.5) * 2,
                vy: (secureRandom() - 0.5) * 2,
                size: 5,
                mass: 8,
                fixed: false
            });
        }
    }

    setupScenarioParameters() {
        const scenarioParams = {
            'drug-protein': `
                <div class="mb-3">
                    <label class="form-label">Drug Concentration: <span id="drugConcValue">1.0 μM</span></label>
                    <input type="range" class="form-range" id="drugConcSlider" min="0.1" max="5.0" value="1.0" step="0.1">
                    <small class="text-muted">💊 Higher concentration = more drug molecules</small>
                </div>
            `,
            'water-boiling': `
                <div class="mb-3">
                    <label class="form-label">Heat Source: <span id="heatValue">Medium</span></label>
                    <select class="form-select" id="heatSelect">
                        <option value="low">Low Heat</option>
                        <option value="medium" selected>Medium Heat</option>
                        <option value="high">High Heat</option>
                    </select>
                    <small class="text-muted">🔥 Controls evaporation rate</small>
                </div>
            `,
            'polymer-strength': `
                <div class="mb-3">
                    <label class="form-label">Applied Force: <span id="forceValue">0 N</span></label>
                    <input type="range" class="form-range" id="forceSlider" min="0" max="10" value="0" step="1">
                    <small class="text-muted">💪 Stretching force on polymer</small>
                </div>
            `,
            'membrane-transport': `
                <div class="mb-3">
                    <label class="form-label">Membrane Permeability: <span id="permValue">Medium</span></label>
                    <select class="form-select" id="permSelect">
                        <option value="low">Low Permeability</option>
                        <option value="medium" selected>Medium Permeability</option>
                        <option value="high">High Permeability</option>
                    </select>
                    <small class="text-muted">🚪 How easily molecules pass through</small>
                </div>
            `,
            'catalyst-reaction': `
                <div class="mb-3">
                    <label class="form-label">Catalyst Activity: <span id="activityValue">100%</span></label>
                    <input type="range" class="form-range" id="activitySlider" min="0" max="200" value="100" step="10">
                    <small class="text-muted">⚡ Catalyst effectiveness</small>
                </div>
            `
        };
        
        $('#scenarioSpecificParams').html(scenarioParams[this.currentScenario]);
        
        // Bind scenario-specific events
        this.bindScenarioEvents();
    }

    bindScenarioEvents() {
        // Add event listeners for scenario-specific parameters
        $('#drugConcSlider, #forceSlider, #activitySlider').on('input', (e) => {
            const value = parseFloat(e.target.value);
            const id = e.target.id;
            if (id === 'drugConcSlider') $('#drugConcValue').text(value.toFixed(1) + ' μM');
            if (id === 'forceSlider') $('#forceValue').text(value + ' N');
            if (id === 'activitySlider') $('#activityValue').text(value + '%');
        });
        
        $('#heatSelect, #permSelect').on('change', (e) => {
            const value = e.target.value;
            const id = e.target.id;
            if (id === 'heatSelect') $('#heatValue').text(value.charAt(0).toUpperCase() + value.slice(1) + ' Heat');
            if (id === 'permSelect') $('#permValue').text(value.charAt(0).toUpperCase() + value.slice(1) + ' Permeability');
        });
    }

    updateSystemProperties() {
        // Temperature affects molecular velocity
        const tempFactor = this.temperature / 300;
        this.molecules.forEach(mol => {
            if (!mol.fixed) {
                mol.vx *= tempFactor * 0.1;
                mol.vy *= tempFactor * 0.1;
            }
        });
    }

    startSimulation() {
        if (this.isPaused) {
            this.isPaused = false;
        } else {
            this.resetSimulation();
        }
        
        this.isRunning = true;
        $('#startBtn').prop('disabled', true);
        $('#pauseBtn').prop('disabled', false);
        $('#progressText').text('Simulation running...');
        
        this.runSimulation();
    }

    pauseSimulation() {
        this.isPaused = true;
        this.isRunning = false;
        $('#startBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        $('#progressText').text('Simulation paused...');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resetSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        
        $('#startBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        $('#progressBar').css('width', '0%');
        $('#progressText').text('Ready to start simulation...');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.initializeScenario();
    }

    runSimulation() {
        if (!this.isRunning || this.isPaused) return;
        
        this.performStep();
        this.currentStep++;
        
        this.updateStats();
        this.draw();
        this.updateProgress();
        
        if (this.currentStep >= this.maxSteps) {
            this.completeSimulation();
        } else {
            this.animationId = requestAnimationFrame(() => {
                setTimeout(() => this.runSimulation(), 101 - this.animationSpeed);
            });
        }
    }

    performStep() {
        // Update molecular positions and velocities
        this.molecules.forEach(mol => {
            if (!mol.fixed) {
                // Apply forces and update positions
                mol.x += mol.vx * this.timeStep;
                mol.y += mol.vy * this.timeStep;
                
                // Boundary conditions
                const canvasRect = this.canvas.getBoundingClientRect();
                if (mol.x < mol.size) {
                    mol.x = mol.size;
                    mol.vx *= -0.8;
                }
                if (mol.x > canvasRect.width - mol.size) {
                    mol.x = canvasRect.width - mol.size;
                    mol.vx *= -0.8;
                }
                if (mol.y < mol.size) {
                    mol.y = mol.size;
                    mol.vy *= -0.8;
                }
                if (mol.y > canvasRect.height - mol.size) {
                    mol.y = canvasRect.height - mol.size;
                    mol.vy *= -0.8;
                }
                
                // Add some damping
                mol.vx *= 0.995;
                mol.vy *= 0.995;
            }
        });
        
        // Calculate scenario-specific properties
        this.calculateEnergy();
        this.calculateBindingAffinity();
    }

    calculateEnergy() {
        let totalEnergy = 0;
        this.molecules.forEach(mol => {
            totalEnergy += 0.5 * mol.mass * (mol.vx * mol.vx + mol.vy * mol.vy);
        });
        this.energy = totalEnergy;
    }

    calculateBindingAffinity() {
        switch(this.currentScenario) {
            case 'drug-protein':
                // Calculate how close drug molecules are to protein
                let boundCount = 0;
                const proteinMolecules = this.molecules.filter(m => m.type === 'protein');
                const drugMolecules = this.molecules.filter(m => m.type === 'drug');
                
                drugMolecules.forEach(drug => {
                    proteinMolecules.forEach(protein => {
                        const dist = Math.sqrt((drug.x - protein.x) ** 2 + (drug.y - protein.y) ** 2);
                        if (dist < 30) boundCount++;
                    });
                });
                this.bindingAffinity = (boundCount / (drugMolecules.length * proteinMolecules.length)) * 100;
                break;
                
            case 'water-boiling':
                // Calculate vapor phase percentage based on molecular speed
                const fastMolecules = this.molecules.filter(m => 
                    m.type === 'water' && Math.sqrt(m.vx * m.vx + m.vy * m.vy) > 2
                ).length;
                this.bindingAffinity = (fastMolecules / this.molecules.filter(m => m.type === 'water').length) * 100;
                break;
                
            case 'polymer-strength':
                // Calculate stretch percentage
                if (this.molecules.length > 1) {
                    const firstMol = this.molecules[0];
                    const lastMol = this.molecules[this.molecules.filter(m => m.type === 'polymer').length - 1];
                    const currentLength = Math.sqrt((lastMol.x - firstMol.x) ** 2 + (lastMol.y - firstMol.y) ** 2);
                    const originalLength = 20 * (this.molecules.filter(m => m.type === 'polymer').length - 1);
                    this.bindingAffinity = ((currentLength - originalLength) / originalLength) * 100;
                }
                break;
                
            default:
                this.bindingAffinity = Math.min(100, this.currentStep / 5);
        }
    }

    updateStats() {
        $('#currentEnergy').text(Math.round(this.energy));
        $('#systemTemp').text(Math.round(this.temperature * (1 + this.energy / 10000)) + 'K');
        $('#bindingAffinity').text(Math.round(this.bindingAffinity) + '%');
    }

    updateProgress() {
        const progress = (this.currentStep / this.maxSteps) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Step: ${this.currentStep} / ${this.maxSteps} (${this.timeStep} fs/step)`);
    }

    draw() {
        const canvas = $('#simulationCanvas');
        canvas.empty();
        
        // Draw bonds first
        this.bonds.forEach(bond => {
            const atom1 = this.molecules[bond.atom1];
            const atom2 = this.molecules[bond.atom2];
            if (atom1 && atom2) {
                const length = Math.sqrt((atom2.x - atom1.x) ** 2 + (atom2.y - atom1.y) ** 2);
                const angle = Math.atan2(atom2.y - atom1.y, atom2.x - atom1.x);
                
                const bondElement = $('<div class="bond"></div>').css({
                    left: atom1.x + 'px',
                    top: atom1.y + 'px',
                    width: length + 'px',
                    transform: `rotate(${angle}rad)`,
                    'transform-origin': '0 50%'
                });
                canvas.append(bondElement);
            }
        });
        
        // Draw molecules
        this.molecules.forEach(mol => {
            const moleculeElement = $(`<div class="molecule atom-${mol.atomType}"></div>`).css({
                left: (mol.x - mol.size) + 'px',
                top: (mol.y - mol.size) + 'px',
                width: (mol.size * 2) + 'px',
                height: (mol.size * 2) + 'px',
                zIndex: 2
            });
            canvas.append(moleculeElement);
        });
    }

    completeSimulation() {
        this.isRunning = false;
        $('#startBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        $('#progressText').text('Simulation completed!');
        
        setTimeout(() => {
            $('#progressText').text('Ready to start new simulation...');
        }, 3000);
    }
}

$(document).ready(() => {
    new MolecularDynamicsSimulation();
});