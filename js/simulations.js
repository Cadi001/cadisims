// Simulation JavaScript Functions

// Helper function to scroll to top of page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Monte Carlo Simulations

function runPiEstimation() {
    scrollToTop();
    const darts = parseInt(document.getElementById('pi-darts').value);
    const canvas = document.getElementById('pi-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('pi-output');
    
    let insideCircle = 0;
    let totalDarts = 0;
    
    // Clear canvas
    ctx.clearRect(0, 0, 300, 300);
    
    // Draw square and circle
    ctx.strokeStyle = '#000';
    ctx.strokeRect(50, 50, 200, 200);
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, 2 * Math.PI);
    ctx.stroke();
    
    let results = "π Estimation Simulation\n";
    results += "===================\n\n";
    
    for (let i = 0; i < darts; i++) {
        const x = Math.random() * 2 - 1; // -1 to 1
        const y = Math.random() * 2 - 1; // -1 to 1
        const distance = Math.sqrt(x * x + y * y);
        
        totalDarts++;
        
        if (distance <= 1) {
            insideCircle++;
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'blue';
        }
        
        // Plot point on canvas
        const canvasX = (x + 1) * 100 + 50;
        const canvasY = (y + 1) * 100 + 50;
        ctx.fillRect(canvasX, canvasY, 1, 1);
        
        // Show intermediate results every 1000 darts
        if (i % 1000 === 999 || i === darts - 1) {
            const estimatedPi = 4 * (insideCircle / totalDarts);
            const error = Math.abs(estimatedPi - Math.PI);
            results += `After ${totalDarts.toLocaleString()} darts:\n`;
            results += `  Inside circle: ${insideCircle.toLocaleString()}\n`;
            results += `  Estimated π: ${estimatedPi.toFixed(6)}\n`;
            results += `  Actual π: ${Math.PI.toFixed(6)}\n`;
            results += `  Error: ${error.toFixed(6)}\n\n`;
        }
    }
    
    const finalPi = 4 * (insideCircle / totalDarts);
    results += `FINAL RESULT:\n`;
    results += `Estimated π = ${finalPi.toFixed(6)}\n`;
    results += `Accuracy: ${(100 - Math.abs(finalPi - Math.PI) / Math.PI * 100).toFixed(2)}%`;
    
    output.textContent = results;
}

