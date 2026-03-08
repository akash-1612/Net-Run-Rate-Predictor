# Net Run Rate Predictor

A comprehensive cricket Net Run Rate (NRR) calculator and tournament scenario predictor built with HTML, CSS, and JavaScript. This tool implements ICC-compliant NRR calculations and helps teams strategize for tournament qualification.

## 🎉 Recent Updates (March 2026)

### Bowling Predictor - Major Accuracy Improvement
- **New Feature**: Now uses **actual cumulative statistics** instead of estimates
- **Improved Accuracy**: Enter your team's total runs and overs from all previous matches for precise predictions
- **Real-World Tested**: Calculations now match official tournament scenarios
- **Better UX**: Clearer input fields with helpful descriptions
- **Documentation**: New [USAGE_GUIDE.md](USAGE_GUIDE.md) with step-by-step instructions

**Why This Matters**: Previous version estimated stats using a generic baseline (8 runs/over), leading to inaccurate predictions. The updated version uses your team's actual performance data for tournament-ready accuracy!

## Features

###  NRR Calculator
- **Accurate NRR Calculation**: Implements the official ICC formula: `(Runs Scored/Overs Faced) - (Runs Conceded/Overs Bowled)`
- **ICC All Out Rule**: Automatically applies the rule that when a team is all out, the full quota of overs is used in calculations
- **Cumulative NRR Tracking**: Track NRR across multiple matches in a tournament
- **Support for Both Formats**: Works for T20 (20 overs) and ODI (50 overs) matches
- **Team Name Customization**: Enter custom team names for personalized results

###  Tournament Scenario Predictor

#### Batting Mode (Chase Target)
- Calculate exactly how many overs needed to chase a target to surpass opponent's NRR
- Same-opponent logic: Accounts for opponent's NRR changing when playing against them directly
- Required run rate calculations
- Detailed breakdown of projected NRR after the match

#### Bowling Mode (Defend Target)
- **Accurate Cumulative Stats**: Uses your team's actual total runs and overs from all previous matches (not estimates!)
- Defense scenario calculator showing maximum runs allowed at different overs
- Multiple scenario table showing best and worst case defenses
- Real-time NRR projection based on actual performance data

##  Use Cases

Perfect for:
- **Tournament Qualification**: IPL, World Cup, and other tournament scenarios where NRR determines playoff qualification
- **Strategic Planning**: Teams can plan exactly how aggressively they need to win
- **Live Match Analysis**: Calculate real-time scenarios during matches
- **Cricket Analytics**: Understanding historical match impacts on tournament standings

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or dependencies required!

### Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/akash-1612/Net-Run-Rate-Predictor.git
   cd Net-Run-Rate-Predictor
   ```

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`
   - Then navigate to `http://localhost:8000`

3. **For Bowling Predictor**: Check [USAGE_GUIDE.md](USAGE_GUIDE.md) for detailed instructions on how to use the updated bowling predictor with cumulative stats.

## How It Works

### NRR Formula
```
NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
```

### ICC Special Rule
When a team is **all out** before using their full quota of overs:
- The calculation uses the **maximum overs** (20 for T20, 50 for ODI)
- Example: Team all out at 116 in 18.2 overs → calculated as 116/20 overs

### Bowling Predictor Calculation
The bowling predictor uses your team's **cumulative statistics** to calculate:
- Your projected run rate after the current match
- Maximum runs allowed at different overs to maintain NRR advantage
- Best and worst case defense scenarios

**Formula**: `Your NRR = (New Total Runs Scored / New Total Overs Faced) - (New Total Runs Conceded / New Total Overs Bowled)`

##  Features Showcase

- **Clean, Modern UI**: Professional gradient design with smooth animations
- **Mobile Responsive**: Works perfectly on all device sizes
- **Real-time Validation**: Input validation with helpful error messages
- **Color-coded Results**: Green for positive NRR, red for negative, white for neutral
- **Keyboard Support**: Press Enter to navigate between fields
- **ICC Compliant**: All calculations follow official ICC rules

##  Project Structure

```
Net-Run-Rate-Predictor/
├── index.html          # Main HTML structure
├── nrr.css            # All styling and animations
├── nrr.js             # JavaScript logic and calculations
├── README.md          # Documentation
└── USAGE_GUIDE.md     # Detailed usage guide for bowling predictor
```

##  Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Grid, Flexbox, animations, gradients
- **Vanilla JavaScript**: No frameworks or dependencies

### Browser Compatibility
-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+

## 🌐 Live Demo

[View Live Demo](https://akash-1612.github.io/Net-Run-Rate-Predictor/)

##  Examples

### Example 1: India vs USA (ICC T20 World Cup 2024)
- **India**: 161/9 in 20 overs
- **USA**: 132/8 in 20 overs
- **Result**: India NRR = +1.455 (This match only)

### Example 2: Tournament Scenario (Batting Mode)
- **Current NRR**: +0.450 (5 matches played)
- **Target to beat**: +0.500
- **Chasing**: 180 runs
- **Result**: Need to chase in 14.3 overs to surpass target NRR

### Example 3: Defense Scenario (Bowling Mode - New!)
- **Team**: Pakistan (2 matches played)
- **Cumulative Stats**: 250 runs in 40 overs, 268 runs conceded in 40 overs
- **Current Match**: Scored 212 runs in 20 overs
- **Target to Beat**: New Zealand's NRR of +1.390
- **Result**: Must restrict opponent to 147 runs or less in 20 overs (or similar scenarios at different overs)

##  Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Author

**Akash**
- GitHub: [@akash-1612](https://github.com/akash-1612)
- LinkedIn: [Akash K](https://www.linkedin.com/in/akash-k-360208377/)

##  Acknowledgments

- ICC for the official NRR calculation rules
- Cricket enthusiasts and tournament analysts for inspiration
- The cricket community for feedback and suggestions

## Contact

For questions, suggestions, or feedback, feel free to open an issue or reach out through my GitHub profile.

---

 **Star this repository if you find it useful!**

 **Happy Cricket Analytics!**
