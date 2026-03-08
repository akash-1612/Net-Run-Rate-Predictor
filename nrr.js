// Tab switching functionality
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    if (tabName === 'calculator') {
        document.getElementById('calculatorTab').classList.add('active');
        document.querySelectorAll('.menu-tab')[0].classList.add('active');
    } else if (tabName === 'predictor') {
        document.getElementById('predictorTab').classList.add('active');
        document.querySelectorAll('.menu-tab')[1].classList.add('active');
    }
}

// Mode switching for predictor
function switchMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });

    if (mode === 'batting') {
        document.getElementById('battingMode').classList.add('active');
        document.querySelectorAll('.mode-btn')[0].classList.add('active');
    } else if (mode === 'bowling') {
        document.getElementById('bowlingMode').classList.add('active');
        document.querySelectorAll('.mode-btn')[1].classList.add('active');
    }
}

// Show/hide opponent matches played field based on checkbox
document.addEventListener('DOMContentLoaded', function() {
    const sameOpponentCheckbox = document.getElementById('sameOpponent');
    const opponentMatchesPlayedGroup = document.getElementById('opponentMatchesPlayedGroup');
    
    sameOpponentCheckbox.addEventListener('change', function() {
        if (this.checked) {
            opponentMatchesPlayedGroup.style.display = 'block';
        } else {
            opponentMatchesPlayedGroup.style.display = 'none';
        }
    });
});

// Convert overs.balls format to actual overs (decimal)
function convertOversToDecimal(overs) {
    const oversStr = overs.toString();
    const parts = oversStr.split('.');
    const wholeOvers = parseInt(parts[0]) || 0;
    const balls = parseInt(parts[1]) || 0;
    
    // Validate balls (should be 0-5)
    if (balls > 5) {
        throw new Error('Balls in an over cannot exceed 5 (use format: overs.balls where balls is 0-5)');
    }
    
    return wholeOvers + (balls / 6);
}

function validateInputs(runsScored, oversFaced, runsConceded, oversBowled) {
    if (!runsScored && runsScored !== 0) {
        throw new Error('Please enter runs scored');
    }
    if (!oversFaced) {
        throw new Error('Please enter overs faced');
    }
    if (!runsConceded && runsConceded !== 0) {
        throw new Error('Please enter runs conceded');
    }
    if (!oversBowled) {
        throw new Error('Please enter overs bowled');
    }
    
    if (runsScored < 0 || runsConceded < 0) {
        throw new Error('Runs cannot be negative');
    }
    if (oversFaced <= 0 || oversBowled <= 0) {
        throw new Error('Overs must be greater than zero');
    }
}

function calculateNRR() {
    // Hide previous results and errors
    document.getElementById('resultSection').classList.remove('show');
    document.getElementById('errorMessage').classList.remove('show');

    try {
        // Get input values
        const runsScored = parseFloat(document.getElementById('runsScored').value);
        const oversFacedInput = parseFloat(document.getElementById('oversFaced').value);
        const runsConceded = parseFloat(document.getElementById('runsConceded').value);
        const oversBowledInput = parseFloat(document.getElementById('oversBowled').value);

        // Get all out checkboxes
        const teamAAllOut = document.getElementById('teamAAllOut').checked;
        const teamBAllOut = document.getElementById('teamBAllOut').checked;

        // Get current NRR and matches played for both teams
        const teamACurrentNRR = parseFloat(document.getElementById('teamACurrentNRR').value) || 0;
        const teamAMatchesPlayed = parseFloat(document.getElementById('teamAMatchesPlayed').value) || 0;
        const teamBCurrentNRR = parseFloat(document.getElementById('teamBCurrentNRR').value) || 0;
        const teamBMatchesPlayed = parseFloat(document.getElementById('teamBMatchesPlayed').value) || 0;

        // Validate inputs
        validateInputs(runsScored, oversFacedInput, runsConceded, oversBowledInput);

        // Convert overs to decimal format
        let oversFaced = convertOversToDecimal(oversFacedInput);
        let oversBowled = convertOversToDecimal(oversBowledInput);
        
        // Determine maximum overs (20 for T20, 50 for ODI)
        const maxOvers = oversFacedInput >= 40 || oversBowledInput >= 40 ? 50 : 20;
        
        // ICC Rule: If team is all out, use full quota of overs for NRR calculation
        if (teamAAllOut && oversFaced < maxOvers) {
            oversFaced = maxOvers;
        }
        if (teamBAllOut && oversBowled < maxOvers) {
            oversBowled = maxOvers;
        }

        // Calculate match NRR (this match only)
        const matchRunRateFor = runsScored / oversFaced;
        const matchRunRateAgainst = runsConceded / oversBowled;
        const matchNRR = matchRunRateFor - matchRunRateAgainst;

        // Calculate new cumulative NRR for both teams
        const teamAData = calculateCumulativeNRR(
            teamACurrentNRR, teamAMatchesPlayed,
            runsScored, oversFaced, runsConceded, oversBowled, maxOvers
        );

        const teamBData = calculateCumulativeNRR(
            teamBCurrentNRR, teamBMatchesPlayed,
            runsConceded, oversBowled, runsScored, oversFaced, maxOvers
        );

        // Display results
        displayResults(teamAData, teamBData, matchRunRateFor, matchRunRateAgainst);

    } catch (error) {
        showError(error.message);
    }
}

