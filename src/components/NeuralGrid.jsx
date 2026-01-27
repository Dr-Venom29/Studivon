import React, { useEffect, useRef } from 'react';

const NeuralGrid = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const visibleRef = useRef(false);

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

    const activateCell = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      mouse.x = x;
      mouse.y = y;

      const cell = getCellAt(x, y);
      if (cell && cell.alpha === 0) {
        cell.alpha = 1;
        cell.lastTouched = Date.now();
        cell.fading = false;
      }
    };

    const handleMouseMove = (e) => activateCell(e.clientX, e.clientY);

    const handleTouchMove = (e) => {
      // Prevent scrolling if needed, or just track touch
      const touch = e.touches[0];
      if (touch) activateCell(touch.clientX, touch.clientY);
    };

    const drawGrid = () => {
      if (!visibleRef.current) {
        // Pause loop if not visible
        return;
      }

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

      animationRef.current = requestAnimationFrame(drawGrid);
    };

    initGrid();

    // Observer for Visibility/Performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          // Restart loop if stopped
          cancelAnimationFrame(animationRef.current);
          drawGrid();
        }
      });
    }, { threshold: 0 });

    observer.observe(canvas);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-grid-canvas" aria-hidden="true" />;
};

export default NeuralGrid;
