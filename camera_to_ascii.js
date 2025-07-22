/*
----- Coding Tutorial by Patt Vira ----- 
Name: ASCII Art (with Video Webcam)
Video Tutorial: https://youtu.be/4IyeLc6J1Uo

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

let asciiChar = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,^`'. "
// let asciiChar = " .:-=+*#%@";

let video; let vidw = 64; let vidh = 48; let scl = 10;
let w, h;

function setup() {
  createCanvas(vidw * scl, vidh * scl);
  video = createCapture(VIDEO);
  video.size(vidw, vidh);
  w = width / video.width;
  h = height / video.height;
}

function draw() {
  background(255);
  video.loadPixels();
  
  /* ---- Using pixels ---- */
  for (let i=0; i<video.width; i++) {
    for (let j=0; j<video.height; j++) {
      let pixelIndex = (i + j*video.width) * 4;
      let r = video.pixels[pixelIndex + 0];
      let g = video.pixels[pixelIndex + 1];
      let b = video.pixels[pixelIndex + 2];
      
      // let bright = brightness(color(r, g, b))
      let bright = (r + g + b) / 3;
      let tIndex = floor(map(bright, 0, 255, 0, asciiChar.length));
      
      let x = i*w + w/2;
      let y = j*h + h/2;
      let t = asciiChar.charAt(tIndex);
      stroke(255);
      textSize(w);
      textAlign(CENTER, CENTER);
      text(t, x, y);
    }
  }
}