function calculateCumulativeNRR(currentNRR, matchesPlayed, runsScored, oversFaced, runsConceded, oversBowled, maxOvers) {
    // Estimate overs per match (use the max overs as reference)
        const oversPerMatch = maxOvers;
    
    // If there are previous matches, back-calculate cumulative stats
    if (matchesPlayed > 0 && currentNRR !== 0) {
        // Assume standard overs per match
        const totalPrevOvers = matchesPlayed * oversPerMatch;
        
        // Use average run rate to estimate previous totals
        // This is an approximation since we don't have exact previous match data
        const avgRunRate = oversPerMatch >= 40 ? 5.0 : 8.0; // ODI vs T20
        const prevTotalRunsScored = totalPrevOvers * avgRunRate;
        const prevTotalRunsConceded = prevTotalRunsScored - (currentNRR * totalPrevOvers);
        
        // Add this match's stats
        const newTotalRunsScored = prevTotalRunsScored + runsScored;
        const newTotalOversFaced = totalPrevOvers + oversFaced;
        const newTotalRunsConceded = prevTotalRunsConceded + runsConceded;
        const newTotalOversBowled = totalPrevOvers + oversBowled;
        
        // Calculate new NRR
        const newRunRateFor = newTotalRunsScored / newTotalOversFaced;
        const newRunRateAgainst = newTotalRunsConceded / newTotalOversBowled;
        const newNRR = newRunRateFor - newRunRateAgainst;
        
        return {
            currentNRR: currentNRR,
            matchNRR: (runsScored / oversFaced) - (runsConceded / oversBowled),
            newNRR: newNRR,
            runRate: newRunRateFor
        };
    } else {
        // First match or no current NRR - just use this match's stats
        const runRateFor = runsScored / oversFaced;
        const runRateAgainst = runsConceded / oversBowled;
        const nrr = runRateFor - runRateAgainst;
        
        return {
            currentNRR: 0,
            matchNRR: nrr,
            newNRR: nrr,
            runRate: runRateFor
        };
    }
}

