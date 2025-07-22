# DEATH OF PIXELS

![Death of Pixels Banner](readme%20files/banner.png)

## Welcome to Death of Pixels

"Death of Pixels" is a fun tool that turns your videos, images, and live camera feeds into retro ASCII art animations. Perfect for YouTubers, artists, and anyone who loves creative experiments.

---

## Features

- **Image to ASCII**: Convert images into ASCII art.
- **Video to ASCII**: Watch your videos come alive in ASCII.
- **Camera to ASCII**: Real-time ASCII art from your webcam.
- **Customizable Output**: Adjust settings like brightness, contrast, and colors.
- **Save Your Art**: Download as text or image files.

---

https://github.com/user-attachments/assets/3e1bb289-21c3-4fb8-9947-12ff042b32ea


## How It Works

1. **Image to ASCII**
   - Upload an image.
   - The tool maps pixel brightness to ASCII characters.

   ```javascript
   let asciiChar = chars[floor(brightness * chars.length)];
   text(asciiChar, x, y);
   ```

2. **Video to ASCII**
   - Upload a video.
   - Each frame is processed into ASCII art in real-time.

   ```javascript
   video.loadPixels();
   for (let i = 0; i < video.pixels.length; i += 4) {
       let brightness = calculateBrightness(video.pixels[i]);
       asciiArt += chars[floor(brightness * chars.length)];
   }
   ```

3. **Camera to ASCII**
   - Activate your webcam.
   - The live feed is converted into ASCII art.

   ```javascript
   capture.loadPixels();
   // Similar processing as video frames
   ```

---

## Quick Start

1. Clone the repository.
2. Open `index.html` in your browser.
3. Choose a mode and start creating ASCII art!

---

## Contributing

Fork the repository and submit pull requests. Contributions are welcome!

---

## License

MIT License.
