"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\";

interface Drop {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  char: string;
  switchIn: number;
  trailLen: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let drops: Drop[] = [];
    let particles: Particle[] = [];
    let scanY = 0;
    let frameCount = 0;
    let animId = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initDrops();
      initParticles();
    };

    const initDrops = () => {
      const cols = Math.floor(w / 20);
      drops = [];
      for (let i = 0; i < cols; i++) {
        drops.push({
          x: i * 20 + 10,
          y: Math.random() * h * 2 - h,
          speed: 0.4 + Math.random() * 1.2,
          opacity: 0.06 + Math.random() * 0.12,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          switchIn: Math.floor(Math.random() * 15) + 3,
          trailLen: Math.floor(Math.random() * 3) + 3,
        });
      }
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((w * h) / 15000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.12 + 0.06,
          size: Math.random() * 2 + 0.8,
          opacity: Math.random() * 0.5 + 0.15,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.02,
        });
      }
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(34, 211, 238, 0.045)";
      ctx.lineWidth = 0.5;
      const gridSize = 40;

      ctx.beginPath();
      for (let x = 0; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Brighter intersection dots
      ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
      for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawMatrixRain = () => {
      ctx.font = "14px monospace";
      for (const drop of drops) {
        // Leading bright character — the "head" of the stream
        const headAlpha = Math.min(drop.opacity * 3.5, 0.45);
        ctx.fillStyle = `rgba(34, 211, 238, ${headAlpha})`;
        ctx.fillText(drop.char, drop.x, drop.y);

        // Trail characters — fading behind
        for (let t = 1; t <= drop.trailLen; t++) {
          const trailAlpha = drop.opacity * (1 - t / (drop.trailLen + 1)) * 1.8;
          // Mix cyan and green for matrix feel
          if (t % 2 === 0) {
            ctx.fillStyle = `rgba(45, 212, 191, ${trailAlpha * 0.7})`;
          } else {
            ctx.fillStyle = `rgba(34, 211, 238, ${trailAlpha})`;
          }
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(trailChar, drop.x, drop.y - t * 18);
        }

        // Update position
        drop.y += drop.speed;
        drop.switchIn--;
        if (drop.switchIn <= 0) {
          drop.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          drop.switchIn = Math.floor(Math.random() * 15) + 3;
        }
        if (drop.y > h + drop.trailLen * 18 + 20) {
          drop.y = -(drop.trailLen * 18 + 20);
          drop.speed = 0.4 + Math.random() * 1.2;
          drop.opacity = 0.06 + Math.random() * 0.12;
          drop.trailLen = Math.floor(Math.random() * 3) + 3;
        }
      }
    };

    const drawParticles = () => {
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const glow = 0.5 + 0.5 * Math.sin(p.pulse);
        const a = p.opacity * (0.5 + glow * 0.5);

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${a * 0.08})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${a})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
    };

    const drawScanLine = () => {
      // Bright horizontal scan pulse
      const gradient = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0)");
      gradient.addColorStop(0.4, "rgba(34, 211, 238, 0.04)");
      gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.08)");
      gradient.addColorStop(0.6, "rgba(34, 211, 238, 0.04)");
      gradient.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 60, w, 120);

      scanY += 0.5;
      if (scanY > h + 60) scanY = -60;
    };

    const drawDataStreams = () => {
      const pulse = Math.sin(frameCount * 0.025);

      // Left edge
      const leftGrad = ctx.createLinearGradient(0, 0, 100, 0);
      leftGrad.addColorStop(0, `rgba(34, 211, 238, ${0.06 + 0.03 * pulse})`);
      leftGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, 100, h);

      // Right edge
      const rightGrad = ctx.createLinearGradient(w - 100, 0, w, 0);
      rightGrad.addColorStop(0, "rgba(34, 211, 238, 0)");
      rightGrad.addColorStop(1, `rgba(34, 211, 238, ${0.06 + 0.03 * pulse})`);
      ctx.fillStyle = rightGrad;
      ctx.fillRect(w - 100, 0, 100, h);

      // Bottom edge glow
      const bottomGrad = ctx.createLinearGradient(0, h - 80, 0, h);
      bottomGrad.addColorStop(0, "rgba(34, 211, 238, 0)");
      bottomGrad.addColorStop(1, `rgba(34, 211, 238, ${0.04 + 0.02 * pulse})`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, h - 80, w, 80);
    };

    const drawVignette = () => {
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
      vignette.addColorStop(0, "rgba(6, 16, 26, 0)");
      vignette.addColorStop(0.6, "rgba(6, 16, 26, 0.2)");
      vignette.addColorStop(1, "rgba(6, 16, 26, 0.6)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, w, h);

      // Layer 1: Grid
      drawGrid();

      // Layer 2: Matrix rain
      drawMatrixRain();

      // Layer 3: Particles
      drawParticles();

      // Layer 4: Scan line
      drawScanLine();

      // Layer 5: Data streams
      drawDataStreams();

      // Layer 6: Vignette
      drawVignette();

      animId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