function displayResults(teamAData, teamBData, runRateFor, runRateAgainst) {
    const resultSection = document.getElementById('resultSection');

    // Get team names
    const teamAName = document.getElementById('teamAName').value.trim() || 'Team A';
    const teamBName = document.getElementById('teamBName').value.trim() || 'Team B';

    // Update team names in results
    document.getElementById('teamAResultName').textContent = teamAName;
    document.getElementById('teamBResultName').textContent = teamBName;

    // Display Team A NRR (New NRR after this match)
    const teamANrrElement = document.getElementById('teamANrr');
    const teamANrrFormatted = teamAData.newNRR >= 0 ? '+' + teamAData.newNRR.toFixed(3) : teamAData.newNRR.toFixed(3);
    teamANrrElement.textContent = teamANrrFormatted;
    teamANrrElement.className = 'nrr-value';
    if (teamAData.newNRR > 0) {
        teamANrrElement.classList.add('nrr-positive');
    } else if (teamAData.newNRR < 0) {
        teamANrrElement.classList.add('nrr-negative');
    } else {
        teamANrrElement.classList.add('nrr-neutral');
    }

    // Display Team B NRR (New NRR after this match)
    const teamBNrrElement = document.getElementById('teamBNrr');
    const teamBNrrFormatted = teamBData.newNRR >= 0 ? '+' + teamBData.newNRR.toFixed(3) : teamBData.newNRR.toFixed(3);
    teamBNrrElement.textContent = teamBNrrFormatted;
    teamBNrrElement.className = 'nrr-value';
    if (teamBData.newNRR > 0) {
        teamBNrrElement.classList.add('nrr-positive');
    } else if (teamBData.newNRR < 0) {
        teamBNrrElement.classList.add('nrr-negative');
    } else {
        teamBNrrElement.classList.add('nrr-neutral');
    }

    // Display detailed stats for Team A
    document.getElementById('teamAMatchNRR').textContent = (teamAData.matchNRR >= 0 ? '+' : '') + teamAData.matchNRR.toFixed(3);
    document.getElementById('teamACurrentNRRDisplay').textContent = (teamAData.currentNRR >= 0 ? '+' : '') + teamAData.currentNRR.toFixed(3);
    document.getElementById('teamARunRate').textContent = teamAData.runRate.toFixed(2);

    // Display detailed stats for Team B
    document.getElementById('teamBMatchNRR').textContent = (teamBData.matchNRR >= 0 ? '+' : '') + teamBData.matchNRR.toFixed(3);
    document.getElementById('teamBCurrentNRRDisplay').textContent = (teamBData.currentNRR >= 0 ? '+' : '') + teamBData.currentNRR.toFixed(3);
    document.getElementById('teamBRunRate').textContent = teamBData.runRate.toFixed(2);

    // Show result section with animation
    resultSection.classList.add('show');

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = ' ' + message;
    errorElement.classList.add('show');

    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

function resetForm() {
    // Clear all input fields
    document.getElementById('teamAName').value = '';
    document.getElementById('teamBName').value = '';
    document.getElementById('teamACurrentNRR').value = '';
    document.getElementById('teamAMatchesPlayed').value = '0';
    document.getElementById('teamBCurrentNRR').value = '';
    document.getElementById('teamBMatchesPlayed').value = '0';
    document.getElementById('runsScored').value = '';
    document.getElementById('oversFaced').value = '';
    document.getElementById('runsConceded').value = '';
    document.getElementById('oversBowled').value = '';
    document.getElementById('teamAAllOut').checked = false;
    document.getElementById('teamBAllOut').checked = false;

    // Hide results and errors
    document.getElementById('resultSection').classList.remove('show');
    document.getElementById('errorMessage').classList.remove('show');

    // Focus on first input
    document.getElementById('teamAName').focus();
}

// Add Enter key support for better UX
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    // Trigger calculate based on active tab
                    if (document.getElementById('calculatorTab').classList.contains('active')) {
                        calculateNRR();
                    } else if (document.getElementById('battingMode').classList.contains('active')) {
                        predictBatting();
                    } else if (document.getElementById('bowlingMode').classList.contains('active')) {
                        predictBowling();
                    }
                }
            }
        });
    });

    // Focus first input on load
    document.getElementById('teamAName').focus();
});

// Add real-time input formatting hints
const oversInputs = ['oversFaced', 'oversBowled'];
oversInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', function(e) {
        const value = e.target.value;
        if (value.includes('.')) {
            const balls = value.split('.')[1];
            if (balls && parseInt(balls) > 5) {
                e.target.setCustomValidity('Balls cannot exceed 5');
            } else {
                e.target.setCustomValidity('');
            }
        }
    });
});