function runStockSimulation() {
    scrollToTop();
    const initialPrice = parseFloat(document.getElementById('stock-initial').value);
    const days = parseInt(document.getElementById('stock-days').value);
    const volatility = parseFloat(document.getElementById('stock-volatility').value) / 100;
    
    const canvas = document.getElementById('stock-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('stock-output');
    
    let prices = [initialPrice];
    let results = "Stock Price Simulation\n";
    results += "====================\n\n";
    results += `Initial Price: $${initialPrice.toFixed(2)}\n`;
    results += `Daily Volatility: ${(volatility * 100).toFixed(1)}%\n`;
    results += `Simulation Period: ${days} days\n\n`;
    
    // Generate price path
    for (let day = 1; day <= days; day++) {
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = prices[day - 1] * (1 + randomChange);
        prices.push(Math.max(0.01, newPrice)); // Prevent negative prices
    }
    
    // Calculate statistics
    const finalPrice = prices[prices.length - 1];
    const totalReturn = (finalPrice - initialPrice) / initialPrice * 100;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    results += `RESULTS:\n`;
    results += `Final Price: $${finalPrice.toFixed(2)}\n`;
    results += `Total Return: ${totalReturn.toFixed(2)}%\n`;
    results += `Highest Price: $${maxPrice.toFixed(2)}\n`;
    results += `Lowest Price: $${minPrice.toFixed(2)}\n`;
    results += `Average Price: $${avgPrice.toFixed(2)}\n`;
    
    // Draw chart
    ctx.clearRect(0, 0, 600, 300);
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxY = maxPrice * 1.1;
    const minY = minPrice * 0.9;
    const range = maxY - minY;
    
    for (let i = 0; i < prices.length; i++) {
        const x = (i / (prices.length - 1)) * 580 + 10;
        const y = 280 - ((prices[i] - minY) / range) * 260;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Add grid and labels
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = 280 - (i / 5) * 260;
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(590, y);
        ctx.stroke();
        
        const price = minY + (i / 5) * range;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(`$${price.toFixed(0)}`, 595, y + 4);
    }
    
    output.textContent = results;
}

function runDiceAnalysis() {
    scrollToTop();
    const numDice = parseInt(document.getElementById('dice-count').value);
    const numRolls = parseInt(document.getElementById('dice-rolls').value);
    
    const canvas = document.getElementById('dice-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('dice-output');
    
    let results = `Dice Roll Analysis (${numDice} dice)\n`;
    results += "==============================\n\n";
    
    const minSum = numDice;
    const maxSum = numDice * 6;
    const outcomes = new Array(maxSum - minSum + 1).fill(0);
    
    // Simulate dice rolls
    for (let roll = 0; roll < numRolls; roll++) {
        let sum = 0;
        for (let die = 0; die < numDice; die++) {
            sum += Math.floor(Math.random() * 6) + 1;
        }
        outcomes[sum - minSum]++;
    }
    
    // Calculate statistics
    results += "Sum\tFreq\tProb\tExpected\n";
    results += "---\t----\t----\t--------\n";
    
    for (let i = 0; i < outcomes.length; i++) {
        const sum = i + minSum;
        const frequency = outcomes[i];
        const probability = frequency / numRolls;
        const expected = getTheoreticalProbability(numDice, sum) * numRolls;
        
        results += `${sum}\t${frequency}\t${(probability * 100).toFixed(1)}%\t${expected.toFixed(0)}\n`;
    }
    
    // Draw histogram
    ctx.clearRect(0, 0, 600, 300);
    const maxFreq = Math.max(...outcomes);
    const barWidth = 550 / outcomes.length;
    
    for (let i = 0; i < outcomes.length; i++) {
        const x = 25 + i * barWidth;
        const height = (outcomes[i] / maxFreq) * 250;
        const y = 270 - height;
        
        ctx.fillStyle = '#007bff';
        ctx.fillRect(x, y, barWidth - 2, height);
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(i + minSum, x + barWidth / 2 - 5, 285);
    }
    
    output.textContent = results;
}

function getTheoreticalProbability(numDice, sum) {
    // Simplified calculation for theoretical probability
    const totalOutcomes = Math.pow(6, numDice);
    // This is a simplified version - actual calculation is more complex
    return 1 / totalOutcomes;
}

function runCoinStreaks() {
    const flipsPerTrial = parseInt(document.getElementById('coin-flips').value);
    const numTrials = parseInt(document.getElementById('coin-trials').value);
    
    const output = document.getElementById('coin-output');
    
    let results = "Coin Flip Streak Analysis\n";
    results += "========================\n\n";
    results += `Flips per trial: ${flipsPerTrial}\n`;
    results += `Number of trials: ${numTrials}\n\n`;
    
    let maxStreakOverall = 0;
    let streakCounts = {};
    
    for (let trial = 0; trial < numTrials; trial++) {
        let currentStreak = 1;
        let maxStreak = 1;
        let lastFlip = Math.random() < 0.5 ? 'H' : 'T';
        
        for (let flip = 1; flip < flipsPerTrial; flip++) {
            const currentFlip = Math.random() < 0.5 ? 'H' : 'T';
            
            if (currentFlip === lastFlip) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
            lastFlip = currentFlip;
        }
        
        maxStreak = Math.max(maxStreak, currentStreak);
        maxStreakOverall = Math.max(maxStreakOverall, maxStreak);
        
        streakCounts[maxStreak] = (streakCounts[maxStreak] || 0) + 1;
    }
    
    results += "Longest streak distribution:\n";
    results += "Streak\tFrequency\tPercentage\n";
    results += "------\t---------\t----------\n";
    
    for (let streak = 1; streak <= maxStreakOverall; streak++) {
        const count = streakCounts[streak] || 0;
        const percentage = (count / numTrials * 100).toFixed(1);
        results += `${streak}\t${count}\t\t${percentage}%\n`;
    }
    
    results += `\nLongest streak observed: ${maxStreakOverall}`;
    results += `\nAverage longest streak: ${(Object.keys(streakCounts).reduce((sum, streak) => sum + parseInt(streak) * streakCounts[streak], 0) / numTrials).toFixed(1)}`;
    
    output.textContent = results;
}

function runPortfolioRisk() {
    const initialValue = parseFloat(document.getElementById('portfolio-initial').value);
    const years = parseInt(document.getElementById('portfolio-years').value);
    const simulations = parseInt(document.getElementById('portfolio-sims').value);
    
    const canvas = document.getElementById('portfolio-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('portfolio-output');
    
    let results = "Portfolio Risk Assessment\n";
    results += "========================\n\n";
    results += `Initial Portfolio Value: $${initialValue.toLocaleString()}\n`;
    results += `Time Horizon: ${years} years\n`;
    results += `Number of Simulations: ${simulations.toLocaleString()}\n\n`;
    
    const finalValues = [];
    const annualReturn = 0.08; // 8% expected return
    const annualVolatility = 0.15; // 15% volatility
    
    for (let sim = 0; sim < simulations; sim++) {
        let value = initialValue;
        
        for (let year = 0; year < years; year++) {
            const randomReturn = normalRandom() * annualVolatility + annualReturn;
            value *= (1 + randomReturn);
        }
        
        finalValues.push(value);
    }
    
    finalValues.sort((a, b) => a - b);
    
    // Calculate risk metrics
    const meanValue = finalValues.reduce((sum, val) => sum + val, 0) / simulations;
    const medianValue = finalValues[Math.floor(simulations / 2)];
    const var95 = finalValues[Math.floor(simulations * 0.05)];
    const var99 = finalValues[Math.floor(simulations * 0.01)];
    const maxValue = finalValues[simulations - 1];
    const minValue = finalValues[0];
    
    results += `RISK ANALYSIS RESULTS:\n`;
    results += `Mean Portfolio Value: $${meanValue.toLocaleString()}\n`;
    results += `Median Portfolio Value: $${medianValue.toLocaleString()}\n`;
    results += `5% VaR (95% confidence): $${var95.toLocaleString()}\n`;
    results += `1% VaR (99% confidence): $${var99.toLocaleString()}\n`;
    results += `Best Case: $${maxValue.toLocaleString()}\n`;
    results += `Worst Case: $${minValue.toLocaleString()}\n`;
    results += `Probability of Loss: ${(finalValues.filter(v => v < initialValue).length / simulations * 100).toFixed(1)}%`;
    
    // Draw histogram
    ctx.clearRect(0, 0, 600, 300);
    const bins = 50;
    const binSize = (maxValue - minValue) / bins;
    const histogram = new Array(bins).fill(0);
    
    finalValues.forEach(value => {
        const binIndex = Math.min(Math.floor((value - minValue) / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    const maxBinCount = Math.max(...histogram);
    const barWidth = 580 / bins;
    
    for (let i = 0; i < bins; i++) {
        const x = 10 + i * barWidth;
        const height = (histogram[i] / maxBinCount) * 250;
        const y = 270 - height;
        
        ctx.fillStyle = '#28a745';
        ctx.fillRect(x, y, barWidth - 1, height);
    }
    
    // Mark VaR lines
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const var95X = 10 + ((var95 - minValue) / (maxValue - minValue)) * 580;
    ctx.beginPath();
    ctx.moveTo(var95X, 20);
    ctx.lineTo(var95X, 270);
    ctx.stroke();
    
    output.textContent = results;
}

function normalRandom() {
    // Box-Muller transformation for normal distribution
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function runInsuranceClaims() {
    scrollToTop();
    const numPolicies = parseInt(document.getElementById('insurance-policies').value);
    const claimRate = parseFloat(document.getElementById('insurance-claim-rate').value) / 100;
    const avgClaimSize = parseFloat(document.getElementById('insurance-avg-claim').value);
    
    const canvas = document.getElementById('insurance-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('insurance-output');
    
    let results = "Insurance Claims Modeling\n";
    results += "========================\n\n";
    results += `Policies in force: ${numPolicies.toLocaleString()}\n`;
    results += `Annual claim rate: ${(claimRate * 100).toFixed(1)}%\n`;
    results += `Average claim size: $${avgClaimSize.toLocaleString()}\n\n`;
    
    // Simulate one year of claims
    const expectedClaims = numPolicies * claimRate;
    const actualClaims = [];
    let totalClaimAmount = 0;
    let numClaims = 0;
    
    // Generate claims using Poisson process
    for (let policy = 0; policy < numPolicies; policy++) {
        if (Math.random() < claimRate) {
            // Generate claim size using log-normal distribution
            const claimSize = Math.exp(normalRandom() * 0.8 + Math.log(avgClaimSize));
            actualClaims.push(Math.max(100, claimSize)); // Minimum $100 claim
            totalClaimAmount += actualClaims[actualClaims.length - 1];
            numClaims++;
        }
    }
    
    // Sort claims for analysis
    actualClaims.sort((a, b) => a - b);
    
    // Calculate statistics
    const meanClaim = totalClaimAmount / numClaims;
    const p50 = actualClaims[Math.floor(numClaims * 0.5)];
    const p90 = actualClaims[Math.floor(numClaims * 0.9)];
    const p99 = actualClaims[Math.floor(numClaims * 0.99)];
    const maxClaim = actualClaims[numClaims - 1];
    
    // Calculate required premium
    const lossRatio = 0.7; // 70% of premiums go to claims
    const requiredPremium = (totalClaimAmount / numPolicies) / lossRatio;
    
    results += `CLAIMS ANALYSIS RESULTS:\n`;
    results += `Total claims: ${numClaims.toLocaleString()}\n`;
    results += `Actual claim rate: ${(numClaims / numPolicies * 100).toFixed(2)}%\n`;
    results += `Total claim amount: $${totalClaimAmount.toLocaleString()}\n`;
    results += `Average claim size: $${meanClaim.toLocaleString()}\n`;
    results += `Median claim: $${p50.toLocaleString()}\n`;
    results += `90th percentile: $${p90.toLocaleString()}\n`;
    results += `99th percentile: $${p99.toLocaleString()}\n`;
    results += `Maximum claim: $${maxClaim.toLocaleString()}\n\n`;
    results += `PRICING RECOMMENDATIONS:\n`;
    results += `Required annual premium: $${requiredPremium.toFixed(0)} per policy\n`;
    results += `Monthly premium: $${(requiredPremium / 12).toFixed(0)} per policy`;
    
    // Draw histogram of claim sizes
    ctx.clearRect(0, 0, 600, 300);
    const bins = 20;
    const binSize = maxClaim / bins;
    const histogram = new Array(bins).fill(0);
    
    actualClaims.forEach(claim => {
        const binIndex = Math.min(Math.floor(claim / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    const maxBinCount = Math.max(...histogram);
    const barWidth = 580 / bins;
    
    for (let i = 0; i < bins; i++) {
        const x = 10 + i * barWidth;
        const height = (histogram[i] / maxBinCount) * 250;
        const y = 270 - height;
        
        ctx.fillStyle = '#17a2b8';
        ctx.fillRect(x, y, barWidth - 2, height);
    }
    
    // Add labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('Claim Size Distribution', 250, 20);
    ctx.fillText('$0', 10, 285);
    ctx.fillText(`$${(maxClaim / 1000).toFixed(0)}K`, 570, 285);
    
    output.textContent = results;
}

// Discrete-Event Simulations

function runCheckoutSimulation() {
    scrollToTop();
    const avgArrival = parseFloat(document.getElementById('checkout-arrival').value);
    const avgService = parseFloat(document.getElementById('checkout-service').value);
    const simTime = parseInt(document.getElementById('checkout-time').value) * 60; // Convert to minutes
    
    const output = document.getElementById('checkout-output');
    
    let results = "Single Server Checkout Simulation\n";
    results += "=================================\n\n";
    results += `Average arrival time: ${avgArrival} minutes\n`;
    results += `Average service time: ${avgService} minutes\n`;
    results += `Simulation time: ${simTime / 60} hours\n\n`;
    
    let currentTime = 0;
    let serverBusyUntil = 0;
    let customersServed = 0;
    let totalWaitTime = 0;
    let totalQueueLength = 0;
    let maxQueueLength = 0;
    let queueLength = 0;
    
    const events = [];
    
    // Generate first arrival
    events.push({
        time: exponentialRandom(avgArrival),
        type: 'arrival'
    });
    
    while (events.length > 0 && currentTime < simTime) {
        // Sort events by time
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'arrival') {
            queueLength++;
            maxQueueLength = Math.max(maxQueueLength, queueLength);
            
            if (currentTime >= serverBusyUntil) {
                // Server is free, start service immediately
                const serviceTime = exponentialRandom(avgService);
                serverBusyUntil = currentTime + serviceTime;
                queueLength--;
                customersServed++;
                
                events.push({
                    time: serverBusyUntil,
                    type: 'departure'
                });
            }
            
            // Schedule next arrival
            events.push({
                time: currentTime + exponentialRandom(avgArrival),
                type: 'arrival'
            });
        } else if (event.type === 'departure') {
            if (queueLength > 0) {
                // Start serving next customer
                const serviceTime = exponentialRandom(avgService);
                const waitTime = currentTime - (currentTime - serviceTime); // Simplified
                totalWaitTime += waitTime;
                serverBusyUntil = currentTime + serviceTime;
                queueLength--;
                customersServed++;
                
                events.push({
                    time: serverBusyUntil,
                    type: 'departure'
                });
            }
        }
        
        totalQueueLength += queueLength;
    }
    
    const avgWaitTime = totalWaitTime / customersServed;
    const avgQueueLength = totalQueueLength / (currentTime / 60); // Per hour
    const utilization = ((serverBusyUntil / currentTime) * 100).toFixed(1);
    
    results += `SIMULATION RESULTS:\n`;
    results += `Customers served: ${customersServed}\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(2)} minutes\n`;
    results += `Average queue length: ${avgQueueLength.toFixed(2)} customers\n`;
    results += `Maximum queue length: ${maxQueueLength} customers\n`;
    results += `Server utilization: ${utilization}%\n`;
    results += `Throughput: ${(customersServed / (currentTime / 60)).toFixed(2)} customers/hour`;
    
    output.textContent = results;
}

function exponentialRandom(mean) {
    return -mean * Math.log(Math.random());
}

function runBankSimulation() {
    scrollToTop();
    const numServers = parseInt(document.getElementById('bank-servers').value);
    const arrivalRate = parseFloat(document.getElementById('bank-arrival-rate').value);
    const avgService = parseFloat(document.getElementById('bank-service').value);
    
    const output = document.getElementById('bank-output');
    
    let results = "Multi-Server Bank Simulation\n";
    results += "===========================\n\n";
    results += `Number of tellers: ${numServers}\n`;
    results += `Customer arrival rate: ${arrivalRate} per hour\n`;
    results += `Average service time: ${avgService} minutes\n\n`;
    
    const simTime = 8 * 60; // 8 hours in minutes
    let currentTime = 0;
    let customersServed = 0;
    let totalWaitTime = 0;
    let queueLength = 0;
    let maxQueueLength = 0;
    
    const servers = new Array(numServers).fill(0); // When each server becomes free
    const avgArrivalTime = 60 / arrivalRate; // Minutes between arrivals
    
    const events = [{time: exponentialRandom(avgArrivalTime), type: 'arrival'}];
    
    while (events.length > 0 && currentTime < simTime) {
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'arrival') {
            const freeServer = servers.findIndex(busyUntil => busyUntil <= currentTime);
            
            if (freeServer !== -1) {
                // Server available
                const serviceTime = exponentialRandom(avgService);
                servers[freeServer] = currentTime + serviceTime;
                customersServed++;
                
                events.push({
                    time: servers[freeServer],
                    type: 'departure',
                    server: freeServer
                });
            } else {
                // All servers busy, join queue
                queueLength++;
                maxQueueLength = Math.max(maxQueueLength, queueLength);
            }
            
            // Schedule next arrival
            events.push({
                time: currentTime + exponentialRandom(avgArrivalTime),
                type: 'arrival'
            });
        } else if (event.type === 'departure') {
            if (queueLength > 0) {
                // Serve next customer from queue
                queueLength--;
                const serviceTime = exponentialRandom(avgService);
                const waitTime = currentTime - event.time + serviceTime; // Simplified
                totalWaitTime += waitTime;
                servers[event.server] = currentTime + serviceTime;
                customersServed++;
                
                events.push({
                    time: servers[event.server],
                    type: 'departure',
                    server: event.server
                });
            }
        }
    }
    
    const avgWaitTime = totalWaitTime / customersServed;
    const totalUtilization = servers.reduce((sum, busyUntil) => 
        sum + Math.min(busyUntil, simTime), 0) / (numServers * simTime) * 100;
    
    results += `SIMULATION RESULTS:\n`;
    results += `Customers served: ${customersServed}\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(2)} minutes\n`;
    results += `Maximum queue length: ${maxQueueLength} customers\n`;
    results += `Overall utilization: ${totalUtilization.toFixed(1)}%\n`;
    results += `Throughput: ${(customersServed / 8).toFixed(1)} customers/hour`;
    
    output.textContent = results;
}

function runManufacturingSimulation() {
    const numStations = parseInt(document.getElementById('mfg-stations').value);
    const processTime = parseFloat(document.getElementById('mfg-process').value);
    const bufferSize = parseInt(document.getElementById('mfg-buffer').value);
    
    const output = document.getElementById('mfg-output');
    
    let results = "Manufacturing Line Simulation\n";
    results += "============================\n\n";
    results += `Workstations: ${numStations}\n`;
    results += `Processing time: ${processTime} minutes\n`;
    results += `Buffer size: ${bufferSize} parts\n\n`;
    
    const simTime = 8 * 60; // 8 hours
    let currentTime = 0;
    let partsCompleted = 0;
    let partsStarted = 0;
    
    const stations = new Array(numStations).fill(0); // When each station becomes free
    const buffers = new Array(numStations - 1).fill(0); // Buffer between stations
    
    const events = [{time: 0, type: 'start_part'}];
    
    while (events.length > 0 && currentTime < simTime) {
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'start_part') {
            if (stations[0] <= currentTime) {
                stations[0] = currentTime + normalRandom() * processTime * 0.2 + processTime;
                partsStarted++;
                
                events.push({
                    time: stations[0],
                    type: 'station_complete',
                    station: 0
                });
                
                // Schedule next part start
                events.push({
                    time: currentTime + processTime * 0.8, // Slight overlap
                    type: 'start_part'
                });
            }
        } else if (event.type === 'station_complete') {
            const station = event.station;
            
            if (station === numStations - 1) {
                // Last station - part is complete
                partsCompleted++;
            } else {
                // Move to next station if possible
                if (buffers[station] < bufferSize && stations[station + 1] <= currentTime) {
                    stations[station + 1] = currentTime + normalRandom() * processTime * 0.2 + processTime;
                    
                    events.push({
                        time: stations[station + 1],
                        type: 'station_complete',
                        station: station + 1
                    });
                } else if (buffers[station] < bufferSize) {
                    buffers[station]++;
                }
            }
        }
    }
    
    const throughput = partsCompleted / (simTime / 60);
    const efficiency = (partsCompleted / partsStarted * 100).toFixed(1);
    
    results += `SIMULATION RESULTS:\n`;
    results += `Parts started: ${partsStarted}\n`;
    results += `Parts completed: ${partsCompleted}\n`;
    results += `Throughput: ${throughput.toFixed(2)} parts/hour\n`;
    results += `Line efficiency: ${efficiency}%\n`;
    
    for (let i = 0; i < buffers.length; i++) {
        results += `Buffer ${i + 1}: ${buffers[i]} parts\n`;
    }
    
    output.textContent = results;
}

function runERSimulation() {
    const numDoctors = parseInt(document.getElementById('er-doctors').value);
    const arrivalRate = parseFloat(document.getElementById('er-arrival').value);
    const criticalPercent = parseFloat(document.getElementById('er-critical').value) / 100;
    
    const output = document.getElementById('er-output');
    
    let results = "Emergency Room Simulation\n";
    results += "========================\n\n";
    results += `Doctors available: ${numDoctors}\n`;
    results += `Patient arrival rate: ${arrivalRate} per hour\n`;
    results += `Critical patients: ${(criticalPercent * 100).toFixed(0)}%\n\n`;
    
    const simTime = 12 * 60; // 12 hours
    let currentTime = 0;
    let patientsServed = 0;
    let criticalPatients = 0;
    let regularPatients = 0;
    let totalWaitTime = 0;
    let criticalWaitTime = 0;
    
    const doctors = new Array(numDoctors).fill(0);
    const criticalQueue = [];
    const regularQueue = [];
    
    const avgArrivalTime = 60 / arrivalRate;
    const events = [{time: exponentialRandom(avgArrivalTime), type: 'arrival'}];
    
    while (events.length > 0 && currentTime < simTime) {
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'arrival') {
            const isCritical = Math.random() < criticalPercent;
            const patient = {
                arrivalTime: currentTime,
                isCritical: isCritical
            };
            
            if (isCritical) {
                criticalQueue.push(patient);
                criticalPatients++;
            } else {
                regularQueue.push(patient);
                regularPatients++;
            }
            
            // Check if doctor is available
            const freeDoctor = doctors.findIndex(busyUntil => busyUntil <= currentTime);
            if (freeDoctor !== -1) {
                let nextPatient;
                if (criticalQueue.length > 0) {
                    nextPatient = criticalQueue.shift();
                } else if (regularQueue.length > 0) {
                    nextPatient = regularQueue.shift();
                }
                
                if (nextPatient) {
                    const serviceTime = nextPatient.isCritical ? 
                        exponentialRandom(45) : exponentialRandom(20); // Critical cases take longer
                    const waitTime = currentTime - nextPatient.arrivalTime;
                    
                    totalWaitTime += waitTime;
                    if (nextPatient.isCritical) {
                        criticalWaitTime += waitTime;
                    }
                    
                    doctors[freeDoctor] = currentTime + serviceTime;
                    patientsServed++;
                    
                    events.push({
                        time: doctors[freeDoctor],
                        type: 'departure',
                        doctor: freeDoctor
                    });
                }
            }
            
            // Schedule next arrival
            events.push({
                time: currentTime + exponentialRandom(avgArrivalTime),
                type: 'arrival'
            });
        } else if (event.type === 'departure') {
            // Doctor becomes available, serve next patient
            let nextPatient;
            if (criticalQueue.length > 0) {
                nextPatient = criticalQueue.shift();
            } else if (regularQueue.length > 0) {
                nextPatient = regularQueue.shift();
            }
            
            if (nextPatient) {
                const serviceTime = nextPatient.isCritical ? 
                    exponentialRandom(45) : exponentialRandom(20);
                const waitTime = currentTime - nextPatient.arrivalTime;
                
                totalWaitTime += waitTime;
                if (nextPatient.isCritical) {
                    criticalWaitTime += waitTime;
                }
                
                doctors[event.doctor] = currentTime + serviceTime;
                patientsServed++;
                
                events.push({
                    time: doctors[event.doctor],
                    type: 'departure',
                    doctor: event.doctor
                });
            }
        }
    }
    
    const avgWaitTime = totalWaitTime / patientsServed;
    const avgCriticalWait = criticalWaitTime / criticalPatients;
    const utilization = doctors.reduce((sum, busyUntil) => 
        sum + Math.min(busyUntil, simTime), 0) / (numDoctors * simTime) * 100;
    
    results += `SIMULATION RESULTS:\n`;
    results += `Total patients served: ${patientsServed}\n`;
    results += `Critical patients: ${criticalPatients}\n`;
    results += `Regular patients: ${regularPatients}\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Critical patient wait: ${avgCriticalWait.toFixed(1)} minutes\n`;
    results += `Doctor utilization: ${utilization.toFixed(1)}%\n`;
    results += `Patients in queue: ${criticalQueue.length + regularQueue.length}`;
    
    output.textContent = results;
}

function runCallCenterSimulation() {
    const numAgents = parseInt(document.getElementById('call-agents').value);
    const callRate = parseFloat(document.getElementById('call-rate').value);
    const maxWaitTime = parseFloat(document.getElementById('call-patience').value);
    
    const output = document.getElementById('call-output');
    
    let results = "Call Center Simulation\n";
    results += "=====================\n\n";
    results += `Agents: ${numAgents}\n`;
    results += `Call rate: ${callRate} per hour\n`;
    results += `Max wait time: ${maxWaitTime} minutes\n\n`;
    
    const simTime = 8 * 60; // 8 hours
    let currentTime = 0;
    let callsAnswered = 0;
    let callsAbandoned = 0;
    let totalWaitTime = 0;
    let totalTalkTime = 0;
    
    const agents = new Array(numAgents).fill(0);
    const queue = [];
    
    const avgArrivalTime = 60 / callRate;
    const events = [{time: exponentialRandom(avgArrivalTime), type: 'call_arrival'}];
    
    while (events.length > 0 && currentTime < simTime) {
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'call_arrival') {
            const freeAgent = agents.findIndex(busyUntil => busyUntil <= currentTime);
            
            if (freeAgent !== -1) {
                // Agent available
                const talkTime = exponentialRandom(6); // Average 6 minutes
                agents[freeAgent] = currentTime + talkTime;
                callsAnswered++;
                totalTalkTime += talkTime;
                
                events.push({
                    time: agents[freeAgent],
                    type: 'call_end',
                    agent: freeAgent
                });
            } else {
                // All agents busy, add to queue
                queue.push({
                    arrivalTime: currentTime,
                    abandonTime: currentTime + maxWaitTime
                });
                
                events.push({
                    time: currentTime + maxWaitTime,
                    type: 'call_abandon',
                    queueIndex: queue.length - 1
                });
            }
            
            // Schedule next call
            events.push({
                time: currentTime + exponentialRandom(avgArrivalTime),
                type: 'call_arrival'
            });
        } else if (event.type === 'call_end') {
            // Agent becomes available
            if (queue.length > 0) {
                const nextCall = queue.shift();
                const waitTime = currentTime - nextCall.arrivalTime;
                const talkTime = exponentialRandom(6);
                
                totalWaitTime += waitTime;
                totalTalkTime += talkTime;
                agents[event.agent] = currentTime + talkTime;
                callsAnswered++;
                
                events.push({
                    time: agents[event.agent],
                    type: 'call_end',
                    agent: event.agent
                });
            }
        } else if (event.type === 'call_abandon') {
            const queueIndex = event.queueIndex;
            if (queueIndex < queue.length && queue[queueIndex]) {
                queue.splice(queueIndex, 1);
                callsAbandoned++;
            }
        }
    }
    
    const totalCalls = callsAnswered + callsAbandoned;
    const avgWaitTime = totalWaitTime / callsAnswered;
    const avgTalkTime = totalTalkTime / callsAnswered;
    const abandonmentRate = (callsAbandoned / totalCalls * 100).toFixed(1);
    const utilization = agents.reduce((sum, busyUntil) => 
        sum + Math.min(busyUntil, simTime), 0) / (numAgents * simTime) * 100;
    
    results += `SIMULATION RESULTS:\n`;
    results += `Total calls: ${totalCalls}\n`;
    results += `Calls answered: ${callsAnswered}\n`;
    results += `Calls abandoned: ${callsAbandoned}\n`;
    results += `Abandonment rate: ${abandonmentRate}%\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Average talk time: ${avgTalkTime.toFixed(1)} minutes\n`;
    results += `Agent utilization: ${utilization.toFixed(1)}%`;
    
    output.textContent = results;
}

// Hand Simulations

function runDemandSimulation() {
    const days = parseInt(document.getElementById('demand-days').value);
    const output = document.getElementById('demand-output');
    const tableDiv = document.getElementById('demand-table');
    
    let results = "Product Demand Simulation\n";
    results += "========================\n\n";
    results += "Demand Distribution:\n";
    results += "0 units: 10% (Random: 00-09)\n";
    results += "1 unit:  20% (Random: 10-29)\n";
    results += "2 units: 40% (Random: 30-69)\n";
    results += "3 units: 20% (Random: 70-89)\n";
    results += "4 units: 10% (Random: 90-99)\n\n";
    
    let totalDemand = 0;
    let demandCounts = [0, 0, 0, 0, 0];
    let tableHTML = "<table class='table table-striped'><thead><tr><th>Day</th><th>Random Number</th><th>Demand</th><th>Cumulative</th></tr></thead><tbody>";
    
    for (let day = 1; day <= days; day++) {
        const randomNum = Math.floor(Math.random() * 100);
        let demand;
        
        if (randomNum <= 9) demand = 0;
        else if (randomNum <= 29) demand = 1;
        else if (randomNum <= 69) demand = 2;
        else if (randomNum <= 89) demand = 3;
        else demand = 4;
        
        totalDemand += demand;
        demandCounts[demand]++;
        
        tableHTML += `<tr><td>${day}</td><td>${randomNum.toString().padStart(2, '0')}</td><td>${demand}</td><td>${totalDemand}</td></tr>`;
    }
    
    tableHTML += "</tbody></table>";
    
    const avgDemand = totalDemand / days;
    results += `SIMULATION RESULTS:\n`;
    results += `Total demand: ${totalDemand} units\n`;
    results += `Average daily demand: ${avgDemand.toFixed(2)} units\n\n`;
    results += `Demand frequency:\n`;
    for (let i = 0; i < 5; i++) {
        const percentage = (demandCounts[i] / days * 100).toFixed(1);
        results += `${i} units: ${demandCounts[i]} days (${percentage}%)\n`;
    }
    
    output.textContent = results;
    tableDiv.innerHTML = tableHTML;
}

function runRandomWalk() {
    const steps = parseInt(document.getElementById('walk-steps').value);
    const trials = parseInt(document.getElementById('walk-trials').value);
    
    const canvas = document.getElementById('walk-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('walk-output');
    
    let results = "Random Walk Simulation\n";
    results += "=====================\n\n";
    results += `Number of steps: ${steps}\n`;
    results += `Number of trials: ${trials}\n\n`;
    
    const finalPositions = [];
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];
    
    ctx.clearRect(0, 0, 600, 300);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(550, 150);
    ctx.moveTo(300, 50);
    ctx.lineTo(300, 250);
    ctx.stroke();
    
    let maxDistance = 0;
    
    for (let trial = 0; trial < Math.min(trials, 5); trial++) {
        let position = 0;
        const path = [0];
        
        for (let step = 0; step < steps; step++) {
            position += Math.random() < 0.5 ? 1 : -1;
            path.push(position);
            maxDistance = Math.max(maxDistance, Math.abs(position));
        }
        
        finalPositions.push(position);
        
        // Draw path
        ctx.strokeStyle = colors[trial];
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < path.length; i++) {
            const x = 50 + (i / steps) * 500;
            const y = 150 - (path[i] / Math.max(maxDistance, 1)) * 80;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // Calculate statistics for all trials
    const allPositions = [];
    for (let trial = 0; trial < trials; trial++) {
        let position = 0;
        for (let step = 0; step < steps; step++) {
            position += Math.random() < 0.5 ? 1 : -1;
        }
        allPositions.push(position);
    }
    
    const avgFinalPosition = allPositions.reduce((sum, pos) => sum + pos, 0) / trials;
    const avgDistance = allPositions.reduce((sum, pos) => sum + Math.abs(pos), 0) / trials;
    const maxFinalDistance = Math.max(...allPositions.map(pos => Math.abs(pos)));
    
    results += `SIMULATION RESULTS:\n`;
    results += `Average final position: ${avgFinalPosition.toFixed(2)}\n`;
    results += `Average distance from start: ${avgDistance.toFixed(2)}\n`;
    results += `Maximum distance from start: ${maxFinalDistance}\n`;
    results += `Standard deviation: ${Math.sqrt(allPositions.reduce((sum, pos) => sum + pos * pos, 0) / trials - avgFinalPosition * avgFinalPosition).toFixed(2)}\n\n`;
    results += `Final positions (first 10):\n`;
    for (let i = 0; i < Math.min(10, allPositions.length); i++) {
        results += `Trial ${i + 1}: ${allPositions[i]}\n`;
    }
    
    output.textContent = results;
}

function runInventorySimulation() {
    const initialInv = parseInt(document.getElementById('inv-initial').value);
    const reorderPoint = parseInt(document.getElementById('inv-reorder').value);
    const orderQty = parseInt(document.getElementById('inv-order-qty').value);
    
    const output = document.getElementById('inv-output');
    
    let results = "Inventory Management Simulation\n";
    results += "==============================\n\n";
    results += `Initial inventory: ${initialInv} units\n`;
    results += `Reorder point: ${reorderPoint} units\n`;
    results += `Order quantity: ${orderQty} units\n\n`;
    
    let inventory = initialInv;
    let totalCost = 0;
    let ordersMade = 0;
    let stockouts = 0;
    let totalDemand = 0;
    
    const days = 30;
    const holdingCostPerUnit = 2; // $2 per unit per day
    const orderingCost = 50; // $50 per order
    const stockoutCost = 20; // $20 per unit short
    
    results += "Day\tDemand\tInventory\tAction\t\tCost\n";
    results += "---\t------\t---------\t------\t\t----\n";
    
    for (let day = 1; day <= days; day++) {
        // Generate demand (0-5 units with different probabilities)
        const randomNum = Math.random();
        let demand;
        if (randomNum < 0.1) demand = 0;
        else if (randomNum < 0.3) demand = 1;
        else if (randomNum < 0.6) demand = 2;
        else if (randomNum < 0.8) demand = 3;
        else if (randomNum < 0.95) demand = 4;
        else demand = 5;
        
        totalDemand += demand;
        
        // Check for incoming orders (simplified - assume 3 day lead time)
        
        // Meet demand
        let shortage = 0;
        if (inventory >= demand) {
            inventory -= demand;
        } else {
            shortage = demand - inventory;
            inventory = 0;
            stockouts += shortage;
        }
        
        // Check if need to order
        let action = "";
        let dayCost = inventory * holdingCostPerUnit + shortage * stockoutCost;
        
        if (inventory <= reorderPoint) {
            inventory += orderQty; // Simplified - assume immediate delivery
            ordersMade++;
            dayCost += orderingCost;
            action = "Order placed";
        }
        
        totalCost += dayCost;
        
        results += `${day}\t${demand}\t${inventory}\t\t${action}\t\t$${dayCost.toFixed(0)}\n`;
    }
    
    const avgInventory = totalDemand / days;
    const serviceLevel = ((totalDemand - stockouts) / totalDemand * 100).toFixed(1);
    
    results += `\nSUMMARY:\n`;
    results += `Total cost: $${totalCost.toFixed(0)}\n`;
    results += `Orders placed: ${ordersMade}\n`;
    results += `Total stockouts: ${stockouts} units\n`;
    results += `Service level: ${serviceLevel}%\n`;
    results += `Final inventory: ${inventory} units\n`;
    results += `Total demand: ${totalDemand} units`;
    
    output.textContent = results;
}

function runWeatherSimulation() {
    const days = parseInt(document.getElementById('weather-days').value);
    const initialWeather = document.getElementById('weather-initial').value;
    
    const output = document.getElementById('weather-output');
    
    let results = "Weather Pattern Simulation\n";
    results += "=========================\n\n";
    results += "Transition Probabilities:\n";
    results += "From Sunny: 70% Sunny, 20% Cloudy, 10% Rainy\n";
    results += "From Cloudy: 30% Sunny, 40% Cloudy, 30% Rainy\n";
    results += "From Rainy: 20% Sunny, 40% Cloudy, 40% Rainy\n\n";
    
    const transitions = {
        sunny: {sunny: 0.7, cloudy: 0.2, rainy: 0.1},
        cloudy: {sunny: 0.3, cloudy: 0.4, rainy: 0.3},
        rainy: {sunny: 0.2, cloudy: 0.4, rainy: 0.4}
    };
    
    const weatherIcons = {sunny: "☀️", cloudy: "☁️", rainy: "🌧️"};
    
    let currentWeather = initialWeather;
    let weatherCounts = {sunny: 0, cloudy: 0, rainy: 0};
    
    results += "Day\tWeather\tRandom\tNext Weather\n";
    results += "---\t-------\t------\t------------\n";
    
    for (let day = 1; day <= days; day++) {
        weatherCounts[currentWeather]++;
        
        const random = Math.random();
        let nextWeather = currentWeather;
        let cumulative = 0;
        
        for (const weather in transitions[currentWeather]) {
            cumulative += transitions[currentWeather][weather];
            if (random <= cumulative) {
                nextWeather = weather;
                break;
            }
        }
        
        results += `${day}\t${weatherIcons[currentWeather]} ${currentWeather}\t${(random * 100).toFixed(0)}\t${weatherIcons[nextWeather]} ${nextWeather}\n`;
        currentWeather = nextWeather;
    }
    
    results += `\nWEATHER SUMMARY:\n`;
    results += `Sunny days: ${weatherCounts.sunny} (${(weatherCounts.sunny / days * 100).toFixed(1)}%)\n`;
    results += `Cloudy days: ${weatherCounts.cloudy} (${(weatherCounts.cloudy / days * 100).toFixed(1)}%)\n`;
    results += `Rainy days: ${weatherCounts.rainy} (${(weatherCounts.rainy / days * 100).toFixed(1)}%)\n`;
    
    // Calculate longest streaks
    let longestSunny = 0, longestCloudy = 0, longestRainy = 0;
    let currentStreak = 1;
    let streakWeather = initialWeather;
    
    // Reset for streak calculation
    currentWeather = initialWeather;
    for (let day = 1; day < days; day++) {
        const random = Math.random();
        let nextWeather = currentWeather;
        let cumulative = 0;
        
        for (const weather in transitions[currentWeather]) {
            cumulative += transitions[currentWeather][weather];
            if (random <= cumulative) {
                nextWeather = weather;
                break;
            }
        }
        
        if (nextWeather === streakWeather) {
            currentStreak++;
        } else {
            if (streakWeather === 'sunny') longestSunny = Math.max(longestSunny, currentStreak);
            else if (streakWeather === 'cloudy') longestCloudy = Math.max(longestCloudy, currentStreak);
            else if (streakWeather === 'rainy') longestRainy = Math.max(longestRainy, currentStreak);
            
            currentStreak = 1;
            streakWeather = nextWeather;
        }
        currentWeather = nextWeather;
    }
    
    results += `\nLongest streaks:\n`;
    results += `Sunny: ${longestSunny} days\n`;
    results += `Cloudy: ${longestCloudy} days\n`;
    results += `Rainy: ${longestRainy} days`;
    
    output.textContent = results;
}

function runHandQueue() {
    const numCustomers = parseInt(document.getElementById('queue-customers').value);
    const output = document.getElementById('queue-output');
    const tableDiv = document.getElementById('queue-table');
    
    let results = "Manual Queue Calculation\n";
    results += "=======================\n\n";
    results += "Arrival and Service Time Distributions:\n";
    results += "Interarrival Time: 1-3 minutes (uniform)\n";
    results += "Service Time: 2-6 minutes (uniform)\n\n";
    
    let currentTime = 0;
    let serverBusyUntil = 0;
    let totalWaitTime = 0;
    let totalServiceTime = 0;
    let tableHTML = "<table class='table table-striped'><thead><tr><th>Customer</th><th>Arrival</th><th>Service Start</th><th>Service Time</th><th>Service End</th><th>Wait Time</th></tr></thead><tbody>";
    
    for (let customer = 1; customer <= numCustomers; customer++) {
        // Generate interarrival time (1-3 minutes)
        if (customer > 1) {
            const interarrival = Math.floor(Math.random() * 3) + 1;
            currentTime += interarrival;
        }
        
        // Generate service time (2-6 minutes)
        const serviceTime = Math.floor(Math.random() * 5) + 2;
        totalServiceTime += serviceTime;
        
        // Calculate service start time
        const serviceStart = Math.max(currentTime, serverBusyUntil);
        const waitTime = serviceStart - currentTime;
        totalWaitTime += waitTime;
        
        // Calculate service end time
        const serviceEnd = serviceStart + serviceTime;
        serverBusyUntil = serviceEnd;
        
        tableHTML += `<tr><td>${customer}</td><td>${currentTime}</td><td>${serviceStart}</td><td>${serviceTime}</td><td>${serviceEnd}</td><td>${waitTime}</td></tr>`;
    }
    
    tableHTML += "</tbody></table>";
    
    const avgWaitTime = totalWaitTime / numCustomers;
    const avgServiceTime = totalServiceTime / numCustomers;
    const totalSimTime = serverBusyUntil;
    const utilization = (totalServiceTime / totalSimTime * 100).toFixed(1);
    
    results += `MANUAL CALCULATION RESULTS:\n`;
    results += `Total simulation time: ${totalSimTime} minutes\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(2)} minutes\n`;
    results += `Average service time: ${avgServiceTime.toFixed(2)} minutes\n`;
    results += `Server utilization: ${utilization}%\n`;
    results += `Total customer time in system: ${(totalWaitTime + totalServiceTime).toFixed(0)} minutes`;
    
    output.textContent = results;
    tableDiv.innerHTML = tableHTML;
}

// Excel-Style Simulations

function runExcelCheckout() {
    const numCustomers = parseInt(document.getElementById('excel-customers').value);
    const output = document.getElementById('excel-checkout-output');
    const tableDiv = document.getElementById('excel-checkout-table');
    
    let results = "Excel-Style Checkout Simulation\n";
    results += "==============================\n\n";
    results += "Using Excel RAND() function equivalents:\n";
    results += "Interarrival = -LN(RAND()) * 5\n";
    results += "Service Time = -LN(RAND()) * 4\n\n";
    
    let currentTime = 0;
    let serverBusyUntil = 0;
    let totalWaitTime = 0;
    
    let tableHTML = "<table class='table table-striped table-sm'><thead><tr>";
    tableHTML += "<th>Customer</th><th>RAND()</th><th>Interarrival</th><th>Arrival</th>";
    tableHTML += "<th>RAND()</th><th>Service</th><th>Start</th><th>Wait</th><th>End</th>";
    tableHTML += "</tr></thead><tbody>";
    
    for (let customer = 1; customer <= numCustomers; customer++) {
        // Excel-style random number generation
        const rand1 = Math.random();
        const interarrival = customer === 1 ? 0 : -Math.log(rand1) * 5;
        currentTime += interarrival;
        
        const rand2 = Math.random();
        const serviceTime = -Math.log(rand2) * 4;
        
        const serviceStart = Math.max(currentTime, serverBusyUntil);
        const waitTime = serviceStart - currentTime;
        const serviceEnd = serviceStart + serviceTime;
        
        totalWaitTime += waitTime;
        serverBusyUntil = serviceEnd;
        
        tableHTML += `<tr>`;
        tableHTML += `<td>${customer}</td>`;
        tableHTML += `<td>${rand1.toFixed(3)}</td>`;
        tableHTML += `<td>${interarrival.toFixed(2)}</td>`;
        tableHTML += `<td>${currentTime.toFixed(2)}</td>`;
        tableHTML += `<td>${rand2.toFixed(3)}</td>`;
        tableHTML += `<td>${serviceTime.toFixed(2)}</td>`;
        tableHTML += `<td>${serviceStart.toFixed(2)}</td>`;
        tableHTML += `<td>${waitTime.toFixed(2)}</td>`;
        tableHTML += `<td>${serviceEnd.toFixed(2)}</td>`;
        tableHTML += `</tr>`;
    }
    
    tableHTML += "</tbody></table>";
    
    const avgWaitTime = totalWaitTime / numCustomers;
    const utilization = ((serverBusyUntil - currentTime) / serverBusyUntil * 100);
    
    results += `EXCEL SIMULATION RESULTS:\n`;
    results += `=AVERAGE(Wait_Column): ${avgWaitTime.toFixed(2)} minutes\n`;
    results += `=MAX(End_Column): ${serverBusyUntil.toFixed(2)} minutes\n`;
    results += `=SUM(Service_Column)/MAX(End_Column): ${(utilization).toFixed(1)}%\n`;
    results += `\nFormulas used:\n`;
    results += `Interarrival: =-LN(RAND())*5\n`;
    results += `Service: =-LN(RAND())*4\n`;
    results += `Start: =MAX(Arrival, Previous_End)\n`;
    results += `Wait: =Start - Arrival\n`;
    results += `End: =Start + Service`;
    
    output.textContent = results;
    tableDiv.innerHTML = tableHTML;
}

function runSalesForecast() {
    const months = parseInt(document.getElementById('sales-months').value);
    const baseSales = parseFloat(document.getElementById('sales-base').value);
    
    const canvas = document.getElementById('sales-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('sales-output');
    
    let results = "Excel-Style Sales Forecasting\n";
    results += "=============================\n\n";
    results += "Excel formulas used:\n";
    results += "Trend = 0.02 * Month (2% monthly growth)\n";
    results += "Seasonality = 0.2 * SIN(2*PI()*Month/12)\n";
    results += "Random = (RAND()-0.5) * 0.3\n";
    results += "Sales = Base * (1 + Trend + Seasonality + Random)\n\n";
    
    const salesData = [];
    let totalSales = 0;
    
    results += "Month\tTrend\tSeason\tRandom\tSales\n";
    results += "-----\t-----\t------\t------\t-----\n";
    
    for (let month = 1; month <= months; month++) {
        const trend = 0.02 * month; // 2% monthly growth
        const seasonality = 0.2 * Math.sin(2 * Math.PI * month / 12); // 20% seasonal variation
        const random = (Math.random() - 0.5) * 0.3; // ±15% random variation
        
        const sales = baseSales * (1 + trend + seasonality + random);
        salesData.push(sales);
        totalSales += sales;
        
        results += `${month}\t${(trend * 100).toFixed(1)}%\t${(seasonality * 100).toFixed(1)}%\t${(random * 100).toFixed(1)}%\t$${sales.toFixed(0)}\n`;
    }
    
    // Draw chart
    ctx.clearRect(0, 0, 600, 300);
    const maxSales = Math.max(...salesData);
    const minSales = Math.min(...salesData);
    const range = maxSales - minSales;
    
    // Draw trend line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < salesData.length; i++) {
        const x = 50 + (i / (salesData.length - 1)) * 500;
        const y = 250 - ((salesData[i] - minSales) / range) * 200;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Add data points
    ctx.fillStyle = '#007bff';
    for (let i = 0; i < salesData.length; i++) {
        const x = 50 + (i / (salesData.length - 1)) * 500;
        const y = 250 - ((salesData[i] - minSales) / range) * 200;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Add grid and labels
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = 250 - (i / 5) * 200;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(550, y);
        ctx.stroke();
        
        const value = minSales + (i / 5) * range;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(`$${(value / 1000).toFixed(0)}K`, 10, y + 4);
    }
    
    const avgSales = totalSales / months;
    const growth = ((salesData[salesData.length - 1] - salesData[0]) / salesData[0] * 100);
    
    results += `\nFORECAST SUMMARY:\n`;
    results += `=AVERAGE(Sales_Range): $${avgSales.toFixed(0)}\n`;
    results += `=SUM(Sales_Range): $${totalSales.toFixed(0)}\n`;
    results += `Growth Rate: ${growth.toFixed(1)}%\n`;
    results += `=MAX(Sales_Range): $${maxSales.toFixed(0)}\n`;
    results += `=MIN(Sales_Range): $${minSales.toFixed(0)}`;
    
    output.textContent = results;
}

function runProjectRisk() {
    const optimistic = parseFloat(document.getElementById('project-optimistic').value);
    const likely = parseFloat(document.getElementById('project-likely').value);
    const pessimistic = parseFloat(document.getElementById('project-pessimistic').value);
    
    const canvas = document.getElementById('project-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('project-output');
    
    let results = "Project Risk Analysis (Triangular Distribution)\n";
    results += "==============================================\n\n";
    results += `Optimistic time: ${optimistic} days\n`;
    results += `Most likely time: ${likely} days\n`;
    results += `Pessimistic time: ${pessimistic} days\n\n`;
    results += "Excel formula: =TRIANG(RAND(), optimistic, likely, pessimistic)\n\n";
    
    const simulations = 1000;
    const projectTimes = [];
    
    // Generate triangular distribution samples
    for (let i = 0; i < simulations; i++) {
        const time = triangularRandom(optimistic, likely, pessimistic);
        projectTimes.push(time);
    }
    
    projectTimes.sort((a, b) => a - b);
    
    // Calculate statistics
    const meanTime = projectTimes.reduce((sum, time) => sum + time, 0) / simulations;
    const medianTime = projectTimes[Math.floor(simulations / 2)];
    const p10 = projectTimes[Math.floor(simulations * 0.1)];
    const p90 = projectTimes[Math.floor(simulations * 0.9)];
    const stdDev = Math.sqrt(projectTimes.reduce((sum, time) => sum + (time - meanTime) ** 2, 0) / simulations);
    
    results += `RISK ANALYSIS RESULTS:\n`;
    results += `=AVERAGE(): ${meanTime.toFixed(1)} days\n`;
    results += `=MEDIAN(): ${medianTime.toFixed(1)} days\n`;
    results += `=PERCENTILE(10%): ${p10.toFixed(1)} days\n`;
    results += `=PERCENTILE(90%): ${p90.toFixed(1)} days\n`;
    results += `=STDEV(): ${stdDev.toFixed(1)} days\n\n`;
    results += `Probability of completion:\n`;
    results += `Within ${likely} days: ${(projectTimes.filter(t => t <= likely).length / simulations * 100).toFixed(1)}%\n`;
    results += `Within ${likely + 10} days: ${(projectTimes.filter(t => t <= likely + 10).length / simulations * 100).toFixed(1)}%`;
    
    // Draw histogram
    ctx.clearRect(0, 0, 600, 300);
    const bins = 30;
    const minTime = Math.min(...projectTimes);
    const maxTime = Math.max(...projectTimes);
    const binSize = (maxTime - minTime) / bins;
    const histogram = new Array(bins).fill(0);
    
    projectTimes.forEach(time => {
        const binIndex = Math.min(Math.floor((time - minTime) / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    const maxBinCount = Math.max(...histogram);
    const barWidth = 580 / bins;
    
    for (let i = 0; i < bins; i++) {
        const x = 10 + i * barWidth;
        const height = (histogram[i] / maxBinCount) * 250;
        const y = 270 - height;
        
        ctx.fillStyle = '#ffc107';
        ctx.fillRect(x, y, barWidth - 1, height);
    }
    
    // Mark key percentiles
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const meanX = 10 + ((meanTime - minTime) / (maxTime - minTime)) * 580;
    ctx.beginPath();
    ctx.moveTo(meanX, 20);
    ctx.lineTo(meanX, 270);
    ctx.stroke();
    
    output.textContent = results;
}

function triangularRandom(min, mode, max) {
    const u = Math.random();
    const c = (mode - min) / (max - min);
    
    if (u < c) {
        return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
}

function runBudgetAnalysis() {
    const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
    const variancePercent = parseFloat(document.getElementById('budget-variance').value) / 100;
    const simulations = parseInt(document.getElementById('budget-sims').value);
    
    const canvas = document.getElementById('budget-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('budget-output');
    
    let results = "Budget Variance Analysis\n";
    results += "=======================\n\n";
    results += `Budget amount: $${budgetAmount.toLocaleString()}\n`;
    results += `Variance range: ±${(variancePercent * 100).toFixed(0)}%\n`;
    results += `Simulations: ${simulations.toLocaleString()}\n\n`;
    results += "Excel formula: =NORMINV(RAND(), budget, budget*variance/3)\n\n";
    
    const actualCosts = [];
    const stdDev = budgetAmount * variancePercent / 3; // 99.7% within ±variance
    
    for (let i = 0; i < simulations; i++) {
        // Normal distribution using Box-Muller
        const normalValue = normalRandom();
        const cost = budgetAmount + normalValue * stdDev;
        actualCosts.push(Math.max(0, cost)); // Prevent negative costs
    }
    
    actualCosts.sort((a, b) => a - b);
    
    const meanCost = actualCosts.reduce((sum, cost) => sum + cost, 0) / simulations;
    const p5 = actualCosts[Math.floor(simulations * 0.05)];
    const p95 = actualCosts[Math.floor(simulations * 0.95)];
    const overBudget = actualCosts.filter(cost => cost > budgetAmount).length / simulations * 100;
    const maxOverrun = Math.max(...actualCosts) - budgetAmount;
    
    results += `VARIANCE ANALYSIS RESULTS:\n`;
    results += `=AVERAGE(): $${meanCost.toLocaleString()}\n`;
    results += `=PERCENTILE(5%): $${p5.toLocaleString()}\n`;
    results += `=PERCENTILE(95%): $${p95.toLocaleString()}\n`;
    results += `Probability over budget: ${overBudget.toFixed(1)}%\n`;
    results += `Maximum overrun: $${maxOverrun.toLocaleString()}\n`;
    results += `Budget adequacy: ${(100 - overBudget).toFixed(1)}%`;
    
    // Draw histogram
    ctx.clearRect(0, 0, 600, 300);
    const bins = 40;
    const minCost = Math.min(...actualCosts);
    const maxCost = Math.max(...actualCosts);
    const binSize = (maxCost - minCost) / bins;
    const histogram = new Array(bins).fill(0);
    
    actualCosts.forEach(cost => {
        const binIndex = Math.min(Math.floor((cost - minCost) / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    const maxBinCount = Math.max(...histogram);
    const barWidth = 580 / bins;
    
    for (let i = 0; i < bins; i++) {
        const x = 10 + i * barWidth;
        const height = (histogram[i] / maxBinCount) * 250;
        const y = 270 - height;
        
        const binCost = minCost + i * binSize;
        ctx.fillStyle = binCost > budgetAmount ? '#dc3545' : '#28a745';
        ctx.fillRect(x, y, barWidth - 1, height);
    }
    
    // Mark budget line
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    const budgetX = 10 + ((budgetAmount - minCost) / (maxCost - minCost)) * 580;
    ctx.beginPath();
    ctx.moveTo(budgetX, 20);
    ctx.lineTo(budgetX, 270);
    ctx.stroke();
    
    output.textContent = results;
}

function runQualityControl() {
    const batchSize = parseInt(document.getElementById('qc-batch-size').value);
    const defectRate = parseFloat(document.getElementById('qc-defect-rate').value) / 100;
    const numBatches = parseInt(document.getElementById('qc-batches').value);
    
    const canvas = document.getElementById('qc-canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('qc-output');
    
    let results = "Quality Control Process Simulation\n";
    results += "==================================\n\n";
    results += `Batch size: ${batchSize} units\n`;
    results += `Expected defect rate: ${(defectRate * 100).toFixed(1)}%\n`;
    results += `Number of batches: ${numBatches}\n\n`;
    results += "Excel formula: =BINOM.INV(batch_size, defect_rate, RAND())\n\n";
    
    const defectCounts = [];
    let totalDefects = 0;
    let batchesRejected = 0;
    const rejectThreshold = Math.ceil(batchSize * defectRate * 2); // Reject if >2x expected
    
    for (let batch = 1; batch <= numBatches; batch++) {
        // Binomial distribution simulation
        let defects = 0;
        for (let unit = 0; unit < batchSize; unit++) {
            if (Math.random() < defectRate) {
                defects++;
            }
        }
        
        defectCounts.push(defects);
        totalDefects += defects;
        
        if (defects > rejectThreshold) {
            batchesRejected++;
        }
    }
    
    const avgDefects = totalDefects / numBatches;
    const actualDefectRate = totalDefects / (numBatches * batchSize) * 100;
    const rejectionRate = batchesRejected / numBatches * 100;
    const expectedDefects = batchSize * defectRate;
    
    results += `QUALITY CONTROL RESULTS:\n`;
    results += `=AVERAGE(defects): ${avgDefects.toFixed(2)} per batch\n`;
    results += `Expected defects: ${expectedDefects.toFixed(2)} per batch\n`;
    results += `Actual defect rate: ${actualDefectRate.toFixed(2)}%\n`;
    results += `Batches rejected: ${batchesRejected} (${rejectionRate.toFixed(1)}%)\n`;
    results += `=MAX(defects): ${Math.max(...defectCounts)} defects\n`;
    results += `=MIN(defects): ${Math.min(...defectCounts)} defects\n`;
    results += `Process capability: ${expectedDefects > 0 ? (avgDefects / expectedDefects).toFixed(2) : 'N/A'}`;
    
    // Draw histogram of defect counts
    ctx.clearRect(0, 0, 600, 300);
    const maxDefects = Math.max(...defectCounts);
    const histogram = new Array(maxDefects + 1).fill(0);
    
    defectCounts.forEach(count => histogram[count]++);
    
    const maxBinCount = Math.max(...histogram);
    const barWidth = 580 / (maxDefects + 1);
    
    for (let i = 0; i <= maxDefects; i++) {
        const x = 10 + i * barWidth;
        const height = (histogram[i] / maxBinCount) * 250;
        const y = 270 - height;
        
        ctx.fillStyle = i > rejectThreshold ? '#dc3545' : '#28a745';
        ctx.fillRect(x, y, barWidth - 2, height);
        
        // Label x-axis
        if (i % Math.max(1, Math.floor(maxDefects / 10)) === 0) {
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.fillText(i.toString(), x + barWidth / 2 - 5, 285);
        }
    }
    
    // Mark rejection threshold
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const thresholdX = 10 + rejectThreshold * barWidth;
    ctx.beginPath();
    ctx.moveTo(thresholdX, 20);
    ctx.lineTo(thresholdX, 270);
    ctx.stroke();
    
    output.textContent = results;
}

// Real-World System Simulations

function runTransportationSimulation() {
    const numBuses = parseInt(document.getElementById('trans-buses').value);
    const routeDistance = parseFloat(document.getElementById('trans-distance').value);
    const numStops = parseInt(document.getElementById('trans-stops').value);
    
    const output = document.getElementById('trans-output');
    
    let results = "Public Transportation Simulation\n";
    results += "===============================\n\n";
    results += `Number of buses: ${numBuses}\n`;
    results += `Route distance: ${routeDistance} km\n`;
    results += `Number of stops: ${numStops}\n\n`;
    
    const avgSpeed = 25; // km/h in city traffic
    const roundTripTime = (routeDistance * 2 / avgSpeed * 60); // minutes
    const stopTime = 2; // minutes per stop
    const totalCycleTime = roundTripTime + (numStops * 2 * stopTime); // Round trip with stops
    
    const frequency = numBuses / (totalCycleTime / 60); // Buses per hour
    const headway = 60 / frequency; // Minutes between buses
    
    // Simulate passenger arrivals and waiting times
    const simTime = 8 * 60; // 8 hours in minutes
    let totalPassengers = 0;
    let totalWaitTime = 0;
    let maxWaitTime = 0;
    
    // Passenger arrival rate (per stop per hour)
    const arrivalRate = 15;
    const avgArrivalInterval = 60 / arrivalRate;
    
    for (let stop = 1; stop <= numStops; stop++) {
        let currentTime = 0;
        let nextBusTime = Math.random() * headway; // Random start offset
        
        while (currentTime < simTime) {
            // Generate passenger arrival
            currentTime += exponentialRandom(avgArrivalInterval);
            if (currentTime >= simTime) break;
            
            // Find next bus arrival at this stop
            while (nextBusTime < currentTime) {
                nextBusTime += headway;
            }
            
            const waitTime = nextBusTime - currentTime;
            totalWaitTime += waitTime;
            maxWaitTime = Math.max(maxWaitTime, waitTime);
            totalPassengers++;
        }
    }
    
    const avgWaitTime = totalWaitTime / totalPassengers;
    const busUtilization = (totalPassengers / (numBuses * simTime / 60 * 40)).toFixed(2); // Assuming 40 passenger capacity
    
    results += `TRANSPORTATION ANALYSIS:\n`;
    results += `Round trip time: ${totalCycleTime.toFixed(1)} minutes\n`;
    results += `Service frequency: ${frequency.toFixed(2)} buses/hour\n`;
    results += `Headway: ${headway.toFixed(1)} minutes\n`;
    results += `Daily passengers: ${totalPassengers.toLocaleString()}\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Maximum wait time: ${maxWaitTime.toFixed(1)} minutes\n`;
    results += `Bus utilization: ${(parseFloat(busUtilization) * 100).toFixed(1)}%\n\n`;
    
    results += `OPTIMIZATION SUGGESTIONS:\n`;
    if (avgWaitTime > 15) {
        results += `• Add ${Math.ceil(avgWaitTime / 15)} more buses to reduce wait times\n`;
    }
    if (parseFloat(busUtilization) > 0.8) {
        results += `• Buses are overcrowded - consider larger vehicles\n`;
    }
    if (headway > 20) {
        results += `• Service frequency is low - passengers wait too long\n`;
    }
    
    output.textContent = results;
}

function runSupplyChain() {
    const numSuppliers = parseInt(document.getElementById('supply-suppliers').value);
    const numManufacturers = parseInt(document.getElementById('supply-manufacturers').value);
    const numRetailers = parseInt(document.getElementById('supply-retailers').value);
    
    const output = document.getElementById('supply-output');
    
    let results = "Supply Chain Network Simulation\n";
    results += "==============================\n\n";
    results += `Supply chain structure:\n`;
    results += `Suppliers: ${numSuppliers}\n`;
    results += `Manufacturers: ${numManufacturers}\n`;
    results += `Retailers: ${numRetailers}\n\n`;
    
    // Simulate 30 days of supply chain operations
    const days = 30;
    let totalCost = 0;
    let totalRevenue = 0;
    let stockouts = 0;
    let overstock = 0;
    
    // Initialize inventory levels
    const supplierInventory = new Array(numSuppliers).fill(1000);
    const manufacturerInventory = new Array(numManufacturers).fill(500);
    const retailerInventory = new Array(numRetailers).fill(100);
    
    const rawMaterialCost = 5;
    const manufacturingCost = 15;
    const retailPrice = 50;
    const holdingCostRate = 0.02; // 2% per day
    
    results += "Day\tDemand\tStockouts\tOverstock\tTotal Cost\tRevenue\n";
    results += "---\t------\t---------\t---------\t----------\t-------\n";
    
    for (let day = 1; day <= days; day++) {
        let dayCost = 0;
        let dayRevenue = 0;
        let dayStockouts = 0;
        let dayOverstock = 0;
        
        // Generate consumer demand at retailers
        for (let r = 0; r < numRetailers; r++) {
            const demand = Math.floor(Math.random() * 20) + 5; // 5-24 units per day
            
            if (retailerInventory[r] >= demand) {
                retailerInventory[r] -= demand;
                dayRevenue += demand * retailPrice;
            } else {
                dayRevenue += retailerInventory[r] * retailPrice;
                dayStockouts += demand - retailerInventory[r];
                retailerInventory[r] = 0;
            }
            
            // Holding costs
            dayCost += retailerInventory[r] * retailPrice * holdingCostRate;
            
            // Reorder from manufacturers
            if (retailerInventory[r] < 30) { // Reorder point
                const orderQty = 80; // Order quantity
                const manufacturer = r % numManufacturers;
                
                if (manufacturerInventory[manufacturer] >= orderQty) {
                    manufacturerInventory[manufacturer] -= orderQty;
                    retailerInventory[r] += orderQty;
                    dayCost += orderQty * manufacturingCost;
                }
            }
        }
        
        // Manufacturers order from suppliers
        for (let m = 0; m < numManufacturers; m++) {
            if (manufacturerInventory[m] < 200) { // Reorder point
                const orderQty = 400; // Order quantity
                const supplier = m % numSuppliers;
                
                if (supplierInventory[supplier] >= orderQty) {
                    supplierInventory[supplier] -= orderQty;
                    manufacturerInventory[m] += orderQty;
                    dayCost += orderQty * rawMaterialCost;
                }
            }
            
            // Holding costs
            dayCost += manufacturerInventory[m] * manufacturingCost * holdingCostRate;
            if (manufacturerInventory[m] > 800) {
                dayOverstock += manufacturerInventory[m] - 800;
            }
        }
        
        // Supplier operations
        for (let s = 0; s < numSuppliers; s++) {
            supplierInventory[s] += Math.floor(Math.random() * 200) + 100; // Daily production
            dayCost += supplierInventory[s] * rawMaterialCost * holdingCostRate;
        }
        
        totalCost += dayCost;
        totalRevenue += dayRevenue;
        stockouts += dayStockouts;
        overstock += dayOverstock;
        
        results += `${day}\t${numRetailers * 15}\t${dayStockouts}\t\t${dayOverstock}\t\t$${dayCost.toFixed(0)}\t$${dayRevenue.toFixed(0)}\n`;
    }
    
    const totalProfit = totalRevenue - totalCost;
    const serviceLevel = (1 - stockouts / (numRetailers * 15 * days)) * 100;
    const inventoryTurnover = totalRevenue / (totalCost / days);
    
    results += `\nSUPPLY CHAIN METRICS:\n`;
    results += `Total Revenue: $${totalRevenue.toLocaleString()}\n`;
    results += `Total Costs: $${totalCost.toLocaleString()}\n`;
    results += `Net Profit: $${totalProfit.toLocaleString()}\n`;
    results += `Profit Margin: ${(totalProfit / totalRevenue * 100).toFixed(1)}%\n`;
    results += `Service Level: ${serviceLevel.toFixed(1)}%\n`;
    results += `Total Stockouts: ${stockouts} units\n`;
    results += `Inventory Turnover: ${inventoryTurnover.toFixed(2)}\n\n`;
    
    results += `FINAL INVENTORY LEVELS:\n`;
    results += `Suppliers: ${supplierInventory.map(inv => inv.toLocaleString()).join(', ')}\n`;
    results += `Manufacturers: ${manufacturerInventory.map(inv => inv.toLocaleString()).join(', ')}\n`;
    results += `Retailers: ${retailerInventory.map(inv => inv.toLocaleString()).join(', ')}`;
    
    output.textContent = results;
}

function runSocialServices() {
    const numWindows = parseInt(document.getElementById('social-windows').value);
    const clientRate = parseFloat(document.getElementById('social-clients').value);
    const complexPercent = parseFloat(document.getElementById('social-complex').value) / 100;
    
    const output = document.getElementById('social-output');
    
    let results = "Social Services Office Simulation\n";
    results += "================================\n\n";
    results += `Service windows: ${numWindows}\n`;
    results += `Client arrival rate: ${clientRate} per hour\n`;
    results += `Complex cases: ${(complexPercent * 100).toFixed(0)}%\n\n`;
    
    const simTime = 8 * 60; // 8 hours in minutes
    let currentTime = 0;
    let clientsServed = 0;
    let totalWaitTime = 0;
    let complexCases = 0;
    let simpleCases = 0;
    
    const windows = new Array(numWindows).fill(0); // When each window becomes free
    const queue = [];
    
    const avgArrivalTime = 60 / clientRate;
    const events = [{time: exponentialRandom(avgArrivalTime), type: 'arrival'}];
    
    while (events.length > 0 && currentTime < simTime) {
        events.sort((a, b) => a.time - b.time);
        const event = events.shift();
        currentTime = event.time;
        
        if (currentTime > simTime) break;
        
        if (event.type === 'arrival') {
            const isComplex = Math.random() < complexPercent;
            const client = {
                arrivalTime: currentTime,
                isComplex: isComplex,
                serviceTime: isComplex ? exponentialRandom(25) : exponentialRandom(10) // Complex: 25min avg, Simple: 10min avg
            };
            
            const freeWindow = windows.findIndex(busyUntil => busyUntil <= currentTime);
            
            if (freeWindow !== -1) {
                // Window available immediately
                const waitTime = 0;
                totalWaitTime += waitTime;
                windows[freeWindow] = currentTime + client.serviceTime;
                clientsServed++;
                
                if (isComplex) complexCases++;
                else simpleCases++;
                
                events.push({
                    time: windows[freeWindow],
                    type: 'departure',
                    window: freeWindow
                });
            } else {
                // All windows busy, join queue
                queue.push(client);
            }
            
            // Schedule next arrival
            events.push({
                time: currentTime + exponentialRandom(avgArrivalTime),
                type: 'arrival'
            });
        } else if (event.type === 'departure') {
            // Window becomes available
            if (queue.length > 0) {
                const nextClient = queue.shift();
                const waitTime = currentTime - nextClient.arrivalTime;
                totalWaitTime += waitTime;
                
                windows[event.window] = currentTime + nextClient.serviceTime;
                clientsServed++;
                
                if (nextClient.isComplex) complexCases++;
                else simpleCases++;
                
                events.push({
                    time: windows[event.window],
                    type: 'departure',
                    window: event.window
                });
            }
        }
    }
    
    const avgWaitTime = totalWaitTime / clientsServed;
    const utilization = windows.reduce((sum, busyUntil) => 
        sum + Math.min(busyUntil, simTime), 0) / (numWindows * simTime) * 100;
    const throughput = clientsServed / (simTime / 60);
    
    results += `OFFICE PERFORMANCE METRICS:\n`;
    results += `Clients served: ${clientsServed}\n`;
    results += `Complex cases: ${complexCases} (${(complexCases / clientsServed * 100).toFixed(1)}%)\n`;
    results += `Simple cases: ${simpleCases} (${(simpleCases / clientsServed * 100).toFixed(1)}%)\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Clients still waiting: ${queue.length}\n`;
    results += `Window utilization: ${utilization.toFixed(1)}%\n`;
    results += `Throughput: ${throughput.toFixed(1)} clients/hour\n\n`;
    
    results += `SERVICE RECOMMENDATIONS:\n`;
    if (avgWaitTime > 30) {
        results += `• Wait times are excessive - consider adding ${Math.ceil(avgWaitTime / 20)} more windows\n`;
    }
    if (utilization > 90) {
        results += `• Staff are overworked - consider additional staff or process improvements\n`;
    }
    if (queue.length > 10) {
        results += `• Significant backlog exists - implement appointment system\n`;
    }
    if (complexCases / clientsServed > 0.4) {
        results += `• High complexity cases - consider specialized windows\n`;
    }
    
    output.textContent = results;
}

function runEcommerceSimulation() {
    const dailyVisitors = parseInt(document.getElementById('ecom-visitors').value);
    const conversionRate = parseFloat(document.getElementById('ecom-conversion').value) / 100;
    const serverCapacity = parseInt(document.getElementById('ecom-capacity').value);
    
    const output = document.getElementById('ecom-output');
    
    let results = "E-commerce Platform Simulation\n";
    results += "=============================\n\n";
    results += `Daily visitors: ${dailyVisitors.toLocaleString()}\n`;
    results += `Conversion rate: ${(conversionRate * 100).toFixed(1)}%\n`;
    results += `Server capacity: ${serverCapacity} concurrent users\n\n`;
    
    // Simulate 24 hours with hourly variations
    const hours = 24;
    const hourlyDistribution = [
        0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.04, // 12AM-7AM
        0.05, 0.06, 0.07, 0.08, 0.09, 0.08, 0.07, 0.06, // 8AM-3PM
        0.05, 0.06, 0.07, 0.08, 0.07, 0.06, 0.04, 0.03  // 4PM-11PM
    ];
    
    let totalSales = 0;
    let totalRevenue = 0;
    let serverOverloads = 0;
    let cartAbandonments = 0;
    let totalVisitors = 0;
    
    const avgOrderValue = 75;
    const avgSessionTime = 12; // minutes
    
    results += "Hour\tVisitors\tConcurrent\tSales\tRevenue\tOverloads\n";
    results += "----\t--------\t----------\t-----\t-------\t---------\n";
    
    for (let hour = 0; hour < hours; hour++) {
        const hourlyVisitors = Math.floor(dailyVisitors * hourlyDistribution[hour]);
        totalVisitors += hourlyVisitors;
        
        // Peak concurrent users (assumes normal distribution within hour)
        const peakConcurrent = Math.floor(hourlyVisitors * 0.15); // 15% of hourly visitors concurrent
        
        let hourlyOverloads = 0;
        if (peakConcurrent > serverCapacity) {
            hourlyOverloads = peakConcurrent - serverCapacity;
            serverOverloads += hourlyOverloads;
        }
        
        // Calculate conversions (reduced by server issues)
        const effectiveConversionRate = hourlyOverloads > 0 ? 
            conversionRate * (1 - hourlyOverloads / peakConcurrent * 0.7) : conversionRate;
        
        const sales = Math.floor(hourlyVisitors * effectiveConversionRate);
        const revenue = sales * avgOrderValue * (0.8 + Math.random() * 0.4); // ±20% variation
        
        totalSales += sales;
        totalRevenue += revenue;
        
        // Cart abandonment due to performance issues
        if (hourlyOverloads > 0) {
            cartAbandonments += Math.floor(hourlyVisitors * 0.2 * (hourlyOverloads / peakConcurrent));
        }
        
        results += `${hour.toString().padStart(2, '0')}:00\t${hourlyVisitors}\t\t${peakConcurrent}\t\t${sales}\t$${revenue.toFixed(0)}\t${hourlyOverloads}\n`;
    }
    
    const actualConversionRate = totalSales / totalVisitors * 100;
    const lostRevenue = cartAbandonments * conversionRate * avgOrderValue;
    const serverUtilization = (totalVisitors * avgSessionTime / 60) / (serverCapacity * 24) * 100;
    
    results += `\nE-COMMERCE METRICS:\n`;
    results += `Total visitors: ${totalVisitors.toLocaleString()}\n`;
    results += `Total sales: ${totalSales.toLocaleString()}\n`;
    results += `Total revenue: $${totalRevenue.toLocaleString()}\n`;
    results += `Actual conversion rate: ${actualConversionRate.toFixed(2)}%\n`;
    results += `Average order value: $${(totalRevenue / totalSales).toFixed(2)}\n`;
    results += `Server overloads: ${serverOverloads} user-hours\n`;
    results += `Cart abandonments: ${cartAbandonments}\n`;
    results += `Lost revenue: $${lostRevenue.toLocaleString()}\n`;
    results += `Server utilization: ${serverUtilization.toFixed(1)}%\n\n`;
    
    results += `OPTIMIZATION RECOMMENDATIONS:\n`;
    if (serverOverloads > 0) {
        const additionalCapacity = Math.ceil(serverOverloads / 8); // Peak hours
        results += `• Increase server capacity by ${additionalCapacity} to handle peak loads\n`;
    }
    if (actualConversionRate < conversionRate * 100 * 0.9) {
        results += `• Performance issues reducing conversions - optimize page load times\n`;
    }
    if (cartAbandonments > totalSales * 0.1) {
        results += `• High cart abandonment - implement session recovery features\n`;
    }
    if (serverUtilization > 80) {
        results += `• Servers running near capacity - plan for scaling\n`;
    }
    
    output.textContent = results;
}

function runHealthcareSystem() {
    const numClinics = parseInt(document.getElementById('health-clinics').value);
    const numSpecialists = parseInt(document.getElementById('health-specialists').value);
    const dailyAppointments = parseInt(document.getElementById('health-appointments').value);
    
    const output = document.getElementById('healthcare-output');
    
    let results = "Integrated Healthcare System Simulation\n";
    results += "=====================================\n\n";
    results += `Clinics: ${numClinics}\n`;
    results += `Specialists: ${numSpecialists}\n`;
    results += `Daily appointments: ${dailyAppointments}\n\n`;
    
    // Simulate one week (7 days)
    const days = 7;
    let totalPatients = 0;
    let totalWaitTime = 0;
    let emergencyVisits = 0;
    let referrals = 0;
    let missedAppointments = 0;
    
    const clinicCapacity = Math.floor(dailyAppointments / numClinics);
    const specialistCapacity = Math.floor(dailyAppointments * 0.3 / numSpecialists); // 30% referrals
    
    results += "Day\tClinic\tEmergency\tReferrals\tWait(min)\tMissed\n";
    results += "---\t------\t---------\t---------\t---------\t------\n";
    
    for (let day = 1; day <= days; day++) {
        let dayPatients = 0;
        let dayWaitTime = 0;
        let dayEmergency = 0;
        let dayReferrals = 0;
        let dayMissed = 0;
        
        // Scheduled appointments
        for (let clinic = 0; clinic < numClinics; clinic++) {
            const scheduledPatients = clinicCapacity + Math.floor(Math.random() * 10 - 5); // ±5 variation
            dayPatients += scheduledPatients;
            
            // Average wait time per clinic (varies by efficiency)
            const avgWaitTime = 15 + Math.random() * 20; // 15-35 minutes
            dayWaitTime += scheduledPatients * avgWaitTime;
            
            // Generate referrals (20% of patients)
            const clinicReferrals = Math.floor(scheduledPatients * 0.2);
            dayReferrals += clinicReferrals;
            
            // Missed appointments (5-10%)
            const noShows = Math.floor(scheduledPatients * (0.05 + Math.random() * 0.05));
            dayMissed += noShows;
        }
        
        // Emergency visits (unscheduled)
        dayEmergency = Math.floor(Math.random() * dailyAppointments * 0.1); // 10% emergency rate
        dayPatients += dayEmergency;
        dayWaitTime += dayEmergency * 45; // Emergencies wait longer initially
        
        // Specialist appointments
        for (let specialist = 0; specialist < numSpecialists; specialist++) {
            const specialistPatients = Math.min(specialistCapacity, dayReferrals / numSpecialists);
            dayPatients += specialistPatients;
            dayWaitTime += specialistPatients * 25; // Specialists take longer
        }
        
        totalPatients += dayPatients;
        totalWaitTime += dayWaitTime;
        emergencyVisits += dayEmergency;
        referrals += dayReferrals;
        missedAppointments += dayMissed;
        
        const avgDayWait = dayPatients > 0 ? dayWaitTime / dayPatients : 0;
        
        results += `${day}\t${dayPatients - dayEmergency - Math.floor(dayReferrals)}\t${dayEmergency}\t\t${dayReferrals}\t\t${avgDayWait.toFixed(0)}\t\t${dayMissed}\n`;
    }
    
    const avgWaitTime = totalWaitTime / totalPatients;
    const systemUtilization = totalPatients / (days * dailyAppointments * 1.3) * 100; // 30% buffer
    const referralRate = referrals / totalPatients * 100;
    const noShowRate = missedAppointments / (totalPatients + missedAppointments) * 100;
    
    results += `\nHEALTHCARE SYSTEM METRICS:\n`;
    results += `Total patients served: ${totalPatients}\n`;
    results += `Average wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Emergency visits: ${emergencyVisits} (${(emergencyVisits / totalPatients * 100).toFixed(1)}%)\n`;
    results += `Referrals generated: ${referrals} (${referralRate.toFixed(1)}%)\n`;
    results += `Missed appointments: ${missedAppointments} (${noShowRate.toFixed(1)}%)\n`;
    results += `System utilization: ${systemUtilization.toFixed(1)}%\n`;
    results += `Patients per day: ${(totalPatients / days).toFixed(0)}\n\n`;
    
    results += `HEALTHCARE RECOMMENDATIONS:\n`;
    if (avgWaitTime > 30) {
        results += `• Wait times excessive - increase staffing or extend hours\n`;
    }
    if (referralRate > 25) {
        results += `• High referral rate - consider expanding primary care services\n`;
    }
    if (noShowRate > 10) {
        results += `• High no-show rate - implement reminder systems\n`;
    }
    if (systemUtilization > 90) {
        results += `• System at capacity - plan expansion or optimize scheduling\n`;
    }
    if (emergencyVisits / totalPatients > 0.15) {
        results += `• High emergency visits - improve preventive care access\n`;
    }
    
    // Resource allocation recommendations
    const optimalClinics = Math.ceil(totalPatients / days / clinicCapacity);
    const optimalSpecialists = Math.ceil(referrals / days / specialistCapacity);
    
    results += `\nRESOURCE OPTIMIZATION:\n`;
    results += `Optimal clinics needed: ${optimalClinics}\n`;
    results += `Optimal specialists needed: ${optimalSpecialists}\n`;
    if (optimalClinics > numClinics) {
        results += `Consider adding ${optimalClinics - numClinics} more clinics\n`;
    }
    if (optimalSpecialists > numSpecialists) {
        results += `Consider adding ${optimalSpecialists - numSpecialists} more specialists\n`;
    }
    
    output.textContent = results;
}

function runAirportSecurity() {
    scrollToTop();
    const output = document.getElementById('airportSecurityOutput');
    if (!output) {
        alert('Airport Security output element not found!');
        return;
    }
    
    const passengers = parseInt(document.getElementById('airportPassengers')?.value) || 500;
    const securityLines = parseInt(document.getElementById('airportLines')?.value) || 6;
    const avgScreeningTime = parseFloat(document.getElementById('airportScreeningTime')?.value) || 2.5;
    const days = parseInt(document.getElementById('airportDays')?.value) || 30;
    
    let results = `AIRPORT SECURITY SIMULATION\n`;
    results += `==========================================\n`;
    results += `Passengers per day: ${passengers}\n`;
    results += `Security lines: ${securityLines}\n`;
    results += `Average screening time: ${avgScreeningTime} minutes\n`;
    results += `Simulation period: ${days} days\n\n`;
    
    let totalWaitTime = 0;
    let totalPassengers = 0;
    let maxWaitTime = 0;
    let delayedFlights = 0;
    let peakHourDelays = 0;
    
    // Simulate each day
    for (let day = 1; day <= days; day++) {
        let dailyPassengers = Math.round(passengers * (0.8 + Math.random() * 0.4)); // 80-120% variation
        totalPassengers += dailyPassengers;
        
        // Peak hours simulation (6-9 AM, 4-7 PM)
        const peakPassengers = Math.round(dailyPassengers * 0.6); // 60% during peak
        const regularPassengers = dailyPassengers - peakPassengers;
        
        // Peak hours processing
        const peakCapacity = securityLines * (60 / avgScreeningTime) * 3; // 3 hours
        const peakWaitTime = Math.max(0, (peakPassengers - peakCapacity) / securityLines * avgScreeningTime);
        
        // Regular hours processing  
        const regularCapacity = securityLines * (60 / avgScreeningTime) * 21; // 21 hours
        const regularWaitTime = Math.max(0, (regularPassengers - regularCapacity) / securityLines * avgScreeningTime);
        
        const avgDailyWait = (peakWaitTime + regularWaitTime) / 2;
        totalWaitTime += avgDailyWait;
        maxWaitTime = Math.max(maxWaitTime, peakWaitTime);
        
        // Flight delays (if wait time > 45 minutes)
        if (peakWaitTime > 45) {
            delayedFlights += Math.round(Math.random() * 5 + 1);
            peakHourDelays++;
        }
    }
    
    const avgWaitTime = totalWaitTime / days;
    const throughputPerLine = totalPassengers / days / securityLines;
    const systemEfficiency = Math.min(100, (securityLines * 60 / avgScreeningTime * 24) / (totalPassengers / days) * 100);
    
    results += `SIMULATION RESULTS:\n`;
    results += `Average daily wait time: ${avgWaitTime.toFixed(1)} minutes\n`;
    results += `Maximum wait time: ${maxWaitTime.toFixed(1)} minutes\n`;
    results += `Total passengers processed: ${totalPassengers.toLocaleString()}\n`;
    results += `Throughput per line: ${throughputPerLine.toFixed(0)} passengers/day\n`;
    results += `System efficiency: ${systemEfficiency.toFixed(1)}%\n`;
    results += `Delayed flights: ${delayedFlights}\n`;
    results += `Peak hour delays: ${peakHourDelays} days\n\n`;
    
    // Service level analysis
    const serviceLevel = avgWaitTime <= 15 ? 'Excellent' : 
                        avgWaitTime <= 25 ? 'Good' : 
                        avgWaitTime <= 40 ? 'Fair' : 'Poor';
    
    results += `SERVICE ANALYSIS:\n`;
    results += `Service Level: ${serviceLevel}\n`;
    results += `Customer Satisfaction: ${Math.max(0, 100 - avgWaitTime * 2).toFixed(0)}%\n`;
    results += `Operational Cost: $${(securityLines * 50000 + totalPassengers * 2.5).toLocaleString()}\n\n`;
    
    results += `SECURITY RECOMMENDATIONS:\n`;
    if (avgWaitTime > 30) {
        results += `• Wait times excessive - add ${Math.ceil(avgWaitTime / 15)} more security lines\n`;
    }
    if (maxWaitTime > 60) {
        results += `• Peak hour bottlenecks - implement dynamic staffing\n`;
    }
    if (delayedFlights > 10) {
        results += `• Flight delays critical - prioritize passenger flow optimization\n`;
    }
    if (systemEfficiency < 80) {
        results += `• Low efficiency - optimize screening procedures and staff training\n`;
    }
    if (peakHourDelays > days * 0.3) {
        results += `• Frequent peak delays - consider pre-check expansion or off-peak incentives\n`;
    }
    
    // Optimization recommendations
    const optimalLines = Math.ceil((totalPassengers / days) / (60 / avgScreeningTime) / 20); // 20 hours operation
    const costSavings = securityLines > optimalLines ? (securityLines - optimalLines) * 50000 : 0;
    
    results += `\nOPTIMIZATION:\n`;
    results += `Optimal security lines: ${optimalLines}\n`;
    if (costSavings > 0) {
        results += `Potential cost savings: $${costSavings.toLocaleString()}\n`;
    }
    if (optimalLines > securityLines) {
        results += `Consider adding ${optimalLines - securityLines} more lines\n`;
    }
    
    output.textContent = results;
}