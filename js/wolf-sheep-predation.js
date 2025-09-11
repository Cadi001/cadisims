class WolfSheepPredationSimulation {
    constructor() {
        this.gridWidth = 50;
        this.gridHeight = 40;
        this.cellSize = 8;
        
        // Simulation state
        this.isRunning = false;
        this.isPaused = false;
        this.ticks = 0;
        this.animationId = null;
        
        // Agents
        this.sheep = [];
        this.wolves = [];
        this.grass = [];
        
        // Parameters (matching NetLogo interface)
        this.params = {
            initialSheep: 100,
            initialWolves: 50,
            sheepGainFromFood: 4,
            sheepReproduce: 4,
            wolfGainFromFood: 20,
            wolfReproduce: 5,
            grassRegrowthTime: 30,
            showEnergy: true
        };
        
        // Statistics
        this.populationHistory = {
            sheep: [],
            wolves: [],
            grass: [],
            ticks: []
        };
        
        this.chart = null;
        this.speed = 5;
        
        this.initializeUI();
        this.setupCanvas();
        this.initializeChart();
        this.setup();
    }

    initializeUI() {
        // Bind parameter controls
        $('#initialSheep').on('input', (e) => {
            this.params.initialSheep = parseInt(e.target.value);
            $('#initialSheepValue').text(this.params.initialSheep);
        });

        $('#initialWolves').on('input', (e) => {
            this.params.initialWolves = parseInt(e.target.value);
            $('#initialWolvesValue').text(this.params.initialWolves);
        });

        $('#sheepGainFromFood').on('input', (e) => {
            this.params.sheepGainFromFood = parseInt(e.target.value);
            $('#sheepGainValue').text(this.params.sheepGainFromFood);
        });

        $('#sheepReproduce').on('input', (e) => {
            this.params.sheepReproduce = parseInt(e.target.value);
            $('#sheepReproduceValue').text(this.params.sheepReproduce);
        });

        $('#wolfGainFromFood').on('input', (e) => {
            this.params.wolfGainFromFood = parseInt(e.target.value);
            $('#wolfGainValue').text(this.params.wolfGainFromFood);
        });

        $('#wolfReproduce').on('input', (e) => {
            this.params.wolfReproduce = parseInt(e.target.value);
            $('#wolfReproduceValue').text(this.params.wolfReproduce);
        });

        $('#grassRegrowthTime').on('input', (e) => {
            this.params.grassRegrowthTime = parseInt(e.target.value);
            $('#grassRegrowthValue').text(this.params.grassRegrowthTime);
        });

        $('#showEnergy').on('change', (e) => {
            this.params.showEnergy = e.target.checked;
            this.render();
        });

        $('#speedSlider').on('input', (e) => {
            this.speed = parseInt(e.target.value);
        });

        // Bind control buttons
        $('#setupBtn').click(() => this.setup());
        $('#runBtn').click(() => this.run());
        $('#pauseBtn').click(() => this.pause());
        $('#stopBtn').click(() => this.stop());
    }

    setupCanvas() {
        const canvas = $('#ecosystemGrid');
        canvas.css({
            width: '100%',
            height: '400px'
        });
    }

    initializeChart() {
        const ctx = document.getElementById('populationChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sheep',
                    data: [],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    fill: true
                }, {
                    label: 'Wolves',
                    data: [],
                    borderColor: '#4a4a4a',
                    backgroundColor: 'rgba(74, 74, 74, 0.1)',
                    borderWidth: 2,
                    fill: true
                }, {
                    label: 'Grass / 4',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (Ticks)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Population'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    setup() {
        this.stop();
        this.ticks = 0;
        this.sheep = [];
        this.wolves = [];
        this.grass = [];
        this.populationHistory = {
            sheep: [],
            wolves: [],
            grass: [],
            ticks: []
        };

        // Initialize grass patches
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.grass.push({
                    x: x,
                    y: y,
                    grown: Math.random() > 0.5,
                    countdown: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * this.params.grassRegrowthTime)
                });
            }
        }

        // Initialize sheep
        for (let i = 0; i < this.params.initialSheep; i++) {
            this.sheep.push({
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
                energy: Math.floor(Math.random() * (2 * this.params.sheepGainFromFood)) + 1,
                id: i
            });
        }

        // Initialize wolves
        for (let i = 0; i < this.params.initialWolves; i++) {
            this.wolves.push({
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
                energy: Math.floor(Math.random() * (2 * this.params.wolfGainFromFood)) + 1,
                id: i + 1000
            });
        }

        this.updateStatistics();
        this.render();
        this.scrollToTop();
    }

    run() {
        if (this.isPaused) {
            this.isPaused = false;
        }
        
        this.isRunning = true;
        $('#runBtn').prop('disabled', true);
        $('#pauseBtn').prop('disabled', false);
        
        this.simulate();
    }

    pause() {
        this.isPaused = true;
        this.isRunning = false;
        $('#runBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        $('#runBtn').prop('disabled', false);
        $('#pauseBtn').prop('disabled', true);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    simulate() {
        if (!this.isRunning || this.isPaused) return;

        // Main simulation step
        this.step();
        this.ticks++;
        
        this.updateStatistics();
        this.render();
        this.updateChart();

        // Check for extinction
        if (this.sheep.length === 0 || this.wolves.length === 0) {
            this.stop();
            alert(this.sheep.length === 0 ? 'All sheep have died! Wolves win.' : 'All wolves have died! Sheep win.');
            return;
        }

        // Continue simulation
        const delay = Math.max(50, 500 - (this.speed * 45));
        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.simulate(), delay);
        });
    }

    step() {
        // Move and process sheep
        this.sheep.forEach(sheep => {
            this.moveSheep(sheep);
            this.sheepEat(sheep);
            sheep.energy -= 1; // Energy cost for living
        });

        // Move and process wolves
        this.wolves.forEach(wolf => {
            this.moveWolf(wolf);
            this.wolfEat(wolf);
            wolf.energy -= 1; // Energy cost for living
        });

        // Remove dead agents
        this.sheep = this.sheep.filter(sheep => sheep.energy > 0);
        this.wolves = this.wolves.filter(wolf => wolf.energy > 0);

        // Reproduction
        this.reproduceAgents();

        // Grow grass
        this.growGrass();
    }

    moveSheep(sheep) {
        // Simple random walk
        const directions = [
            {dx: 0, dy: 1}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: -1, dy: 0},
            {dx: 1, dy: 1}, {dx: -1, dy: 1}, {dx: 1, dy: -1}, {dx: -1, dy: -1}
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        sheep.x = Math.max(0, Math.min(this.gridWidth - 1, sheep.x + direction.dx));
        sheep.y = Math.max(0, Math.min(this.gridHeight - 1, sheep.y + direction.dy));
    }

    moveWolf(wolf) {
        // Wolves try to move towards nearest sheep
        let nearestSheep = null;
        let minDistance = Infinity;

        this.sheep.forEach(sheep => {
            const distance = Math.abs(sheep.x - wolf.x) + Math.abs(sheep.y - wolf.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestSheep = sheep;
            }
        });

        if (nearestSheep && minDistance <= 5) {
            // Move towards nearest sheep
            const dx = nearestSheep.x > wolf.x ? 1 : (nearestSheep.x < wolf.x ? -1 : 0);
            const dy = nearestSheep.y > wolf.y ? 1 : (nearestSheep.y < wolf.y ? -1 : 0);
            wolf.x = Math.max(0, Math.min(this.gridWidth - 1, wolf.x + dx));
            wolf.y = Math.max(0, Math.min(this.gridHeight - 1, wolf.y + dy));
        } else {
            // Random walk if no sheep nearby
            this.moveSheep(wolf); // Use same random walk logic
        }
    }

    sheepEat(sheep) {
        const grassPatch = this.grass.find(g => g.x === sheep.x && g.y === sheep.y);
        if (grassPatch && grassPatch.grown) {
            sheep.energy += this.params.sheepGainFromFood;
            grassPatch.grown = false;
            grassPatch.countdown = this.params.grassRegrowthTime;
        }
    }

    wolfEat(wolf) {
        // Find sheep at same location
        const prey = this.sheep.find(sheep => sheep.x === wolf.x && sheep.y === wolf.y);
        if (prey) {
            wolf.energy += this.params.wolfGainFromFood;
            // Remove the eaten sheep
            const index = this.sheep.indexOf(prey);
            if (index > -1) {
                this.sheep.splice(index, 1);
            }
        }
    }

    reproduceAgents() {
        // Sheep reproduction
        const newSheep = [];
        this.sheep.forEach(sheep => {
            if (sheep.energy >= 2 * this.params.sheepGainFromFood && Math.random() * 100 < this.params.sheepReproduce) {
                sheep.energy = Math.floor(sheep.energy / 2);
                newSheep.push({
                    x: Math.max(0, Math.min(this.gridWidth - 1, sheep.x + (Math.random() > 0.5 ? 1 : -1))),
                    y: Math.max(0, Math.min(this.gridHeight - 1, sheep.y + (Math.random() > 0.5 ? 1 : -1))),
                    energy: sheep.energy,
                    id: Date.now() + Math.random()
                });
            }
        });
        this.sheep.push(...newSheep);

        // Wolf reproduction
        const newWolves = [];
        this.wolves.forEach(wolf => {
            if (wolf.energy >= 2 * this.params.wolfGainFromFood && Math.random() * 100 < this.params.wolfReproduce) {
                wolf.energy = Math.floor(wolf.energy / 2);
                newWolves.push({
                    x: Math.max(0, Math.min(this.gridWidth - 1, wolf.x + (Math.random() > 0.5 ? 1 : -1))),
                    y: Math.max(0, Math.min(this.gridHeight - 1, wolf.y + (Math.random() > 0.5 ? 1 : -1))),
                    energy: wolf.energy,
                    id: Date.now() + Math.random() + 1000
                });
            }
        });
        this.wolves.push(...newWolves);
    }

    growGrass() {
        this.grass.forEach(patch => {
            if (!patch.grown) {
                patch.countdown--;
                if (patch.countdown <= 0) {
                    patch.grown = true;
                }
            }
        });
    }

    render() {
        const canvas = $('#ecosystemGrid');
        canvas.empty();

        const canvasWidth = canvas.width();
        const canvasHeight = canvas.height();
        const cellWidth = canvasWidth / this.gridWidth;
        const cellHeight = canvasHeight / this.gridHeight;

        // Render grass
        this.grass.forEach(patch => {
            const grassElement = $(`<div class="grass-patch ${patch.grown ? 'grass-full' : 'grass-empty'}"></div>`);
            grassElement.css({
                left: (patch.x * cellWidth) + 'px',
                top: (patch.y * cellHeight) + 'px',
                width: cellWidth + 'px',
                height: cellHeight + 'px'
            });
            canvas.append(grassElement);
        });

        // Render sheep
        this.sheep.forEach(sheep => {
            const sheepElement = $('<div class="agent sheep"></div>');
            if (this.params.showEnergy) {
                sheepElement.text(sheep.energy);
            }
            sheepElement.css({
                left: (sheep.x * cellWidth + cellWidth/2 - 6) + 'px',
                top: (sheep.y * cellHeight + cellHeight/2 - 6) + 'px'
            });
            canvas.append(sheepElement);
        });

        // Render wolves
        this.wolves.forEach(wolf => {
            const wolfElement = $('<div class="agent wolf"></div>');
            if (this.params.showEnergy) {
                wolfElement.text(wolf.energy);
            }
            wolfElement.css({
                left: (wolf.x * cellWidth + cellWidth/2 - 6) + 'px',
                top: (wolf.y * cellHeight + cellHeight/2 - 6) + 'px'
            });
            canvas.append(wolfElement);
        });
    }

    updateStatistics() {
        $('#currentSheep').text(this.sheep.length);
        $('#currentWolves').text(this.wolves.length);
        $('#currentTicks').text(this.ticks);
    }

    updateChart() {
        const grassCount = this.grass.filter(g => g.grown).length;
        
        this.populationHistory.ticks.push(this.ticks);
        this.populationHistory.sheep.push(this.sheep.length);
        this.populationHistory.wolves.push(this.wolves.length);
        this.populationHistory.grass.push(Math.floor(grassCount / 4)); // Divide by 4 for scale

        // Keep only last 100 data points for performance
        if (this.populationHistory.ticks.length > 100) {
            this.populationHistory.ticks.shift();
            this.populationHistory.sheep.shift();
            this.populationHistory.wolves.shift();
            this.populationHistory.grass.shift();
        }

        this.chart.data.labels = this.populationHistory.ticks;
        this.chart.data.datasets[0].data = this.populationHistory.sheep;
        this.chart.data.datasets[1].data = this.populationHistory.wolves;
        this.chart.data.datasets[2].data = this.populationHistory.grass;
        this.chart.update('none'); // No animation for performance
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Initialize simulation when document is ready
$(document).ready(() => {
    new WolfSheepPredationSimulation();
});