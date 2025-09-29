/**
 * Signup Monitoring Script
 * Monitors signup success rates and common errors
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Log file path
const logFile = path.join(logsDir, 'signup-monitor.log');

// Function to log signup attempts
function logSignupAttempt(data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type: 'signup_attempt',
        ...data
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Function to log signup success
function logSignupSuccess(data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type: 'signup_success',
        ...data
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Function to log signup error
function logSignupError(data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type: 'signup_error',
        ...data
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Function to generate daily report
function generateDailyReport() {
    try {
        const logContent = fs.readFileSync(logFile, 'utf8');
        const lines = logContent.trim().split('\n');
        
        const attempts = lines.filter(line => {
            const entry = JSON.parse(line);
            return entry.type === 'signup_attempt';
        }).length;
        
        const successes = lines.filter(line => {
            const entry = JSON.parse(line);
            return entry.type === 'signup_success';
        }).length;
        
        const errors = lines.filter(line => {
            const entry = JSON.parse(line);
            return entry.type === 'signup_error';
        }).length;
        
        const successRate = attempts > 0 ? (successes / attempts * 100).toFixed(2) : 0;
        
        console.log('📊 Daily Signup Report:');
        console.log(`Total Attempts: ${attempts}`);
        console.log(`Successful: ${successes}`);
        console.log(`Errors: ${errors}`);
        console.log(`Success Rate: ${successRate}%`);
        
        // Group errors by type
        const errorTypes = {};
        lines.forEach(line => {
            const entry = JSON.parse(line);
            if (entry.type === 'signup_error') {
                const errorType = entry.error || 'Unknown';
                errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
            }
        });
        
        if (Object.keys(errorTypes).length > 0) {
            console.log('\n🔍 Error Breakdown:');
            Object.entries(errorTypes).forEach(([error, count]) => {
                console.log(`  ${error}: ${count}`);
            });
        }
        
    } catch (error) {
        console.log('No log data available yet.');
    }
}

// Export functions for use in your server
module.exports = {
    logSignupAttempt,
    logSignupSuccess,
    logSignupError,
    generateDailyReport
};

// If run directly, generate report
if (require.main === module) {
    generateDailyReport();
}
