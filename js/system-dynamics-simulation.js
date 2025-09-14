// Cryptographically secure random number generator utility
function secureRandom() {
    try {
        if (crypto && crypto.getRandomValues) {
            return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
        }
    } catch (e) {
        console.warn('Crypto API not available, falling back to Math.random()');
    }
    return Math.random();
}

class SystemDynamicsSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.maxSteps = 60; // months/periods
        this.animationSpeed = 50;
        this.currentScenario = 'supply-chain';
        this.animationId = null;
        
        // System variables
        this.timeHorizon = 12;
        this.feedbackDelay = 2;
        this.history = [];
        
        // Stock and Flow variables
        this.stocks = {};
        this.flows = {};
        this.auxiliaries = {};
        this.constants = {};
        
        this.setupCanvas();
        this.bindEvents();
        this.initializeScenario();
        this.updateScenarioExplanation();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 300;
    }

    bindEvents() {
        $('#startBtn').click(() => this.startSimulation());
        $('#pauseBtn').click(() => this.pauseSimulation());
        $('#resetBtn').click(() => this.resetSimulation());
        
        $('#timeHorizon').on('input', (e) => {
            this.timeHorizon = parseInt(e.target.value);
            this.maxSteps = this.timeHorizon;
            $('#timeHorizonValue').text(this.timeHorizon + ' months');
        });
        
        $('#feedbackDelay').on('input', (e) => {
            this.feedbackDelay = parseInt(e.target.value);
            $('#feedbackDelayValue').text(this.feedbackDelay + ' periods');
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
            'supply-chain': {
                description: 'We model supply chain dynamics with inventory stocks, demand flows, and feedback loops that create delays and oscillations.',
                why: 'Used in: Manufacturing, retail, logistics. When managing inventory levels and preventing bullwhip effect in supply chains.',
                realWorld: '📦 Amazon optimizes warehouse inventory, Toyota manages just-in-time production, Walmart prevents stockouts!'
            },
            'urban-growth': {
                description: 'We simulate city growth with population stocks, migration flows, and infrastructure feedback loops affecting quality of life.',
                why: 'Used in: Urban planning, infrastructure development, policy making. When planning sustainable city growth and resource allocation.',
                realWorld: '🏙️ Singapore plans housing development, NYC manages traffic infrastructure, London controls urban sprawl!'
            },
            'customer-satisfaction': {
                description: 'We model customer satisfaction with service quality stocks, complaint flows, and improvement feedback loops.',
                why: 'Used in: Service industries, quality management, customer retention. When improving service quality and customer loyalty.',
                realWorld: '😊 Hotels improve guest experience, airlines enhance service quality, banks reduce customer complaints!'
            },
            'renewable-energy': {
                description: 'We simulate energy transition with renewable capacity stocks, adoption flows, and cost-experience feedback loops.',
                why: 'Used in: Energy planning, sustainability policy, investment decisions. When planning transition to renewable energy sources.',
                realWorld: '🌱 Countries plan solar adoption, utilities manage grid stability, investors evaluate renewable projects!'
            },
            'organizational-learning': {
                description: 'We model organizational knowledge with expertise stocks, learning flows, and performance feedback loops.',
                why: 'Used in: Corporate strategy, human resources, knowledge management. When building learning organizations and competitive advantage.',
                realWorld: '🎓 Companies build expertise, startups scale knowledge, consultancies develop capabilities!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(102, 126, 234, 0.1); border-left: 3px solid #667eea; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        this.history = [];
        this.currentStep = 0;
        this.stocks = {};
        this.flows = {};
        this.auxiliaries = {};
        this.constants = {};
        
        switch(this.currentScenario) {
            case 'supply-chain':
                this.initSupplyChain();
                break;
            case 'urban-growth':
                this.initUrbanGrowth();
                break;
            case 'customer-satisfaction':
                this.initCustomerSatisfaction();
                break;
            case 'renewable-energy':
                this.initRenewableEnergy();
                break;
            case 'organizational-learning':
                this.initOrganizationalLearning();
                break;
        }
        
        this.setupScenarioParameters();
        this.updateStockFlowDiagram();
        this.updateStats();
        this.draw();
    }

    initSupplyChain() {
        $('#stockLabel').text('Inventory');
        $('#flowLabel').text('Orders/Month');
        
        // Stocks
        this.stocks.inventory = 1000;
        this.stocks.backlog = 0;
        
        // Constants
        this.constants.desiredInventory = 1200;
        this.constants.demandRate = 100;
        this.constants.adjustmentTime = 4;
        this.constants.deliveryDelay = this.feedbackDelay;
        
        // Initialize history
        this.history.push({
            inventory: this.stocks.inventory,
            orders: this.constants.demandRate,
            shipments: this.constants.demandRate,
            target: this.constants.desiredInventory
        });
    }

    initUrbanGrowth() {
        $('#stockLabel').text('Population');
        $('#flowLabel').text('Migration Rate');
        
        // Stocks
        this.stocks.population = 100000;
        this.stocks.infrastructure = 80;
        
        // Constants
        this.constants.attractiveness = 0.7;
        this.constants.capacity = 150000;
        this.constants.infrastructureInvestment = 0.05;
        this.constants.depreciationRate = 0.02;
        
        this.history.push({
            population: this.stocks.population,
            migration: 0,
            infrastructure: this.stocks.infrastructure,
            target: this.constants.capacity
        });
    }

    initCustomerSatisfaction() {
        $('#stockLabel').text('Satisfaction');
        $('#flowLabel').text('Improvement Rate');
        
        // Stocks
        this.stocks.satisfaction = 75;
        this.stocks.serviceQuality = 70;
        
        // Constants
        this.constants.targetSatisfaction = 90;
        this.constants.improvementBudget = 10000;
        this.constants.improvementEfficiency = 0.1;
        this.constants.naturalDecay = 0.02;
        
        this.history.push({
            satisfaction: this.stocks.satisfaction,
            improvement: 0,
            complaints: 25,
            target: this.constants.targetSatisfaction
        });
    }

    initRenewableEnergy() {
        $('#stockLabel').text('Renewable %');
        $('#flowLabel').text('Adoption Rate');
        
        // Stocks
        this.stocks.renewableCapacity = 20; // percentage
        this.stocks.experience = 10;
        
        // Constants
        this.constants.targetCapacity = 80;
        this.constants.initialCost = 100;
        this.constants.learningRate = 0.15;
        this.constants.policySupport = 0.5;
        
        this.history.push({
            renewable: this.stocks.renewableCapacity,
            adoption: 0,
            cost: this.constants.initialCost,
            target: this.constants.targetCapacity
        });
    }

    initOrganizationalLearning() {
        $('#stockLabel').text('Knowledge');
        $('#flowLabel').text('Learning Rate');
        
        // Stocks
        this.stocks.knowledge = 50;
        this.stocks.performance = 60;
        
        // Constants
        this.constants.learningInvestment = 0.1;
        this.constants.knowledgeDecay = 0.05;
        this.constants.performanceTarget = 90;
        this.constants.learningEffectiveness = 0.2;
        
        this.history.push({
            knowledge: this.stocks.knowledge,
            learning: 0,
            performance: this.stocks.performance,
            target: this.constants.performanceTarget
        });
    }

    setupScenarioParameters() {
        const scenarioParams = {
            'supply-chain': `
                <div class="mb-3">
                    <label class="form-label">Demand Variability: <span id="demandVarValue">Low</span></label>
                    <select class="form-select" id="demandVarSelect">
                        <option value="low" selected>Low Variability</option>
                        <option value="medium">Medium Variability</option>
                        <option value="high">High Variability</option>
                    </select>
                    <small class="text-muted">📊 How much demand fluctuates</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Safety Stock: <span id="safetyStockValue">200</span></label>
                    <input type="range" class="form-range" id="safetyStockSlider" min="0" max="500" value="200" step="50">
                    <small class="text-muted">🛡️ Extra inventory buffer</small>
                </div>
            `,
            'urban-growth': `
                <div class="mb-3">
                    <label class="form-label">Economic Growth: <span id="economicGrowthValue">Medium</span></label>
                    <select class="form-select" id="economicGrowthSelect">
                        <option value="low">Low Growth</option>
                        <option value="medium" selected>Medium Growth</option>
                        <option value="high">High Growth</option>
                    </select>
                    <small class="text-muted">💰 Affects migration attractiveness</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Investment Rate: <span id="investmentRateValue">5%</span></label>
                    <input type="range" class="form-range" id="investmentRateSlider" min="1" max="15" value="5" step="1">
                    <small class="text-muted">🏗️ Infrastructure investment as % of budget</small>
                </div>
            `,
            'customer-satisfaction': `
                <div class="mb-3">
                    <label class="form-label">Service Priority: <span id="servicePriorityValue">Medium</span></label>
                    <select class="form-select" id="servicePrioritySelect">
                        <option value="low">Cost Focus</option>
                        <option value="medium" selected>Balanced Approach</option>
                        <option value="high">Service Focus</option>
                    </select>
                    <small class="text-muted">⚡ How much to invest in service quality</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Training Budget: <span id="trainingBudgetValue">$10,000</span></label>
                    <input type="range" class="form-range" id="trainingBudgetSlider" min="5000" max="25000" value="10000" step="2500">
                    <small class="text-muted">📚 Monthly staff training budget</small>
                </div>
            `,
            'renewable-energy': `
                <div class="mb-3">
                    <label class="form-label">Policy Support: <span id="policySupportValue">Medium</span></label>
                    <select class="form-select" id="policySupportSelect">
                        <option value="low">Minimal Support</option>
                        <option value="medium" selected>Moderate Support</option>
                        <option value="high">Strong Support</option>
                    </select>
                    <small class="text-muted">🏛️ Government incentives and regulations</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Technology Progress: <span id="techProgressValue">15%</span></label>
                    <input type="range" class="form-range" id="techProgressSlider" min="5" max="25" value="15" step="5">
                    <small class="text-muted">🔬 Learning curve steepness (%)</small>
                </div>
            `,
            'organizational-learning': `
                <div class="mb-3">
                    <label class="form-label">Learning Culture: <span id="learningCultureValue">Medium</span></label>
                    <select class="form-select" id="learningCultureSelect">
                        <option value="low">Traditional Culture</option>
                        <option value="medium" selected>Adaptive Culture</option>
                        <option value="high">Learning Culture</option>
                    </select>
                    <small class="text-muted">🧠 How much organization values learning</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Knowledge Sharing: <span id="knowledgeSharingValue">20%</span></label>
                    <input type="range" class="form-range" id="knowledgeSharingSlider" min="5" max="50" value="20" step="5">
                    <small class="text-muted">🤝 Effectiveness of knowledge transfer (%)</small>
                </div>
            `
        };
        
        $('#scenarioSpecificParams').html(scenarioParams[this.currentScenario]);
        this.bindScenarioEvents();
    }

    bindScenarioEvents() {
        // Add event listeners for scenario-specific parameters
        $('select[id$="Select"], input[id$="Slider"]').on('input change', (e) => {
            const id = e.target.id;
            const value = e.target.value;
            
            // Update display values
            if (id.includes('Slider')) {
                const targetId = id.replace('Slider', 'Value');
                if (id.includes('Rate') || id.includes('Progress') || id.includes('Sharing')) {
                    $(`#${targetId}`).text(value + '%');
                } else if (id.includes('Budget')) {
                    $(`#${targetId}`).text('$' + parseInt(value).toLocaleString());
                } else {
                    $(`#${targetId}`).text(value);
                }
            } else if (id.includes('Select')) {
                const targetId = id.replace('Select', 'Value');
                const labels = {
                    'demandVarSelect': {'low': 'Low Variability', 'medium': 'Medium Variability', 'high': 'High Variability'},
                    'economicGrowthSelect': {'low': 'Low Growth', 'medium': 'Medium Growth', 'high': 'High Growth'},
                    'servicePrioritySelect': {'low': 'Cost Focus', 'medium': 'Balanced Approach', 'high': 'Service Focus'},
                    'policySupportSelect': {'low': 'Minimal Support', 'medium': 'Moderate Support', 'high': 'Strong Support'},
                    'learningCultureSelect': {'low': 'Traditional Culture', 'medium': 'Adaptive Culture', 'high': 'Learning Culture'}
                };
                if (labels[id]) {
                    $(`#${targetId}`).text(labels[id][value]);
                }
            }
            
            // Update model parameters
            this.updateModelParameters();
        });
    }

    updateModelParameters() {
        // Update constants based on UI controls
        const demandVar = $('#demandVarSelect').val();
        const safetyStock = parseInt($('#safetyStockSlider').val() || 200);
        const economicGrowth = $('#economicGrowthSelect').val();
        const investmentRate = parseInt($('#investmentRateSlider').val() || 5) / 100;
        
        if (this.currentScenario === 'supply-chain') {
            this.constants.safetyStock = safetyStock;
            this.constants.demandVariability = {'low': 0.1, 'medium': 0.3, 'high': 0.5}[demandVar] || 0.1;
        } else if (this.currentScenario === 'urban-growth') {
            this.constants.economicFactor = {'low': 0.8, 'medium': 1.0, 'high': 1.2}[economicGrowth] || 1.0;
            this.constants.infrastructureInvestment = investmentRate;
        }
    }

    updateStockFlowDiagram() {
        const diagrams = {
            'supply-chain': `
                <div class="stock-flow-diagram">
                    <div class="stock-box">Inventory</div>
                    <div class="flow-arrow"><div class="flow-label">Orders</div></div>
                    <div class="stock-box">Suppliers</div>
                    <div class="flow-arrow"><div class="flow-label">Shipments</div></div>
                    <div class="stock-box">Customers</div>
                </div>
                <div class="feedback-loop">Feedback Loop: Low inventory → More orders → Higher costs</div>
            `,
            'urban-growth': `
                <div class="stock-flow-diagram">
                    <div class="stock-box">Population</div>
                    <div class="flow-arrow"><div class="flow-label">Migration</div></div>
                    <div class="stock-box">Attractiveness</div>
                    <div class="flow-arrow"><div class="flow-label">Investment</div></div>
                    <div class="stock-box">Infrastructure</div>
                </div>
                <div class="feedback-loop">Feedback Loop: More people → Strain infrastructure → Reduce attractiveness</div>
            `,
            'customer-satisfaction': `
                <div class="stock-flow-diagram">
                    <div class="stock-box">Satisfaction</div>
                    <div class="flow-arrow"><div class="flow-label">Complaints</div></div>
                    <div class="stock-box">Service Quality</div>
                    <div class="flow-arrow"><div class="flow-label">Investment</div></div>
                    <div class="stock-box">Resources</div>
                </div>
                <div class="feedback-loop">Feedback Loop: High satisfaction → More customers → More revenue → Better service</div>
            `,
            'renewable-energy': `
                <div class="stock-flow-diagram">
                    <div class="stock-box">Renewable %</div>
                    <div class="flow-arrow"><div class="flow-label">Adoption</div></div>
                    <div class="stock-box">Experience</div>
                    <div class="flow-arrow"><div class="flow-label">Cost Reduction</div></div>
                    <div class="stock-box">Competitiveness</div>
                </div>
                <div class="feedback-loop">Feedback Loop: More adoption → Lower costs → More competitive → More adoption</div>
            `,
            'organizational-learning': `
                <div class="stock-flow-diagram">
                    <div class="stock-box">Knowledge</div>
                    <div class="flow-arrow"><div class="flow-label">Learning</div></div>
                    <div class="stock-box">Performance</div>
                    <div class="flow-arrow"><div class="flow-label">Investment</div></div>
                    <div class="stock-box">Capability</div>
                </div>
                <div class="feedback-loop">Feedback Loop: Better performance → More investment → More learning → Better performance</div>
            `
        };
        
        $('#stockFlowDiagram').html(diagrams[this.currentScenario]);
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
            case 'supply-chain':
                this.performSupplyChainStep();
                break;
            case 'urban-growth':
                this.performUrbanGrowthStep();
                break;
            case 'customer-satisfaction':
                this.performCustomerSatisfactionStep();
                break;
            case 'renewable-energy':
                this.performRenewableEnergyStep();
                break;
            case 'organizational-learning':
                this.performOrganizationalLearningStep();
                break;
        }
    }

    performSupplyChainStep() {
        // Calculate demand with variability
        const baseDemand = this.constants.demandRate;
        const demandVar = this.constants.demandVariability || 0.1;
        const actualDemand = baseDemand * (1 + (secureRandom() - 0.5) * demandVar);
        
        // Calculate inventory gap
        const desiredInventory = this.constants.desiredInventory + (this.constants.safetyStock || 0);
        const inventoryGap = desiredInventory - this.stocks.inventory;
        
        // Orders with delay response
        const orders = Math.max(0, actualDemand + (inventoryGap / this.constants.adjustmentTime));
        
        // Shipments arrive with delay
        const delayedOrders = this.getDelayedValue('orders', this.constants.deliveryDelay) || orders;
        
        // Update stocks
        this.stocks.inventory = Math.max(0, this.stocks.inventory + delayedOrders - actualDemand);
        
        // Track history
        this.history.push({
            inventory: this.stocks.inventory,
            orders: orders,
            shipments: delayedOrders,
            target: desiredInventory,
            demand: actualDemand
        });
    }

    performUrbanGrowthStep() {
        // Calculate attractiveness based on infrastructure and capacity
        const capacityUtilization = this.stocks.population / this.constants.capacity;
        const infrastructureQuality = this.stocks.infrastructure / 100;
        const economicFactor = this.constants.economicFactor || 1.0;
        
        const attractiveness = Math.max(0, infrastructureQuality * economicFactor * (1 - capacityUtilization));
        
        // Migration flow
        const migrationRate = attractiveness * 5000 * (secureRandom() * 0.5 + 0.75); // Some randomness
        
        // Infrastructure investment and depreciation
        const infrastructureInvestment = this.constants.infrastructureInvestment * this.stocks.population * 0.00001;
        const depreciation = this.constants.depreciationRate * this.stocks.infrastructure;
        
        // Update stocks
        this.stocks.population += migrationRate;
        this.stocks.infrastructure = Math.max(0, this.stocks.infrastructure + infrastructureInvestment - depreciation);
        
        this.history.push({
            population: this.stocks.population,
            migration: migrationRate,
            infrastructure: this.stocks.infrastructure,
            target: this.constants.capacity,
            attractiveness: attractiveness * 100
        });
    }

    performCustomerSatisfactionStep() {
        // Service quality affects satisfaction
        const serviceGap = this.stocks.serviceQuality - this.stocks.satisfaction;
        const satisfactionChange = serviceGap * 0.1;
        
        // Investment in service improvement
        const priority = $('#servicePrioritySelect').val() || 'medium';
        const priorityMultiplier = {'low': 0.5, 'medium': 1.0, 'high': 1.5}[priority];
        const budget = parseInt($('#trainingBudgetSlider').val() || 10000) * priorityMultiplier;
        
        const serviceImprovement = (budget / 1000) * this.constants.improvementEfficiency;
        const naturalDecay = this.constants.naturalDecay * this.stocks.serviceQuality;
        
        // Update stocks
        this.stocks.satisfaction = Math.max(0, Math.min(100, this.stocks.satisfaction + satisfactionChange));
        this.stocks.serviceQuality = Math.max(0, Math.min(100, this.stocks.serviceQuality + serviceImprovement - naturalDecay));
        
        this.history.push({
            satisfaction: this.stocks.satisfaction,
            improvement: serviceImprovement,
            complaints: Math.max(0, 100 - this.stocks.satisfaction),
            target: this.constants.targetSatisfaction,
            serviceQuality: this.stocks.serviceQuality
        });
    }

    performRenewableEnergyStep() {
        // Experience curve effect
        const costReduction = this.constants.learningRate * (this.stocks.experience / 100);
        const currentCost = this.constants.initialCost * (1 - costReduction);
        
        // Policy support effect
        const policySupport = $('#policySupportSelect').val() || 'medium';
        const policyMultiplier = {'low': 0.5, 'medium': 1.0, 'high': 1.5}[policySupport];
        
        // Technology progress
        const techProgress = parseInt($('#techProgressSlider').val() || 15) / 100;
        
        // Adoption rate based on cost competitiveness and policy
        const competitiveness = Math.max(0, 2 - (currentCost / 50)); // Relative to fossil fuels
        const adoptionRate = competitiveness * policyMultiplier * techProgress * (100 - this.stocks.renewableCapacity) * 0.01;
        
        // Update stocks
        this.stocks.renewableCapacity = Math.min(100, this.stocks.renewableCapacity + adoptionRate);
        this.stocks.experience += adoptionRate * 0.5; // Experience grows with adoption
        
        this.history.push({
            renewable: this.stocks.renewableCapacity,
            adoption: adoptionRate,
            cost: currentCost,
            target: this.constants.targetCapacity,
            experience: this.stocks.experience
        });
    }

    performOrganizationalLearningStep() {
        // Learning culture effect
        const culture = $('#learningCultureSelect').val() || 'medium';
        const cultureMultiplier = {'low': 0.5, 'medium': 1.0, 'high': 1.5}[culture];
        
        // Knowledge sharing effectiveness
        const sharingEffectiveness = parseInt($('#knowledgeSharingSlider').val() || 20) / 100;
        
        // Learning investment effect
        const learningRate = this.constants.learningInvestment * cultureMultiplier * sharingEffectiveness;
        const knowledgeDecay = this.constants.knowledgeDecay * this.stocks.knowledge;
        
        // Performance improvement from knowledge
        const performanceGap = this.stocks.knowledge - this.stocks.performance;
        const performanceImprovement = performanceGap * 0.1;
        
        // Update stocks
        this.stocks.knowledge = Math.max(0, Math.min(100, this.stocks.knowledge + learningRate * 10 - knowledgeDecay));
        this.stocks.performance = Math.max(0, Math.min(100, this.stocks.performance + performanceImprovement));
        
        this.history.push({
            knowledge: this.stocks.knowledge,
            learning: learningRate * 10,
            performance: this.stocks.performance,
            target: this.constants.performanceTarget
        });
    }

    getDelayedValue(variable, delay) {
        if (this.history.length < delay) return null;
        return this.history[this.history.length - delay][variable];
    }

    updateStats() {
        let stockValue, flowValue, healthValue;
        
        switch(this.currentScenario) {
            case 'supply-chain':
                stockValue = Math.round(this.stocks.inventory);
                flowValue = Math.round(this.history[this.history.length - 1]?.orders || 0);
                healthValue = Math.round(Math.max(0, 100 - Math.abs(this.stocks.inventory - this.constants.desiredInventory) / 10));
                break;
            case 'urban-growth':
                stockValue = Math.round(this.stocks.population);
                flowValue = Math.round(this.history[this.history.length - 1]?.migration || 0);
                healthValue = Math.round(this.stocks.infrastructure);
                break;
            case 'customer-satisfaction':
                stockValue = Math.round(this.stocks.satisfaction);
                flowValue = Math.round(this.history[this.history.length - 1]?.improvement || 0);
                healthValue = Math.round(this.stocks.serviceQuality);
                break;
            case 'renewable-energy':
                stockValue = Math.round(this.stocks.renewableCapacity) + '%';
                flowValue = (this.history[this.history.length - 1]?.adoption || 0).toFixed(1);
                healthValue = Math.round(100 - this.history[this.history.length - 1]?.cost || 100) + '%';
                break;
            case 'organizational-learning':
                stockValue = Math.round(this.stocks.knowledge);
                flowValue = (this.history[this.history.length - 1]?.learning || 0).toFixed(1);
                healthValue = Math.round(this.stocks.performance) + '%';
                break;
            default:
                stockValue = 0;
                flowValue = 0;
                healthValue = 100;
        }
        
        $('#stockLevel').text(stockValue);
        $('#flowRate').text(flowValue);
        $('#systemHealth').text(typeof healthValue === 'string' ? healthValue : healthValue + '%');
    }

    updateProgress() {
        const progress = (this.currentStep / this.maxSteps) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Month ${this.currentStep} of ${this.maxSteps}`);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.history.length < 2) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        // Determine what to plot based on scenario
        let datasets = [];
        
        switch(this.currentScenario) {
            case 'supply-chain':
                datasets = [
                    {data: this.history.map(h => h.inventory), color: '#3498db', label: 'Inventory'},
                    {data: this.history.map(h => h.orders), color: '#2ecc71', label: 'Orders'},
                    {data: this.history.map(h => h.demand || 0), color: '#e74c3c', label: 'Demand'},
                    {data: this.history.map(h => h.target), color: '#f39c12', label: 'Target'}
                ];
                break;
            case 'urban-growth':
                datasets = [
                    {data: this.history.map(h => h.population / 1000), color: '#3498db', label: 'Population (k)'},
                    {data: this.history.map(h => h.migration), color: '#2ecc71', label: 'Migration'},
                    {data: this.history.map(h => h.infrastructure), color: '#e74c3c', label: 'Infrastructure'},
                    {data: this.history.map(h => h.target / 1000), color: '#f39c12', label: 'Capacity (k)'}
                ];
                break;
            case 'customer-satisfaction':
                datasets = [
                    {data: this.history.map(h => h.satisfaction), color: '#3498db', label: 'Satisfaction'},
                    {data: this.history.map(h => h.improvement * 10), color: '#2ecc71', label: 'Improvement x10'},
                    {data: this.history.map(h => h.complaints), color: '#e74c3c', label: 'Complaints'},
                    {data: this.history.map(h => h.target), color: '#f39c12', label: 'Target'}
                ];
                break;
            case 'renewable-energy':
                datasets = [
                    {data: this.history.map(h => h.renewable), color: '#3498db', label: 'Renewable %'},
                    {data: this.history.map(h => h.adoption * 10), color: '#2ecc71', label: 'Adoption x10'},
                    {data: this.history.map(h => h.cost), color: '#e74c3c', label: 'Cost'},
                    {data: this.history.map(h => h.target), color: '#f39c12', label: 'Target %'}
                ];
                break;
            case 'organizational-learning':
                datasets = [
                    {data: this.history.map(h => h.knowledge), color: '#3498db', label: 'Knowledge'},
                    {data: this.history.map(h => h.learning * 5), color: '#2ecc71', label: 'Learning x5'},
                    {data: this.history.map(h => h.performance), color: '#e74c3c', label: 'Performance'},
                    {data: this.history.map(h => h.target), color: '#f39c12', label: 'Target'}
                ];
                break;
        }
        
        // Find min/max for scaling
        const allValues = datasets.flatMap(d => d.data);
        const minValue = Math.min(...allValues) * 0.95;
        const maxValue = Math.max(...allValues) * 1.05;
        const range = maxValue - minValue;
        
        // Draw datasets
        datasets.forEach(dataset => {
            this.ctx.strokeStyle = dataset.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            dataset.data.forEach((value, index) => {
                const x = padding + (index / Math.max(dataset.data.length - 1, 1)) * graphWidth;
                const y = padding + graphHeight - ((value - minValue) / range) * graphHeight;
                
                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            
            this.ctx.stroke();
        });
        
        // Draw axes
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, padding + graphHeight);
        this.ctx.lineTo(padding + graphWidth, padding + graphHeight);
        this.ctx.stroke();
        
        // Draw grid lines
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
            const y = padding + (i / 5) * graphHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + graphWidth, y);
            this.ctx.stroke();
        }
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
    new SystemDynamicsSimulation();
});