// Predictor Functions
function predictBatting() {
    document.getElementById('battingResult').classList.remove('show');
    document.getElementById('predictorError').classList.remove('show');

    try {
        // Get inputs
        const yourTeamName = document.getElementById('yourTeamName').value.trim() || 'Your Team';
        const currentNRR = parseFloat(document.getElementById('currentNRR').value);
        const matchesPlayed = parseFloat(document.getElementById('matchesPlayed').value);
        const oversPerMatchInput = parseFloat(document.getElementById('oversPerMatch').value);
        const targetRuns = parseFloat(document.getElementById('targetRuns').value);
        const maxOversInput = parseFloat(document.getElementById('maxOvers').value);
        const opponentOversFacedInput = parseFloat(document.getElementById('opponentOversFaced').value);
        const opponentRunsConceded = targetRuns - 1; // Opponent scored (target - 1) runs
        const opponentTeamName = document.getElementById('opponentTeamName').value.trim() || 'Opponent Team';
        let targetNRR = parseFloat(document.getElementById('targetNRR').value);
        const sameOpponent = document.getElementById('sameOpponent').checked;
        const opponentMatchesPlayed = sameOpponent ? parseFloat(document.getElementById('opponentMatchesPlayed').value) : 0;

        // Validate
        if (isNaN(currentNRR) || isNaN(matchesPlayed) || isNaN(oversPerMatchInput) || 
            isNaN(targetRuns) || isNaN(maxOversInput) || 
            isNaN(opponentOversFacedInput) || isNaN(targetNRR)) {
            throw new Error('Please fill in all required fields');
        }

        if (sameOpponent && isNaN(opponentMatchesPlayed)) {
            throw new Error('Please enter opponent\'s matches played before this match');
        }

        // Convert overs
        const oversPerMatch = convertOversToDecimal(oversPerMatchInput);
        const maxOvers = convertOversToDecimal(maxOversInput);
        const opponentOversFaced = convertOversToDecimal(opponentOversFacedInput);
        
        // Calculate cumulative stats from current NRR and matches played
        const totalOversFaced = matchesPlayed * oversPerMatch;
        const totalOversBowled = matchesPlayed * oversPerMatch;
        
        const baselineRunRate = oversPerMatch >= 40 ? 5.0 : 8.0; // ODI vs T20
        const totalRunsScored = totalOversFaced * baselineRunRate;
        const totalRunsConceded = totalRunsScored - (currentNRR * totalOversBowled);

        // If playing against same opponent, calculate their NEW NRR after this match
        if (sameOpponent) {
            // Calculate opponent's current cumulative stats
            const opponentTotalOversFaced = opponentMatchesPlayed * oversPerMatch;
            const opponentTotalOversBowled = opponentMatchesPlayed * oversPerMatch;
            const opponentBaselineRunRate = oversPerMatch >= 40 ? 5.0 : 8.0;
            const opponentTotalRunsScored = opponentTotalOversFaced * opponentBaselineRunRate;
            const opponentTotalRunsConceded = opponentTotalRunsScored - (targetNRR * opponentTotalOversBowled);
            const opponentNewTotalRunsScored = opponentTotalRunsScored + opponentRunsConceded;
            const opponentNewTotalOversFaced = opponentTotalOversFaced + opponentOversFaced;
            const opponentNewTotalRunsConceded = opponentTotalRunsConceded + targetRuns;
            const opponentNewTotalOversBowled = opponentTotalOversBowled + maxOvers;
            
            const opponentNewNRR = (opponentNewTotalRunsScored / opponentNewTotalOversFaced) -
                                (opponentNewTotalRunsConceded / opponentNewTotalOversBowled);
            
            targetNRR = opponentNewNRR;
            
            console.log(`Opponent's current NRR: ${parseFloat(document.getElementById('targetNRR').value).toFixed(3)}`);
            console.log(`Opponent's projected new NRR after match: ${targetNRR.toFixed(3)}`);
        }

        // Calculate required NRR
        const requiredNRR = targetNRR + 0.001; // Need to beat by at least 0.001

        // After this match, runs conceded will include opponent's runs
        const newTotalRunsConceded = totalRunsConceded + opponentRunsConceded;
        const newTotalOversBowled = totalOversBowled + opponentOversFaced;

        
        
        const runRateAgainst = newTotalRunsConceded / newTotalOversBowled;
        const requiredRunRate = requiredNRR + runRateAgainst;

        // Required overs: (totalRunsScored + targetRuns) / requiredRunRate - totalOversFaced
        const requiredOversDecimal = ((totalRunsScored + targetRuns) / requiredRunRate) - totalOversFaced;

        // Check if it's achievable
        if (requiredOversDecimal > maxOvers) {
            showPredictorError('battingResult', 
                `Cannot Achieve Target NRR`,
                `To surpass ${opponentTeamName}'s NRR of ${targetNRR.toFixed(3)}, you would need ${formatOvers(requiredOversDecimal)} overs, but only ${formatOvers(maxOvers)} overs are available.<br><br>
                <strong>Even winning in ${formatOvers(maxOvers)} overs won't be enough to beat their NRR.</strong><br><br>
                Your projected NRR if you win in ${formatOvers(maxOvers)} overs: ${calculateProjectedNRR(totalRunsScored + targetRuns, totalOversFaced + maxOvers, newTotalRunsConceded, newTotalOversBowled).toFixed(3)}`);
            return;
        }

        if (requiredOversDecimal < 0.1) {
            showPredictorError('battingResult', 
                `Already Above Target`,
                `Based on your current stats, you're already projected to surpass ${opponentTeamName}'s NRR even if you chase slowly!<br><br>
                Just win the match and you'll beat their NRR.`);
            return;
        }

        // Calculate new NRR after achieving target
        const newNRR = calculateProjectedNRR(
            totalRunsScored + targetRuns, 
            totalOversFaced + requiredOversDecimal, 
            newTotalRunsConceded, 
            newTotalOversBowled
        );

        // Display result
        displayBattingResult(yourTeamName, opponentTeamName, requiredOversDecimal, targetRuns, newNRR, targetNRR, requiredRunRate, sameOpponent, parseFloat(document.getElementById('targetNRR').value));

    } catch (error) {
        showPredictorErrorMessage('predictorError', error.message);
    }
}

