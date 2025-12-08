/**
 * Component to restore VR focus and controller functionality when returning from 
 * external menus (like the Meta system menu) or when the XR session is interrupted.
 * 
 * Problem: When users press the Meta button or switch apps while in VR, the XR session
 * may become disconnected from input handling. Upon return, controllers and raycasters
 * may not function properly until the page is refreshed.
 * 
 * Solution: Listen for visibility changes, XR session events, and enter-vr/exit-vr events
 * to restore controller connections, raycaster state, and re-enable input handling.
 */
AFRAME.registerComponent('vr-focus-restore', {
  init: function () {
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
    this.onExitVR = this.onExitVR.bind(this);
    this.restoreFocus = this.restoreFocus.bind(this);
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    
    // Listen for VR session events
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
    this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);
    
    // Track if we were in VR before losing focus
    this.wasInVR = false;
    this.lastXRSession = null;
    
    // Also listen for the XR session end/start events directly
    if (navigator.xr) {
      this.setupXRSessionListeners();
    }
  },
  
  remove: function () {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    this.el.sceneEl.removeEventListener('exit-vr', this.onExitVR);
    
    // Clear the XR session check interval to prevent memory leak
    if (this.xrSessionCheckInterval) {
      clearInterval(this.xrSessionCheckInterval);
      this.xrSessionCheckInterval = null;
    }
  },
  
  setupXRSessionListeners: function () {
    // Watch for session changes on the scene's xrSession
    const scene = this.el.sceneEl;
    const self = this;
    
    // Check for xrSession periodically
    this.xrSessionCheckInterval = setInterval(() => {
      if (scene.xrSession && scene.xrSession !== self.lastXRSession) {
        self.lastXRSession = scene.xrSession;
        
        // Listen for visibility change on the XR session itself
        scene.xrSession.addEventListener('visibilitychange', (evt) => {
          console.log('XR Session visibility changed:', evt.session.visibilityState);
          if (evt.session.visibilityState === 'visible') {
            self.restoreFocus();
          }
        });
      }
    }, 1000);
  },
  
  onVisibilityChange: function () {
    if (document.visibilityState === 'visible') {
      console.log('Document became visible, checking VR state...');
      
      // If we're in VR mode, restore focus
      if (this.el.sceneEl.is('vr-mode')) {
        setTimeout(() => this.restoreFocus(), 100);
      }
    } else {
      // Track if we were in VR when losing focus
      this.wasInVR = this.el.sceneEl.is('vr-mode');
    }
  },
  
  onEnterVR: function () {
    console.log('Entered VR mode');
    this.wasInVR = true;
    // Restore focus to ensure everything is connected properly
    setTimeout(() => this.restoreFocus(), 500);
  },
  
  onExitVR: function () {
    console.log('Exited VR mode');
    this.wasInVR = false;
  },
  
  restoreFocus: function () {
    console.log('Restoring VR focus and controllers...');
    const scene = this.el.sceneEl;
    
    // 1. Refresh controllers
    const leftHand = document.getElementById('leftHand');
    const rightHand = document.getElementById('rightHand');
    
    [leftHand, rightHand].forEach(hand => {
      if (!hand) return;
      
      // Re-emit controllerconnected to refresh state
      const trackedControls = hand.components['tracked-controls'] || 
                              hand.components['tracked-controls-webxr'];
      if (trackedControls) {
        // Force a controller update
        if (trackedControls.updateController) {
          trackedControls.updateController();
        }
      }
      
      // Re-enable raycaster if present
      const raycaster = hand.components.raycaster;
      if (raycaster) {
        // Temporarily disable and re-enable to force refresh
        const wasEnabled = raycaster.data.enabled;
        if (wasEnabled) {
          hand.setAttribute('raycaster', 'enabled', false);
          setTimeout(() => {
            hand.setAttribute('raycaster', 'enabled', true);
          }, 50);
        }
      }
      
      // Re-enable laser-controls if present
      const laserControls = hand.components['laser-controls'];
      if (laserControls) {
        // Force re-initialization of laser controls
        if (laserControls.pause && laserControls.play) {
          laserControls.pause();
          setTimeout(() => laserControls.play(), 50);
        }
      }
    });
    
    // 2. Refresh cursor if present
    const cursor = document.querySelector('[cursor]');
    if (cursor) {
      const cursorComponent = cursor.components.cursor;
      if (cursorComponent && cursorComponent.pause && cursorComponent.play) {
        cursorComponent.pause();
        setTimeout(() => cursorComponent.play(), 50);
      }
    }
    
    // 3. Re-emit controllers updated event
    setTimeout(() => {
      scene.emit('controllersupdated', {}, false);
    }, 100);
    
    // 4. Force a canvas focus
    const canvas = scene.canvas;
    if (canvas) {
      canvas.focus();
    }
    
    // 5. If in VR, request animation frame to restart render loop
    if (scene.is('vr-mode') && scene.xrSession) {
      // The session should auto-resume, but we can ensure the loop is running
      if (scene.renderer && scene.renderer.xr) {
        scene.renderer.xr.enabled = true;
      }
    }
    
    console.log('VR focus restoration complete');
  }
});
