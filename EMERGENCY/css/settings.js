// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();

    // Initialize toggle switches
    initializeToggles();

    // Initialize select dropdowns
    initializeSelects();

    // Set up navigation
    setupNavigation();

    // Set up profile click
    setupProfile();
});

// Load settings from localStorage
function loadSettings() {
    // Emergency Settings
    loadToggle('autoCall', 'autoCall');
    loadToggle('locationShare', 'locationShare');
    loadToggle('emergencyAlerts', 'emergencyAlerts');
    loadSelect('emergencyProtocol', 'emergencyProtocol');

    // Notifications
    loadToggle('pushNotifications', 'pushNotifications');
    loadToggle('smsNotifications', 'smsNotifications');
    loadToggle('emailNotifications', 'emailNotifications');
    loadSelect('notificationSound', 'notificationSound');

    // Profile
    loadToggle('profileVisibility', 'profileVisibility');
    loadSelect('language', 'language');
    loadSelect('theme', 'theme');

    // Privacy & Security
    loadToggle('dataEncryption', 'dataEncryption');
    loadToggle('biometricAuth', 'biometricAuth');
    loadToggle('locationTracking', 'locationTracking');

    // App Settings
    loadToggle('autoUpdate', 'autoUpdate');
    loadToggle('analytics', 'analytics');
    loadSelect('dataUsage', 'dataUsage');

    // Accessibility Settings
    loadToggle('highContrast', 'highContrast');
    loadToggle('largeText', 'largeText');
    loadToggle('reduceMotion', 'reduceMotion');
    loadToggle('screenReader', 'screenReader');
    loadToggle('voiceActivation', 'voiceActivation');
    loadToggle('hapticFeedback', 'hapticFeedback');
    loadToggle('colorBlind', 'colorBlind');
    loadToggle('simplifiedUI', 'simplifiedUI');
    loadSelect('emergencyVolume', 'emergencyVolume');
    loadToggle('textToSpeech', 'textToSpeech');
    loadToggle('keyboardShortcuts', 'keyboardShortcuts');

    // Apply accessibility settings
    applyAccessibilitySettings();
}

// Save settings to localStorage
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

// Load toggle state
function loadToggle(elementId, storageKey) {
    const element = document.getElementById(elementId);
    if (element) {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
            element.checked = saved === 'true';
        }
    }
}

// Load select value
function loadSelect(elementId, storageKey) {
    const element = document.getElementById(elementId);
    if (element) {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
            element.value = saved;
        }
    }
}

// Initialize toggle switches
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            saveSetting(this.id, this.checked);

            // Apply accessibility settings immediately for certain toggles
            if (['highContrast', 'largeText', 'reduceMotion', 'colorBlind', 'simplifiedUI'].includes(this.id)) {
                applyAccessibilitySettings();
            }
        });
    });
}

// Initialize select dropdowns
function initializeSelects() {
    const selects = document.querySelectorAll('.setting-select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            saveSetting(this.id, this.value);
        });
    });
}

// Navigation setup
function setupNavigation() {
    // Bottom navigation
    const navItems = document.querySelectorAll('.bottom-nav div');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Set active navigation
    setActiveNav('settings');
}

// Navigate to different pages
function navigateToPage(page) {
    const pages = {
        'home': 'home.html',
        'history': 'history.html',
        'contact': 'contact.html',
        'settings': 'settings.html'
    };

    if (pages[page]) {
        window.location.href = pages[page];
    }
}

// Set active navigation item
function setActiveNav(activePage) {
    const navItems = document.querySelectorAll('.bottom-nav div');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === activePage) {
            item.classList.add('active');
        }
    });
}

// Profile setup
function setupProfile() {
    const profile = document.querySelector('.profile');
    if (profile) {
        profile.addEventListener('click', function() {
            // Could open profile modal or navigate to profile page
            console.log('Profile clicked');
        });
    }
}

// Utility functions for settings management
function getSetting(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
}

function setSetting(key, value) {
    localStorage.setItem(key, value);
}

function resetSettings() {
    // Reset all settings to defaults
    const defaults = {
        autoCall: false,
        locationShare: true,
        emergencyAlerts: true,
        emergencyProtocol: 'standard',
        pushNotifications: true,
        smsNotifications: false,
        emailNotifications: false,
        notificationSound: 'default',
        profileVisibility: true,
        language: 'english',
        theme: 'light',
        dataEncryption: true,
        biometricAuth: false,
        locationTracking: true,
        autoUpdate: true,
        analytics: false,
        dataUsage: 'wifi',
        // Accessibility defaults
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        screenReader: true,
        voiceActivation: false,
        hapticFeedback: true,
        colorBlind: false,
        simplifiedUI: false,
        emergencyVolume: 'medium',
        textToSpeech: true,
        keyboardShortcuts: true
    };

    Object.keys(defaults).forEach(key => {
        setSetting(key, defaults[key]);
    });

    // Reload the page to reflect changes
    location.reload();
}

// Apply accessibility settings to the UI
function applyAccessibilitySettings() {
    const body = document.body;

    // High contrast mode
    if (getSetting('highContrast') === 'true') {
        body.classList.add('high-contrast');
    } else {
        body.classList.remove('high-contrast');
    }

    // Large text mode
    if (getSetting('largeText') === 'true') {
        body.classList.add('large-text');
    } else {
        body.classList.remove('large-text');
    }

    // Reduce motion
    if (getSetting('reduceMotion') === 'true') {
        body.classList.add('reduce-motion');
    } else {
        body.classList.remove('reduce-motion');
    }

    // Color blind friendly
    if (getSetting('colorBlind') === 'true') {
        body.classList.add('color-blind');
    } else {
        body.classList.remove('color-blind');
    }

    // Simplified UI
    if (getSetting('simplifiedUI') === 'true') {
        body.classList.add('simplified-ui');
    } else {
        body.classList.remove('simplified-ui');
    }
}

// Export settings for backup/sharing
function exportSettings() {
    const settings = {};
    const keys = [
        'autoCall', 'locationShare', 'emergencyAlerts', 'emergencyProtocol',
        'pushNotifications', 'smsNotifications', 'emailNotifications', 'notificationSound',
        'profileVisibility', 'language', 'theme',
        'dataEncryption', 'biometricAuth', 'locationTracking',
        'autoUpdate', 'analytics', 'dataUsage',
        // Accessibility settings
        'highContrast', 'largeText', 'reduceMotion', 'screenReader', 'voiceActivation',
        'hapticFeedback', 'colorBlind', 'simplifiedUI', 'emergencyVolume', 'textToSpeech', 'keyboardShortcuts'
    ];

    keys.forEach(key => {
        settings[key] = getSetting(key);
    });

    return JSON.stringify(settings, null, 2);
}

// Import settings from backup
function importSettings(settingsJson) {
    try {
        const settings = JSON.parse(settingsJson);
        Object.keys(settings).forEach(key => {
            setSetting(key, settings[key]);
        });
        location.reload();
        return true;
    } catch (error) {
        console.error('Invalid settings JSON:', error);
        return false;
    }
}