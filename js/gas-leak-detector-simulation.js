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

class GasLeakDetectorSimulation {
    constructor() {
        this.isRunning = false;
        this.isLeaking = false;
        this.animationId = null;
        
        // Gas properties
        this.gasTypes = {
            methane: { density: 0.717, lel: 50000, dispersionRate: 1.2, color: 'rgba(255, 165, 0, 0.3)' },
            propane: { density: 1.52, lel: 21000, dispersionRate: 0.8, color: 'rgba(255, 0, 0, 0.3)' },
            hydrogen: { density: 0.071, lel: 40000, dispersionRate: 2.5, color: 'rgba(173, 216, 230, 0.3)' },
            ammonia: { density: 0.73, lel: 150000, dispersionRate: 1.0, color: 'rgba(255, 255, 0, 0.3)' },
            co: { density: 0.97, lel: 125000, dispersionRate: 1.1, color: 'rgba(128, 128, 128, 0.3)' }
        };
        
        this.currentGasType = 'methane';
        this.windSpeed = 5;
        this.windDirection = 90; // degrees
        this.detectorSensitivity = 50; // ppm
        this.autoVentilation = true;
        this.emergencyShutdown = true;
        
        // Simulation state
        this.gasConcentration = 0;
        this.maxConcentration = 0;
        this.activeLeakSource = null;
        this.detectorReadings = {};
        this.ventilationActive = false;
        this.systemShutdown = false;
        
        // Chart for gas concentration over time
        this.chart = null;
        this.concentrationHistory = {
            time: [],
            concentration: []
        };
        
        // Detector positions (x, y coordinates relative to facility)
        this.detectorPositions = {
            1: { x: 120, y: 70 },
            2: { x: 350, y: 60 },
            3: { x: 480, y: 70 },
            4: { x: 150, y: 210 },
            5: { x: 320, y: 200 },
            6: { x: 480, y: 210 },
            7: { x: 200, y: 330 },
            8: { x: 400, y: 330 }
        };
        
        // Gas source positions
        this.gasSourcePositions = {
            1: { x: 150, y: 100 },
            2: { x: 320, y: 80 },
            3: { x: 180, y: 240 },
            4: { x: 350, y: 220 },
            5: { x: 280, y: 350 }
        };
        
        this.initializeUI();
        this.initializeChart();
        this.setup();
    }

    initializeUI() {
        $('#gasType').on('change', (e) => {
            this.currentGasType = e.target.value;
            this.updateGasInfo();
        });

        $('#windSpeed').on('input', (e) => {
            this.windSpeed = parseInt(e.target.value);
            $('#windSpeedValue').text(this.windSpeed);
        });

        $('#windDirection').on('input', (e) => {
            this.windDirection = parseInt(e.target.value);
            $('#windDirValue').text(this.windDirection);
        });

        $('#detectorSensitivity').on('input', (e) => {
            this.detectorSensitivity = parseInt(e.target.value);
            $('#sensitivityValue').text(this.detectorSensitivity);
        });

        $('#autoVentilation').on('change', (e) => {
            this.autoVentilation = e.target.checked;
        });

        $('#emergencyShutdown').on('change', (e) => {
            this.emergencyShutdown = e.target.checked;
        });

        $('#setupBtn').click(() => this.setup());
        $('#runBtn').click(() => this.startMonitoring());
        $('#leakBtn').click(() => this.simulateLeak());
        $('#stopBtn').click(() => this.stop());

        // Add click handlers for gas sources
        $('.gas-source').click((e) => {
            if (this.isRunning) {
                const sourceId = $(e.target).data('source');
                this.activateGasLeak(sourceId);
            }
        });

        // Add tooltips for detectors
        $('.gas-detector').hover(
            function() { $(this).css('transform', 'scale(1.2)'); },
            function() { $(this).css('transform', 'scale(1)'); }
        );
    }

