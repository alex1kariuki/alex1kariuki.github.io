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
import { ThemeService, Weather, Orbiter } from '../theme.service';

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
  // This subtree is driven imperatively (canvas) and its orbiter differs
  // between the prerendered default theme and the client-resolved theme, so
  // skip hydration and let it render fresh on the client.
  host: { ngSkipHydration: 'true' },
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
  @ViewChild('ship') ship!: ElementRef<HTMLElement>;

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

  // Occasional orbiting spacecraft
  private shipTimer: ReturnType<typeof setTimeout> | null = null;
  private shipActive = false;
  private shipStart = 0;
  private shipDuration = 0;
  private shipScale = 1;
  private shipPath = { x0: 0, y0: 0, cx: 0, cy: 0, x1: 0, y1: 0 };

  // Weather overlay
  private weatherKind: Weather | null = null;
  private rainDrops: { x: number; y: number; len: number; speed: number; alpha: number }[] = [];
  private snowFlakes: { x: number; y: number; r: number; speed: number; drift: number; phase: number }[] = [];
  private clouds: { x: number; y: number; r: number; speed: number; alpha: number }[] = [];
  private flash = 0;

  private readonly onMoveBound = (e: MouseEvent) => this.onMouseMove(e);
  private readonly onOverBound = (e: MouseEvent) => this.onPointerTarget(e, true);
  private readonly onOutBound = (e: MouseEvent) => this.onPointerTarget(e, false);
  private readonly onResizeBound = () => this.resizeCanvas();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private theme: ThemeService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Which orbiting body to show (fixed at load by the active theme). */
  get orbiter(): Orbiter {
    return this.theme.state().orbiter;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const mm = typeof window.matchMedia === 'function';
    this.hasFinePointer = mm && window.matchMedia('(pointer: fine)').matches;
    this.reducedMotion = mm && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initScene();
    window.addEventListener('resize', this.onResizeBound);

    if (!this.reducedMotion) {
      this.scheduleShip(true);
    } else {
      this.ship?.nativeElement.remove();
    }

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
    if (this.shipTimer) clearTimeout(this.shipTimer);
  }

  // ---- Occasional orbiting spacecraft -------------------------------------

  /** Queue the next fly-by after a long, randomised gap so it stays a treat. */
  private scheduleShip(initial = false): void {
    if (this.shipTimer) clearTimeout(this.shipTimer);
    // First appearance 6–16s in; afterwards a sparse 30–80s between fly-bys.
    const delay = initial ? 6000 + Math.random() * 10000 : 30000 + Math.random() * 50000;
    this.shipTimer = setTimeout(() => this.launchShip(), delay);
  }

  /** Set up one fly-by with a fresh random arc, direction, size and speed. */
  private launchShip(): void {
    if (!this.ship?.nativeElement) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const margin = 160;
    const dir = Math.random() < 0.5 ? 1 : -1; // left→right or right→left
    const y0 = h * (0.08 + Math.random() * 0.72);
    const y1 = h * (0.08 + Math.random() * 0.72);
    const x0 = dir === 1 ? -margin : w + margin;
    const x1 = dir === 1 ? w + margin : -margin;
    // A curved control point gives the path an orbital sweep.
    const cx = (x0 + x1) / 2 + (Math.random() * 2 - 1) * w * 0.12;
    const cy = (y0 + y1) / 2 + (Math.random() * 2 - 1) * h * 0.45;

    this.shipPath = { x0, y0, cx, cy, x1, y1 };
    this.shipDuration = 7000 + Math.random() * 8000; // 7–15s to cross
    this.shipScale = 0.55 + Math.random() * 0.75;
    this.shipStart = performance.now();
    this.shipActive = true;
  }

  /** Advance the current fly-by; called once per scene frame while active. */
  private updateShip(): void {
    const el = this.ship?.nativeElement;
    if (!el) return;

    const t = (performance.now() - this.shipStart) / this.shipDuration;
    if (t >= 1) {
      this.shipActive = false;
      el.style.opacity = '0';
      this.scheduleShip();
      return;
    }

    const p = this.shipPath;
    const mt = 1 - t;
    const x = mt * mt * p.x0 + 2 * mt * t * p.cx + t * t * p.x1;
    const y = mt * mt * p.y0 + 2 * mt * t * p.cy + t * t * p.y1;
    const dx = 2 * mt * (p.cx - p.x0) + 2 * t * (p.x1 - p.cx);
    const dy = 2 * mt * (p.cy - p.y0) + 2 * t * (p.y1 - p.cy);
    const angle = Math.atan2(dy, dx);

    // Fade in/out at the edges of the journey.
    const opacity = t < 0.12 ? t / 0.12 : t > 0.88 ? (1 - t) / 0.12 : 1;
    el.style.opacity = String(Math.max(0, Math.min(1, opacity)) * 0.9);
    el.style.transform =
      `translate(${x - 32}px, ${y - 20}px) rotate(${angle}rad) scale(${this.shipScale})`;
  }

  // ---- Weather overlay ----------------------------------------------------

  private ensureWeather(kind: Weather | null): void {
    if (kind === this.weatherKind) return;
    this.weatherKind = kind;
    this.rainDrops = [];
    this.snowFlakes = [];
    this.clouds = [];
    if (!this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const area = w * h;

    if (kind === 'rain' || kind === 'thunder') {
      const n = Math.min(420, Math.floor(area / 5500));
      for (let i = 0; i < n; i++) {
        this.rainDrops.push({
          x: Math.random() * w,
          y: Math.random() * h,
          len: 8 + Math.random() * 16,
          speed: 7 + Math.random() * 7,
          alpha: 0.12 + Math.random() * 0.28,
        });
      }
    } else if (kind === 'snow') {
      const n = Math.min(260, Math.floor(area / 9000));
      for (let i = 0; i < n; i++) {
        this.snowFlakes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 2.2,
          speed: 0.4 + Math.random() * 1.2,
          drift: Math.random() * 0.6 - 0.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    } else if (kind === 'clouds') {
      for (let i = 0; i < 5; i++) {
        this.clouds.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.6,
          r: 140 + Math.random() * 180,
          speed: 0.15 + Math.random() * 0.35,
          alpha: 0.05 + Math.random() * 0.06,
        });
      }
    }
  }

  private renderWeather(kind: Weather | null): void {
    this.ensureWeather(kind);
    if (!this.ctx || !this.canvas || !kind || kind === 'clear') return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (kind === 'clouds') {
      for (const c of this.clouds) {
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, `rgba(200,210,235,${c.alpha})`);
        g.addColorStop(1, 'rgba(200,210,235,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        c.x += c.speed;
        if (c.x - c.r > w) c.x = -c.r;
      }
      return;
    }

    if (kind === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const f of this.snowFlakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed;
        f.x += Math.sin(this.frame * 0.02 + f.phase) * f.drift + f.drift * 0.5;
        if (f.y > h) {
          f.y = -4;
          f.x = Math.random() * w;
        }
      }
      return;
    }

    // rain / thunder
    ctx.strokeStyle = 'rgba(180,205,240,0.5)';
    ctx.lineWidth = 1;
    for (const d of this.rainDrops) {
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      d.x -= 0.6;
      if (d.y > h) {
        d.y = -d.len;
        d.x = Math.random() * w;
      }
    }
    ctx.globalAlpha = 1;

    if (kind === 'thunder') {
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(226,232,255,${(this.flash * 0.22).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
        this.flash -= 0.08;
      } else if (this.frame % 200 === 0 && Math.random() < 0.6) {
        this.flash = 1;
      }
    }
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

    this.renderWeather(this.theme.state().weather);
    if (this.shipActive) this.updateShip();

    // Honour reduced-motion: draw a single static starfield and stop.
    if (this.reducedMotion) return;
    this.sceneFrame = requestAnimationFrame(() => this.renderScene());
  }
}
