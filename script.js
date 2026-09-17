let loadedImage = null;

function handlePresetChange() {
  const preset = document.getElementById('platformSelect').value;
  if (preset !== 'custom') {
    const [w, h] = preset.split('x').map(Number);
    document.getElementById('customWidth').value = w;
    document.getElementById('customHeight').value = h;
  }
  updatePreview();
}

function onCustomDimensionChange() {
  document.getElementById('platformSelect').value = 'custom';
  updatePreview();
}

function toggleBgColorOption() {
  const mode = document.querySelector('input[name="resizeMode"]:checked').value;
  const bgColorGroup = document.getElementById('bgColorGroup');
  if (mode === 'fit') {
    bgColorGroup.style.display = 'block';
  } else {
    bgColorGroup.style.display = 'none';
  }
}

function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      loadedImage = img;
      document.getElementById('actionArea').style.display = 'block';
      updatePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePreview() {
  if (!loadedImage) return;

  const targetWidth = parseInt(document.getElementById('customWidth').value) || 1080;
  const targetHeight = parseInt(document.getElementById('customHeight').value) || 1080;
  const mode = document.querySelector('input[name="resizeMode"]:checked').value;
  const bgColor = document.getElementById('bgColor').value;
  document.getElementById('colorHex').innerText = bgColor;

  const statusBadge = document.getElementById('statusBadge');
  const infoText = document.getElementById('originalInfo');

  const isMatch = (loadedImage.width === targetWidth && loadedImage.height === targetHeight);

  if (isMatch) {
    statusBadge.className = 'badge pass';
    statusBadge.innerText = 'Perfect Dimensions Match';
  } else {
    statusBadge.className = 'badge warn';
    statusBadge.innerText = 'Dimensions Mismatch - Ready to Resize';
  }

  infoText.innerHTML = `Original: <b>${loadedImage.width} x ${loadedImage.height} px</b> | Target: <b>${targetWidth} x ${targetHeight} px</b>`;

  const canvas = document.getElementById('outputCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const imgWidth = loadedImage.width;
  const imgHeight = loadedImage.height;

  if (mode === 'fit') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const ratio = Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;
    const x = (targetWidth - newWidth) / 2;
    const y = (targetHeight - newHeight) / 2;

    ctx.drawImage(loadedImage, 0, 0, imgWidth, imgHeight, x, y, newWidth, newHeight);
  } else if (mode === 'crop') {
    const targetAspect = targetWidth / targetHeight;
    const imgAspect = imgWidth / imgHeight;

    let sourceX = 0, sourceY = 0, sourceWidth = imgWidth, sourceHeight = imgHeight;

    if (imgAspect > targetAspect) {
      sourceWidth = imgHeight * targetAspect;
      sourceX = (imgWidth - sourceWidth) / 2;
    } else {
      sourceHeight = imgWidth / targetAspect;
      sourceY = (imgHeight - sourceY) / 2;
    }

    ctx.drawImage(loadedImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
  } else if (mode === 'stretch') {
    ctx.drawImage(loadedImage, 0, 0, imgWidth, imgHeight, 0, 0, targetWidth, targetHeight);
  }

  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.href = canvas.toDataURL('image/png');
  downloadBtn.download = `social-media-${targetWidth}x${targetHeight}.png`;
}
