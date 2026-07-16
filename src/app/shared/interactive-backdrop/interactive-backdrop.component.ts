import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

/**
 * Shared animated backdrop: ambient gradient, floating particles, a
 * cursor-following glow and a custom cursor. All browser-only work is guarded,
 * and the custom cursor / glow only activate on devices with a precise pointer
 * (desktops), so touch users keep their native cursor.
 */
@Component({
  selector: 'app-interactive-backdrop',
  standalone: true,
  templateUrl: './interactive-backdrop.component.html',
  styleUrl: './interactive-backdrop.component.scss',
})
export class InteractiveBackdropComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cursor') cursor!: ElementRef<HTMLElement>;
  @ViewChild('trail') trail!: ElementRef<HTMLElement>;
  @ViewChild('glow') glow!: ElementRef<HTMLElement>;
  @ViewChild('secondaryGlow') secondaryGlow!: ElementRef<HTMLElement>;
  @ViewChild('coreGlow') coreGlow!: ElementRef<HTMLElement>;
  @ViewChild('particlesContainer') particlesContainer!: ElementRef<HTMLElement>;

  private readonly isBrowser: boolean;
  private hasFinePointer = false;
  private cursorVisible = false;

  private animationFrame: number | null = null;
  private particlesAnimationFrame: number | null = null;
  private mouse = { x: 0, y: 0 };
  private trailPosition = { x: 0, y: 0 };
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Bound handlers so add/removeEventListener match.
  private readonly onMoveBound = (e: MouseEvent) => this.onMouseMove(e);
  private readonly onOverBound = (e: MouseEvent) => this.onPointerTarget(e, true);
  private readonly onOutBound = (e: MouseEvent) => this.onPointerTarget(e, false);
  private readonly onResizeBound = () => this.resizeCanvas();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.hasFinePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches;

    // Subtle particle field runs everywhere.
    this.initParticles();
    window.addEventListener('resize', this.onResizeBound);

    if (this.hasFinePointer) {
      // Hide the native cursor and drive the custom one on desktop.
      document.body.classList.add('has-custom-cursor');
      document.addEventListener('mousemove', this.onMoveBound);
      window.addEventListener('mouseover', this.onOverBound);
      window.addEventListener('mouseout', this.onOutBound);
      this.animateCursor();
    } else {
      // Touch / coarse pointer: remove the custom cursor elements entirely.
      this.cursor?.nativeElement.remove();
      this.trail?.nativeElement.remove();
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    document.body.classList.remove('has-custom-cursor');
    document.removeEventListener('mousemove', this.onMoveBound);
    window.removeEventListener('mouseover', this.onOverBound);
    window.removeEventListener('mouseout', this.onOutBound);
    window.removeEventListener('resize', this.onResizeBound);

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.particlesAnimationFrame) cancelAnimationFrame(this.particlesAnimationFrame);
  }

  // ---- Cursor + glow ------------------------------------------------------

  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // Reveal the cursor on the first movement to avoid a corner flash.
    if (!this.cursorVisible) {
      this.cursorVisible = true;
      if (this.cursor?.nativeElement) this.cursor.nativeElement.style.opacity = '1';
      if (this.trail?.nativeElement) this.trail.nativeElement.style.opacity = '1';
    }

    const vh = window.innerHeight;
    this.positionGlow(this.glow, e, vh * 0.3);
    this.positionGlow(this.secondaryGlow, e, vh * 0.25);
    this.positionGlow(this.coreGlow, e, vh * 0.2);
  }

  private positionGlow(ref: ElementRef<HTMLElement> | undefined, e: MouseEvent, size: number): void {
    if (!ref?.nativeElement) return;
    ref.nativeElement.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
  }

  private animateCursor(): void {
    const animate = () => {
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.transform = `translate(${this.mouse.x - 10}px, ${this.mouse.y - 10}px)`;
      }
      if (this.trail?.nativeElement) {
        this.trailPosition.x += (this.mouse.x - this.trailPosition.x - 24) * 0.1;
        this.trailPosition.y += (this.mouse.y - this.trailPosition.y - 24) * 0.1;
        this.trail.nativeElement.style.transform = `translate(${this.trailPosition.x}px, ${this.trailPosition.y}px)`;
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private onPointerTarget(e: MouseEvent, entering: boolean): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const tag = target.tagName.toLowerCase();
    if (tag !== 'a' && tag !== 'button' && tag !== 'input' && tag !== 'textarea') return;

    const scale = entering ? 1.5 : 1;
    const offset = entering ? 12 : 10;
    if (this.cursor?.nativeElement) {
      this.cursor.nativeElement.style.transform = `translate(${this.mouse.x - offset}px, ${this.mouse.y - offset}px) scale(${scale})`;
    }
    const inner = this.trail?.nativeElement.firstElementChild;
    inner?.classList.toggle('scale-150', entering);
  }

  // ---- Particles ----------------------------------------------------------

  private initParticles(): void {
    if (!this.particlesContainer) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.particlesContainer.nativeElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    this.createParticles();
    this.animateParticles();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx || !this.particlesContainer) return;
    const container = this.particlesContainer.nativeElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.createParticles();
  }

  private createParticles(): void {
    if (!this.canvas) return;
    const numParticles = Math.floor((this.canvas.width * this.canvas.height) / 25000);
    this.particles = [];
    for (let i = 0; i < numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        color: this.getRandomColor(),
      });
    }
  }

  private getRandomColor(): string {
    const colors = [
      'rgba(56, 189, 248, 0.4)', // blue
      'rgba(139, 92, 246, 0.4)', // purple
      'rgba(45, 212, 191, 0.4)', // teal
      'rgba(255, 255, 255, 0.3)', // white
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private animateParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.hasFinePointer) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200 && distance > 0) {
          p.vx += (dx / distance) * 0.01;
          p.vy += (dy / distance) * 0.01;
        }
      }

      p.vx = Math.min(Math.max(p.vx, -0.8), 0.8);
      p.vy = Math.min(Math.max(p.vy, -0.8), 0.8);
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const gradient = this.ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
          gradient.addColorStop(0, p.color.replace('0.4', '0.15'));
          gradient.addColorStop(1, p2.color.replace('0.4', '0.15'));
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = Math.max(0.1, (1 - distance / 100) * 0.5);
          this.ctx.stroke();
        }
      }
    }

    this.particlesAnimationFrame = requestAnimationFrame(() => this.animateParticles());
  }
}
