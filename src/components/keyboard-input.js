/**
 * Capture physical keyboard input and forward to super-keyboard.
 * Also prevents WASD camera movement when keyboard is active.
 */
AFRAME.registerComponent('keyboard-input', {
  init: function () {
    this.onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
  },

  remove: function () {
    window.removeEventListener('keydown', this.onKeyDown);
  },

  onKeyDown: function (evt) {
    // Find the super-keyboard component in the scene
    const keyboardEl = document.querySelector('[super-keyboard]');
    if (!keyboardEl) { return; }

    const keyboard = keyboardEl.components['super-keyboard'];
    if (!keyboard) { return; }

    // Only capture input if the keyboard is visible
    if (!keyboardEl.object3D.visible) { return; }

    // Prevent WASD and other keys from moving the camera when keyboard is active
    // This stops the default A-Frame wasd-controls from intercepting these keys
    const movementKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (movementKeys.includes(evt.key) || evt.key.length === 1) {
      evt.stopPropagation();
    }

    // Handle Enter key
    if (evt.key === 'Enter') {
      keyboard.accept();
      evt.preventDefault();
      return;
    }

    // Handle Escape key
    if (evt.key === 'Escape') {
      keyboard.dismiss();
      evt.preventDefault();
      return;
    }

    // Handle Backspace
    if (evt.key === 'Backspace') {
      let value = keyboard.data.value;
      if (value.length > 0) {
        value = value.substring(0, value.length - 1);
        keyboard.rawValue = value;
        keyboard.data.value = value;
        keyboard.updateTextInput(value);
        keyboard.el.emit('superkeyboardchange', {value: value});
      }
      evt.preventDefault();
      return;
    }

    // Handle regular characters (length 1)
    if (evt.key.length === 1) {
      let value = keyboard.data.value;
      // Check max length if defined
      if (keyboard.data.maxLength > 0 && value.length >= keyboard.data.maxLength) {
        return;
      }
      
      value += evt.key;
      keyboard.rawValue = value;
      keyboard.data.value = value;
      keyboard.updateTextInput(keyboard.filter(value));
      keyboard.el.emit('superkeyboardchange', {value: value});
      keyboard.updateCursorPosition();
      evt.preventDefault();
    }
  }
});
