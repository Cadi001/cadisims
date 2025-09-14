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

function secureRandomFloat(min, max) {
    return secureRandom() * (max - min) + min;
}

class DiscreteEventSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.maxTime = 480; // 8 hours in minutes
        this.animationSpeed = 50;
        this.currentScenario = 'hospital-emergency';
        this.animationId = null;
        
        // Event queue (priority queue)
        this.eventQueue = [];
        this.entities = [];
        this.servers = [];
        this.statistics = {
            entitiesProcessed: 0,
            totalWaitTime: 0,
            totalServiceTime: 0,
            queueLengthHistory: [],
            utilizationHistory: []
        };
        
        // Parameters
        this.arrivalRate = 5; // per hour
        this.serviceTime = 10; // minutes
        this.numServers = 2;
        
        // Entity counter
        this.entityCounter = 0;
        
        this.bindEvents();
        this.initializeScenario();
        this.updateScenarioExplanation();
    }

    bindEvents() {
        $('#startBtn').click(() => this.startSimulation());
        $('#pauseBtn').click(() => this.pauseSimulation());
        $('#resetBtn').click(() => this.resetSimulation());
        
        $('#arrivalRate').on('input', (e) => {
            this.arrivalRate = parseInt(e.target.value);
            $('#arrivalRateValue').text(this.arrivalRate + '/hour');
        });
        
        $('#serviceTime').on('input', (e) => {
            this.serviceTime = parseInt(e.target.value);
            $('#serviceTimeValue').text(this.serviceTime + ' min');
        });
        
        $('#numServers').on('input', (e) => {
            this.numServers = parseInt(e.target.value);
            $('#numServersValue').text(this.numServers);
            this.resetSimulation();
        });
        
        $('#scenarioSelect').change((e) => {
            this.currentScenario = e.target.value;
            this.resetSimulation();
            this.updateScenarioExplanation();
            this.setupScenarioParameters(); // Ensure parameters are set up after scenario change
        });
    }

    updateScenarioExplanation() {
        const explanations = {
            'hospital-emergency': {
                description: 'We track patient arrivals, triage assessments, treatment events, and discharges to optimize emergency room efficiency.',
                why: 'Used in: Healthcare operations, capacity planning, staff scheduling. When optimizing patient flow and reducing wait times.',
                realWorld: '🏥 Mayo Clinic optimizes ER flow, NHS reduces patient wait times, hospitals improve bed utilization!'
            },
            'manufacturing': {
                description: 'We simulate production events like machine starts, processing completion, breakdowns, and repairs in a manufacturing line.',
                why: 'Used in: Production planning, quality control, maintenance scheduling. When optimizing throughput and minimizing downtime.',
                realWorld: '🏭 Toyota optimizes assembly lines, Intel improves chip production, Boeing schedules aircraft manufacturing!'
            },
            'call-center': {
                description: 'We model customer call arrivals, agent assignments, call handling, and call completion events.',
                why: 'Used in: Customer service optimization, staffing decisions, performance measurement. When improving service levels.',
                realWorld: '📞 Amazon customer service, bank call centers, tech support operations optimize agent scheduling!'
            },
            'airport-security': {
                description: 'We simulate passenger arrivals, security line processing, screening events, and checkpoint throughput.',
                why: 'Used in: Airport operations, security planning, passenger experience. When reducing wait times and improving security.',
                realWorld: '✈️ TSA optimizes checkpoint flow, airports reduce passenger wait times, airlines improve boarding!'
            },
            'drive-through': {
                description: 'We track vehicle arrivals, order taking, food preparation, and service completion events at drive-through restaurants.',
                why: 'Used in: Restaurant operations, service optimization, customer satisfaction. When reducing service times and queues.',
                realWorld: '🍔 McDonald\'s optimizes drive-through flow, Starbucks improves order processing, fast food chains reduce wait times!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(240, 147, 251, 0.1); border-left: 3px solid #f093fb; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        // This method is now used only for initial setup on page load
        this.eventQueue = [];
        this.entities = [];
        this.servers = [];
        this.statistics = {
            entitiesProcessed: 0,
            totalWaitTime: 0,
            totalServiceTime: 0,
            queueLengthHistory: [],
            utilizationHistory: []
        };
        this.currentTime = 0;
        this.entityCounter = 0;
        
        // Initialize servers
        for (let i = 0; i < this.numServers; i++) {
            this.servers.push({
                id: i,
                busy: false,
                currentEntity: null,
                totalServiceTime: 0
            });
        }
        
        this.setupScenarioParameters();
        this.scheduleInitialEvents();
        this.updateStats();
        this.updateServersDisplay();
        this.draw();
    }

    setupScenarioParameters() {
        const scenarioParams = {
            'hospital-emergency': `
                <div class="mb-3">
                    <label class="form-label">Triage Priority: <span id="triagePriorityValue">Standard</span></label>
                    <select class="form-select" id="triagePrioritySelect">
                        <option value="emergency">Emergency Priority</option>
                        <option value="standard" selected>Standard Triage</option>
                        <option value="routine">Routine Care</option>
                    </select>
                    <small class="text-muted">🚨 Patient urgency levels</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Complexity Mix: <span id="complexityValue">50% Complex</span></label>
                    <input type="range" class="form-range" id="complexitySlider" min="10" max="90" value="50" step="10">
                    <small class="text-muted">🧠 Percentage of complex cases</small>
                </div>
            `,
            'manufacturing': `
                <div class="mb-3">
                    <label class="form-label">Machine Reliability: <span id="reliabilityValue">90%</span></label>
                    <input type="range" class="form-range" id="reliabilitySlider" min="70" max="99" value="90" step="5">
                    <small class="text-muted">⚙️ Percentage uptime</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Quality Control: <span id="qualityValue">Standard</span></label>
                    <select class="form-select" id="qualitySelect">
                        <option value="minimal">Minimal QC</option>
                        <option value="standard" selected>Standard QC</option>
                        <option value="strict">Strict QC</option>
                    </select>
                    <small class="text-muted">🔍 Quality inspection level</small>
                </div>
            `,
            'call-center': `
                <div class="mb-3">
                    <label class="form-label">Call Complexity: <span id="callComplexityValue">Medium</span></label>
                    <select class="form-select" id="callComplexitySelect">
                        <option value="simple">Simple Inquiries</option>
                        <option value="medium" selected>Mixed Complexity</option>
                        <option value="complex">Complex Issues</option>
                    </select>
                    <small class="text-muted">🤔 Average call difficulty</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Agent Experience: <span id="experienceValue">Medium</span></label>
                    <select class="form-select" id="experienceSelect">
                        <option value="junior">Junior Agents</option>
                        <option value="medium" selected>Mixed Experience</option>
                        <option value="senior">Senior Agents</option>
                    </select>
                    <small class="text-muted">👩‍💼 Agent skill level</small>
                </div>
            `,
            'airport-security': `
                <div class="mb-3">
                    <label class="form-label">Security Level: <span id="securityLevelValue">Standard</span></label>
                    <select class="form-select" id="securityLevelSelect">
                        <option value="low">Basic Screening</option>
                        <option value="standard" selected>Standard Security</option>
                        <option value="high">High Security</option>
                    </select>
                    <small class="text-muted">🔒 Screening intensity</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Bag Check Rate: <span id="bagCheckValue">15%</span></label>
                    <input type="range" class="form-range" id="bagCheckSlider" min="5" max="30" value="15" step="5">
                    <small class="text-muted">🎒 Percentage requiring additional screening</small>
                </div>
            `,
            'drive-through': `
                <div class="mb-3">
                    <label class="form-label">Order Complexity: <span id="orderComplexityValue">Medium</span></label>
                    <select class="form-select" id="orderComplexitySelect">
                        <option value="simple">Simple Orders</option>
                        <option value="medium" selected>Mixed Orders</option>
                        <option value="complex">Complex Orders</option>
                    </select>
                    <small class="text-muted">🍔 Average order size/complexity</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Peak Time Factor: <span id="peakFactorValue">1.5x</span></label>
                    <input type="range" class="form-range" id="peakFactorSlider" min="1.0" max="3.0" value="1.5" step="0.5">
                    <small class="text-muted">📈 Rush hour multiplier</small>
                </div>
            `
        };
        
        $('#scenarioSpecificParams').html(scenarioParams[this.currentScenario]);
        this.bindScenarioEvents();
        
        // Update labels based on scenario
        const labels = {
            'hospital-emergency': 'Patients',
            'manufacturing': 'Products',
            'call-center': 'Calls',
            'airport-security': 'Passengers',
            'drive-through': 'Orders'
        };
        $('#processedLabel').text(labels[this.currentScenario]);
        
        // Schedule initial events for the scenario
        this.scheduleInitialEvents();
    }

    bindScenarioEvents() {
        // Remove any existing event handlers to prevent duplicates
        $('#scenarioSpecificParams').off('input change');
        
        // Use event delegation to handle dynamically created elements
        $('#scenarioSpecificParams').on('input change', 'select, input', (e) => {
            const id = e.target.id;
            const value = e.target.value;
            
            // Update display values
            if (id.includes('Slider')) {
                const targetId = id.replace('Slider', 'Value');
                if (id.includes('Rate') || id.includes('reliability') || id.includes('complexity') || id.includes('bagCheck')) {
                    $(`#${targetId}`).text(value + '%');
                } else if (id.includes('Factor') || id.includes('peak') || id.includes('Peak')) {
                    $(`#${targetId}`).text(value + 'x');
                } else {
                    $(`#${targetId}`).text(value);
                }
            } else if (id.includes('Select')) {
                const targetId = id.replace('Select', 'Value');
                const labels = {
                    'triagePrioritySelect': {'emergency': 'Emergency Priority', 'standard': 'Standard Triage', 'routine': 'Routine Care'},
                    'qualitySelect': {'minimal': 'Minimal QC', 'standard': 'Standard QC', 'strict': 'Strict QC'},
                    'callComplexitySelect': {'simple': 'Simple Inquiries', 'medium': 'Mixed Complexity', 'complex': 'Complex Issues'},
                    'experienceSelect': {'junior': 'Junior Agents', 'medium': 'Mixed Experience', 'senior': 'Senior Agents'},
                    'securityLevelSelect': {'low': 'Basic Screening', 'standard': 'Standard Security', 'high': 'High Security'},
                    'orderComplexitySelect': {'simple': 'Simple Orders', 'medium': 'Mixed Orders', 'complex': 'Complex Orders'}
                };
                if (labels[id]) {
                    $(`#${targetId}`).text(labels[id][value]);
                }
            }
        });
    }

    scheduleInitialEvents() {
        // Schedule first arrival
        const interArrivalTime = this.generateInterArrivalTime();
        console.log(`Scheduling first arrival at time: ${this.currentTime + interArrivalTime}`);
        this.scheduleEvent('arrival', this.currentTime + interArrivalTime);
        
        // Schedule potential system events based on scenario
        if (this.currentScenario === 'manufacturing') {
            // Schedule potential machine breakdowns
            this.scheduleEvent('breakdown', this.currentTime + this.generateBreakdownTime());
        }
        
        console.log(`Event queue length after initial scheduling: ${this.eventQueue.length}`);
    }

    generateInterArrivalTime() {
        // Exponential distribution for arrivals
        const rate = this.arrivalRate / 60; // Convert to per minute
        return -Math.log(secureRandom()) / rate;
    }

    generateServiceTime(entity = null) {
        // Service time based on scenario and entity properties
        let baseTime = this.serviceTime;
        
        // Add variability based on scenario
        switch(this.currentScenario) {
            case 'hospital-emergency':
                const complexity = parseInt($('#complexitySlider').val() || 50) / 100;
                if (secureRandom() < complexity) {
                    baseTime *= 2; // Complex cases take longer
                }
                break;
            case 'manufacturing':
                const quality = $('#qualitySelect').val();
                const qualityMultipliers = {'minimal': 0.8, 'standard': 1.0, 'strict': 1.3};
                baseTime *= qualityMultipliers[quality] || 1.0;
                break;
            case 'call-center':
                const callComplexity = $('#callComplexitySelect').val();
                const experience = $('#experienceSelect').val();
                const complexityMultipliers = {'simple': 0.7, 'medium': 1.0, 'complex': 1.5};
                const experienceMultipliers = {'junior': 1.3, 'medium': 1.0, 'senior': 0.8};
                baseTime *= complexityMultipliers[callComplexity] * experienceMultipliers[experience];
                break;
            case 'airport-security':
                const bagCheckRate = parseInt($('#bagCheckSlider').val() || 15) / 100;
                if (secureRandom() < bagCheckRate) {
                    baseTime *= 2; // Additional screening
                }
                break;
            case 'drive-through':
                const orderComplexity = $('#orderComplexitySelect').val();
                const peakFactor = parseFloat($('#peakFactorSlider').val() || 1.5);
                const orderMultipliers = {'simple': 0.6, 'medium': 1.0, 'complex': 1.8};
                baseTime *= orderMultipliers[orderComplexity] * peakFactor;
                break;
        }
        
        // Add randomness (exponential distribution)
        return baseTime * (-Math.log(secureRandom()));
    }

    generateBreakdownTime() {
        const reliability = parseInt($('#reliabilitySlider').val() || 90) / 100;
        const mtbf = 120 / (1 - reliability); // Mean time between failures
        return mtbf * (-Math.log(secureRandom()));
    }

    scheduleEvent(type, time, entity = null, server = null) {
        const event = {
            type: type,
            time: time,
            entity: entity,
            server: server
        };
        
        // Insert event in chronological order
        let inserted = false;
        for (let i = 0; i < this.eventQueue.length; i++) {
            if (event.time < this.eventQueue[i].time) {
                this.eventQueue.splice(i, 0, event);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.eventQueue.push(event);
        }
        
        this.addEventToTimeline(event);
    }

    addEventToTimeline(event) {
        const timeline = $('#eventTimeline');
        const timelineWidth = timeline.width();
        const position = (event.time / this.maxTime) * timelineWidth;
        
        if (position <= timelineWidth) {
            const marker = $(`<div class="event-marker event-${event.type}" title="${event.type} at ${this.formatTime(event.time)}"></div>`);
            marker.css('left', position + 'px');
            timeline.append(marker);
        }
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
        
        $('#startBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        $('#progressBar').css('width', '0%');
        $('#progressText').text('Ready to start simulation...');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clear timeline
        $('#eventTimeline').empty().append('<div class="current-time-marker" id="currentTimeMarker" style="left: 0px;"></div>');
        
        // Reset all simulation state
        this.eventQueue = [];
        this.entities = [];
        this.statistics = {
            entitiesProcessed: 0,
            totalWaitTime: 0,
            totalServiceTime: 0,
            queueLengthHistory: [],
            utilizationHistory: []
        };
        this.currentTime = 0;
        this.entityCounter = 0;
        
        // Reinitialize servers
        this.servers = [];
        for (let i = 0; i < this.numServers; i++) {
            this.servers.push({
                id: i,
                busy: false,
                currentEntity: null,
                totalServiceTime: 0
            });
        }
        
        // Reschedule initial events after reset
        this.scheduleInitialEvents();
        this.updateStats();
        this.updateServersDisplay();
        this.draw();
    }

    runSimulation() {
        if (!this.isRunning || this.isPaused) return;
        
        console.log(`Running simulation at time: ${this.currentTime}, Queue length: ${this.eventQueue.length}`);
        
        // Process events - advance time by small increments to show animation
        let eventsProcessed = false;
        
        // Process all events that occur at current time or slightly in the future
        while (this.eventQueue.length > 0 && this.eventQueue[0].time <= this.currentTime + 0.1) {
            const event = this.eventQueue.shift();
            console.log(`Processing event: ${event.type} at time ${event.time}`);
            this.currentTime = event.time;
            this.processEvent(event);
            eventsProcessed = true;
        }
        
        // Advance time even if no events occurred (for animation)
        if (!eventsProcessed) {
            this.currentTime += 0.5; // Small time increment for smooth animation
        }
        
        // Update display
        this.updateStats();
        this.updateTimeline();
        this.draw();
        this.updateProgress();
        
        // Continue simulation if within time limit and not ended
        const shouldContinue = this.currentTime < this.maxTime && (this.eventQueue.length > 0 || this.entities.length > 0 || this.servers.some(s => s.busy));
        console.log(`Should continue: ${shouldContinue}, Time: ${this.currentTime}/${this.maxTime}, Queue: ${this.eventQueue.length}, Entities: ${this.entities.length}`);
        
        if (shouldContinue) {
            this.animationId = requestAnimationFrame(() => {
                setTimeout(() => this.runSimulation(), 101 - this.animationSpeed);
            });
        } else {
            console.log('Completing simulation');
            this.completeSimulation();
        }
    }

    processEvent(event) {
        switch(event.type) {
            case 'arrival':
                this.handleArrival(event);
                break;
            case 'departure':
                this.handleDeparture(event);
                break;
            case 'breakdown':
                this.handleBreakdown(event);
                break;
            case 'repair':
                this.handleRepair(event);
                break;
        }
    }

    handleArrival(event) {
        // Create new entity
        const entity = {
            id: this.entityCounter++,
            arrivalTime: this.currentTime,
            startServiceTime: null,
            waitTime: 0,
            serviceTime: 0,
            priority: this.getEntityPriority()
        };
        
        // Find available server
        const availableServer = this.servers.find(server => !server.busy);
        
        if (availableServer) {
            // Start service immediately
            this.startService(entity, availableServer);
        } else {
            // Add to queue
            this.entities.push(entity);
        }
        
        // Schedule next arrival
        const interArrivalTime = this.generateInterArrivalTime();
        if (this.currentTime + interArrivalTime < this.maxTime) {
            this.scheduleEvent('arrival', this.currentTime + interArrivalTime);
        }
    }

    handleDeparture(event) {
        const { entity, server } = event;
        
        // Update statistics
        this.statistics.entitiesProcessed++;
        this.statistics.totalWaitTime += entity.waitTime;
        this.statistics.totalServiceTime += entity.serviceTime;
        
        // Free server
        server.busy = false;
        server.currentEntity = null;
        
        // Assign next entity from queue if available
        if (this.entities.length > 0) {
            // Get next entity (consider priority)
            const nextEntity = this.getNextEntityFromQueue();
            if (nextEntity) {
                this.startService(nextEntity, server);
            }
        }
        
        this.updateServersDisplay();
    }

    handleBreakdown(event) {
        // Find a random busy server to break down
        const busyServers = this.servers.filter(s => s.busy);
        if (busyServers.length > 0) {
            const server = busyServers[Math.floor(secureRandom() * busyServers.length)];
            server.broken = true;
            
            // If serving an entity, put it back in queue
            if (server.currentEntity) {
                this.entities.unshift(server.currentEntity);
                server.currentEntity = null;
            }
            server.busy = false;
            
            // Schedule repair
            const repairTime = 30 + secureRandom() * 60; // 30-90 minutes
            this.scheduleEvent('repair', this.currentTime + repairTime, null, server);
        }
        
        // Schedule next potential breakdown
        if (this.currentTime + this.generateBreakdownTime() < this.maxTime) {
            this.scheduleEvent('breakdown', this.currentTime + this.generateBreakdownTime());
        }
        
        this.updateServersDisplay();
    }

    handleRepair(event) {
        const { server } = event;
        server.broken = false;
        
        // Assign entity from queue if available
        if (this.entities.length > 0) {
            const nextEntity = this.getNextEntityFromQueue();
            if (nextEntity) {
                this.startService(nextEntity, server);
            }
        }
        
        this.updateServersDisplay();
    }

    startService(entity, server) {
        // Remove entity from queue
        const entityIndex = this.entities.indexOf(entity);
        if (entityIndex > -1) {
            this.entities.splice(entityIndex, 1);
        }
        
        // Calculate wait time
        entity.startServiceTime = this.currentTime;
        entity.waitTime = this.currentTime - entity.arrivalTime;
        entity.serviceTime = this.generateServiceTime(entity);
        
        // Assign to server
        server.busy = true;
        server.currentEntity = entity;
        server.totalServiceTime += entity.serviceTime;
        
        // Schedule departure
        this.scheduleEvent('departure', this.currentTime + entity.serviceTime, entity, server);
        
        this.updateServersDisplay();
    }

    getEntityPriority() {
        // Priority based on scenario
        switch(this.currentScenario) {
            case 'hospital-emergency':
                const triage = $('#triagePrioritySelect').val();
                const priorities = {'emergency': 1, 'standard': 2, 'routine': 3};
                return priorities[triage] || 2;
            default:
                return 1; // FIFO
        }
    }

    getNextEntityFromQueue() {
        if (this.entities.length === 0) return null;
        
        // Sort by priority, then by arrival time
        this.entities.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.arrivalTime - b.arrivalTime;
        });
        
        return this.entities.shift();
    }

    updateStats() {
        $('#currentTime').text(this.formatTime(this.currentTime));
        $('#entitiesProcessed').text(this.statistics.entitiesProcessed);
        
        const avgWaitTime = this.statistics.entitiesProcessed > 0 
            ? this.statistics.totalWaitTime / this.statistics.entitiesProcessed 
            : 0;
        $('#avgWaitTime').text(Math.round(avgWaitTime) + ' min');
        
        // Track queue length and utilization
        this.statistics.queueLengthHistory.push(this.entities.length);
        const busyServers = this.servers.filter(s => s.busy).length;
        this.statistics.utilizationHistory.push(busyServers / this.numServers);
    }

    updateTimeline() {
        const timelineWidth = $('#eventTimeline').width();
        const position = (this.currentTime / this.maxTime) * timelineWidth;
        $('#currentTimeMarker').css('left', position + 'px');
    }

    updateProgress() {
        const progress = (this.currentTime / this.maxTime) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Time: ${this.formatTime(this.currentTime)} / ${this.formatTime(this.maxTime)}`);
    }

    updateServersDisplay() {
        const serversHtml = this.servers.map(server => {
            let className = 'server';
            let status = 'Idle';
            if (server.broken) {
                className += ' broken';
                status = 'Broken';
            } else if (server.busy) {
                className += ' busy';
                status = `Serving #${server.currentEntity.id}`;
            } else {
                className += ' idle';
            }
            
            return `
                <div class="${className}">
                    <strong>Server ${server.id + 1}</strong><br>
                    <small>${status}</small>
                </div>
            `;
        }).join('');
        
        $('#serversStatus').html(`<div class="d-flex flex-wrap">${serversHtml}</div>`);
    }

    draw() {
        const canvas = $('#simulationCanvas');
        canvas.empty();
        
        // Draw queue
        const queueY = 50;
        this.entities.forEach((entity, index) => {
            const x = 50 + (index * 25);
            const y = queueY;
            
            let entityClass = 'entity entity-';
            switch(this.currentScenario) {
                case 'hospital-emergency': entityClass += 'patient'; break;
                case 'manufacturing': entityClass += 'product'; break;
                case 'call-center': entityClass += 'customer'; break;
                case 'airport-security': entityClass += 'customer'; break;
                case 'drive-through': entityClass += 'vehicle'; break;
                default: entityClass += 'customer';
            }
            
            const element = $(`<div class="${entityClass}" title="Entity #${entity.id}">${entity.id}</div>`);
            element.css({
                left: x + 'px',
                top: y + 'px'
            });
            canvas.append(element);
        });
        
        // Draw servers and entities being served
        const serverY = 150;
        this.servers.forEach((server, index) => {
            const x = 100 + (index * 100);
            
            if (server.currentEntity) {
                const entityClass = 'entity entity-customer';
                const element = $(`<div class="${entityClass}" title="Entity #${server.currentEntity.id}">${server.currentEntity.id}</div>`);
                element.css({
                    left: x + 'px',
                    top: serverY + 'px'
                });
                canvas.append(element);
            }
        });
        
        // Draw labels
        canvas.append(`<div style="position: absolute; left: 10px; top: 45px; font-weight: bold;">Queue (${this.entities.length})</div>`);
        canvas.append(`<div style="position: absolute; left: 10px; top: 145px; font-weight: bold;">Servers</div>`);
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }

    completeSimulation() {
        this.isRunning = false;
        $('#startBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        $('#progressText').text('Simulation completed!');
        
        // Show final statistics
        setTimeout(() => {
            const avgQueueLength = this.statistics.queueLengthHistory.reduce((a, b) => a + b, 0) / this.statistics.queueLengthHistory.length;
            const avgUtilization = this.statistics.utilizationHistory.reduce((a, b) => a + b, 0) / this.statistics.utilizationHistory.length;
            
            $('#progressText').html(`
                Final Results: ${this.statistics.entitiesProcessed} processed, 
                Avg Queue: ${avgQueueLength.toFixed(1)}, 
                Utilization: ${(avgUtilization * 100).toFixed(1)}%
            `);
        }, 2000);
        
        setTimeout(() => {
            $('#progressText').text('Ready to start new simulation...');
        }, 8000);
    }
}

$(document).ready(() => {
    new DiscreteEventSimulation();
});