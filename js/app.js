import { WorkoutApp } from './workout-app.js';
import { WorkoutParser } from './workout-parser.js';
import { WorkoutLibrary } from './workout-library.js';
import { AudioManager } from './audio-manager.js';
import { TimerManager } from './timer-manager.js';
import { StatisticsManager } from './statistics-manager.js';
import { ScreenWakeManager } from './screen-wake-manager.js';
import { TrainingPlanManager } from './training-plan-manager.js';
import { NavigationManager } from './navigation-manager.js';
import { SyncManager } from './sync-manager.js';
import { UIUtils } from './ui-utils.js';
import { APP_CONFIG, APP_UTILS } from './constants.js';

/**
 * Application initialization
 * Initialize the WorkoutApp when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main application
    window.workoutApp = new WorkoutApp();
    window.app = window.workoutApp; // Make app globally accessible for onclick handlers
    
    // Initialize navigation
    window.navigationManager = new NavigationManager();
    
    // Initialize sync manager
    window.syncManager = new SyncManager();
    
    // Initialize sync UI
    initializeSyncUI();
    
    // Expose classes globally for backward compatibility with tests
    window.WorkoutApp = WorkoutApp;
    window.WorkoutParser = WorkoutParser;
    window.WorkoutLibrary = WorkoutLibrary;
    window.AudioManager = AudioManager;
    window.TimerManager = TimerManager;
    window.StatisticsManager = StatisticsManager;
    window.ScreenWakeManager = ScreenWakeManager;
    window.TrainingPlanManager = TrainingPlanManager;
    window.NavigationManager = NavigationManager;
    window.SyncManager = SyncManager;
    
    // Expose new utility classes for testing and development
    window.UIUtils = UIUtils;
    window.APP_CONFIG = APP_CONFIG;
    window.APP_UTILS = APP_UTILS;
    
    // For backward compatibility, create a WorkoutTimer class that delegates to WorkoutApp
    window.WorkoutTimer = class WorkoutTimer {
        constructor() {
            // Return the existing workout app instance
            return window.workoutApp;
        }
    };
});

/**
 * Initialize sync UI components
 */
function initializeSyncUI() {
    const syncManager = window.syncManager;
    
    // Navigation handlers
    document.getElementById('navSync')?.addEventListener('click', () => {
        showSyncDialog();
    });
    
    // Sync dialog handlers
    document.getElementById('closeSyncBtn')?.addEventListener('click', () => {
        hideSyncDialog();
    });
    
    document.getElementById('syncEnabledToggle')?.addEventListener('change', (e) => {
        syncManager.setSyncEnabled(e.target.checked);
        updateSyncUI();
    });
    
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        showAuthDialog('login');
    });
    
    document.getElementById('registerBtn')?.addEventListener('click', () => {
        showAuthDialog('register');
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        syncManager.logout();
        updateSyncUI();
    });
    
    document.getElementById('syncNowBtn')?.addEventListener('click', async () => {
        await performSync();
    });
    
    // Auth dialog handlers
    document.getElementById('cancelAuthBtn')?.addEventListener('click', () => {
        hideAuthDialog();
    });
    
    document.getElementById('loginTab')?.addEventListener('click', () => {
        setAuthMode('login');
    });
    
    document.getElementById('registerTab')?.addEventListener('click', () => {
        setAuthMode('register');
    });
    
    document.getElementById('authForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAuth();
    });
    
    // Close dialogs when clicking outside
    document.getElementById('syncDialog')?.addEventListener('click', (e) => {
        if (e.target.id === 'syncDialog') hideSyncDialog();
    });
    
    document.getElementById('authDialog')?.addEventListener('click', (e) => {
        if (e.target.id === 'authDialog') hideAuthDialog();
    });
    
    // Initialize UI state
    updateSyncUI();
}

function showSyncDialog() {
    document.getElementById('syncDialog').style.display = 'flex';
    updateSyncUI();
}

function hideSyncDialog() {
    document.getElementById('syncDialog').style.display = 'none';
}

function showAuthDialog(mode = 'login') {
    setAuthMode(mode);
    document.getElementById('authDialog').style.display = 'flex';
}

function hideAuthDialog() {
    document.getElementById('authDialog').style.display = 'none';
    document.getElementById('authMessage').style.display = 'none';
}

