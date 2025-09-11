class StochasticSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.maxSteps = 50;
        this.animationSpeed = 50;
        this.currentScenario = 'weather-forecast';
        this.animationId = null;
        this.history = [];
        this.currentState = 0;
        
        this.setupCanvas();
        this.bindEvents();
        this.initializeScenario();
        this.updateScenarioExplanation();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 400;
    }

    bindEvents() {
        $('#startBtn').click(() => this.startSimulation());
        $('#pauseBtn').click(() => this.pauseSimulation());
        $('#resetBtn').click(() => this.resetSimulation());
        
        $('#timeSteps').on('input', (e) => {
            this.maxSteps = parseInt(e.target.value);
            $('#timeStepsValue').text(this.maxSteps);
        });
        
        $('#speed').on('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            $('#speedValue').text(this.animationSpeed);
        });
        
        $('#scenarioSelect').change((e) => {
            this.currentScenario = e.target.value;
            this.resetSimulation();
            this.initializeScenario();
            this.updateScenarioExplanation();
        });
        
        $(window).resize(() => this.setupCanvas());
    }

    updateScenarioExplanation() {
        const explanations = {
            'weather-forecast': {
                description: 'We simulate how weather changes from day to day based on current conditions and random factors like wind patterns.',
                why: 'Used in: Meteorology, agriculture, event planning. When future outcomes depend on current state but have unpredictable elements.',
                realWorld: '🌤️ Weather services use this for 7-day forecasts, farmers use it for crop planning, airlines use it for flight delays!'
            },
            'queue-system': {
                description: 'We model customers arriving at a store and being served, with random arrival times and service durations.',
                why: 'Used in: Retail management, call centers, hospital emergency rooms. When you need to plan staffing based on unpredictable demand.',
                realWorld: '🏪 McDonald\'s uses this for drive-through staffing, hospitals use it for emergency room capacity, Disney uses it for ride wait times!'
            },
            'population-growth': {
                description: 'We track an animal population where births and deaths happen randomly, but depend on current population size.',
                why: 'Used in: Wildlife conservation, fisheries management, pest control. When population changes depend on current size and environmental factors.',
                realWorld: '🦌 National parks use this for deer hunting quotas, fisheries use it for catch limits, farmers use it for pest management!'
            },
            'traffic-flow': {
                description: 'We simulate cars arriving at an intersection with random timing and different traffic light patterns.',
                why: 'Used in: Traffic engineering, city planning, parking management. When traffic patterns change based on time and current congestion.',
                realWorld: '🚦 Cities use this for traffic light timing, Google Maps uses it for route planning, parking apps use it for space prediction!'
            },
            'disease-spread': {
                description: 'We model how a disease spreads through a population where infections depend on current sick people and random contacts.',
                why: 'Used in: Public health, pandemic response, vaccine planning. When disease spread depends on current infections and contact patterns.',
                realWorld: '🏥 CDC used this for COVID-19 policies, WHO uses it for vaccine distribution, hospitals use it for capacity planning!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous real-world examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(255, 107, 107, 0.1); border-left: 3px solid #ff6b6b; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        this.history = [];
        this.currentStep = 0;
        
        switch(this.currentScenario) {
            case 'weather-forecast':
                this.initWeatherForecast();
                break;
            case 'queue-system':
                this.initQueueSystem();
                break;
            case 'population-growth':
                this.initPopulationGrowth();
                break;
            case 'traffic-flow':
                this.initTrafficFlow();
                break;
            case 'disease-spread':
                this.initDiseaseSpread();
                break;
        }
        
        this.updateStats();
        this.updateLegend();
        this.draw();
    }

    // Weather Forecast Scenario
    initWeatherForecast() {
        $('#stateLabel').text('Weather');
        $('#averageLabel').text('Sunny Days');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Climate Type: <span id="climateValue">Dry (Sunny Bias)</span></label>
                <select class="form-select" id="climateSelect">
                    <option value="dry" selected>Dry (Desert/Arizona)</option>
                    <option value="temperate">Temperate (New York/London)</option>
                    <option value="rainy">Rainy (Seattle/Ireland)</option>
                </select>
                <small class="text-muted">🌍 <strong>What this does:</strong> Different regions have different weather patterns based on geography</small>
            </div>
            <div class="alert alert-light p-2 mt-2">
                <small><strong>🌤️ How Weather Memory Works:</strong><br>
                • If it's sunny today, more likely to be sunny tomorrow<br>
                • If it's rainy today, might stay rainy or turn cloudy<br>
                • But random factors (wind, pressure) can change everything!</small>
            </div>
        `);
        
        this.weatherStates = ['☀️ Sunny', '⛅ Cloudy', '🌧️ Rainy'];
        this.currentState = 0; // Start sunny
        this.climate = 'dry';
        
        // Transition probabilities based on current state
        this.weatherTransitions = {
            'dry': [
                [0.7, 0.25, 0.05],    // Sunny -> [Sunny, Cloudy, Rainy]
                [0.4, 0.4, 0.2],      // Cloudy -> [Sunny, Cloudy, Rainy] 
                [0.3, 0.5, 0.2]       // Rainy -> [Sunny, Cloudy, Rainy]
            ],
            'temperate': [
                [0.5, 0.35, 0.15],    
                [0.3, 0.4, 0.3],      
                [0.2, 0.4, 0.4]       
            ],
            'rainy': [
                [0.3, 0.35, 0.35],    
                [0.2, 0.3, 0.5],      
                [0.1, 0.3, 0.6]       
            ]
        };
        
        $('#climateSelect').on('change', (e) => {
            this.climate = e.target.value;
            const labels = {'dry': 'Dry (Desert/Arizona)', 'temperate': 'Temperate (New York/London)', 'rainy': 'Rainy (Seattle/Ireland)'};
            $('#climateValue').text(labels[this.climate]);
        });
    }

    // Queue System Scenario
    initQueueSystem() {
        $('#stateLabel').text('Queue Size');
        $('#averageLabel').text('Avg Wait');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Business Type: <span id="storeTypeValue">Coffee Shop</span></label>
                <select class="form-select" id="storeTypeSelect">
                    <option value="coffee" selected>Coffee Shop</option>
                    <option value="fastfood">Fast Food Restaurant</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="bank">Bank Branch</option>
                    <option value="callcenter">Call Center</option>
                </select>
                <small class="text-muted">🏪 Different businesses have different patterns</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Time of Day: <span id="timeOfDayValue">Morning Rush</span></label>
                <select class="form-select" id="timeOfDaySelect">
                    <option value="early">Early Morning (Low Traffic)</option>
                    <option value="rush" selected>Morning Rush (High Traffic)</option>
                    <option value="midday">Midday (Medium Traffic)</option>
                    <option value="evening">Evening (Medium Traffic)</option>
                    <option value="late">Late Night (Low Traffic)</option>
                </select>
                <small class="text-muted">🕐 Customer arrival patterns change by time</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Number of Servers: <span id="serversValue">2</span></label>
                <input type="range" class="form-range" id="serversSlider" min="1" max="8" value="2" step="1">
                <small class="text-muted">👥 More servers = faster service but higher costs</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Service Efficiency: <span id="efficiencyValue">Normal</span></label>
                <select class="form-select" id="efficiencySelect">
                    <option value="slow">Slow (New Staff)</option>
                    <option value="normal" selected>Normal (Trained Staff)</option>
                    <option value="fast">Fast (Expert Staff)</option>
                </select>
                <small class="text-muted">⚡ Staff experience affects service speed</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Customer Patience: <span id="patienceValue">Medium</span></label>
                <select class="form-select" id="patienceSelect">
                    <option value="low">Low (Leave if wait > 5 min)</option>
                    <option value="medium" selected>Medium (Leave if wait > 10 min)</option>
                    <option value="high">High (Leave if wait > 15 min)</option>
                </select>
                <small class="text-muted">😤 Some customers leave if wait is too long</small>
            </div>
        `);
        
        this.queueSize = 0;
        this.totalWaitTime = 0;
        this.customersServed = 0;
        this.customersLost = 0;
        this.storeType = 'coffee';
        this.timeOfDay = 'rush';
        this.numServers = 2;
        this.efficiency = 'normal';
        this.patience = 'medium';
        
        // Business type parameters
        this.businessParams = {
            'coffee': { baseArrival: 0.7, baseService: 3, serviceVariability: 2 },
            'fastfood': { baseArrival: 1.2, baseService: 4, serviceVariability: 2 },
            'grocery': { baseArrival: 0.4, baseService: 8, serviceVariability: 5 },
            'bank': { baseArrival: 0.3, baseService: 12, serviceVariability: 8 },
            'callcenter': { baseArrival: 2.0, baseService: 6, serviceVariability: 4 }
        };
        
        // Time of day multipliers
        this.timeMultipliers = {
            'early': { arrival: 0.3, service: 1.1 },
            'rush': { arrival: 1.5, service: 0.9 },
            'midday': { arrival: 0.8, service: 1.0 },
            'evening': { arrival: 1.2, service: 0.95 },
            'late': { arrival: 0.2, service: 1.2 }
        };
        
        // Add event listeners
        $('#storeTypeSelect').on('change', (e) => {
            this.storeType = e.target.value;
            const labels = {'coffee': 'Coffee Shop', 'fastfood': 'Fast Food Restaurant', 'grocery': 'Grocery Store', 'bank': 'Bank Branch', 'callcenter': 'Call Center'};
            $('#storeTypeValue').text(labels[this.storeType]);
            this.resetSimulation();
        });
        
        $('#timeOfDaySelect').on('change', (e) => {
            this.timeOfDay = e.target.value;
            const labels = {'early': 'Early Morning (Low Traffic)', 'rush': 'Morning Rush (High Traffic)', 'midday': 'Midday (Medium Traffic)', 'evening': 'Evening (Medium Traffic)', 'late': 'Late Night (Low Traffic)'};
            $('#timeOfDayValue').text(labels[this.timeOfDay].split(' (')[0]);
        });
        
        $('#serversSlider').on('input', (e) => {
            this.numServers = parseInt(e.target.value);
            $('#serversValue').text(this.numServers);
        });
        
        $('#efficiencySelect').on('change', (e) => {
            this.efficiency = e.target.value;
            const labels = {'slow': 'Slow (New Staff)', 'normal': 'Normal (Trained Staff)', 'fast': 'Fast (Expert Staff)'};
            $('#efficiencyValue').text(labels[this.efficiency].split(' (')[0]);
        });
        
        $('#patienceSelect').on('change', (e) => {
            this.patience = e.target.value;
            const labels = {'low': 'Low (Leave if wait > 5 min)', 'medium': 'Medium (Leave if wait > 10 min)', 'high': 'High (Leave if wait > 15 min)'};
            $('#patienceValue').text(labels[this.patience].split(' (')[0]);
        });
    }

    // Population Growth Scenario
    initPopulationGrowth() {
        $('#stateLabel').text('Population');
        $('#averageLabel').text('Growth Rate');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Species: <span id="speciesValue">Rabbits</span></label>
                <select class="form-select" id="speciesSelect">
                    <option value="rabbits" selected>Rabbits (Fast Growth)</option>
                    <option value="deer">Deer (Moderate Growth)</option>
                    <option value="bears">Bears (Slow Growth)</option>
                </select>
            </div>
        `);
        
        this.population = 10;
        this.species = 'rabbits';
        
        this.speciesParams = {
            'rabbits': { birthRate: 0.3, deathRate: 0.1, carryingCapacity: 100 },
            'deer': { birthRate: 0.2, deathRate: 0.15, carryingCapacity: 80 },
            'bears': { birthRate: 0.15, deathRate: 0.1, carryingCapacity: 50 }
        };
        
        $('#speciesSelect').on('change', (e) => {
            this.species = e.target.value;
            const labels = {'rabbits': 'Rabbits (Fast Growth)', 'deer': 'Deer (Moderate Growth)', 'bears': 'Bears (Slow Growth)'};
            $('#speciesValue').text(labels[this.species]);
            this.resetSimulation();
        });
    }

    // Traffic Flow Scenario
    initTrafficFlow() {
        $('#stateLabel').text('Cars/Hour');
        $('#averageLabel').text('Avg Flow');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Time of Day: <span id="trafficTimeValue">Morning Rush</span></label>
                <select class="form-select" id="trafficTimeSelect">
                    <option value="rush" selected>Morning Rush (Heavy Traffic)</option>
                    <option value="normal">Normal Hours (Medium Traffic)</option>
                    <option value="night">Night Time (Light Traffic)</option>
                </select>
            </div>
        `);
        
        this.carsPerHour = 20;
        this.trafficTime = 'rush';
        
        this.trafficParams = {
            'rush': { baseRate: 40, variability: 20 },
            'normal': { baseRate: 20, variability: 10 },
            'night': { baseRate: 5, variability: 5 }
        };
        
        $('#trafficTimeSelect').on('change', (e) => {
            this.trafficTime = e.target.value;
            const labels = {'rush': 'Morning Rush (Heavy Traffic)', 'normal': 'Normal Hours (Medium Traffic)', 'night': 'Night Time (Light Traffic)'};
            $('#trafficTimeValue').text(labels[this.trafficTime]);
            this.resetSimulation();
        });
    }

    // Disease Spread Scenario
    initDiseaseSpread() {
        $('#stateLabel').text('Infected');
        $('#averageLabel').text('Peak Infected');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Population Size: <span id="popSizeValue">10,000</span></label>
                <input type="range" class="form-range" id="popSizeSlider" min="1000" max="50000" value="10000" step="1000">
                <small class="text-muted">👥 Total people in the community</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Disease Type: <span id="diseaseValue">Flu-like</span></label>
                <select class="form-select" id="diseaseSelect">
                    <option value="cold">Common Cold (Low Severity)</option>
                    <option value="flu" selected>Flu-like (Medium Severity)</option>
                    <option value="covid">COVID-like (High Severity)</option>
                    <option value="measles">Measles-like (Very High Transmission)</option>
                </select>
                <small class="text-muted">🦠 Different diseases spread differently</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Population Density: <span id="densityValue">Suburban</span></label>
                <select class="form-select" id="densitySelect">
                    <option value="rural">Rural (Low Contact)</option>
                    <option value="suburban" selected>Suburban (Medium Contact)</option>
                    <option value="urban">Urban (High Contact)</option>
                </select>
                <small class="text-muted">🏘️ How often people interact</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Social Measures: <span id="measuresValue">None</span></label>
                <select class="form-select" id="measuresSelect">
                    <option value="none" selected>No Restrictions</option>
                    <option value="masks">Mask Mandates (-30% transmission)</option>
                    <option value="distancing">Social Distancing (-50% transmission)</option>
                    <option value="lockdown">Lockdown (-70% transmission)</option>
                </select>
                <small class="text-muted">😷 Public health interventions</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Vaccination Rate: <span id="vaccinationValue">0%</span></label>
                <input type="range" class="form-range" id="vaccinationSlider" min="0" max="90" value="0" step="5">
                <small class="text-muted">💉 Percent of population vaccinated</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Initial Infected: <span id="initialInfectedValue">10</span></label>
                <input type="range" class="form-range" id="initialInfectedSlider" min="1" max="100" value="10" step="1">
                <small class="text-muted">🤒 Number of people infected at start</small>
            </div>
        `);
        
        this.totalPopulation = 10000;
        this.initialInfected = 10;
        this.infected = this.initialInfected;
        this.recovered = 0;
        this.susceptible = this.totalPopulation - this.infected;
        this.diseaseType = 'flu';
        this.density = 'suburban';
        this.socialMeasures = 'none';
        this.vaccinationRate = 0;
        this.peakInfected = this.initialInfected;
        
        // Disease parameters (transmission rate, recovery rate, mortality rate)
        this.diseaseParams = {
            'cold': { R0: 1.5, recoveryDays: 7, severity: 0.1 },
            'flu': { R0: 2.5, recoveryDays: 10, severity: 0.3 },
            'covid': { R0: 3.5, recoveryDays: 14, severity: 0.5 },
            'measles': { R0: 15, recoveryDays: 10, severity: 0.2 }
        };
        
        // Density contact multipliers
        this.densityMultipliers = {
            'rural': 0.5,
            'suburban': 1.0,
            'urban': 1.8
        };
        
        // Social measures effectiveness
        this.measureEffectiveness = {
            'none': 1.0,
            'masks': 0.7,
            'distancing': 0.5,
            'lockdown': 0.3
        };
        
        // Add event listeners
        $('#popSizeSlider').on('input', (e) => {
            this.totalPopulation = parseInt(e.target.value);
            $('#popSizeValue').text(this.totalPopulation.toLocaleString());
            this.resetSimulation();
        });
        
        $('#diseaseSelect').on('change', (e) => {
            this.diseaseType = e.target.value;
            const labels = {'cold': 'Common Cold (Low Severity)', 'flu': 'Flu-like (Medium Severity)', 'covid': 'COVID-like (High Severity)', 'measles': 'Measles-like (Very High Transmission)'};
            $('#diseaseValue').text(labels[this.diseaseType].split(' (')[0]);
        });
        
        $('#densitySelect').on('change', (e) => {
            this.density = e.target.value;
            const labels = {'rural': 'Rural (Low Contact)', 'suburban': 'Suburban (Medium Contact)', 'urban': 'Urban (High Contact)'};
            $('#densityValue').text(labels[this.density].split(' (')[0]);
        });
        
        $('#measuresSelect').on('change', (e) => {
            this.socialMeasures = e.target.value;
            const labels = {'none': 'No Restrictions', 'masks': 'Mask Mandates (-30% transmission)', 'distancing': 'Social Distancing (-50% transmission)', 'lockdown': 'Lockdown (-70% transmission)'};
            $('#measuresValue').text(labels[this.socialMeasures].split(' (')[0]);
        });
        
        $('#vaccinationSlider').on('input', (e) => {
            this.vaccinationRate = parseInt(e.target.value) / 100;
            $('#vaccinationValue').text(parseInt(e.target.value) + '%');
            this.resetSimulation();
        });
        
        $('#initialInfectedSlider').on('input', (e) => {
            this.initialInfected = parseInt(e.target.value);
            $('#initialInfectedValue').text(this.initialInfected);
            this.resetSimulation();
        });
    }

    updateLegend() {
        const legends = {
            'weather-forecast': [
                { color: '#FFD700', label: 'Sunny' },
                { color: '#87CEEB', label: 'Cloudy' },
                { color: '#4682B4', label: 'Rainy' }
            ],
            'queue-system': [
                { color: '#4CAF50', label: 'Short Queue' },
                { color: '#FF9800', label: 'Medium Queue' },
                { color: '#F44336', label: 'Long Queue' }
            ],
            'population-growth': [
                { color: '#4CAF50', label: 'Growing' },
                { color: '#FF9800', label: 'Stable' },
                { color: '#F44336', label: 'Declining' }
            ],
            'traffic-flow': [
                { color: '#4CAF50', label: 'Light Traffic' },
                { color: '#FF9800', label: 'Moderate Traffic' },
                { color: '#F44336', label: 'Heavy Traffic' }
            ],
            'disease-spread': [
                { color: '#4CAF50', label: 'Susceptible' },
                { color: '#F44336', label: 'Infected' },
                { color: '#2196F3', label: 'Recovered' }
            ]
        };
        
        const legend = legends[this.currentScenario];
        let legendHTML = '';
        legend.forEach(item => {
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${item.color};"></div>
                    <span>${item.label}</span>
                </div>
            `;
        });
        $('#processLegend').html(legendHTML);
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
        switch(this.currentScenario) {
            case 'weather-forecast':
                this.performWeatherStep();
                break;
            case 'queue-system':
                this.performQueueStep();
                break;
            case 'population-growth':
                this.performPopulationStep();
                break;
            case 'traffic-flow':
                this.performTrafficStep();
                break;
            case 'disease-spread':
                this.performDiseaseStep();
                break;
        }
    }

    performWeatherStep() {
        const transitions = this.weatherTransitions[this.climate];
        const probabilities = transitions[this.currentState];
        const rand = Math.random();
        
        let cumulative = 0;
        for (let i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (rand < cumulative) {
                this.currentState = i;
                break;
            }
        }
        
        this.history.push(this.currentState);
    }

    performQueueStep() {
        const businessData = this.businessParams[this.storeType];
        const timeData = this.timeMultipliers[this.timeOfDay];
        
        // Calculate adjusted arrival rate
        const arrivalRate = businessData.baseArrival * timeData.arrival;
        
        // Random arrivals (Poisson-like process)
        if (Math.random() < arrivalRate / 10) {
            const newArrivals = Math.floor(Math.random() * 2) + 1; // 1-2 customers
            this.queueSize += newArrivals;
        }
        
        // Service processing
        if (this.queueSize > 0) {
            // Calculate service capacity
            const efficiencyMultipliers = {'slow': 0.7, 'normal': 1.0, 'fast': 1.3};
            const serviceCapacity = this.numServers * efficiencyMultipliers[this.efficiency] * timeData.service;
            
            // Service rate varies by business type and current conditions
            const baseServiceTime = businessData.baseService;
            const serviceVariability = businessData.serviceVariability;
            const actualServiceTime = baseServiceTime + (Math.random() - 0.5) * serviceVariability;
            
            // Probability of serving customers this step
            const serviceProb = serviceCapacity / actualServiceTime / 10;
            
            if (Math.random() < serviceProb) {
                const served = Math.min(this.queueSize, Math.max(1, Math.floor(serviceCapacity)));
                this.queueSize -= served;
                this.customersServed += served;
                this.totalWaitTime += this.queueSize * served; // Wait time approximation
            }
        }
        
        // Customer abandonment due to long wait
        if (this.queueSize > 0) {
            const patienceThresholds = {'low': 3, 'medium': 6, 'high': 10};
            const abandonmentThreshold = patienceThresholds[this.patience];
            
            if (this.queueSize > abandonmentThreshold) {
                const abandonRate = (this.queueSize - abandonmentThreshold) * 0.1;
                if (Math.random() < abandonRate) {
                    const abandoned = Math.floor(Math.random() * 2) + 1;
                    this.queueSize = Math.max(0, this.queueSize - abandoned);
                    this.customersLost += abandoned;
                }
            }
        }
        
        this.history.push(this.queueSize);
        this.currentState = this.queueSize;
    }

    performPopulationStep() {
        const params = this.speciesParams[this.species];
        const overcrowding = this.population / params.carryingCapacity;
        
        // Births (reduced by overcrowding)
        const birthRate = params.birthRate * (1 - overcrowding * 0.8);
        const births = Math.floor(this.population * birthRate * Math.random());
        
        // Deaths (increased by overcrowding)  
        const deathRate = params.deathRate * (1 + overcrowding * 0.5);
        const deaths = Math.floor(this.population * deathRate * Math.random());
        
        this.population = Math.max(0, this.population + births - deaths);
        this.history.push(this.population);
        this.currentState = this.population;
    }

    performTrafficStep() {
        const params = this.trafficParams[this.trafficTime];
        
        // Random fluctuation around base rate
        const variation = (Math.random() - 0.5) * params.variability;
        this.carsPerHour = Math.max(0, params.baseRate + variation);
        
        this.history.push(this.carsPerHour);
        this.currentState = Math.round(this.carsPerHour);
    }

    performDiseaseStep() {
        const params = this.densityParams[this.density];
        
        // New infections based on contact between infected and susceptible
        const newInfections = Math.floor(
            params.transmissionRate * this.infected * this.susceptible * Math.random()
        );
        
        // Recoveries
        const newRecoveries = Math.floor(this.infected * params.recoveryRate * Math.random());
        
        this.susceptible = Math.max(0, this.susceptible - newInfections);
        this.infected = Math.max(0, this.infected + newInfections - newRecoveries);
        this.recovered = Math.min(this.totalPopulation, this.recovered + newRecoveries);
        
        this.peakInfected = Math.max(this.peakInfected, this.infected);
        this.history.push({infected: this.infected, susceptible: this.susceptible, recovered: this.recovered});
        this.currentState = this.infected;
    }

    updateStats() {
        $('#currentStep').text(this.currentStep);
        
        switch(this.currentScenario) {
            case 'weather-forecast':
                $('#currentState').text(this.weatherStates[this.currentState]);
                const sunnyDays = this.history.filter(state => state === 0).length;
                $('#averageValue').text(sunnyDays);
                break;
            case 'queue-system':
                $('#currentState').text(this.currentState);
                const avgWait = this.customersServed > 0 ? (this.totalWaitTime / this.customersServed).toFixed(1) : '0';
                $('#averageValue').text(avgWait);
                break;
            case 'population-growth':
                $('#currentState').text(this.currentState);
                const avgPop = this.history.length > 0 ? (this.history.reduce((a, b) => a + b, 0) / this.history.length).toFixed(0) : '0';
                $('#averageValue').text(avgPop);
                break;
            case 'traffic-flow':
                $('#currentState').text(this.currentState);
                const avgFlow = this.history.length > 0 ? (this.history.reduce((a, b) => a + b, 0) / this.history.length).toFixed(1) : '0';
                $('#averageValue').text(avgFlow);
                break;
            case 'disease-spread':
                $('#currentState').text(this.currentState);
                $('#averageValue').text(this.peakInfected);
                break;
        }
    }

    updateProgress() {
        const progress = (this.currentStep / this.maxSteps) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Progress: ${this.currentStep} / ${this.maxSteps} steps`);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(this.currentScenario) {
            case 'weather-forecast':
                this.drawWeatherForecast();
                break;
            case 'queue-system':
                this.drawQueueSystem();
                break;
            case 'population-growth':
                this.drawPopulationGrowth();
                break;
            case 'traffic-flow':
                this.drawTrafficFlow();
                break;
            case 'disease-spread':
                this.drawDiseaseSpread();
                break;
        }
    }

    drawWeatherForecast() {
        if (this.history.length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        const barWidth = graphWidth / Math.max(this.history.length, this.maxSteps);
        
        const colors = ['#FFD700', '#87CEEB', '#4682B4']; // Sunny, Cloudy, Rainy
        
        for (let i = 0; i < this.history.length; i++) {
            const state = this.history[i];
            const x = padding + i * barWidth;
            const y = padding + (2 - state) * (graphHeight / 3);
            const height = graphHeight / 3;
            
            this.ctx.fillStyle = colors[state];
            this.ctx.fillRect(x, y, barWidth - 2, height);
        }
        
        // Draw grid lines and labels
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = padding + i * (graphHeight / 3);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(this.canvas.width - padding, y);
            this.ctx.stroke();
        }
        
        // Labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        const labels = ['Rainy', 'Cloudy', 'Sunny'];
        for (let i = 0; i < 3; i++) {
            const y = padding + i * (graphHeight / 3) + (graphHeight / 6);
            this.ctx.fillText(labels[i], padding - 10, y + 5);
        }
    }

    drawQueueSystem() {
        if (this.history.length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const maxQueue = Math.max(...this.history, 1);
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.history.length; i++) {
            const x = padding + (i / Math.max(this.history.length - 1, 1)) * graphWidth;
            const y = padding + graphHeight - (this.history[i] / maxQueue) * graphHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Draw queue visualization
        const queueY = this.canvas.height - 60;
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < Math.min(this.currentState, 20); i++) {
            this.ctx.fillRect(50 + i * 15, queueY, 10, 30);
        }
    }

    drawPopulationGrowth() {
        if (this.history.length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const maxPop = Math.max(...this.history, 1);
        
        // Area chart
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding + graphHeight);
        
        for (let i = 0; i < this.history.length; i++) {
            const x = padding + (i / Math.max(this.history.length - 1, 1)) * graphWidth;
            const y = padding + graphHeight - (this.history[i] / maxPop) * graphHeight;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(padding + graphWidth, padding + graphHeight);
        this.ctx.fill();
        
        // Line chart
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.history.length; i++) {
            const x = padding + (i / Math.max(this.history.length - 1, 1)) * graphWidth;
            const y = padding + graphHeight - (this.history[i] / maxPop) * graphHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Current population display
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Population: ${this.currentState}`, this.canvas.width / 2, 30);
    }

    drawTrafficFlow() {
        if (this.history.length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const maxFlow = Math.max(...this.history, 1);
        const barWidth = graphWidth / Math.max(this.history.length, this.maxSteps);
        
        for (let i = 0; i < this.history.length; i++) {
            const flow = this.history[i];
            const x = padding + i * barWidth;
            const height = (flow / maxFlow) * graphHeight;
            const y = padding + graphHeight - height;
            
            // Color based on traffic level
            let color = '#4CAF50'; // Light traffic
            if (flow > maxFlow * 0.6) color = '#F44336'; // Heavy traffic
            else if (flow > maxFlow * 0.3) color = '#FF9800'; // Moderate traffic
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, barWidth - 2, height);
        }
        
        // Current flow display
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Current Flow: ${this.currentState} cars/hour`, this.canvas.width / 2, 30);
    }

    drawDiseaseSpread() {
        if (this.history.length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        // Stacked area chart
        for (let i = 0; i < this.history.length - 1; i++) {
            const x1 = padding + (i / Math.max(this.history.length - 1, 1)) * graphWidth;
            const x2 = padding + ((i + 1) / Math.max(this.history.length - 1, 1)) * graphWidth;
            
            const data1 = this.history[i];
            const data2 = this.history[i + 1];
            
            // Susceptible (bottom)
            const s1 = padding + graphHeight - (data1.susceptible / this.totalPopulation) * graphHeight;
            const s2 = padding + graphHeight - (data2.susceptible / this.totalPopulation) * graphHeight;
            
            // Infected (middle)
            const i1 = s1 - (data1.infected / this.totalPopulation) * graphHeight;
            const i2 = s2 - (data2.infected / this.totalPopulation) * graphHeight;
            
            // Recovered (top)
            const r1 = i1 - (data1.recovered / this.totalPopulation) * graphHeight;
            const r2 = i2 - (data2.recovered / this.totalPopulation) * graphHeight;
            
            // Draw susceptible
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.moveTo(x1, padding + graphHeight);
            this.ctx.lineTo(x1, s1);
            this.ctx.lineTo(x2, s2);
            this.ctx.lineTo(x2, padding + graphHeight);
            this.ctx.fill();
            
            // Draw infected
            this.ctx.fillStyle = '#F44336';
            this.ctx.beginPath();
            this.ctx.moveTo(x1, s1);
            this.ctx.lineTo(x1, i1);
            this.ctx.lineTo(x2, i2);
            this.ctx.lineTo(x2, s2);
            this.ctx.fill();
            
            // Draw recovered
            this.ctx.fillStyle = '#2196F3';
            this.ctx.beginPath();
            this.ctx.moveTo(x1, i1);
            this.ctx.lineTo(x1, r1);
            this.ctx.lineTo(x2, r2);
            this.ctx.lineTo(x2, i2);
            this.ctx.fill();
        }
        
        // Current stats display
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Susceptible: ${this.susceptible}`, 20, 30);
        this.ctx.fillText(`Infected: ${this.infected}`, 20, 50);
        this.ctx.fillText(`Recovered: ${this.recovered}`, 20, 70);
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
    new StochasticSimulation();
});