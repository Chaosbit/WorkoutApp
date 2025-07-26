/**
 * UI Utilities - Common UI functions and user messaging
 */
export class UIUtils {
    /**
     * Show a user-friendly message instead of alert()
     * @param {string} message - The message to display
     * @param {string} type - Message type: 'success', 'error', 'info', 'warning'
     * @param {number} duration - How long to show the message (milliseconds)
     */
    static showMessage(message, type = 'info', duration = 3000) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.app-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageElement = document.createElement('div');
        messageElement.className = `app-message app-message--${type}`;
        messageElement.innerHTML = `
            <div class="app-message__content">
                <span class="app-message__icon">${this.getMessageIcon(type)}</span>
                <span class="app-message__text">${message}</span>
                <button class="app-message__close" onclick="this.parentElement.parentElement.remove()">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
        
        // Apply styles
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        const content = messageElement.querySelector('.app-message__content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        const closeBtn = messageElement.querySelector('.app-message__close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#app-message-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'app-message-styles';
            styleSheet.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(messageElement);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (messageElement.parentElement) {
                    messageElement.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => messageElement.remove(), 300);
                }
            }, duration);
        }
    }
    
    /**
     * Get icon for message type
     * @param {string} type - Message type
     * @returns {string} Icon string
     */
    static getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * Get color for message type
     * @param {string} type - Message type
     * @returns {string} Color value
     */
    static getMessageColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * Show a confirmation dialog with better UX than confirm()
     * @param {string} message - The message to display
     * @param {Function} onConfirm - Callback when user confirms
     * @param {Function} onCancel - Callback when user cancels
     * @param {string} confirmText - Text for confirm button
     * @param {string} cancelText - Text for cancel button
     */
    static showConfirmDialog(message, onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel') {
        // Remove any existing dialogs
        const existingDialogs = document.querySelectorAll('.app-confirm-dialog');
        existingDialogs.forEach(dialog => dialog.remove());
        
        const dialog = document.createElement('div');
        dialog.className = 'app-confirm-dialog';
        dialog.innerHTML = `
            <div class="app-confirm-dialog__backdrop"></div>
            <div class="app-confirm-dialog__content">
                <div class="app-confirm-dialog__message">${message}</div>
                <div class="app-confirm-dialog__actions">
                    <button class="app-confirm-dialog__cancel">${cancelText}</button>
                    <button class="app-confirm-dialog__confirm">${confirmText}</button>
                </div>
            </div>
        `;
        
        // Apply styles
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const backdrop = dialog.querySelector('.app-confirm-dialog__backdrop');
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
        `;
        
        const content = dialog.querySelector('.app-confirm-dialog__content');
        content.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
            position: relative;
            z-index: 1;
        `;
        
        const messageDiv = dialog.querySelector('.app-confirm-dialog__message');
        messageDiv.style.cssText = `
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
        `;
        
        const actions = dialog.querySelector('.app-confirm-dialog__actions');
        actions.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = dialog.querySelector('.app-confirm-dialog__cancel');
        const confirmBtn = dialog.querySelector('.app-confirm-dialog__confirm');
        
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            background: #6750A4;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        // Event handlers
        const cleanup = () => dialog.remove();
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });
        
        confirmBtn.addEventListener('click', () => {
            cleanup();
            onConfirm();
        });
        
        backdrop.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });
        
        document.body.appendChild(dialog);
    }
    
    /**
     * Debounce function to limit rapid function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function to limit function execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Validate form input
     * @param {string} value - Value to validate
     * @param {string} type - Validation type
     * @returns {object} Validation result
     */
    static validateInput(value, type) {
        const result = { isValid: true, error: null };
        
        switch (type) {
            case 'required':
                if (!value || value.trim() === '') {
                    result.isValid = false;
                    result.error = 'This field is required';
                }
                break;
            case 'workoutName':
                if (!value || value.trim().length < 3) {
                    result.isValid = false;
                    result.error = 'Workout name must be at least 3 characters';
                }
                break;
            case 'workoutContent':
                if (!value || !value.includes('##')) {
                    result.isValid = false;
                    result.error = 'Workout must contain at least one exercise (## Exercise Name)';
                }
                break;
            default:
                break;
        }
        
        return result;
    }
}