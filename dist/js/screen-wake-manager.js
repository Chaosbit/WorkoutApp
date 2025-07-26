/**
 * ScreenWakeManager - Manages screen wake lock functionality
 * Prevents the screen from turning off during workouts
 */
export class ScreenWakeManager {
    constructor() {
        this.wakeLock = null;
        this.isSupported = 'wakeLock' in navigator;
        this.isActive = false;
        
        // Handle visibility change to re-acquire wake lock when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isActive) {
                this.requestWakeLock();
            }
        });
    }

    /**
     * Check if Screen Wake Lock API is supported
     */
    isWakeLockSupported() {
        return this.isSupported;
    }

    /**
     * Request a screen wake lock
     */
    async requestWakeLock() {
        if (!this.isSupported) {
            console.log('Screen Wake Lock API not supported');
            return false;
        }

        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.isActive = true;
            
            // Add event listener for when wake lock is released
            this.wakeLock.addEventListener('release', () => {
                console.log('Screen wake lock was released');
                this.isActive = false;
            });

            console.log('Screen wake lock is active');
            return true;
        } catch (err) {
            console.error('Failed to request screen wake lock:', err);
            this.isActive = false;
            return false;
        }
    }

    /**
     * Release the screen wake lock
     */
    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                this.isActive = false;
                console.log('Screen wake lock released');
                return true;
            } catch (err) {
                console.error('Failed to release screen wake lock:', err);
                return false;
            }
        }
        return true;
    }

    /**
     * Get the current wake lock status
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isActive: this.isActive,
            wakeLock: this.wakeLock
        };
    }
}