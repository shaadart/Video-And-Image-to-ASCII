let img, aspectRatio;
let previewCanvas, previewCtx;
let size = 10; 
let asciiChar = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/()1{}[]?-_+~<>i!lI;:,^`'. "
// let asciiChar = " .:-=+*#%@";
let inputFile;


  // grab controls
  const cwSlider = document.getElementById("canvasWidth");
  const cwInput  = document.getElementById("canvasWidthInput");
  const pxSlider = document.getElementById("pixelSize");
  const useCustom = document.getElementById("useCustomChars");
  const customChars = document.getElementById("customChars");
  const contrast = document.getElementById("contrast");
  const saturation = document.getElementById("saturation");
  const brightness = document.getElementById("brightness");
  const fileInput = document.getElementById("fileInput");
  const asciiOut  = document.getElementById("asciiOutput");
  const bgcolor = document.getElementById("bgcolor");
  const asciiColor = document.getElementById("asciiColor");
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");


  previewCanvas = document.getElementById("previewCanvas");
  previewCtx    = previewCanvas.getContext("2d");


  cwSlider.addEventListener('input', function(){
    const value = cwSlider.value;
    cwSlider.textContent = value; 
    console.log(value); 
    resizeCanvas(value, value);
    img.resize(value/4, 0);

  });

  pxSlider.addEventListener('input', function(){
    const value = pxSlider.value;
    pxSlider.textContent = value; 
    size = value;
    textSize(size*(img.width/100)); // Set p5.js text size
    draw(); 
    
  }
  );

  useCustom.addEventListener('change', function() {
    if (useCustom.checked) {
      customChars.disabled = false;
      asciiChar = customChars.value;
    } else {
      customChars.disabled = true;
      asciiChar = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,^`'. ";
    }
    draw(); 
  });

  customChars.addEventListener('input', function() {
    asciiChar = customChars.value;
    draw(); 
  });

  contrast.addEventListener('input', function() {
    const value = contrast.value;
    contrast.textContent = value; 
    img.filter(CONTRAST, value);
    draw(); 
  }
  );

  brightness.addEventListener('input', function() {
    const value = brightness.value;
    brightness.textContent = value; 
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
      img.pixels[i] = img.pixels[i] * value;     // Red
      img.pixels[i + 1] = img.pixels[i + 1] * value; // Green
      img.pixels[i + 2] = img.pixels[i + 2] * value; // Blue
    }
    img.updatePixels();
    draw();  
  });

  // Update the color event listener
  asciiColor.addEventListener('input', function() {
    const colorInput = asciiColor.value;
    const r = parseInt(colorInput.substr(1,2), 16);
    const g = parseInt(colorInput.substr(3,2), 16);
    const b = parseInt(colorInput.substr(5,2), 16);
    const a = parseInt(colorInput.substr(7,2), 16) || 255; // Default to 255 if not provided
    // Set the color for the ASCII characters
    fill(r, g, b, a); // Set the fill color for the ASCII characters
    draw();  // This will use the new color value
  });

downloadBtn.addEventListener('click', function() {
  const canvas = document.createElement('canvas');
  canvas.width = img.width * size;
  canvas.height = img.height * size;
  const ctx = canvas.getContext('2d');
  
  // Draw the ASCII art on the new canvas
  for (let i=0; i<img.width; i++) {
    for (let j=0; j<img.height; j++) {
      let pixelIndex = (i + j*img.width) * 4;
      let r = img.pixels[pixelIndex + 0];
      let g = img.pixels[pixelIndex + 1];
      let b = img.pixels[pixelIndex + 2];
      let a = img.pixels[pixelIndex + 3];
      
      let bright = (r + g + b + a) / 3;
      let tIndex = floor(map(bright, 0, 255, 0, asciiChar.length));
      
      let x = i*size + size/2;
      let y = j*size + size/2;
      let t = asciiChar.charAt(tIndex);
      ctx.font = `${size}px monospace`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t, x, y);
    }
  }
  
  // Create a download link for the ASCII art
  const link = document.createElement('a');
  link.download = 'ascii_art.png';
  link.href = canvas.toDataURL();
  link.click();

});

// Add reset button functionality 
resetBtn.addEventListener('click', function() {
  // Reset all controls to default values
  cwSlider.value = 800;
  cwInput.value = 800;
  pxSlider.value = 8;
  size = 8;
  contrast.value = 1;
  saturation.value = 1;
  brightness.value = 0;
  bgcolor.value = "#000000";
  asciiColor.value = "#00ff00";
  useCustom.checked = false;
  customChars.disabled = true;
  customChars.value = "";
  asciiChar = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,^`'. ";
  
  // If an image is loaded, reset and redraw
  if (img) {
    // Reset image to original size without filters
    img = loadImage(img.canvas.toDataURL(), () => {
      img.resize(100, 0);
      size = width / img.width;
      draw();
    });
  }
});

function preload() {
  inputFile = createFileInput(handleFile);
  inputFile.position(0, 0);
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      img.resize(100, 0);
      size = width / img.width;
    });
  } else {
    console.error('Not an image file!');
  }
}

function setup() {
  createCanvas(400, 400);
  background(240);
  textSize(16);
  
  textAlign(CENTER, CENTER);
  text('Upload an image to convert to ASCII', width / 2, height / 2);
}

// Modify the draw function to use the selected color
function draw() {
  if (!img) return;
  
  // Convert hex color value to RGB
  const colorInput = bgcolor.value;
  const r = parseInt(colorInput.substr(1,2), 16);
  const g = parseInt(colorInput.substr(3,2), 16);
  const b = parseInt(colorInput.substr(5,2), 16);
  // const a = parseInt(colorInput.substr(7,2), 16) || 0; // Default to 255 if not provided
  noStroke();
  // Set background using the color picker's RGB values
  background(r, g, b);
  
  /* ---- Using pixels ---- */
  img.loadPixels();
  for (let i=0; i<img.width; i++) {
    for (let j=0; j<img.height; j++) {
      let pixelIndex = (i + j*img.width) * 4;
      let r = img.pixels[pixelIndex + 0];
      let g = img.pixels[pixelIndex + 1];
      let b = img.pixels[pixelIndex + 2];
      let a = img.pixels[pixelIndex + 3];
      
      // let bright = brightness(color(r, g, b))
      let bright = (r + g + b + a) / 3;
      let tIndex = floor(map(bright, 0, 255, 0, asciiChar.length));
      
      let x = i*size + size/2;
      let y = j*size + size/2;
      let t = asciiChar.charAt(tIndex);
      textSize(size);
      textAlign(CENTER, CENTER);
      text(t, x, y);
    }
  }
}
/* ---- Using get() ---- */
//   for (let i=0; i<img.width; i++) {
//     for (let j=0; j<img.height; j++) {
//       let pixelVal = img.get(i, j);
//       let c = brightness(pixelVal);
//       let tIndex = floor(map(c, 0, 100, 0 ,asciiChar.length));
      
//       let x = i*size + size/2;
//       let y = j*size + size/2;
//       let t = asciiChar.charAt(tIndex);
//       textSize(size);
//       textAlign(CENTER, CENTER);
//       text(t, x, y);
      
//     }
//   }
