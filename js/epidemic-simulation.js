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

class EpidemicSimulation {
    constructor() {
        this.population = [];
        this.parameters = {
            populationSize: 1000,
            initialInfected: 5,
            transmissionRate: 0.3,
            recoveryRate: 0.1,
            mortalityRate: 0.02
        };
        
        this.isRunning = false;
        this.isPaused = false;
        this.day = 0;
        this.animationId = null;
        
        this.chart = null;
        this.history = {
            days: [],
            susceptible: [],
            infected: [],
            recovered: [],
            dead: []
        };
        
        this.initializeUI();
        this.initializeChart();
        this.setup();
    }

    initializeUI() {
        $('#population').on('input', (e) => {
            this.parameters.populationSize = parseInt(e.target.value);
            $('#populationValue').text(this.parameters.populationSize);
        });

        $('#initialInfected').on('input', (e) => {
            this.parameters.initialInfected = parseInt(e.target.value);
            $('#initialInfectedValue').text(this.parameters.initialInfected);
        });

        $('#transmissionRate').on('input', (e) => {
            this.parameters.transmissionRate = parseFloat(e.target.value);
            $('#transmissionRateValue').text(this.parameters.transmissionRate.toFixed(1));
        });

        $('#recoveryRate').on('input', (e) => {
            this.parameters.recoveryRate = parseFloat(e.target.value);
            $('#recoveryRateValue').text(this.parameters.recoveryRate.toFixed(2));
        });

        $('#mortalityRate').on('input', (e) => {
            this.parameters.mortalityRate = parseFloat(e.target.value);
            $('#mortalityRateValue').text(this.parameters.mortalityRate.toFixed(2));
        });

        $('#setupBtn').click(() => this.setup());
        $('#runBtn').click(() => this.run());
        $('#pauseBtn').click(() => this.pause());
        $('#stopBtn').click(() => this.stop());
    }

    initializeChart() {
        const ctx = document.getElementById('sirChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Susceptible',
                        data: [],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Infected',
                        data: [],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Recovered',
                        data: [],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Dead',
                        data: [],
                        borderColor: '#6c757d',
                        backgroundColor: 'rgba(108, 117, 125, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Days'
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
                }
            }
        });
    }

    setup() {
        this.stop();
        this.day = 0;
        this.population = [];
        this.history = {
            days: [],
            susceptible: [],
            infected: [],
            recovered: [],
            dead: []
        };

        // Create population
        for (let i = 0; i < this.parameters.populationSize; i++) {
            this.population.push({
                id: i,
                state: i < this.parameters.initialInfected ? 'infected' : 'susceptible',
                x: secureRandom() * 100,
                y: secureRandom() * 100,
                infectionTime: 0,
                dx: (secureRandom() - 0.5) * 2,
                dy: (secureRandom() - 0.5) * 2
            });
        }

        this.updateStatistics();
        this.render();
        this.updateChart();
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

        this.step();
        this.day++;
        
        this.updateStatistics();
        this.render();
        this.updateChart();

        // Check if epidemic is over
        const infected = this.population.filter(p => p.state === 'infected').length;
        if (infected === 0) {
            this.stop();
            alert('Epidemic has ended!');
            return;
        }

        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.simulate(), 100);
        });
    }

    step() {
        const infected = this.population.filter(p => p.state === 'infected');
        const susceptible = this.population.filter(p => p.state === 'susceptible');

        // Move people
        this.population.forEach(person => {
            person.x += person.dx;
            person.y += person.dy;

            // Bounce off walls
            if (person.x <= 0 || person.x >= 100) person.dx *= -1;
            if (person.y <= 0 || person.y >= 100) person.dy *= -1;
            
            person.x = Math.max(0, Math.min(100, person.x));
            person.y = Math.max(0, Math.min(100, person.y));
        });

        // Infection process
        infected.forEach(infectedPerson => {
            susceptible.forEach(susceptiblePerson => {
                const distance = Math.sqrt(
                    Math.pow(infectedPerson.x - susceptiblePerson.x, 2) + 
                    Math.pow(infectedPerson.y - susceptiblePerson.y, 2)
                );
                
                if (distance < 3 && secureRandom() < this.parameters.transmissionRate) {
                    susceptiblePerson.state = 'infected';
                    susceptiblePerson.infectionTime = 0;
                }
            });
            
            infectedPerson.infectionTime++;
            
            // Recovery or death
            if (secureRandom() < this.parameters.recoveryRate) {
                if (secureRandom() < this.parameters.mortalityRate) {
                    infectedPerson.state = 'dead';
                    infectedPerson.dx = 0;
                    infectedPerson.dy = 0;
                } else {
                    infectedPerson.state = 'recovered';
                }
            }
        });
    }

    render() {
        const canvas = $('#populationGrid');
        canvas.empty();

        this.population.forEach(person => {
            const personElement = $(`<div class="person ${person.state}"></div>`);
            personElement.css({
                left: person.x + '%',
                top: person.y + '%'
            });
            canvas.append(personElement);
        });
    }

    updateStatistics() {
        const counts = {
            susceptible: this.population.filter(p => p.state === 'susceptible').length,
            infected: this.population.filter(p => p.state === 'infected').length,
            recovered: this.population.filter(p => p.state === 'recovered').length,
            dead: this.population.filter(p => p.state === 'dead').length
        };

        $('#susceptibleCount').text(counts.susceptible);
        $('#infectedCount').text(counts.infected);
        $('#recoveredCount').text(counts.recovered);
        $('#deadCount').text(counts.dead);
    }

    updateChart() {
        const counts = {
            susceptible: this.population.filter(p => p.state === 'susceptible').length,
            infected: this.population.filter(p => p.state === 'infected').length,
            recovered: this.population.filter(p => p.state === 'recovered').length,
            dead: this.population.filter(p => p.state === 'dead').length
        };

        this.history.days.push(this.day);
        this.history.susceptible.push(counts.susceptible);
        this.history.infected.push(counts.infected);
        this.history.recovered.push(counts.recovered);
        this.history.dead.push(counts.dead);

        // Keep only last 200 data points
        if (this.history.days.length > 200) {
            Object.keys(this.history).forEach(key => {
                this.history[key].shift();
            });
        }

        this.chart.data.labels = this.history.days;
        this.chart.data.datasets[0].data = this.history.susceptible;
        this.chart.data.datasets[1].data = this.history.infected;
        this.chart.data.datasets[2].data = this.history.recovered;
        this.chart.data.datasets[3].data = this.history.dead;
        this.chart.update('none');
    }
}

$(document).ready(() => {
    new EpidemicSimulation();
});