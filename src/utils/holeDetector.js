/**
 * Utility to automatically detect transparent rectangular cutouts (holes)
 * in an uploaded PNG frame.
 * 
 * @param {HTMLImageElement} imageElement - The pre-loaded frame image.
 * @param {number} canvasWidth - Target scan canvas width (default: 600)
 * @param {number} canvasHeight - Target scan canvas height (default: 1800)
 * @returns {Array<{id: number, left: number, y: number, width: number, height: number}>} - Detected photo slots
 */
export function detectTransparentHoles(imageElement, canvasWidth = 600, canvasHeight = 1800) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    
    // Draw the custom frame onto our measuring canvas
    ctx.drawImage(imageElement, 0, 0, canvasWidth, canvasHeight);
    
    const imgData = ctx.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imgData.data;
    
    const visited = new Uint8Array(canvasWidth * canvasHeight);
    const holes = [];
    
    // Scan step (e.g. check every 4th pixel for speed & efficiency)
    const STEP = 4;
    
    for (let y = 0; y < canvasHeight; y += STEP) {
      for (let x = 0; x < canvasWidth; x += STEP) {
        const vIdx = y * canvasWidth + x;
        
        // Skip if already visited
        if (visited[vIdx] === 1) continue;
        
        const idx = (y * canvasWidth + x) * 4;
        const alpha = data[idx + 3]; // Alpha channel (0-255)
        
        // If transparent/semi-transparent (alpha < 50)
        if (alpha < 50) {
          // Initialize bounding box
          let minX = x;
          let maxX = x;
          let minY = y;
          let maxY = y;
          
          // BFS / Flood fill to discover full contiguous transparent area
          const queue = [{ x, y }];
          visited[vIdx] = 1;
          
          while (queue.length > 0) {
            const curr = queue.shift();
            
            if (curr.x < minX) minX = curr.x;
            if (curr.x > maxX) maxX = curr.x;
            if (curr.y < minY) minY = curr.y;
            if (curr.y > maxY) maxY = curr.y;
            
            // Check 4-directional neighbors
            const neighbors = [
              { x: curr.x + STEP, y: curr.y },
              { x: curr.x - STEP, y: curr.y },
              { x: curr.x, y: curr.y + STEP },
              { x: curr.x, y: curr.y - STEP }
            ];
            
            for (const n of neighbors) {
              if (n.x >= 0 && n.x < canvasWidth && n.y >= 0 && n.y < canvasHeight) {
                const nVIdx = n.y * canvasWidth + n.x;
                if (visited[nVIdx] === 0) {
                  const nIdx = (n.y * canvasWidth + n.x) * 4;
                  const nAlpha = data[nIdx + 3];
                  
                  if (nAlpha < 50) {
                    visited[nVIdx] = 1;
                    queue.push(n);
                  }
                }
              }
            }
          }
          
          const width = maxX - minX + STEP;
          const height = maxY - minY + STEP;
          
          // Filter out small decorations, stars, texts, or noise (must be at least 60x60 pixels)
          if (width >= 60 && height >= 60) {
            // Mark all coordinates inside the detected bounding box as visited
            // so we don't scan overlapping or multi-connected edge pixels again
            for (let vy = minY; vy <= maxY; vy += STEP) {
              for (let vx = minX; vx <= maxX; vx += STEP) {
                if (vy >= 0 && vy < canvasHeight && vx >= 0 && vx < canvasWidth) {
                  visited[vy * canvasWidth + vx] = 1;
                }
              }
            }
            
            // Apply a slight padding/inset (e.g. 2px inner padding) so photos overlap perfectly behind edges
            const padding = 2;
            holes.push({
              left: Math.max(0, minX - padding),
              y: Math.max(0, minY - padding),
              width: Math.min(canvasWidth - minX, width + padding * 2),
              height: Math.min(canvasHeight - minY, height + padding * 2)
            });
          }
        }
      }
    }
    
    // Sort detected transparent holes from top to bottom (by Y coordinate)
    holes.sort((a, b) => a.y - b.y);
    
    // Convert to slot objects
    return holes.map((hole, index) => ({
      id: index,
      left: hole.left,
      y: hole.y,
      width: hole.width,
      height: hole.height
    }));
  } catch (error) {
    console.error("Auto hole detection error:", error);
    return [];
  }
}
