import React, { useEffect, useRef } from 'react';

const NeuralGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const mouse = { x: -9999, y: -9999 };
    const squareSize = 30; // Slightly smaller cubes for a more compact grid
    const grid = [];
    let cols = 0;
    let rows = 0;

    const initGrid = () => {
      const rect = canvas.getBoundingClientRect();
      width = (canvas.width = rect.width);
      height = (canvas.height = rect.height);
      grid.length = 0;

      cols = Math.ceil(width / squareSize);
      rows = Math.ceil(height / squareSize);

      for (let col = 0; col < cols; col++) {
        const x = col * squareSize;
        for (let row = 0; row < rows; row++) {
          const y = row * squareSize;
          grid.push({
            x,
            y,
            alpha: 0,
            fading: false,
            lastTouched: 0,
          });
        }
      }
    };

    const getCellAt = (x, y) => {
      if (!cols || !rows) return undefined;

      const col = Math.floor(x / squareSize);
      const row = Math.floor(y / squareSize);

      if (col < 0 || row < 0 || col >= cols || row >= rows) return undefined;

      const index = row + col * rows;
      return grid[index];
    };

    const handleResize = () => {
      initGrid();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouse.x = x;
      mouse.y = y;

      const cell = getCellAt(x, y);
      if (cell && cell.alpha === 0) {
        cell.alpha = 1;
        cell.lastTouched = Date.now();
        cell.fading = false;
      }
    };

    let animationId;

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle HUD persistence glow overlay
      if (width > 0 && height > 0) {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.015)';
        ctx.fillRect(0, 0, width, height);
      }

      const now = Date.now();

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];

        // Start fading fairly quickly after activation
        if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 350) {
          cell.fading = true;
        }

        if (cell.fading) {
          // Smooth but concise fade so trails don't feel too long
          cell.alpha -= 0.024;
          if (cell.alpha <= 0) {
            cell.alpha = 0;
            cell.fading = false;
          }
        }

        if (cell.alpha > 0) {
          const centerX = cell.x + squareSize / 2;
          const centerY = cell.y + squareSize / 2;

          const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            4,
            centerX,
            centerY,
            squareSize
          );
          gradient.addColorStop(0, `rgba(0, 255, 204, ${cell.alpha})`);
          gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.1;
          ctx.strokeRect(
            cell.x + 0.5,
            cell.y + 0.5,
            squareSize - 1,
            squareSize - 1
          );
        }
      }

      animationId = requestAnimationFrame(drawGrid);
    };

    initGrid();
    drawGrid();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-grid-canvas" aria-hidden="true" />;
};

export default NeuralGrid;
