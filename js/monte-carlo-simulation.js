class MonteCarloSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.currentIteration = 0;
        this.maxIterations = 1000;
        this.animationSpeed = 50;
        this.currentScenario = 'pi-estimation';
        this.animationId = null;
        this.data = [];
        
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
        
        $('#iterations').on('input', (e) => {
            this.maxIterations = parseInt(e.target.value);
            $('#iterationsValue').text(this.maxIterations);
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
            'pi-estimation': {
                description: 'We throw random dots inside a square and count how many land inside a circle. Since we know the circle and square areas, we can calculate π!',
                why: 'Used in: Engineering calculations, computer graphics, physics simulations. When you need precise mathematical constants but complex formulas are too slow.',
                realWorld: '🎯 NASA uses this for spacecraft trajectory calculations, video games use it for collision detection!'
            },
            'stock-price': {
                description: 'We simulate a stock\'s price by adding random changes each day. This shows how unpredictable markets can be and helps test trading strategies.',
                why: 'Used in: Investment banking, retirement planning, insurance. When you need to test financial strategies against thousands of possible market scenarios.',
                realWorld: '💼 Your bank uses this to calculate mortgage rates, pension funds use it to plan for retirement payouts!'
            },
            'dice-rolls': {
                description: 'We roll dice many times and count the results. This shows us the probability of getting each sum and proves that some numbers come up more often.',
                why: 'Used in: Game design, quality control, risk assessment. When you need to understand probability patterns without complex mathematical formulas.',
                realWorld: '🎲 Casinos use this to set odds, manufacturers use it to test product failure rates!'
            },
            'coin-flips': {
                description: 'We flip coins many times and track the longest streak of heads (or tails) in a row. This helps us understand "lucky streaks" and randomness.',
                why: 'Used in: Sports analytics, psychology research, fraud detection. When you need to distinguish between real patterns and random coincidences.',
                realWorld: '⚾ Sports teams use this to analyze "hot streaks", banks use it to detect suspicious transaction patterns!'
            },
            'portfolio-risk': {
                description: 'We simulate an investment portfolio over time with random market changes. This helps us see potential gains, losses, and risks before investing real money.',
                why: 'Used in: Wealth management, insurance, business planning. When you need to test strategies against thousands of possible future scenarios.',
                realWorld: '📈 Financial advisors use this for retirement planning, insurance companies use it to set premiums!'
            }
        };

        const explanation = explanations[this.currentScenario];
        $('#scenarioDescription').text(explanation.description);
        $('#scenarioWhy').html('<strong>When is this used?</strong> ' + explanation.why);
        
        // Clear previous real-world examples and add new ones
        $('#scenarioExplanation .real-world-example').remove();
        const realWorldHTML = `<div class="mt-2 p-2 real-world-example" style="background: rgba(40, 167, 69, 0.1); border-left: 3px solid #28a745; border-radius: 5px;">
            <small><strong>Real Examples:</strong> ${explanation.realWorld}</small>
        </div>`;
        $('#scenarioExplanation').append(realWorldHTML);
    }

    initializeScenario() {
        this.data = [];
        this.currentIteration = 0;
        
        switch(this.currentScenario) {
            case 'pi-estimation':
                this.initPiEstimation();
                break;
            case 'stock-price':
                this.initStockPrice();
                break;
            case 'dice-rolls':
                this.initDiceRolls();
                break;
            case 'coin-flips':
                this.initCoinFlips();
                break;
            case 'portfolio-risk':
                this.initPortfolioRisk();
                break;
        }
        
        this.updateStats();
        this.draw();
    }

    initPiEstimation() {
        $('#resultLabel').text('π Estimate');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Circle Radius: <span id="radiusValue">1.0</span></label>
                <input type="range" class="form-range" id="radiusSlider" min="0.5" max="2.0" value="1.0" step="0.1">
                <small class="text-muted">🎯 <strong>What this does:</strong> Changes the size of the target circle. Larger circles are easier to hit, smaller ones are harder!</small>
            </div>
            <div class="alert alert-light p-2 mt-2">
                <small><strong>🤔 Why change radius?</strong><br>
                • Larger radius = More dots hit the circle = Faster convergence<br>
                • Smaller radius = Fewer hits = Takes more iterations for accuracy<br>
                • Real use: Testing algorithm performance with different target sizes</small>
            </div>
        `);
        this.circleRadius = 1.0;
        this.insideCircle = 0;
        this.totalPoints = 0;
        
        // Add event listener for radius using event delegation to ensure it works after DOM changes
        $('#scenarioSpecificParams').off('input', '#radiusSlider');
        $('#scenarioSpecificParams').on('input', '#radiusSlider', (e) => {
            this.circleRadius = parseFloat(e.target.value);
            $('#radiusValue').text(this.circleRadius.toFixed(1));
            // Reset the simulation data when radius changes to show immediate effect
            this.insideCircle = 0;
            this.totalPoints = 0;
            this.data = [];
            this.currentIteration = 0;
            this.updateStats();
            this.draw();
        });
    }

    initStockPrice() {
        $('#resultLabel').text('Final Price');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Initial Price: <span id="initialPriceValue">$100</span></label>
                <input type="range" class="form-range" id="initialPriceSlider" min="10" max="500" value="100" step="5">
                <small class="text-muted">💰 Starting stock price</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Daily Volatility: <span id="volatilityValue">2.0%</span></label>
                <input type="range" class="form-range" id="volatilitySlider" min="0.5" max="10" value="2" step="0.5">
                <small class="text-muted">📈 Daily price swing percentage</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Market Trend: <span id="trendValue">Neutral</span></label>
                <select class="form-select" id="trendSelect">
                    <option value="bear">Bear Market (-0.1% daily)</option>
                    <option value="neutral" selected>Neutral (0% daily)</option>
                    <option value="bull">Bull Market (+0.1% daily)</option>
                </select>
                <small class="text-muted">📊 Overall market direction bias</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Market Events: <span id="eventsValue">Normal</span></label>
                <select class="form-select" id="eventsSelect">
                    <option value="none" selected>Normal Market</option>
                    <option value="earnings">Earnings Season (+/- 5%)</option>
                    <option value="crisis">Market Crisis (+/- 15%)</option>
                </select>
                <small class="text-muted">⚡ Special events that cause big swings</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Time Period: <span id="timeframeValue">30 Days</span></label>
                <input type="range" class="form-range" id="timeframeSlider" min="7" max="365" value="30" step="7">
                <small class="text-muted">📅 Simulation length</small>
            </div>
        `);
        
        this.initialPrice = 100;
        this.currentPrice = 100;
        this.volatility = 0.02; // 2% daily
        this.trend = 0; // neutral
        this.eventType = 'none';
        this.timeframe = 30;
        this.priceHistory = [100];
        
        // Add event listeners
        $('#initialPriceSlider').on('input', (e) => {
            this.initialPrice = parseInt(e.target.value);
            this.currentPrice = this.initialPrice;
            $('#initialPriceValue').text('$' + this.initialPrice);
            this.priceHistory = [this.initialPrice];
            this.resetSimulation();
        });
        
        $('#volatilitySlider').on('input', (e) => {
            this.volatility = parseFloat(e.target.value) / 100;
            $('#volatilityValue').text((parseFloat(e.target.value)).toFixed(1) + '%');
        });
        
        $('#trendSelect').on('change', (e) => {
            const trends = {'bear': -0.001, 'neutral': 0, 'bull': 0.001};
            this.trend = trends[e.target.value];
            const labels = {'bear': 'Bear Market (-0.1% daily)', 'neutral': 'Neutral (0% daily)', 'bull': 'Bull Market (+0.1% daily)'};
            $('#trendValue').text(labels[e.target.value].split(' (')[0]);
        });
        
        $('#eventsSelect').on('change', (e) => {
            this.eventType = e.target.value;
            const labels = {'none': 'Normal Market', 'earnings': 'Earnings Season (+/- 5%)', 'crisis': 'Market Crisis (+/- 15%)'};
            $('#eventsValue').text(labels[e.target.value].split(' (')[0]);
        });
        
        $('#timeframeSlider').on('input', (e) => {
            this.timeframe = parseInt(e.target.value);
            $('#timeframeValue').text(this.timeframe + ' Days');
        });
    }

    initDiceRolls() {
        $('#resultLabel').text('Average Sum');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Number of Dice: <span id="diceCountValue">2</span></label>
                <input type="range" class="form-range" id="diceCountSlider" min="1" max="6" value="2" step="1">
                <small class="text-muted">🎲 <strong>What this does:</strong> More dice = higher average sums, different probability patterns</small>
            </div>
            <div class="alert alert-light p-2 mt-2">
                <small><strong>🎯 Real Examples:</strong><br>
                • 2 dice: Board games like Monopoly (sum 2-12, avg 7)<br>
                • 3 dice: Role-playing games like D&D<br>
                • 6 dice: Complex strategy games, risk assessment</small>
            </div>
        `);
        this.diceCount = 2;
        this.rollSums = [];
        this.sumCounts = {};
        
        // Add event listener for dice count
        $('#diceCountSlider').on('input', (e) => {
            this.diceCount = parseInt(e.target.value);
            $('#diceCountValue').text(this.diceCount);
            this.rollSums = [];
            this.sumCounts = {};
            this.resetSimulation();
        });
    }

    initCoinFlips() {
        $('#resultLabel').text('Longest Streak');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Tracking: <span id="trackingTypeValue">Heads</span></label>
                <select class="form-select" id="trackingTypeSelect">
                    <option value="heads">Heads</option>
                    <option value="tails">Tails</option>
                </select>
            </div>
        `);
        this.flips = [];
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.trackingHeads = true;
        
        // Add event listener for tracking type
        $('#trackingTypeSelect').on('change', (e) => {
            this.trackingHeads = e.target.value === 'heads';
            $('#trackingTypeValue').text(this.trackingHeads ? 'Heads' : 'Tails');
            this.currentStreak = 0;
            this.longestStreak = 0;
            this.resetSimulation();
        });
    }

    initPortfolioRisk() {
        $('#resultLabel').text('Portfolio Value');
        $('#scenarioSpecificParams').html(`
            <div class="mb-3">
                <label class="form-label">Initial Investment: <span id="investmentValue">$10,000</span></label>
                <input type="range" class="form-range" id="investmentSlider" min="1000" max="100000" value="10000" step="1000">
                <small class="text-muted">💵 Starting portfolio amount</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Asset Allocation: <span id="allocationValue">Balanced</span></label>
                <select class="form-select" id="allocationSelect">
                    <option value="conservative">Conservative (80% Bonds, 20% Stocks)</option>
                    <option value="balanced" selected>Balanced (60% Stocks, 40% Bonds)</option>
                    <option value="aggressive">Aggressive (90% Stocks, 10% Bonds)</option>
                    <option value="speculative">Speculative (100% High-Risk Assets)</option>
                </select>
                <small class="text-muted">📊 How money is divided between asset types</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Monthly Contribution: <span id="contributionValue">$0</span></label>
                <input type="range" class="form-range" id="contributionSlider" min="0" max="2000" value="0" step="100">
                <small class="text-muted">💰 Additional money added each month</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Market Conditions: <span id="marketValue">Normal</span></label>
                <select class="form-select" id="marketSelect">
                    <option value="recession">Recession (High Volatility)</option>
                    <option value="normal" selected>Normal Market</option>
                    <option value="boom">Bull Market (Low Volatility)</option>
                </select>
                <small class="text-muted">🌊 Overall economic environment</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Time Horizon: <span id="horizonValue">5 Years</span></label>
                <input type="range" class="form-range" id="horizonSlider" min="1" max="30" value="5" step="1">
                <small class="text-muted">📅 Investment time period</small>
            </div>
            <div class="mb-3">
                <label class="form-label">Expense Ratio: <span id="expenseValue">0.5%</span></label>
                <input type="range" class="form-range" id="expenseSlider" min="0.1" max="2.0" value="0.5" step="0.1">
                <small class="text-muted">💸 Annual management fees</small>
            </div>
        `);
        
        this.initialInvestment = 10000;
        this.currentValue = 10000;
        this.allocation = 'balanced';
        this.monthlyContribution = 0;
        this.marketConditions = 'normal';
        this.timeHorizon = 5;
        this.expenseRatio = 0.005;
        this.valueHistory = [10000];
        this.monthCounter = 0;
        
        // Add event listeners
        $('#investmentSlider').on('input', (e) => {
            this.initialInvestment = parseInt(e.target.value);
            this.currentValue = this.initialInvestment;
            $('#investmentValue').text('$' + this.initialInvestment.toLocaleString());
            this.valueHistory = [this.initialInvestment];
            this.resetSimulation();
        });
        
        $('#allocationSelect').on('change', (e) => {
            this.allocation = e.target.value;
            const labels = {
                'conservative': 'Conservative (80% Bonds, 20% Stocks)', 
                'balanced': 'Balanced (60% Stocks, 40% Bonds)', 
                'aggressive': 'Aggressive (90% Stocks, 10% Bonds)',
                'speculative': 'Speculative (100% High-Risk Assets)'
            };
            $('#allocationValue').text(labels[this.allocation].split(' (')[0]);
        });
        
        $('#contributionSlider').on('input', (e) => {
            this.monthlyContribution = parseInt(e.target.value);
            $('#contributionValue').text('$' + this.monthlyContribution.toLocaleString());
        });
        
        $('#marketSelect').on('change', (e) => {
            this.marketConditions = e.target.value;
            const labels = {'recession': 'Recession (High Volatility)', 'normal': 'Normal Market', 'boom': 'Bull Market (Low Volatility)'};
            $('#marketValue').text(labels[this.marketConditions].split(' (')[0]);
        });
        
        $('#horizonSlider').on('input', (e) => {
            this.timeHorizon = parseInt(e.target.value);
            $('#horizonValue').text(this.timeHorizon + (this.timeHorizon === 1 ? ' Year' : ' Years'));
        });
        
        $('#expenseSlider').on('input', (e) => {
            this.expenseRatio = parseFloat(e.target.value) / 100;
            $('#expenseValue').text((parseFloat(e.target.value)).toFixed(1) + '%');
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
        this.currentIteration = 0;
        
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
        
        const batchSize = Math.max(1, Math.floor(this.animationSpeed / 10));
        
        for (let i = 0; i < batchSize && this.currentIteration < this.maxIterations; i++) {
            this.performIteration();
            this.currentIteration++;
        }
        
        this.updateStats();
        this.draw();
        this.updateProgress();
        
        if (this.currentIteration >= this.maxIterations) {
            this.completeSimulation();
        } else {
            this.animationId = requestAnimationFrame(() => {
                setTimeout(() => this.runSimulation(), 101 - this.animationSpeed);
            });
        }
    }

    performIteration() {
        switch(this.currentScenario) {
            case 'pi-estimation':
                this.performPiIteration();
                break;
            case 'stock-price':
                this.performStockIteration();
                break;
            case 'dice-rolls':
                this.performDiceIteration();
                break;
            case 'coin-flips':
                this.performCoinIteration();
                break;
            case 'portfolio-risk':
                this.performPortfolioIteration();
                break;
        }
    }

    performPiIteration() {
        const x = Math.random() * 2 * this.circleRadius - this.circleRadius;
        const y = Math.random() * 2 * this.circleRadius - this.circleRadius;
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance <= this.circleRadius) {
            this.insideCircle++;
        }
        
        this.totalPoints++;
        this.data.push({x, y, inside: distance <= this.circleRadius});
    }

    performStockIteration() {
        // Base random change
        const random = Math.random();
        const baseChange = this.volatility * (2 * random - 1);
        
        // Add market trend
        let change = baseChange + this.trend;
        
        // Add special events (random occurrence)
        if (this.eventType !== 'none' && Math.random() < 0.05) { // 5% chance per day
            const eventMultipliers = {'earnings': 0.05, 'crisis': 0.15};
            const eventChange = eventMultipliers[this.eventType] * (2 * Math.random() - 1);
            change += eventChange;
        }
        
        // Apply change and ensure price stays positive
        this.currentPrice = Math.max(1, this.currentPrice * (1 + change));
        this.priceHistory.push(this.currentPrice);
        this.data.push(this.currentPrice);
    }

    performDiceIteration() {
        let sum = 0;
        const roll = [];
        for (let i = 0; i < this.diceCount; i++) {
            const die = Math.floor(Math.random() * 6) + 1;
            roll.push(die);
            sum += die;
        }
        this.rollSums.push(sum);
        this.sumCounts[sum] = (this.sumCounts[sum] || 0) + 1;
        this.data.push({roll, sum});
    }

    performCoinIteration() {
        const flip = Math.random() < 0.5 ? 'heads' : 'tails';
        this.flips.push(flip);
        
        if ((this.trackingHeads && flip === 'heads') || (!this.trackingHeads && flip === 'tails')) {
            this.currentStreak++;
            this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
        } else {
            this.currentStreak = 0;
        }
        
        this.data.push({flip, streak: this.currentStreak});
    }

    performPortfolioIteration() {
        // Define asset allocation volatilities and expected returns
        const allocationData = {
            'conservative': { volatility: 0.05, expectedReturn: 0.04 },
            'balanced': { volatility: 0.12, expectedReturn: 0.07 },
            'aggressive': { volatility: 0.18, expectedReturn: 0.09 },
            'speculative': { volatility: 0.35, expectedReturn: 0.12 }
        };
        
        // Adjust for market conditions
        const marketMultipliers = {
            'recession': { volMultiplier: 1.8, returnMultiplier: 0.3 },
            'normal': { volMultiplier: 1.0, returnMultiplier: 1.0 },
            'boom': { volMultiplier: 0.6, returnMultiplier: 1.4 }
        };
        
        const baseData = allocationData[this.allocation];
        const marketData = marketMultipliers[this.marketConditions];
        
        const adjustedVolatility = baseData.volatility * marketData.volMultiplier;
        const adjustedReturn = baseData.expectedReturn * marketData.returnMultiplier;
        
        // Monthly return calculation
        const monthlyReturn = adjustedReturn / 12;
        const monthlyVolatility = adjustedVolatility / Math.sqrt(12);
        
        // Add random component
        const random = Math.random();
        const change = monthlyReturn + monthlyVolatility * (2 * random - 1);
        
        // Apply monthly contribution
        this.monthCounter++;
        if (this.monthCounter % 4 === 0) { // Quarterly contribution for visualization
            this.currentValue += this.monthlyContribution * 3; // 3 months worth
        }
        
        // Apply performance change
        this.currentValue *= (1 + change);
        
        // Apply expense ratio (monthly)
        this.currentValue *= (1 - this.expenseRatio / 12);
        
        // Ensure value stays positive
        this.currentValue = Math.max(100, this.currentValue);
        
        this.valueHistory.push(this.currentValue);
        this.data.push(this.currentValue);
    }

    updateStats() {
        $('#currentIteration').text(this.currentIteration);
        
        switch(this.currentScenario) {
            case 'pi-estimation':
                const piEstimate = this.totalPoints > 0 ? (4 * this.insideCircle / this.totalPoints) : 0;
                $('#currentResult').text(piEstimate.toFixed(4));
                $('#accuracy').text(this.totalPoints > 0 ? (100 - Math.abs(Math.PI - piEstimate) / Math.PI * 100).toFixed(1) + '%' : '0%');
                break;
            case 'stock-price':
                $('#currentResult').text('$' + this.currentPrice.toFixed(2));
                const priceChange = ((this.currentPrice - this.initialPrice) / this.initialPrice * 100);
                $('#accuracy').text((priceChange >= 0 ? '+' : '') + priceChange.toFixed(1) + '%');
                break;
            case 'dice-rolls':
                const avgSum = this.rollSums.length > 0 ? this.rollSums.reduce((a, b) => a + b, 0) / this.rollSums.length : 0;
                $('#currentResult').text(avgSum.toFixed(2));
                const expectedSum = (this.diceCount * 7) / 2;
                $('#accuracy').text((100 - Math.abs(expectedSum - avgSum) / expectedSum * 100).toFixed(1) + '%');
                break;
            case 'coin-flips':
                $('#currentResult').text(this.longestStreak);
                const expectedStreak = Math.log2(this.currentIteration + 1);
                $('#accuracy').text(this.longestStreak >= expectedStreak ? 'Above Expected' : 'Below Expected');
                break;
            case 'portfolio-risk':
                $('#currentResult').text('$' + this.currentValue.toFixed(0));
                const portfolioChange = ((this.currentValue - this.initialInvestment) / this.initialInvestment * 100);
                $('#accuracy').text((portfolioChange >= 0 ? '+' : '') + portfolioChange.toFixed(1) + '%');
                break;
        }
    }

    updateProgress() {
        const progress = (this.currentIteration / this.maxIterations) * 100;
        $('#progressBar').css('width', progress + '%');
        $('#progressText').text(`Progress: ${this.currentIteration} / ${this.maxIterations} iterations`);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(this.currentScenario) {
            case 'pi-estimation':
                this.drawPiEstimation();
                break;
            case 'stock-price':
                this.drawStockPrice();
                break;
            case 'dice-rolls':
                this.drawDiceRolls();
                break;
            case 'coin-flips':
                this.drawCoinFlips();
                break;
            case 'portfolio-risk':
                this.drawPortfolioRisk();
                break;
        }
    }

    drawPiEstimation() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        const displayRadius = maxRadius * (this.circleRadius / 2);
        const squareSize = displayRadius * 2;
        
        // Draw square
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(centerX - displayRadius, centerY - displayRadius, squareSize, squareSize);
        
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, displayRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Draw points
        const displayPoints = Math.min(this.data.length, 1000);
        const startIndex = Math.max(0, this.data.length - displayPoints);
        
        for (let i = startIndex; i < this.data.length; i++) {
            const point = this.data[i];
            this.ctx.fillStyle = point.inside ? '#28a745' : '#dc3545';
            this.ctx.beginPath();
            this.ctx.arc(
                centerX + (point.x / this.circleRadius) * displayRadius,
                centerY + (point.y / this.circleRadius) * displayRadius,
                2, 0, 2 * Math.PI
            );
            this.ctx.fill();
        }
        
        // Add labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Radius: ${this.circleRadius}`, centerX, 30);
    }

    drawStockPrice() {
        if (this.priceHistory.length < 2) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const minPrice = Math.min(...this.priceHistory) * 0.95;
        const maxPrice = Math.max(...this.priceHistory) * 1.05;
        const priceRange = maxPrice - minPrice;
        
        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.priceHistory.length; i++) {
            const x = padding + (i / (this.priceHistory.length - 1)) * graphWidth;
            const y = padding + (1 - (this.priceHistory[i] - minPrice) / priceRange) * graphHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#28a745';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        const initialY = padding + (1 - (this.initialPrice - minPrice) / priceRange) * graphHeight;
        this.ctx.moveTo(padding, initialY);
        this.ctx.lineTo(this.canvas.width - padding, initialY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawDiceRolls() {
        if (Object.keys(this.sumCounts).length === 0) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const minSum = this.diceCount;
        const maxSum = this.diceCount * 6;
        const maxCount = Math.max(...Object.values(this.sumCounts));
        
        const barWidth = graphWidth / (maxSum - minSum + 1);
        
        this.ctx.fillStyle = '#007bff';
        for (let sum = minSum; sum <= maxSum; sum++) {
            const count = this.sumCounts[sum] || 0;
            const x = padding + (sum - minSum) * barWidth;
            const height = (count / maxCount) * graphHeight;
            const y = padding + graphHeight - height;
            
            this.ctx.fillRect(x + 2, y, barWidth - 4, height);
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sum.toString(), x + barWidth / 2, padding + graphHeight + 20);
            this.ctx.fillStyle = '#007bff';
        }
    }

    drawCoinFlips() {
        const recentFlips = this.flips.slice(-50);
        const flipSize = Math.min(20, this.canvas.width / 52);
        const startX = (this.canvas.width - recentFlips.length * (flipSize + 5)) / 2;
        
        for (let i = 0; i < recentFlips.length; i++) {
            const x = startX + i * (flipSize + 5);
            const y = this.canvas.height / 2;
            
            this.ctx.fillStyle = recentFlips[i] === 'heads' ? '#ffd700' : '#c0c0c0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, flipSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(recentFlips[i] === 'heads' ? 'H' : 'T', x, y + 3);
        }
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Current Streak: ${this.currentStreak}`, this.canvas.width / 2, 50);
        this.ctx.fillText(`Longest Streak: ${this.longestStreak}`, this.canvas.width / 2, 75);
    }

    drawPortfolioRisk() {
        if (this.valueHistory.length < 2) return;
        
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;
        
        const minValue = Math.min(...this.valueHistory) * 0.95;
        const maxValue = Math.max(...this.valueHistory) * 1.05;
        const valueRange = maxValue - minValue;
        
        const currentValue = this.valueHistory[this.valueHistory.length - 1];
        const color = currentValue >= this.initialInvestment ? '#28a745' : '#dc3545';
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < this.valueHistory.length; i++) {
            const x = padding + (i / (this.valueHistory.length - 1)) * graphWidth;
            const y = padding + (1 - (this.valueHistory[i] - minValue) / valueRange) * graphHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#666';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        const initialY = padding + (1 - (this.initialInvestment - minValue) / valueRange) * graphHeight;
        this.ctx.moveTo(padding, initialY);
        this.ctx.lineTo(this.canvas.width - padding, initialY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
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
    new MonteCarloSimulation();
});