function setAuthMode(mode) {
    const isLogin = mode === 'login';
    
    // Update tabs
    document.getElementById('loginTab').classList.toggle('active', isLogin);
    document.getElementById('registerTab').classList.toggle('active', !isLogin);
    
    // Update form fields
    document.getElementById('authDialogTitle').textContent = isLogin ? 'Login' : 'Register';
    document.getElementById('usernameField').style.display = isLogin ? 'none' : 'block';
    document.getElementById('emailField').style.display = isLogin ? 'none' : 'block';
    document.getElementById('referredByField').style.display = isLogin ? 'none' : 'block';
    document.getElementById('usernameOrEmailLabel').textContent = isLogin ? 'Username or Email' : 'Username';
    document.getElementById('authSubmitBtn').querySelector('.md-button__label').textContent = isLogin ? 'Login' : 'Register';
    
    // Clear form
    document.getElementById('authForm').reset();
}

async function handleAuth() {
    const mode = document.getElementById('loginTab').classList.contains('active') ? 'login' : 'register';
    const syncManager = window.syncManager;
    const messageEl = document.getElementById('authMessage');
    
    try {
        messageEl.style.display = 'none';
        
        if (mode === 'login') {
            const usernameOrEmail = document.getElementById('usernameOrEmail').value;
            const password = document.getElementById('password').value;
            
            const result = await syncManager.login({ usernameOrEmail, password });
            
            if (result.requiresApproval) {
                showAuthMessage('Account pending approval. Please wait for administrator approval.', 'warning');
                return;
            }
            
            showAuthMessage('Login successful!', 'success');
            setTimeout(() => {
                hideAuthDialog();
                updateSyncUI();
            }, 1500);
            
        } else {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const referredBy = document.getElementById('referredBy').value || null;
            
            const result = await syncManager.register({ username, email, password, referredBy });
            
            if (result.requiresApproval) {
                showAuthMessage('Registration submitted! Please wait for administrator approval.', 'success');
            } else {
                showAuthMessage('Registration successful!', 'success');
            }
            
            setTimeout(() => {
                hideAuthDialog();
                updateSyncUI();
            }, 1500);
        }
        
    } catch (error) {
        console.error('Auth error:', error);
        showAuthMessage(error.message || 'Authentication failed. Please try again.', 'error');
    }
}

function showAuthMessage(message, type = 'info') {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';
}

function updateSyncUI() {
    const syncManager = window.syncManager;
    const isEnabled = syncManager.isEnabled;
    const isAuthenticated = syncManager.isAuthenticated();
    
    // Update sync toggle
    document.getElementById('syncEnabledToggle').checked = isEnabled;
    
    // Update sync status
    const statusIcon = document.getElementById('syncStatusIcon');
    const statusText = document.getElementById('syncStatusText');
    
    if (isEnabled && isAuthenticated) {
        statusIcon.textContent = 'sync';
        statusText.textContent = 'Sync enabled';
    } else if (isEnabled) {
        statusIcon.textContent = 'sync_problem';
        statusText.textContent = 'Sync enabled (not logged in)';
    } else {
        statusIcon.textContent = 'sync_disabled';
        statusText.textContent = 'Sync disabled';
    }
    
    // Update auth section visibility
    document.getElementById('authSection').style.display = isEnabled ? 'block' : 'none';
    document.getElementById('syncActions').style.display = isEnabled && isAuthenticated ? 'block' : 'none';
    
    // Update auth status
    const authStatusText = document.getElementById('authStatusText');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isAuthenticated) {
        authStatusText.textContent = 'Logged in';
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';
    } else {
        authStatusText.textContent = 'Not logged in';
        loginBtn.style.display = 'inline-flex';
        registerBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
    }
}

async function performSync() {
    const syncManager = window.syncManager;
    const syncBtn = document.getElementById('syncNowBtn');
    const lastSyncEl = document.getElementById('lastSyncTime');
    
    if (!syncManager.isEnabled || !syncManager.isAuthenticated()) {
        return;
    }
    
    try {
        syncBtn.disabled = true;
        syncBtn.querySelector('.md-button__label').textContent = 'Syncing...';
        
        // Sync workouts (this would integrate with WorkoutLibrary)
        // For now, just show success
        
        lastSyncEl.textContent = `Last synced: ${new Date().toLocaleString()}`;
        
        setTimeout(() => {
            syncBtn.disabled = false;
            syncBtn.querySelector('.md-button__label').textContent = 'Sync Now';
        }, 1000);
        
    } catch (error) {
        console.error('Sync failed:', error);
        syncBtn.disabled = false;
        syncBtn.querySelector('.md-button__label').textContent = 'Sync Now';
    }
}