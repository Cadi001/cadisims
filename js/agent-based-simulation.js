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

function secureRandomInt(min, max) {
    return Math.floor(secureRandom() * (max - min + 1)) + min;
}

function secureRandomFloat(min, max) {
    return secureRandom() * (max - min) + min;
}

class AgentBasedSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.maxSteps = 2000;
        this.animationSpeed = 50;
        this.currentScenario = 'crowd-evacuation';
        this.animationId = null;
        
        // Agent properties
        this.agents = [];
        this.obstacles = [];
        this.resources = [];
        this.agentCount = 50;
        this.agentSpeed = 'medium';
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        // Metrics
        this.evacuated = 0;
        this.efficiency = 0;
        this.systemMetric = 0;
        
        this.bindEvents();
        this.updateScenarioExplanation();
        
        // Initialize canvas and scenario after DOM is ready
        setTimeout(() => {
            this.setupCanvas();
            this.initializeScenario();
        }, 200);
    }

    setupCanvas() {
        // Wait a moment for CSS to be applied, then get dimensions
        setTimeout(() => {
            const canvasRect = this.canvas.getBoundingClientRect();
            this.canvasWidth = Math.max(600, canvasRect.width || 600);
            this.canvasHeight = Math.max(400, canvasRect.height || 400);
            
            // If we have agents, reinitialize the scenario to fit new dimensions
            if (this.agents.length > 0) {
                this.initializeScenario();
            }
        }, 100);
    }

    bindEvents() {
        $('#startBtn').click(() => this.startSimulation());
        $('#pauseBtn').click(() => this.pauseSimulation());
        $('#resetBtn').click(() => this.resetSimulation());
        
        $('#agentCount').on('input', (e) => {
            this.agentCount = parseInt(e.target.value);
            $('#agentCountValue').text(this.agentCount);
            this.resetSimulation();
        });
        
        $('#agentSpeed').on('change', (e) => {
            this.agentSpeed = e.target.value;
            $('#agentSpeedValue').text(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) + ' Movement');
            this.updateAgentSpeeds();
        });
        
        $('#scenarioSelect').change((e) => {
            this.currentScenario = e.target.value;
            this.resetSimulation();
            this.initializeScenario();
            this.updateScenarioExplanation();
        });
        
        $(window).resize(() => {
            this.setupCanvas();
            this.resetSimulation();
        });
    }

    updateScenarioExplanation() {
        const explanations = {
            'crowd-evacuation': {
                description: 'We simulate how people evacuate buildings during emergencies to optimize exit strategies and building design.',
                why: 'Used in: Building design, emergency planning, safety regulations. When designing safer evacuation routes and procedures.',
                realWorld: '🚨 Airports use this for terminal design, stadiums for crowd control, schools for fire drills!'
            },
            'market-trading': {
                description: 'We model how traders make buying/selling decisions based on market information and individual strategies.',
                why: 'Used in: Financial analysis, trading algorithms, market regulation. When understanding market volatility and price formation.',
                realWorld: '💹 Wall Street firms predict market crashes, regulators design trading rules, robo-advisors make investment decisions!'
            },
            'predator-prey': {
                description: 'We simulate ecosystem dynamics where predators hunt prey while prey seek resources and avoid danger.',
                why: 'Used in: Wildlife management, conservation planning, ecosystem restoration. When managing animal populations and habitats.',
                realWorld: '🦊 National parks manage wolf populations, fisheries control overfishing, conservationists restore ecosystems!'
            },
            'traffic-flow': {
                description: 'We model how vehicles navigate roads with different driving behaviors, following traffic rules and avoiding collisions.',
                why: 'Used in: Traffic engineering, autonomous vehicles, urban planning. When optimizing traffic flow and reducing congestion.',
                realWorld: '🚗 Cities optimize traffic lights, autonomous car companies test scenarios, ride-sharing apps plan routes!'
            },
            'social-media': {
                description: 'We simulate how information spreads through social networks based on user influence, interests, and connections.',
                why: 'Used in: Marketing campaigns, viral content prediction, misinformation control. When understanding information diffusion.',
                realWorld: '📱 Companies design viral marketing, social media platforms fight fake news, influencers maximize reach!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(168, 237, 234, 0.3); border-left: 3px solid #a8edea; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        this.agents = [];
        this.obstacles = [];
        this.resources = [];
        this.currentStep = 0;
        this.evacuated = 0;
        this.efficiency = 0;
        this.systemMetric = 0;
        
        switch(this.currentScenario) {
            case 'crowd-evacuation':
                this.initCrowdEvacuation();
                break;
            case 'market-trading':
                this.initMarketTrading();
                break;
            case 'predator-prey':
                this.initPredatorPrey();
                break;
            case 'traffic-flow':
                this.initTrafficFlow();
                break;
            case 'social-media':
                this.initSocialMedia();
                break;
        }
        
        this.setupScenarioParameters();
        this.updateStats();
        this.updateLegend();
        this.draw();
    }

    initCrowdEvacuation() {
        $('#metricLabel').text('Evacuated');
        
        // Create exits
        this.resources.push(
            {type: 'exit', x: this.canvasWidth - 20, y: this.canvasHeight * 0.2, width: 20, height: 60},
            {type: 'exit', x: this.canvasWidth - 20, y: this.canvasHeight * 0.8, width: 20, height: 60}
        );
        
        // Create obstacles (walls, furniture)
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: secureRandom() * (this.canvasWidth - 100) + 50,
                y: secureRandom() * (this.canvasHeight - 100) + 50,
                width: 40 + secureRandom() * 30,
                height: 20 + secureRandom() * 20
            });
        }
        
        // Create people
        for (let i = 0; i < this.agentCount; i++) {
            let x, y;
            do {
                x = secureRandom() * (this.canvasWidth - 100) + 50;
                y = secureRandom() * (this.canvasHeight - 100) + 50;
            } while (this.isPositionBlocked(x, y, 15));
            
            this.agents.push({
                id: i,
                type: 'person',
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                size: 8,
                state: 'normal',
                target: null,
                speed: this.getSpeedMultiplier(),
                evacuated: false
            });
        }
    }

    initMarketTrading() {
        $('#metricLabel').text('Trades Made');
        
        // Create trading zones
        this.resources.push(
            {type: 'market', x: this.canvasWidth * 0.5, y: this.canvasHeight * 0.5, width: 60, height: 60}
        );
        
        // Create traders
        for (let i = 0; i < this.agentCount; i++) {
            this.agents.push({
                id: i,
                type: secureRandom() < 0.5 ? 'buyer' : 'seller',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                vx: 0,
                vy: 0,
                size: 6,
                wealth: 100 + secureRandom() * 100,
                strategy: secureRandom() < 0.5 ? 'aggressive' : 'conservative',
                speed: this.getSpeedMultiplier(),
                trades: 0
            });
        }
    }

    initPredatorPrey() {
        $('#metricLabel').text('Population');
        
        // Create resources (food)
        for (let i = 0; i < 15; i++) {
            this.resources.push({
                type: 'food',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                size: 4
            });
        }
        
        const predatorCount = Math.floor(this.agentCount * 0.2);
        const preyCount = this.agentCount - predatorCount;
        
        // Create predators
        for (let i = 0; i < predatorCount; i++) {
            this.agents.push({
                id: i,
                type: 'predator',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                vx: 0,
                vy: 0,
                size: 10,
                energy: 100,
                speed: this.getSpeedMultiplier() * 0.8,
                huntTarget: null
            });
        }
        
        // Create prey
        for (let i = 0; i < preyCount; i++) {
            this.agents.push({
                id: i + predatorCount,
                type: 'prey',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                vx: 0,
                vy: 0,
                size: 6,
                energy: 80,
                speed: this.getSpeedMultiplier(),
                fleeFrom: null
            });
        }
    }

    initTrafficFlow() {
        $('#metricLabel').text('Traffic Flow');
        
        // Create road obstacles
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                width: 30,
                height: 15
            });
        }
        
        // Create cars
        for (let i = 0; i < this.agentCount; i++) {
            this.agents.push({
                id: i,
                type: 'car',
                x: secureRandom() * 50,
                y: secureRandom() * this.canvasHeight,
                vx: 0,
                vy: 0,
                size: 8,
                speed: this.getSpeedMultiplier() * (0.8 + secureRandom() * 0.4),
                destination: {x: this.canvasWidth - 30, y: secureRandom() * this.canvasHeight},
                behavior: secureRandom() < 0.3 ? 'aggressive' : 'normal'
            });
        }
    }

    initSocialMedia() {
        $('#metricLabel').text('Influenced');
        
        // Create agents with different influence levels
        for (let i = 0; i < this.agentCount; i++) {
            const influence = secureRandom();
            this.agents.push({
                id: i,
                type: 'person',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                vx: 0,
                vy: 0,
                size: 4 + influence * 8,
                influence: influence,
                informed: i < 3, // Start with a few informed agents
                speed: this.getSpeedMultiplier(),
                connections: []
            });
        }
        
        // Create connections between agents
        this.agents.forEach(agent => {
            const connectionCount = Math.floor(secureRandom() * 8) + 2;
            for (let i = 0; i < connectionCount; i++) {
                const otherAgent = this.agents[Math.floor(secureRandom() * this.agents.length)];
                if (otherAgent.id !== agent.id && !agent.connections.includes(otherAgent.id)) {
                    agent.connections.push(otherAgent.id);
                }
            }
        });
    }

    setupScenarioParameters() {
        const scenarioParams = {
            'crowd-evacuation': `
                <div class="mb-3">
                    <label class="form-label">Panic Level: <span id="panicValue">Low</span></label>
                    <select class="form-select" id="panicSelect">
                        <option value="low" selected>Low Panic</option>
                        <option value="medium">Medium Panic</option>
                        <option value="high">High Panic</option>
                    </select>
                    <small class="text-muted">😰 Higher panic = more erratic movement</small>
                </div>
            `,
            'market-trading': `
                <div class="mb-3">
                    <label class="form-label">Market Volatility: <span id="volatilityValue">Medium</span></label>
                    <select class="form-select" id="volatilitySelect">
                        <option value="low">Low Volatility</option>
                        <option value="medium" selected>Medium Volatility</option>
                        <option value="high">High Volatility</option>
                    </select>
                    <small class="text-muted">📈 Affects trading frequency and decisions</small>
                </div>
            `,
            'predator-prey': `
                <div class="mb-3">
                    <label class="form-label">Food Abundance: <span id="foodValue">Medium</span></label>
                    <select class="form-select" id="foodSelect">
                        <option value="low">Scarce Food</option>
                        <option value="medium" selected>Medium Food</option>
                        <option value="high">Abundant Food</option>
                    </select>
                    <small class="text-muted">🌱 More food = higher prey survival</small>
                </div>
            `,
            'traffic-flow': `
                <div class="mb-3">
                    <label class="form-label">Road Conditions: <span id="roadValue">Normal</span></label>
                    <select class="form-select" id="roadSelect">
                        <option value="poor">Poor Conditions</option>
                        <option value="normal" selected>Normal Conditions</option>
                        <option value="good">Good Conditions</option>
                    </select>
                    <small class="text-muted">🛣️ Affects vehicle speed and behavior</small>
                </div>
            `,
            'social-media': `
                <div class="mb-3">
                    <label class="form-label">Content Type: <span id="contentValue">Neutral</span></label>
                    <select class="form-select" id="contentSelect">
                        <option value="boring">Boring Content</option>
                        <option value="neutral" selected>Neutral Content</option>
                        <option value="viral">Viral Content</option>
                    </select>
                    <small class="text-muted">🔥 Viral content spreads faster</small>
                </div>
            `
        };
        
        $('#scenarioSpecificParams').html(scenarioParams[this.currentScenario]);
        this.bindScenarioEvents();
    }

    bindScenarioEvents() {
        $('#panicSelect, #volatilitySelect, #foodSelect, #roadSelect, #contentSelect').on('change', (e) => {
            const id = e.target.id;
            const value = e.target.value;
            const labels = {
                'panicSelect': {'low': 'Low Panic', 'medium': 'Medium Panic', 'high': 'High Panic'},
                'volatilitySelect': {'low': 'Low Volatility', 'medium': 'Medium Volatility', 'high': 'High Volatility'},
                'foodSelect': {'low': 'Scarce Food', 'medium': 'Medium Food', 'high': 'Abundant Food'},
                'roadSelect': {'poor': 'Poor Conditions', 'normal': 'Normal Conditions', 'good': 'Good Conditions'},
                'contentSelect': {'boring': 'Boring Content', 'neutral': 'Neutral Content', 'viral': 'Viral Content'}
            };
            
            if (labels[id]) {
                const targetId = id.replace('Select', 'Value');
                $(`#${targetId}`).text(labels[id][value]);
            }
        });
    }

    updateLegend() {
        const legends = {
            'crowd-evacuation': `
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#3498db;border-radius:50%;"></span> Person</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#e74c3c;border-radius:50%;"></span> Panicked</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#27ae60;border-radius:50%;"></span> Evacuated</small>
            `,
            'market-trading': `
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#1abc9c;border-radius:50%;"></span> Buyer</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#e67e22;border-radius:50%;"></span> Seller</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#2ecc71;border-radius:4px;"></span> Market</small>
            `,
            'predator-prey': `
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#8e44ad;border-radius:50%;"></span> Predator</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#f39c12;border-radius:50%;"></span> Prey</small>
                <small class="me-3"><span style="width:8px;height:8px;display:inline-block;background:#2ecc71;border-radius:50%;"></span> Food</small>
            `,
            'traffic-flow': `
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#2c3e50;border-radius:50%;"></span> Vehicle</small>
                <small class="me-3"><span style="width:12px;height:8px;display:inline-block;background:#95a5a6;border-radius:2px;"></span> Obstacle</small>
            `,
            'social-media': `
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#3498db;border-radius:50%;"></span> User</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#e74c3c;border-radius:50%;"></span> Informed</small>
                <small class="me-3"><span style="width:12px;height:12px;display:inline-block;background:#27ae60;border-radius:50%;"></span> Influencer</small>
            `
        };
        
        $('#legendContainer').html(legends[this.currentScenario]);
    }

    getSpeedMultiplier() {
        const speeds = {'slow': 0.5, 'medium': 1.0, 'fast': 1.5};
        return speeds[this.agentSpeed];
    }

    updateAgentSpeeds() {
        const multiplier = this.getSpeedMultiplier();
        this.agents.forEach(agent => {
            agent.speed = multiplier * (agent.originalSpeed || 1);
        });
    }

    isPositionBlocked(x, y, size) {
        return this.obstacles.some(obs => 
            x + size > obs.x && x - size < obs.x + obs.width &&
            y + size > obs.y && y - size < obs.y + obs.height
        );
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
            case 'crowd-evacuation':
                this.performEvacuationStep();
                break;
            case 'market-trading':
                this.performTradingStep();
                break;
            case 'predator-prey':
                this.performEcosystemStep();
                break;
            case 'traffic-flow':
                this.performTrafficStep();
                break;
            case 'social-media':
                this.performSocialStep();
                break;
        }
    }

    performEvacuationStep() {
        // Get current panic level from UI
        const panicLevel = $('#panicSelect').val() || 'low';
        const panicMultipliers = {
            'low': { speed: 1.0, randomness: 0.1 },
            'medium': { speed: 1.3, randomness: 0.3 },
            'high': { speed: 1.6, randomness: 0.6 }
        };
        const panicModifier = panicMultipliers[panicLevel];
        
        this.agents.forEach(agent => {
            if (agent.evacuated) return;
            
            // Find nearest exit
            let nearestExit = null;
            let minDistance = Infinity;
            this.resources.forEach(exit => {
                const distance = Math.sqrt((agent.x - exit.x) ** 2 + (agent.y - exit.y) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestExit = exit;
                }
            });
            
            // Move towards exit
            if (nearestExit) {
                const dx = nearestExit.x - agent.x;
                const dy = nearestExit.y - agent.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 25) {
                    agent.evacuated = true;
                    this.evacuated++;
                } else {
                    // Apply panic effects
                    let moveX = (dx / distance) * agent.speed * panicModifier.speed;
                    let moveY = (dy / distance) * agent.speed * panicModifier.speed;
                    
                    // Add random movement based on panic level
                    if (secureRandom() < panicModifier.randomness) {
                        moveX += (secureRandom() - 0.5) * 4;
                        moveY += (secureRandom() - 0.5) * 4;
                    }
                    
                    agent.vx = moveX;
                    agent.vy = moveY;
                    
                    // Avoid obstacles
                    this.avoidObstacles(agent);
                    
                    // Update position
                    agent.x += agent.vx;
                    agent.y += agent.vy;
                    
                    // Keep agents within bounds
                    agent.x = Math.max(agent.size, Math.min(this.canvasWidth - agent.size, agent.x));
                    agent.y = Math.max(agent.size, Math.min(this.canvasHeight - agent.size, agent.y));
                    
                    // Update agent state for visual feedback
                    agent.state = panicLevel === 'high' ? 'panicked' : 'normal';
                }
            }
        });
    }

    performTradingStep() {
        // Get current volatility level from UI
        const volatilityLevel = $('#volatilitySelect').val() || 'medium';
        const volatilitySettings = {
            'low': { tradeFreq: 0.02, movementSpeed: 0.3 },
            'medium': { tradeFreq: 0.05, movementSpeed: 0.5 },
            'high': { tradeFreq: 0.1, movementSpeed: 0.8 }
        };
        const volatility = volatilitySettings[volatilityLevel];
        
        this.agents.forEach(agent => {
            // Move towards market center
            const market = this.resources[0];
            const dx = market.x - agent.x;
            const dy = market.y - agent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 50) {
                agent.vx = (dx / distance) * agent.speed * volatility.movementSpeed;
                agent.vy = (dy / distance) * agent.speed * volatility.movementSpeed;
                agent.x += agent.vx;
                agent.y += agent.vy;
                
                // Keep agents within bounds
                agent.x = Math.max(agent.size, Math.min(this.canvasWidth - agent.size, agent.x));
                agent.y = Math.max(agent.size, Math.min(this.canvasHeight - agent.size, agent.y));
            } else {
                // Execute trades with nearby agents (affected by volatility)
                this.agents.forEach(other => {
                    if (other.id !== agent.id && agent.type !== other.type) {
                        const dist = Math.sqrt((agent.x - other.x) ** 2 + (agent.y - other.y) ** 2);
                        if (dist < 20 && secureRandom() < volatility.tradeFreq) {
                            agent.trades = (agent.trades || 0) + 1;
                            other.trades = (other.trades || 0) + 1;
                            this.systemMetric++;
                        }
                    }
                });
            }
        });
    }

    performEcosystemStep() {
        // Get current food abundance level from UI
        const foodLevel = $('#foodSelect').val() || 'medium';
        const foodSettings = {
            'low': { energyGain: 15, spawnRate: 0.005 },
            'medium': { energyGain: 20, spawnRate: 0.01 },
            'high': { energyGain: 30, spawnRate: 0.02 }
        };
        const foodConfig = foodSettings[foodLevel];
        
        // Spawn new food based on abundance level
        if (secureRandom() < foodConfig.spawnRate && this.resources.length < 20) {
            this.resources.push({
                type: 'food',
                x: secureRandom() * this.canvasWidth,
                y: secureRandom() * this.canvasHeight,
                size: 4
            });
        }
        
        this.agents.forEach(agent => {
            if (agent.type === 'predator') {
                // Hunt prey
                let nearestPrey = null;
                let minDistance = Infinity;
                this.agents.filter(a => a.type === 'prey').forEach(prey => {
                    const distance = Math.sqrt((agent.x - prey.x) ** 2 + (agent.y - prey.y) ** 2);
                    if (distance < minDistance && distance < 100) {
                        minDistance = distance;
                        nearestPrey = prey;
                    }
                });
                
                if (nearestPrey) {
                    const dx = nearestPrey.x - agent.x;
                    const dy = nearestPrey.y - agent.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 15) {
                        // Catch prey
                        nearestPrey.energy = 0;
                        agent.energy += 50;
                    } else {
                        agent.vx = (dx / distance) * agent.speed;
                        agent.vy = (dy / distance) * agent.speed;
                    }
                }
            } else if (agent.type === 'prey') {
                // Flee from predators and seek food
                let nearestPredator = null;
                let minPredatorDistance = Infinity;
                this.agents.filter(a => a.type === 'predator').forEach(predator => {
                    const distance = Math.sqrt((agent.x - predator.x) ** 2 + (agent.y - predator.y) ** 2);
                    if (distance < minPredatorDistance && distance < 80) {
                        minPredatorDistance = distance;
                        nearestPredator = predator;
                    }
                });
                
                if (nearestPredator) {
                    // Flee from predator
                    const dx = agent.x - nearestPredator.x;
                    const dy = agent.y - nearestPredator.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    agent.vx = (dx / distance) * agent.speed;
                    agent.vy = (dy / distance) * agent.speed;
                } else {
                    // Seek food
                    let nearestFood = null;
                    let minFoodDistance = Infinity;
                    this.resources.forEach(food => {
                        const distance = Math.sqrt((agent.x - food.x) ** 2 + (agent.y - food.y) ** 2);
                        if (distance < minFoodDistance) {
                            minFoodDistance = distance;
                            nearestFood = food;
                        }
                    });
                    
                    if (nearestFood && minFoodDistance < 15) {
                        agent.energy += foodConfig.energyGain;
                        this.resources = this.resources.filter(f => f !== nearestFood);
                    } else if (nearestFood) {
                        const dx = nearestFood.x - agent.x;
                        const dy = nearestFood.y - agent.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        agent.vx = (dx / distance) * agent.speed * 0.5;
                        agent.vy = (dy / distance) * agent.speed * 0.5;
                    }
                }
            }
            
            // Update positions and energy
            agent.x += agent.vx || 0;
            agent.y += agent.vy || 0;
            agent.energy = Math.max(0, (agent.energy || 100) - 0.1);
            
            // Keep agents in bounds
            agent.x = Math.max(agent.size, Math.min(this.canvasWidth - agent.size, agent.x));
            agent.y = Math.max(agent.size, Math.min(this.canvasHeight - agent.size, agent.y));
        });
        
        // Remove dead agents
        this.agents = this.agents.filter(agent => agent.energy > 0);
        this.systemMetric = this.agents.length;
    }

    performTrafficStep() {
        // Get current road conditions from UI
        const roadCondition = $('#roadSelect').val() || 'normal';
        const roadSettings = {
            'poor': { speedMultiplier: 0.6, avoidanceRadius: 35 },
            'normal': { speedMultiplier: 1.0, avoidanceRadius: 25 },
            'good': { speedMultiplier: 1.4, avoidanceRadius: 20 }
        };
        const roadConfig = roadSettings[roadCondition];
        
        this.agents.forEach(agent => {
            const dx = agent.destination.x - agent.x;
            const dy = agent.destination.y - agent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 20) {
                agent.vx = (dx / distance) * agent.speed * roadConfig.speedMultiplier;
                agent.vy = (dy / distance) * agent.speed * roadConfig.speedMultiplier;
                
                // Avoid other cars
                this.agents.forEach(other => {
                    if (other.id !== agent.id) {
                        const dist = Math.sqrt((agent.x - other.x) ** 2 + (agent.y - other.y) ** 2);
                        if (dist < roadConfig.avoidanceRadius) {
                            const avoidX = agent.x - other.x;
                            const avoidY = agent.y - other.y;
                            const avoidDist = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                            agent.vx += (avoidX / avoidDist) * 0.5;
                            agent.vy += (avoidY / avoidDist) * 0.5;
                        }
                    }
                });
                
                this.avoidObstacles(agent);
                agent.x += agent.vx;
                agent.y += agent.vy;
                
                // Keep agents within bounds
                agent.x = Math.max(agent.size, Math.min(this.canvasWidth - agent.size, agent.x));
                agent.y = Math.max(agent.size, Math.min(this.canvasHeight - agent.size, agent.y));
            } else {
                this.systemMetric++;
                // Reset to start
                agent.x = secureRandom() * 50;
                agent.y = secureRandom() * this.canvasHeight;
                agent.destination = {x: this.canvasWidth - 30, y: secureRandom() * this.canvasHeight};
            }
        });
    }

    performSocialStep() {
        // Get current content type from UI
        const contentType = $('#contentSelect').val() || 'neutral';
        const contentSettings = {
            'boring': { spreadRate: 0.02, reachMultiplier: 0.5 },
            'neutral': { spreadRate: 0.1, reachMultiplier: 1.0 },
            'viral': { spreadRate: 0.25, reachMultiplier: 2.0 }
        };
        const contentConfig = contentSettings[contentType];
        
        this.agents.forEach(agent => {
            // Random movement
            agent.x += (secureRandom() - 0.5) * agent.speed;
            agent.y += (secureRandom() - 0.5) * agent.speed;
            
            // Keep in bounds
            agent.x = Math.max(agent.size, Math.min(this.canvasWidth - agent.size, agent.x));
            agent.y = Math.max(agent.size, Math.min(this.canvasHeight - agent.size, agent.y));
            
            // Spread information (affected by content type)
            if (agent.informed) {
                agent.connections.forEach(connId => {
                    const connected = this.agents.find(a => a.id === connId);
                    if (connected && !connected.informed && secureRandom() < agent.influence * contentConfig.spreadRate * contentConfig.reachMultiplier) {
                        connected.informed = true;
                        this.systemMetric++;
                    }
                });
            }
        });
    }

    avoidObstacles(agent) {
        this.obstacles.forEach(obstacle => {
            const dx = agent.x - (obstacle.x + obstacle.width / 2);
            const dy = agent.y - (obstacle.y + obstacle.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                agent.vx += (dx / distance) * 0.5;
                agent.vy += (dy / distance) * 0.5;
            }
        });
    }

    updateStats() {
        const activeAgents = this.agents.filter(a => !a.evacuated).length;
        $('#activeAgents').text(activeAgents);
        $('#systemMetric').text(this.systemMetric);
        
        let efficiency = 0;
        switch(this.currentScenario) {
            case 'crowd-evacuation':
                efficiency = (this.evacuated / this.agentCount) * 100;
                break;
            case 'market-trading':
                efficiency = Math.min(100, (this.systemMetric / this.agentCount) * 10);
                break;
            case 'predator-prey':
                efficiency = (this.agents.length / this.agentCount) * 100;
                break;
            default:
                efficiency = Math.min(100, this.currentStep / 20);
        }
        $('#efficiency').text(Math.round(efficiency) + '%');
    }

    updateProgress() {
        const progress = (this.currentStep / this.maxSteps) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Step: ${this.currentStep} / ${this.maxSteps}`);
    }

    draw() {
        const canvas = $('#simulationCanvas');
        canvas.empty();
        
        // Draw resources
        this.resources.forEach(resource => {
            let element;
            if (resource.type === 'exit') {
                element = $('<div class="resource"></div>').css({
                    left: resource.x + 'px',
                    top: resource.y + 'px',
                    width: resource.width + 'px',
                    height: resource.height + 'px',
                    background: '#27ae60'
                });
            } else if (resource.type === 'market') {
                element = $('<div class="resource"></div>').css({
                    left: resource.x + 'px',
                    top: resource.y + 'px',
                    width: resource.width + 'px',
                    height: resource.height + 'px',
                    background: '#2ecc71',
                    borderRadius: '8px'
                });
            } else {
                element = $('<div class="resource"></div>').css({
                    left: resource.x + 'px',
                    top: resource.y + 'px',
                    width: (resource.size * 2) + 'px',
                    height: (resource.size * 2) + 'px'
                });
            }
            canvas.append(element);
        });
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            const element = $('<div class="obstacle"></div>').css({
                left: obstacle.x + 'px',
                top: obstacle.y + 'px',
                width: obstacle.width + 'px',
                height: obstacle.height + 'px'
            });
            canvas.append(element);
        });
        
        // Draw agents
        this.agents.forEach(agent => {
            if (agent.evacuated) return;
            
            let className = 'agent agent-' + agent.type;
            let displayText = '';
            
            // Special states
            if (agent.type === 'person' && agent.state === 'panicked') className += ' agent-panicked';
            if (agent.type === 'person' && agent.informed) className += ' agent-infected';
            if (agent.energy && agent.energy < 30) className += ' agent-infected';
            
            const element = $(`<div class="${className}">${displayText}</div>`).css({
                left: (agent.x - agent.size) + 'px',
                top: (agent.y - agent.size) + 'px',
                width: (agent.size * 2) + 'px',
                height: (agent.size * 2) + 'px'
            });
            canvas.append(element);
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
    new AgentBasedSimulation();
});