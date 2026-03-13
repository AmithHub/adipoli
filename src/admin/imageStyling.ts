const OUTPUT_SIZE = 1024;
const MAX_SOURCE_DIMENSION = 1400;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image preview failed"));
      image.src = String(reader.result ?? "");
    };
    reader.onerror = () => reject(new Error("Image upload failed"));
    reader.readAsDataURL(file);
  });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function isNearWhite(data: Uint8ClampedArray, index: number): boolean {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  if (a < 10) {
    return true;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 228 && min > 212 && max - min < 30;
}

function removeWhiteBackground(
  image: HTMLImageElement,
): { canvas: HTMLCanvasElement; hasCutout: boolean } {
  const scale = Math.min(
    1,
    MAX_SOURCE_DIMENSION / Math.max(image.width, image.height),
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not available");
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;

  function enqueue(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) {
      return;
    }

    const rgbaIndex = pixelIndex * 4;
    if (!isNearWhite(data, rgbaIndex)) {
      return;
    }

    visited[pixelIndex] = 1;
    queue[queueEnd] = pixelIndex;
    queueEnd += 1;
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart];
    queueStart += 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  let foregroundPixels = 0;

  for (let pixelIndex = 0; pixelIndex < visited.length; pixelIndex += 1) {
    const rgbaIndex = pixelIndex * 4;
    const alpha = data[rgbaIndex + 3];

    if (visited[pixelIndex]) {
      data[rgbaIndex + 3] = 0;
      continue;
    }

    if (alpha > 16) {
      foregroundPixels += 1;
    }

    const r = data[rgbaIndex];
    const g = data[rgbaIndex + 1];
    const b = data[rgbaIndex + 2];
    const brightness = (r + g + b) / 3;
    const channelSpread = Math.max(r, g, b) - Math.min(r, g, b);

    if (brightness > 238 && channelSpread < 24) {
      data[rgbaIndex + 3] = Math.max(0, alpha - 190);
    } else if (brightness > 224 && channelSpread < 26) {
      data[rgbaIndex + 3] = Math.max(0, alpha - 120);
    }
  }

  context.putImageData(imageData, 0, 0);

  const foregroundRatio = foregroundPixels / (width * height);
  return {
    canvas,
    hasCutout: foregroundRatio > 0.04,
  };
}

function getOpaqueBounds(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image processing is not available");
  }

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 24) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function drawAdipoliBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const baseGradient = context.createLinearGradient(0, 0, 0, height);
  baseGradient.addColorStop(0, "#121212");
  baseGradient.addColorStop(0.54, "#18181a");
  baseGradient.addColorStop(1, "#1c1c1c");
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, width, height);

  const amberGlow = context.createRadialGradient(
    width / 2,
    height * 0.42,
    0,
    width / 2,
    height * 0.42,
    width * 0.38,
  );
  amberGlow.addColorStop(0, "rgba(245, 186, 77, 0.28)");
  amberGlow.addColorStop(0.42, "rgba(183, 99, 20, 0.16)");
  amberGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = amberGlow;
  context.fillRect(0, 0, width, height);

  const vignette = context.createRadialGradient(
    width / 2,
    height * 0.44,
    width * 0.2,
    width / 2,
    height * 0.5,
    width * 0.72,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.42)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function composeCutoutPresentation(
  cutoutCanvas: HTMLCanvasElement,
): string {
  const output = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const context = output.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not available");
  }

  drawAdipoliBackdrop(context, OUTPUT_SIZE, OUTPUT_SIZE);

  const bounds = getOpaqueBounds(cutoutCanvas);
  if (!bounds) {
    throw new Error("Image processing failed");
  }

  const paddedWidth = bounds.width * 1.14;
  const paddedHeight = bounds.height * 1.14;
  const drawScale = Math.min(
    (OUTPUT_SIZE * 0.52) / paddedWidth,
    (OUTPUT_SIZE * 0.76) / paddedHeight,
  );
  const drawWidth = bounds.width * drawScale;
  const drawHeight = bounds.height * drawScale;
  const drawX = (OUTPUT_SIZE - drawWidth) / 2;
  const drawY = OUTPUT_SIZE * 0.12;
  const floorY = drawY + drawHeight;

  context.save();
  context.globalAlpha = 0.24;
  context.filter = "blur(18px)";
  context.fillStyle = "rgba(0, 0, 0, 0.72)";
  context.beginPath();
  context.ellipse(
    OUTPUT_SIZE / 2,
    floorY + OUTPUT_SIZE * 0.038,
    drawWidth * 0.26,
    OUTPUT_SIZE * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.restore();

  context.save();
  context.globalAlpha = 0.18;
  context.translate(OUTPUT_SIZE / 2, floorY + OUTPUT_SIZE * 0.012);
  context.scale(1, -0.22);
  context.filter = "blur(8px)";
  context.drawImage(
    cutoutCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    -drawWidth / 2,
    0,
    drawWidth,
    drawHeight,
  );
  context.restore();

  context.save();
  context.shadowColor = "rgba(243, 167, 58, 0.24)";
  context.shadowBlur = 32;
  context.drawImage(
    cutoutCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
  context.restore();

  context.drawImage(
    cutoutCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  const overlay = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const overlayContext = overlay.getContext("2d");
  if (!overlayContext) {
    throw new Error("Image processing is not available");
  }

  overlayContext.drawImage(
    cutoutCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
  overlayContext.globalCompositeOperation = "source-atop";
  const edgeHighlight = overlayContext.createLinearGradient(
    drawX,
    drawY,
    drawX + drawWidth,
    drawY,
  );
  edgeHighlight.addColorStop(0, "rgba(255, 255, 255, 0.20)");
  edgeHighlight.addColorStop(0.18, "rgba(255, 255, 255, 0.08)");
  edgeHighlight.addColorStop(0.52, "rgba(255, 196, 86, 0.10)");
  edgeHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  overlayContext.fillStyle = edgeHighlight;
  overlayContext.fillRect(drawX, drawY, drawWidth, drawHeight);
  context.drawImage(overlay, 0, 0);

  return output.toDataURL("image/png");
}

function composeFallbackPresentation(image: HTMLImageElement): string {
  const output = createCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
  const context = output.getContext("2d");
  if (!context) {
    throw new Error("Image processing is not available");
  }

  drawAdipoliBackdrop(context, OUTPUT_SIZE, OUTPUT_SIZE);

  const scale = Math.min(
    (OUTPUT_SIZE * 0.7) / image.width,
    (OUTPUT_SIZE * 0.82) / image.height,
  );
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = (OUTPUT_SIZE - drawWidth) / 2;
  const drawY = (OUTPUT_SIZE - drawHeight) / 2 - OUTPUT_SIZE * 0.02;

  context.save();
  context.filter = "brightness(0.9) contrast(1.06) saturate(1.04)";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();

  context.save();
  const vignette = context.createRadialGradient(
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE * 0.46,
    OUTPUT_SIZE * 0.1,
    OUTPUT_SIZE / 2,
    OUTPUT_SIZE * 0.5,
    OUTPUT_SIZE * 0.58,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.restore();

  return output.toDataURL("image/png");
}

export async function buildStyledProductImage(file: File): Promise<string> {
  const image = await loadImageFromFile(file);
  const cutout = removeWhiteBackground(image);

  if (cutout.hasCutout) {
    return composeCutoutPresentation(cutout.canvas);
  }

  return composeFallbackPresentation(image);
}
