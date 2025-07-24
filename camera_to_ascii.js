/* A camera is requested only by an explicit user action. */
(function () {
  'use strict';
  window.AsciiCamera = {
    async open() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access needs HTTPS or localhost. Images and videos still work here.');
      }
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false
        });
      } catch (error) {
        const messages = {
          NotAllowedError: 'Camera permission was declined. Allow access in your browser and try again.',
          NotFoundError: 'No camera was found. Connect one, or try an image or video.',
          NotReadableError: 'The camera is busy. Close the other app using it and try again.',
          OverconstrainedError: 'This camera could not start. Try another camera or upload a file.'
        };
        throw new Error(messages[error.name] || 'The camera could not start. Check its connection and try again.');
      }
    },
    stop(stream) { stream?.getTracks().forEach(track => track.stop()); }
  };
})();