function predictBowling() {
    document.getElementById('bowlingResult').classList.remove('show');
    document.getElementById('predictorErrorBowl').classList.remove('show');

    try {
        // Get inputs
        const yourTeamName = document.getElementById('yourTeamNameBowl').value.trim() || 'Your Team';
        const matchesPlayed = parseFloat(document.getElementById('matchesPlayedBowl').value);
        const cumulativeRunsScored = parseFloat(document.getElementById('cumulativeRunsScoredBowl').value);
        const cumulativeOversFaced = parseFloat(document.getElementById('cumulativeOversFacedBowl').value);
        const cumulativeRunsConceded = parseFloat(document.getElementById('cumulativeRunsConcededBowl').value);
        const cumulativeOversBowled = parseFloat(document.getElementById('cumulativeOversBowledBowl').value);
        const yourRunsScored = parseFloat(document.getElementById('yourRunsScored').value);
        const yourOversFacedInput = parseFloat(document.getElementById('yourOversFaced').value);
        const maxOversInput = parseFloat(document.getElementById('maxOversBowl').value);
        const opponentTeamName = document.getElementById('opponentTeamNameBowl').value.trim() || 'Opponent';
        const targetNRR = parseFloat(document.getElementById('targetNRRBowl').value);
        const targetTeamName = document.getElementById('targetTeamNameBowl').value.trim() || 'Target Team';

        // Validate
        if (isNaN(matchesPlayed) || isNaN(cumulativeRunsScored) || isNaN(cumulativeOversFaced) ||
            isNaN(cumulativeRunsConceded) || isNaN(cumulativeOversBowled) ||
            isNaN(yourRunsScored) || isNaN(yourOversFacedInput) || 
            isNaN(maxOversInput) || isNaN(targetNRR)) {
            throw new Error('Please fill in all required fields');
        }

        if (cumulativeOversFaced <= 0 || cumulativeOversBowled <= 0) {
            throw new Error('Overs must be greater than 0');
        }

        // Convert overs
        const yourOversFaced = convertOversToDecimal(yourOversFacedInput);
        const maxOvers = convertOversToDecimal(maxOversInput);
        
        // Calculate current NRR for display
        const currentNRR = (cumulativeRunsScored / cumulativeOversFaced) - 
                          (cumulativeRunsConceded / cumulativeOversBowled);

        // After this match, your batting stats update
        const newTotalRunsScored = cumulativeRunsScored + yourRunsScored;
        const newTotalOversFaced = cumulativeOversFaced + yourOversFaced;
        const runRateFor = newTotalRunsScored / newTotalOversFaced;

        // Required NRR - need to be slightly above target
        const requiredNRR = targetNRR + 0.001;

        // Calculate scenarios: for different overs bowled, what's the max runs allowed?
        const scenarios = [];
        
        for (let overs = 10; overs <= maxOvers; overs += 0.5) {
            // New NRR = runRateFor - (newTotalRunsConceded / newTotalOversBowled)
            // We need: runRateFor - (newTotalRunsConceded / newTotalOversBowled) >= requiredNRR
            // So: (newTotalRunsConceded / newTotalOversBowled) <= runRateFor - requiredNRR
            // Therefore: newTotalRunsConceded <= (runRateFor - requiredNRR) * newTotalOversBowled
            
            const newTotalOversBowled = cumulativeOversBowled + overs;const maxTotalRunsConceded = (runRateFor - requiredNRR) * newTotalOversBowled;
            const maxRunsAllowed = maxTotalRunsConceded - cumulativeRunsConceded;
            
            if (maxRunsAllowed >= 0) {
                const yourNRR = runRateFor - ((cumulativeRunsConceded + maxRunsAllowed) / newTotalOversBowled);
                scenarios.push({
                    overs: overs,
                    maxRuns: Math.floor(maxRunsAllowed),
                    nrr: yourNRR
                });
            }
        }

        if (scenarios.length === 0) {
            showPredictorError('bowlingResult', 
                `Cannot Surpass Target NRR`,
                `Based on your cumulative stats and this match's batting performance, it's mathematically impossible to defend and maintain NRR above ${targetNRR.toFixed(3)}.<br><br>
                Your batting performance (${yourRunsScored} runs in ${formatOvers(yourOversFaced)} overs) wasn't strong enough to create a defendable NRR cushion.`);
            return;
        }

        // Display bowling result
        displayBowlingResult(yourTeamName, opponentTeamName, yourRunsScored, scenarios, 
                           targetNRR, runRateFor, targetTeamName, currentNRR);

    } catch (error) {
        showPredictorErrorMessage('predictorErrorBowl', error.message);
    }
}