    initializeChart() {
        const ctx = document.getElementById('concentrationChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Gas Concentration (PPM)',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'PPM'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    setup() {
        this.stop();
        this.gasConcentration = 0;
        this.maxConcentration = 0;
        this.activeLeakSource = null;
        this.detectorReadings = {};
        this.ventilationActive = false;
        this.systemShutdown = false;
        this.concentrationHistory = { time: [], concentration: [] };
        
        // Reset all visual indicators
        $('.gas-source').removeClass('active');
        $('.gas-detector').removeClass('detector-alarm detector-warning');
        $('.ventilation-system').removeClass('ventilation-active');
        $('.gas-cloud').remove();
        
        this.updateDisplay();
        this.updateAlarmPanel();
        this.updateChart();
        
        // Initialize detector readings
        for (let i = 1; i <= 8; i++) {
            this.detectorReadings[i] = 0;
        }
    }

    startMonitoring() {
        if (!this.isRunning) {
            this.isRunning = true;
            $('#runBtn').prop('disabled', true);
            $('#leakBtn').prop('disabled', false);
            
            this.updateAlarmPanel();
            this.simulate();
        }
    }

    simulateLeak() {
        if (this.isRunning && !this.isLeaking) {
            // Randomly select a gas source
            const sourceIds = Object.keys(this.gasSourcePositions);
            const randomSourceId = sourceIds[Math.floor(secureRandom() * sourceIds.length)];
            this.activateGasLeak(parseInt(randomSourceId));
        }
    }

    activateGasLeak(sourceId) {
        this.isLeaking = true;
        this.activeLeakSource = sourceId;
        
        // Visual indication of leak
        $(`.gas-source[data-source="${sourceId}"]`).addClass('active');
        
        // Create gas cloud
        this.createGasCloud(sourceId);
        
        console.log(`Gas leak activated at source ${sourceId}`);
    }

    createGasCloud(sourceId) {
        const source = this.gasSourcePositions[sourceId];
        const gasType = this.gasTypes[this.currentGasType];
        
        const cloudElement = $('<div class="gas-cloud"></div>');
        cloudElement.css({
            left: (source.x - 25) + 'px',
            top: (source.y - 25) + 'px',
            background: `radial-gradient(circle, ${gasType.color} 0%, rgba(231, 76, 60, 0.1) 50%, transparent 100%)`
        });
        
        $('#facilityLayout').append(cloudElement);
    }

    stop() {
        this.isRunning = false;
        this.isLeaking = false;
        $('#runBtn').prop('disabled', false);
        $('#leakBtn').prop('disabled', true);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.updateAlarmPanel();
    }

    simulate() {
        if (!this.isRunning) return;

        if (this.isLeaking && this.activeLeakSource) {
            this.updateGasDispersion();
        } else if (this.gasConcentration > 0) {
            // Natural dissipation
            this.gasConcentration = Math.max(0, this.gasConcentration - 2 - (this.ventilationActive ? 5 : 0));
        }

        this.updateDetectorReadings();
        this.checkAlarmConditions();
        this.updateDisplay();
        this.updateChart();
        
        // Continue simulation
        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.simulate(), 500);
        });
    }

    updateGasDispersion() {
        const gasType = this.gasTypes[this.currentGasType];
        const source = this.gasSourcePositions[this.activeLeakSource];
        
        // Simulate gas leak rate (PPM increase per tick)
        let leakRate = 50 + secureRandom() * 50; // 50-100 PPM per tick
        
        // Adjust for gas properties
        leakRate *= gasType.dispersionRate;
        
        // Adjust for wind (higher wind = faster dispersion = lower local concentration)
        leakRate *= Math.max(0.3, 1 - (this.windSpeed * 0.05));
        
        // Adjust for ventilation
        if (this.ventilationActive) {
            leakRate *= 0.4;
        }
        
        this.gasConcentration = Math.min(10000, this.gasConcentration + leakRate);
        this.maxConcentration = Math.max(this.maxConcentration, this.gasConcentration);
        
        // Stop leak randomly after some time
        if (secureRandom() < 0.01) { // 1% chance to stop each tick
            this.stopLeak();
        }
    }

    stopLeak() {
        this.isLeaking = false;
        if (this.activeLeakSource) {
            $(`.gas-source[data-source="${this.activeLeakSource}"]`).removeClass('active');
            this.activeLeakSource = null;
        }
    }

    updateDetectorReadings() {
        const source = this.activeLeakSource ? this.gasSourcePositions[this.activeLeakSource] : null;
        
        Object.keys(this.detectorPositions).forEach(detectorId => {
            const detector = this.detectorPositions[detectorId];
            let reading = 0;
            
            if (source && this.gasConcentration > 0) {
                // Calculate distance from leak source
                const distance = Math.sqrt(
                    Math.pow(detector.x - source.x, 2) + 
                    Math.pow(detector.y - source.y, 2)
                );
                
                // Gas concentration decreases with distance
                const distanceFactor = Math.max(0.1, 1 / (1 + distance / 100));
                reading = this.gasConcentration * distanceFactor;
                
                // Add some random variation
                reading *= (0.8 + secureRandom() * 0.4);
                
                // Account for wind direction (simplified)
                const windFactor = this.calculateWindEffect(source, detector);
                reading *= windFactor;
            }
            
            this.detectorReadings[detectorId] = Math.max(0, reading);
        });
    }

    calculateWindEffect(source, detector) {
        // Simplified wind effect calculation
        const dx = detector.x - source.x;
        const dy = detector.y - source.y;
        const windRad = (this.windDirection * Math.PI) / 180;
        const windX = Math.cos(windRad);
        const windY = Math.sin(windRad);
        
        // Dot product to see if detector is downwind
        const dotProduct = (dx * windX + dy * windY);
        return dotProduct > 0 ? 1 + (this.windSpeed * 0.02) : Math.max(0.3, 1 - (this.windSpeed * 0.01));
    }

    checkAlarmConditions() {
        const maxReading = Math.max(...Object.values(this.detectorReadings));
        const gasType = this.gasTypes[this.currentGasType];
        
        // Update detector visual states
        Object.keys(this.detectorReadings).forEach(detectorId => {
            const reading = this.detectorReadings[detectorId];
            const detector = $(`.gas-detector[data-detector="${detectorId}"]`);
            
            detector.removeClass('detector-alarm detector-warning');
            
            if (reading > this.detectorSensitivity * 2) {
                detector.addClass('detector-alarm');
            } else if (reading > this.detectorSensitivity) {
                detector.addClass('detector-warning');
            }
        });
        
        // Trigger ventilation system
        if (this.autoVentilation && maxReading > this.detectorSensitivity) {
            this.activateVentilation();
        } else if (maxReading < this.detectorSensitivity * 0.5) {
            this.deactivateVentilation();
        }
        
        // Emergency shutdown
        if (this.emergencyShutdown && maxReading > this.detectorSensitivity * 3) {
            this.triggerEmergencyShutdown();
        }
    }

    activateVentilation() {
        if (!this.ventilationActive) {
            this.ventilationActive = true;
            $('.ventilation-system').addClass('ventilation-active');
        }
    }

    deactivateVentilation() {
        if (this.ventilationActive) {
            this.ventilationActive = false;
            $('.ventilation-system').removeClass('ventilation-active');
        }
    }

    triggerEmergencyShutdown() {
        if (!this.systemShutdown) {
            this.systemShutdown = true;
            this.stopLeak();
            this.activateVentilation();
            console.log('Emergency shutdown triggered!');
        }
    }

    updateDisplay() {
        const maxReading = Math.max(...Object.values(this.detectorReadings));
        const displayConcentration = Math.round(maxReading);
        
        $('#ppmDisplay').text(`${displayConcentration} PPM`);
        
        // Update PPM display color
        const ppmDisplay = $('#ppmDisplay');
        ppmDisplay.removeClass('ppm-safe ppm-warning ppm-danger');
        
        if (displayConcentration < this.detectorSensitivity) {
            ppmDisplay.addClass('ppm-safe');
        } else if (displayConcentration < this.detectorSensitivity * 2) {
            ppmDisplay.addClass('ppm-warning');
        } else {
            ppmDisplay.addClass('ppm-danger');
        }
    }

    updateAlarmPanel() {
        const maxReading = Math.max(...Object.values(this.detectorReadings));
        
        // System Status
        const systemStatus = $('#systemStatus');
        const statusText = $('#statusText');
        systemStatus.removeClass('alarm-green alarm-yellow alarm-red');
        
        if (!this.isRunning) {
            systemStatus.addClass('alarm-yellow');
            statusText.text('Offline');
        } else if (this.systemShutdown) {
            systemStatus.addClass('alarm-red');
            statusText.text('Emergency');
        } else {
            systemStatus.addClass('alarm-green');
            statusText.text('Normal');
        }
        
        // Gas Level Status
        const gasStatus = $('#gasStatus');
        const gasLevelText = $('#gasLevelText');
        gasStatus.removeClass('alarm-green alarm-yellow alarm-red');
        
        if (maxReading > this.detectorSensitivity * 2) {
            gasStatus.addClass('alarm-red');
            gasLevelText.text('Dangerous');
        } else if (maxReading > this.detectorSensitivity) {
            gasStatus.addClass('alarm-yellow');
            gasLevelText.text('Warning');
        } else {
            gasStatus.addClass('alarm-green');
            gasLevelText.text('Safe');
        }
        
        // Ventilation Status
        const ventStatus = $('#ventStatus');
        const ventText = $('#ventText');
        ventStatus.removeClass('alarm-green alarm-yellow alarm-red');
        
        if (this.ventilationActive) {
            ventStatus.addClass('alarm-green');
            ventText.text('Active');
        } else if (maxReading > this.detectorSensitivity * 0.5) {
            ventStatus.addClass('alarm-yellow');
            ventText.text('Standby');
        } else {
            ventStatus.addClass('alarm-green');
            ventText.text('Standby');
        }
    }

    updateChart() {
        const currentTime = this.concentrationHistory.time.length;
        const maxReading = Math.max(...Object.values(this.detectorReadings));
        
        this.concentrationHistory.time.push(currentTime);
        this.concentrationHistory.concentration.push(Math.round(maxReading));
        
        // Keep only last 60 data points
        if (this.concentrationHistory.time.length > 60) {
            this.concentrationHistory.time.shift();
            this.concentrationHistory.concentration.shift();
        }
        
        this.chart.data.labels = this.concentrationHistory.time;
        this.chart.data.datasets[0].data = this.concentrationHistory.concentration;
        this.chart.update('none');
    }

    updateGasInfo() {
        const gasType = this.gasTypes[this.currentGasType];
        console.log(`Gas type changed to: ${this.currentGasType}`);
        console.log(`LEL: ${gasType.lel} PPM, Density: ${gasType.density}`);
    }
}

$(document).ready(() => {
    new GasLeakDetectorSimulation();
});