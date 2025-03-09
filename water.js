// Constants
const DAILY_GOAL = 2000; // 2000ml or 2L
const REMINDER_INTERVAL = 30; // minutes
const MIN_AMOUNT = 50; // minimum water amount
const MAX_AMOUNT = 1000; // maximum water amount
const AMOUNT_STEP = 50; // step for amount adjustment

// DOM Elements
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentAmountEl = document.getElementById('currentAmount');
const logEntries = document.getElementById('logEntries');
const tipContainer = document.getElementById('tipContainer');
const healthTip = document.getElementById('healthTip');

// State
let currentAmount = 250;
let waterLogs = [];
let lastReminder = new Date();
let notificationEnabled = false;

// Health Tips
const healthTips = [
    "Drinking water first thing in the morning can boost your metabolism",
    "Water helps maintain the balance of body fluids",
    "Staying hydrated improves brain function and energy levels",
    "Water can help prevent and treat headaches",
    "Proper hydration can help prevent kidney stones",
    "Drinking water before meals can help with portion control",
    "Water helps regulate body temperature",
    "Staying hydrated can improve physical performance",
    "Water helps maintain healthy skin",
    "Proper hydration supports kidney function"
];

// Initialize
async function init() {
    // Load data from localStorage
    loadData();
    
    // Display random health tip
    displayRandomTip();
    startTipRotation();

    // Request notification permission
    if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        notificationEnabled = permission === "granted";
    }

    // Start reminder check
    setInterval(checkReminder, 60000); // Check every minute
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Initial UI update
    updateUI();
}

// Data Management
function loadData() {
    try {
        const savedLogs = localStorage.getItem('waterLogs');
        if (savedLogs) {
            waterLogs = JSON.parse(savedLogs).filter(log => isToday(new Date(log.timestamp)));
        }
        
        const savedAmount = localStorage.getItem('currentAmount');
        if (savedAmount) {
            currentAmount = parseInt(savedAmount, 10);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        waterLogs = [];
        currentAmount = 250;
    }
}

function saveData() {
    try {
        localStorage.setItem('waterLogs', JSON.stringify(waterLogs));
        localStorage.setItem('currentAmount', currentAmount.toString());
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Helper Functions
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function displayRandomTip() {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    healthTip.textContent = randomTip;
    tipContainer.style.display = 'block';
}

function startTipRotation() {
    setInterval(() => {
        if (tipContainer.style.display !== 'none') {
            displayRandomTip();
        }
    }, 300000); // Rotate tips every 5 minutes
}

// UI Updates
function updateUI() {
    // Calculate total intake
    const totalIntake = waterLogs.reduce((sum, log) => sum + log.amount, 0);
    
    // Update progress
    const progress = Math.min((totalIntake / DAILY_GOAL) * 100, 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${totalIntake}/${DAILY_GOAL}ml`;

    // Update progress bar color based on progress
    if (progress < 33) {
        progressBar.style.background = '#ef5350';
    } else if (progress < 66) {
        progressBar.style.background = '#ffa726';
    } else {
        progressBar.style.background = '#66bb6a';
    }

    // Update current amount
    currentAmountEl.textContent = currentAmount;

    // Update logs
    logEntries.innerHTML = '';
    [...waterLogs].reverse().forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span>${formatTime(log.timestamp)}</span>
            <span>${log.amount}ml</span>
        `;
        logEntries.appendChild(entry);
    });

    // Save data
    saveData();

    // Check if daily goal is reached
    if (totalIntake >= DAILY_GOAL && waterLogs.length > 0) {
        const lastLog = waterLogs[waterLogs.length - 1];
        const isNewAchievement = !lastLog.goalReached;
        
        if (isNewAchievement) {
            showGoalAchievement();
            waterLogs[waterLogs.length - 1].goalReached = true;
        }
    }
}

// User Actions
function adjustAmount(change) {
    currentAmount = Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, currentAmount + change));
    updateUI();
}

function addWater() {
    const timestamp = new Date();
    waterLogs.push({
        timestamp,
        amount: currentAmount,
        goalReached: false
    });
    
    // Show confirmation animation
    const btn = document.querySelector('.btn.primary');
    btn.classList.add('success');
    setTimeout(() => btn.classList.remove('success'), 1000);

    updateUI();
}

function resetLogs() {
    if (confirm('Are you sure you want to reset today\'s log? This action cannot be undone.')) {
        waterLogs = [];
        updateUI();
    }
}

function closeTip() {
    tipContainer.style.display = 'none';
}

// Reminder System
function checkReminder() {
    const now = new Date();
    const timeDiff = now - lastReminder;
    const minutesPassed = Math.floor(timeDiff / 60000);

    if (minutesPassed >= REMINDER_INTERVAL && notificationEnabled) {
        const totalIntake = waterLogs.reduce((sum, log) => sum + log.amount, 0);
        const remainingMl = Math.max(0, DAILY_GOAL - totalIntake);
        
        new Notification("Time to drink water! 💧", {
            body: `You still need ${remainingMl}ml to reach your daily goal. Stay hydrated!`,
            icon: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=48"
        });
        lastReminder = now;
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    if (event.target.tagName === 'INPUT') return; // Ignore if user is typing in an input
    
    switch(event.key) {
        case '+':
        case '=':
            adjustAmount(AMOUNT_STEP);
            break;
        case '-':
        case '_':
            adjustAmount(-AMOUNT_STEP);
            break;
        case 'Enter':
            addWater();
            break;
        case 'Escape':
            closeTip();
            break;
    }
}

// Achievement Animation
function showGoalAchievement() {
    const achievement = document.createElement('div');
    achievement.className = 'achievement';
    achievement.innerHTML = `
        <h3>🎉 Congratulations!</h3>
        <p>You've reached your daily water goal!</p>
    `;
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        achievement.classList.add('show');
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => {
                achievement.remove();
            }, 300);
        }, 3000);
    }, 100);
}

// Initialize the app
init();ogs = JSON.parse(savedLogs).filter(log => isToday(new Date(log.timestamp)));
        upda