function calculateProjectedNRR(totalRunsScored, totalOversFaced, totalRunsConceded, totalOversBowled) {
    return (totalRunsScored / totalOversFaced) - (totalRunsConceded / totalOversBowled);
}

function formatOvers(decimalOvers) {
    const wholeOvers = Math.floor(decimalOvers);
    const balls = Math.round((decimalOvers - wholeOvers) * 6);
    return `${wholeOvers}.${balls}`;
}

function displayBattingResult(teamName, opponentName, requiredOvers, targetRuns, newNRR, targetNRR, requiredRunRate, sameOpponent, originalTargetNRR) {
    const resultDiv = document.getElementById('battingResult');
    
    const oversFormatted = formatOvers(requiredOvers);
    
    const actualRequiredRunRate = targetRuns / requiredOvers;
    
    let nrrExplanation = '';
    if (sameOpponent) {
        nrrExplanation = `
            <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
            <p style="font-size: 0.95em; opacity: 0.9;"> <strong>Note:</strong> ${opponentName}'s current NRR is ${originalTargetNRR >= 0 ? '+' : ''}${originalTargetNRR.toFixed(3)}, but after this match their projected NRR will be ${targetNRR >= 0 ? '+' : ''}${targetNRR.toFixed(3)}. You need to beat their NEW NRR.</p>
        `;
    }
    
    resultDiv.innerHTML = `
        <h3> Chase Prediction for ${teamName}</h3>
        <div class="big-number">${oversFormatted} Overs</div>
        <div class="predictor-details">
            <p><strong>Target:</strong> ${targetRuns} runs</p>
            <p><strong>Chase within:</strong> ${oversFormatted} overs (${requiredOvers.toFixed(2)} overs)</p>
            <p><strong>Required Run Rate:</strong> ${actualRequiredRunRate.toFixed(2)} runs per over</p>
            <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
            <p><strong>Your New NRR:</strong> ${newNRR >= 0 ? '+' : ''}${newNRR.toFixed(3)}</p>
            <p><strong>${opponentName}'s ${sameOpponent ? 'Projected' : ''} NRR:</strong> ${targetNRR >= 0 ? '+' : ''}${targetNRR.toFixed(3)}</p>
            <p><strong>NRR Advantage:</strong> ${(newNRR - targetNRR >= 0 ? '+' : '')}${(newNRR - targetNRR).toFixed(3)}</p>
            ${nrrExplanation}
            <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
            <p style="font-size: 1.1em;"><strong>Win in ${oversFormatted} overs or less to surpass ${opponentName}'s NRR!</strong></p>
        </div>
    `;
    
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayBowlingResult(teamName, opponentName, yourRuns, scenarios, targetNRR, runRateFor, targetTeamName, currentNRR) {
    const resultDiv = document.getElementById('bowlingResult');
    
    // Best case: all out as early as possible
    const bestScenario = scenarios[0];
    const worstScenario = scenarios[scenarios.length - 1];
    
    let scenariosHTML = '';
    const selectedScenarios = scenarios.filter((s, i) => i % 6 === 0 || i === scenarios.length - 1);
    selectedScenarios.forEach(scenario => {
        scenariosHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                <td style="padding: 8px;">${formatOvers(scenario.overs)}</td>
                <td style="padding: 8px;"><strong>${scenario.maxRuns}</strong></td>
                <td style="padding: 8px;">${scenario.nrr >= 0 ? '+' : ''}${scenario.nrr.toFixed(3)}</td>
            </tr>
        `;
    });
    
    resultDiv.innerHTML = `
        <h3>🛡️ Defense Strategy for ${teamName}</h3>
        <div class="big-number">${yourRuns} Runs to Defend</div>
        <div class="predictor-details">
            <p><strong>Your Current NRR:</strong> ${currentNRR >= 0 ? '+' : ''}${currentNRR.toFixed(3)}</p>
            <p><strong>Your Score This Match:</strong> ${yourRuns} runs</p>
            <p><strong>Your Projected Run Rate For:</strong> ${runRateFor.toFixed(2)}</p>
            <p><strong>${targetTeamName}'s NRR to Beat:</strong> ${targetNRR >= 0 ? '+' : ''}${targetNRR.toFixed(3)}</p>
            <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
            <p style="font-size: 1.15em;"><strong>Defense Scenarios vs ${opponentName} to Beat ${targetTeamName}'s NRR:</strong></p>
            <table style="width: 100%; margin-top: 10px; text-align: center;">
                <thead>
                    <tr style="border-bottom: 2px solid rgba(255,255,255,0.4);">
                        <th style="padding: 10px;">Overs</th>
                        <th style="padding: 10px;">Max Runs Allowed</th>
                        <th style="padding: 10px;">Your NRR</th>
                    </tr>
                </thead>
                <tbody>
                    ${scenariosHTML}
                </tbody>
            </table>
            <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
            <p style="font-size: 1.1em;"><strong>Best Case:</strong> Restrict to ${bestScenario.maxRuns} runs in ${formatOvers(bestScenario.overs)} overs</p>
            <p style="font-size: 1.1em;"><strong>Worst Case:</strong> Can allow up to ${worstScenario.maxRuns} runs in ${formatOvers(worstScenario.overs)} overs</p>
        </div>
    `;
    
    resultDiv.style.background = 'linear-gradient(135deg, #022678 0%, #181b36 100%)';
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showPredictorError(resultDivId, title, message) {
    const resultDiv = document.getElementById(resultDivId);
    resultDiv.innerHTML = `
        <h3>${title}</h3>
        <div class="predictor-details">
            <p>${message}</p>
        </div>
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showPredictorErrorMessage(errorDivId, message) {
    const errorElement = document.getElementById(errorDivId);
    errorElement.textContent = ' ' + message;
    errorElement.classList.add('show');

    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

function resetPredictor() {
    // Reset batting mode
    document.getElementById('yourTeamName').value = '';
    document.getElementById('currentNRR').value = '';
    document.getElementById('matchesPlayed').value = '';
    document.getElementById('oversPerMatch').value = '';
    document.getElementById('targetRuns').value = '';
    document.getElementById('maxOvers').value = '';
    document.getElementById('opponentOversFaced').value = '';
    document.getElementById('opponentTeamName').value = '';
    document.getElementById('targetNRR').value = '';
    document.getElementById('sameOpponent').checked = false;
    document.getElementById('opponentMatchesPlayed').value = '';
    document.getElementById('opponentMatchesPlayedGroup').style.display = 'none';

    // Reset bowling mode
    document.getElementById('yourTeamNameBowl').value = '';
    document.getElementById('matchesPlayedBowl').value = '';
    document.getElementById('cumulativeRunsScoredBowl').value = '';
    document.getElementById('cumulativeOversFacedBowl').value = '';
    document.getElementById('cumulativeRunsConcededBowl').value = '';
    document.getElementById('cumulativeOversBowledBowl').value = '';
    document.getElementById('yourRunsScored').value = '';
    document.getElementById('yourOversFaced').value = '';
    document.getElementById('maxOversBowl').value = '';
    document.getElementById('opponentTeamNameBowl').value = '';
    document.getElementById('targetNRRBowl').value = '';
    document.getElementById('targetTeamNameBowl').value = '';

    // Hide results
    document.getElementById('battingResult').classList.remove('show');
    document.getElementById('bowlingResult').classList.remove('show');
    document.getElementById('predictorError').classList.remove('show');
    document.getElementById('predictorErrorBowl').classList.remove('show');
}
