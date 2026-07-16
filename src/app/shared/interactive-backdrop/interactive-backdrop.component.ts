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

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  amp: number;
  speed: number;
  phase: number;
  color: string;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  life: number;
  maxLife: number;
}

/**
 * Shared intergalactic backdrop: a cosmic gradient (styled in the template),
 * a twinkling starfield, a slowly drifting constellation of dust, and the odd
 * shooting star — all rendered on one canvas. A cursor-following aura and a
 * custom cursor activate only on precise-pointer (desktop) devices.
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
  private reducedMotion = false;
  private cursorVisible = false;

  private animationFrame: number | null = null;
  private sceneFrame: number | null = null;
  private frame = 0;
  private mouse = { x: -1000, y: -1000 };
  private trailPosition = { x: 0, y: 0 };

  private stars: Star[] = [];
  private dust: Dust[] = [];
  private shootingStars: ShootingStar[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;

  private readonly onMoveBound = (e: MouseEvent) => this.onMouseMove(e);
  private readonly onOverBound = (e: MouseEvent) => this.onPointerTarget(e, true);
  private readonly onOutBound = (e: MouseEvent) => this.onPointerTarget(e, false);
  private readonly onResizeBound = () => this.resizeCanvas();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const mm = typeof window.matchMedia === 'function';
    this.hasFinePointer = mm && window.matchMedia('(pointer: fine)').matches;
    this.reducedMotion = mm && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initScene();
    window.addEventListener('resize', this.onResizeBound);

    if (this.hasFinePointer) {
      document.body.classList.add('has-custom-cursor');
      document.addEventListener('mousemove', this.onMoveBound);
      window.addEventListener('mouseover', this.onOverBound);
      window.addEventListener('mouseout', this.onOutBound);
      this.animateCursor();
    } else {
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
    if (this.sceneFrame) cancelAnimationFrame(this.sceneFrame);
  }

  // ---- Cursor + aura ------------------------------------------------------

  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

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

  // ---- Space scene --------------------------------------------------------

  private initScene(): void {
    if (!this.particlesContainer) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.particlesContainer.nativeElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    this.renderScene();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx || !this.particlesContainer) return;
    const container = this.particlesContainer.nativeElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.buildScene();
  }

  private buildScene(): void {
    if (!this.canvas) return;
    const area = this.canvas.width * this.canvas.height;

    const starColors = [
      'rgba(255, 255, 255, ALPHA)',
      'rgba(191, 219, 254, ALPHA)', // pale blue
      'rgba(221, 214, 254, ALPHA)', // pale violet
      'rgba(153, 246, 228, ALPHA)', // pale teal
    ];
    const starCount = Math.min(700, Math.floor(area / 3200));
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.4 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.45,
        amp: Math.random() * 0.35 + 0.15,
        speed: Math.random() * 0.05 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const dustColors = [
      'rgba(129, 140, 248, 0.6)', // indigo
      'rgba(167, 139, 250, 0.6)', // violet
      'rgba(45, 212, 191, 0.55)', // teal
      'rgba(244, 114, 182, 0.5)', // pink
    ];
    const dustCount = Math.min(70, Math.floor(area / 42000));
    this.dust = [];
    for (let i = 0; i < dustCount; i++) {
      this.dust.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.6 + 0.6,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }
  }

  private spawnShootingStar(): void {
    if (!this.canvas) return;
    const angle = Math.PI / 5 + (Math.random() * 0.25 - 0.125);
    const speed = 7 + Math.random() * 5;
    this.shootingStars.push({
      x: Math.random() * this.canvas.width * 0.8,
      y: Math.random() * this.canvas.height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 120 + Math.random() * 90,
      life: 0,
      maxLife: 55 + Math.random() * 35,
    });
  }

  private renderScene(): void {
    if (!this.ctx || !this.canvas) return;
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.frame++;
    const t = this.frame;

    // Twinkling stars — larger ones get a soft glow
    for (const s of this.stars) {
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + s.amp * Math.sin(t * s.speed + s.phase)));
      if (s.r > 1.35) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = s.color.replace('ALPHA', '0.9');
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color.replace('ALPHA', alpha.toFixed(3));
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Drifting constellation dust + links
    for (let i = 0; i < this.dust.length; i++) {
      const p = this.dust[i];

      if (this.hasFinePointer) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          p.vx += (dx / dist) * 0.008;
          p.vy += (dy / dist) * 0.008;
        }
      }

      p.vx = Math.min(Math.max(p.vx, -0.7), 0.7);
      p.vy = Math.min(Math.max(p.vy, -0.7), 0.7);
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < this.dust.length; j++) {
        const p2 = this.dust[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const gradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
          gradient.addColorStop(0, p.color.replace(/0\.\d+\)/, '0.14)'));
          gradient.addColorStop(1, p2.color.replace(/0\.\d+\)/, '0.14)'));
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(0.1, (1 - dist / 120) * 0.6);
          ctx.stroke();
        }
      }
    }

    // Shooting stars
    if (this.frame % 110 === 0 && Math.random() < 0.75) {
      this.spawnShootingStar();
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const sh = this.shootingStars[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life++;
      const fade = 1 - sh.life / sh.maxLife;
      if (fade <= 0 || sh.x > canvas.width + 200 || sh.y > canvas.height + 200) {
        this.shootingStars.splice(i, 1);
        continue;
      }
      const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
      const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${(fade * 0.9).toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(191, 219, 254, ${(fade * 0.35).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(191, 219, 254, 0)');
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Honour reduced-motion: draw a single static starfield and stop.
    if (this.reducedMotion) return;
    this.sceneFrame = requestAnimationFrame(() => this.renderScene());
  }
}
