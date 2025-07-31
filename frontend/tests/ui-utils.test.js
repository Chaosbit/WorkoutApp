/**
 * Unit tests for UIUtils class
 */

import { UIUtils } from '../js/ui-utils.js';

describe('UIUtils', () => {
  describe('getMessageIcon', () => {
    test('returns correct icons for message types', () => {
      expect(UIUtils.getMessageIcon('success')).toBe('✅');
      expect(UIUtils.getMessageIcon('error')).toBe('❌');
      expect(UIUtils.getMessageIcon('warning')).toBe('⚠️');
      expect(UIUtils.getMessageIcon('info')).toBe('ℹ️');
    });

    test('returns info icon for unknown types', () => {
      expect(UIUtils.getMessageIcon('unknown')).toBe('ℹ️');
      expect(UIUtils.getMessageIcon('')).toBe('ℹ️');
      expect(UIUtils.getMessageIcon(null)).toBe('ℹ️');
      expect(UIUtils.getMessageIcon(undefined)).toBe('ℹ️');
    });
  });

  describe('getMessageColor', () => {
    test('returns correct colors for message types', () => {
      expect(UIUtils.getMessageColor('success')).toBe('#4CAF50');
      expect(UIUtils.getMessageColor('error')).toBe('#f44336');
      expect(UIUtils.getMessageColor('warning')).toBe('#ff9800');
      expect(UIUtils.getMessageColor('info')).toBe('#2196F3');
    });

    test('returns info color for unknown types', () => {
      expect(UIUtils.getMessageColor('unknown')).toBe('#2196F3');
      expect(UIUtils.getMessageColor('')).toBe('#2196F3');
      expect(UIUtils.getMessageColor(null)).toBe('#2196F3');
      expect(UIUtils.getMessageColor(undefined)).toBe('#2196F3');
    });
  });

  describe('validateInput', () => {
    describe('required validation', () => {
      test('validates required fields correctly', () => {
        expect(UIUtils.validateInput('valid value', 'required')).toEqual({
          isValid: true,
          error: null
        });

        expect(UIUtils.validateInput('', 'required')).toEqual({
          isValid: false,
          error: 'This field is required'
        });

        expect(UIUtils.validateInput('   ', 'required')).toEqual({
          isValid: false,
          error: 'This field is required'
        });

        expect(UIUtils.validateInput(null, 'required')).toEqual({
          isValid: false,
          error: 'This field is required'
        });

        expect(UIUtils.validateInput(undefined, 'required')).toEqual({
          isValid: false,
          error: 'This field is required'
        });
      });
    });

    describe('workoutName validation', () => {
      test('validates workout names correctly', () => {
        expect(UIUtils.validateInput('Valid Name', 'workoutName')).toEqual({
          isValid: true,
          error: null
        });

        expect(UIUtils.validateInput('abc', 'workoutName')).toEqual({
          isValid: true,
          error: null
        });

        expect(UIUtils.validateInput('ab', 'workoutName')).toEqual({
          isValid: false,
          error: 'Workout name must be at least 3 characters'
        });

        expect(UIUtils.validateInput('', 'workoutName')).toEqual({
          isValid: false,
          error: 'Workout name must be at least 3 characters'
        });

        expect(UIUtils.validateInput('  a  ', 'workoutName')).toEqual({
          isValid: false,
          error: 'Workout name must be at least 3 characters'
        });
      });
    });

    describe('workoutContent validation', () => {
      test('validates workout content correctly', () => {
        expect(UIUtils.validateInput('# Title\n## Exercise 1 - 1:30', 'workoutContent')).toEqual({
          isValid: true,
          error: null
        });

        expect(UIUtils.validateInput('## Push-ups - 0:30', 'workoutContent')).toEqual({
          isValid: true,
          error: null
        });

        expect(UIUtils.validateInput('# Title only', 'workoutContent')).toEqual({
          isValid: false,
          error: 'Workout must contain at least one exercise (## Exercise Name)'
        });

        expect(UIUtils.validateInput('', 'workoutContent')).toEqual({
          isValid: false,
          error: 'Workout must contain at least one exercise (## Exercise Name)'
        });

        expect(UIUtils.validateInput('No exercises here', 'workoutContent')).toEqual({
          isValid: false,
          error: 'Workout must contain at least one exercise (## Exercise Name)'
        });
      });
    });

    describe('unknown validation type', () => {
      test('returns valid for unknown validation types', () => {
        expect(UIUtils.validateInput('any value', 'unknown')).toEqual({
          isValid: true,
          error: null
        });
      });
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('delays function execution', () => {
      const func = jest.fn();
      const debouncedFunc = UIUtils.debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('resets delay on subsequent calls', () => {
      const func = jest.fn();
      const debouncedFunc = UIUtils.debounce(func, 100);

      debouncedFunc();
      jest.advanceTimersByTime(50);
      
      debouncedFunc(); // This should reset the timer
      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('passes arguments correctly', () => {
      const func = jest.fn();
      const debouncedFunc = UIUtils.debounce(func, 100);

      debouncedFunc('arg1', 'arg2');
      jest.advanceTimersByTime(100);
      
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('executes function immediately on first call', () => {
      const func = jest.fn();
      const throttledFunc = UIUtils.throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('prevents execution within throttle period', () => {
      const func = jest.fn();
      const throttledFunc = UIUtils.throttle(func, 100);

      throttledFunc();
      throttledFunc();
      throttledFunc();
      
      expect(func).toHaveBeenCalledTimes(1);
    });

    test('allows execution after throttle period', () => {
      const func = jest.fn();
      const throttledFunc = UIUtils.throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    test('passes arguments correctly', () => {
      const func = jest.fn();
      const throttledFunc = UIUtils.throttle(func, 100);

      throttledFunc('arg1', 'arg2');
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('showMessage', () => {
    beforeEach(() => {
      // Clean up any existing messages
      document.querySelectorAll('.app-message').forEach(el => el.remove());
      document.querySelectorAll('#app-message-styles').forEach(el => el.remove());
    });

    test('creates message element with correct structure', () => {
      UIUtils.showMessage('Test message', 'success');
      
      const messageEl = document.querySelector('.app-message');
      expect(messageEl).toBeTruthy();
      expect(messageEl.classList.contains('app-message--success')).toBe(true);
      
      const textEl = messageEl.querySelector('.app-message__text');
      expect(textEl.textContent).toBe('Test message');
      
      const iconEl = messageEl.querySelector('.app-message__icon');
      expect(iconEl.textContent).toBe('✅');
      
      const closeBtn = messageEl.querySelector('.app-message__close');
      expect(closeBtn).toBeTruthy();
    });

    test('removes existing messages before showing new one', () => {
      UIUtils.showMessage('First message', 'info');
      UIUtils.showMessage('Second message', 'success');
      
      const messages = document.querySelectorAll('.app-message');
      expect(messages.length).toBe(1);
      expect(messages[0].querySelector('.app-message__text').textContent).toBe('Second message');
    });

    test('adds animation styles only once', () => {
      UIUtils.showMessage('Test message', 'success');
      UIUtils.showMessage('Another message', 'error');
      
      const styleSheets = document.querySelectorAll('#app-message-styles');
      expect(styleSheets.length).toBe(1);
    });

    test('uses default values for optional parameters', () => {
      UIUtils.showMessage('Test message');
      
      const messageEl = document.querySelector('.app-message');
      expect(messageEl.classList.contains('app-message--info')).toBe(true);
      
      const iconEl = messageEl.querySelector('.app-message__icon');
      expect(iconEl.textContent).toBe('ℹ️');
    });
  });

  describe('showConfirmDialog', () => {
    beforeEach(() => {
      // Clean up any existing dialogs
      document.querySelectorAll('.app-confirm-dialog').forEach(el => el.remove());
    });

    test('creates confirm dialog with correct structure', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      UIUtils.showConfirmDialog('Are you sure?', onConfirm, onCancel);
      
      const dialog = document.querySelector('.app-confirm-dialog');
      expect(dialog).toBeTruthy();
      
      const message = dialog.querySelector('.app-confirm-dialog__message');
      expect(message.textContent).toBe('Are you sure?');
      
      const confirmBtn = dialog.querySelector('.app-confirm-dialog__confirm');
      const cancelBtn = dialog.querySelector('.app-confirm-dialog__cancel');
      expect(confirmBtn.textContent).toBe('Confirm');
      expect(cancelBtn.textContent).toBe('Cancel');
    });

    test('uses custom button texts', () => {
      const onConfirm = jest.fn();
      
      UIUtils.showConfirmDialog('Delete item?', onConfirm, null, 'Delete', 'Keep');
      
      const confirmBtn = document.querySelector('.app-confirm-dialog__confirm');
      const cancelBtn = document.querySelector('.app-confirm-dialog__cancel');
      expect(confirmBtn.textContent).toBe('Delete');
      expect(cancelBtn.textContent).toBe('Keep');
    });

    test('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      UIUtils.showConfirmDialog('Test', onConfirm, onCancel);
      
      const confirmBtn = document.querySelector('.app-confirm-dialog__confirm');
      confirmBtn.click();
      
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
      expect(document.querySelector('.app-confirm-dialog')).toBeFalsy();
    });

    test('calls onCancel when cancel button is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      UIUtils.showConfirmDialog('Test', onConfirm, onCancel);
      
      const cancelBtn = document.querySelector('.app-confirm-dialog__cancel');
      cancelBtn.click();
      
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(document.querySelector('.app-confirm-dialog')).toBeFalsy();
    });

    test('calls onCancel when backdrop is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      UIUtils.showConfirmDialog('Test', onConfirm, onCancel);
      
      const backdrop = document.querySelector('.app-confirm-dialog__backdrop');
      backdrop.click();
      
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(document.querySelector('.app-confirm-dialog')).toBeFalsy();
    });

    test('removes existing dialogs before showing new one', () => {
      const onConfirm1 = jest.fn();
      const onConfirm2 = jest.fn();
      
      UIUtils.showConfirmDialog('First', onConfirm1);
      UIUtils.showConfirmDialog('Second', onConfirm2);
      
      const dialogs = document.querySelectorAll('.app-confirm-dialog');
      expect(dialogs.length).toBe(1);
      expect(dialogs[0].querySelector('.app-confirm-dialog__message').textContent).toBe('Second');
    });
  });
});