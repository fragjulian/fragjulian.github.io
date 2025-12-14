import { useEffect, useRef } from 'react';

const FluidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const blobsRef = useRef<Array<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    radius: number;
    color: string;
    speed: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Rainbow colors with transparency
    const colors = [
      'rgba(255, 107, 107, 0.6)',
      'rgba(255, 193, 7, 0.6)',
      'rgba(76, 175, 80, 0.6)',
      'rgba(33, 150, 243, 0.6)',
      'rgba(156, 39, 176, 0.6)',
      'rgba(255, 87, 34, 0.6)',
      'rgba(0, 188, 212, 0.6)',
    ];

    // Initialize blobs
    blobsRef.current = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
      radius: 150 + Math.random() * 150,
      color,
      speed: 0.02 + Math.random() * 0.02,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      blobsRef.current.forEach((blob, i) => {
        // Calculate offset based on index for organic movement
        const offsetX = Math.sin(Date.now() * 0.001 + i * 2) * 100;
        const offsetY = Math.cos(Date.now() * 0.001 + i * 2) * 100;

        blob.targetX = mouseRef.current.x + offsetX;
        blob.targetY = mouseRef.current.y + offsetY;

        // Smooth follow
        blob.x += (blob.targetX - blob.x) * blob.speed;
        blob.y += (blob.targetY - blob.y) * blob.speed;

        // Draw blob with radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ filter: 'blur(80px)' }}
    />
  );
};

export default FluidBackground;
