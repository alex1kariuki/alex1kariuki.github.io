import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, PLATFORM_ID, Inject, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: Technology[];
}

interface Technology {
  name: string;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('trail') trail!: ElementRef;
  @ViewChild('glow') glow!: ElementRef;
  @ViewChild('secondaryGlow') secondaryGlow!: ElementRef;
  @ViewChild('coreGlow') coreGlow!: ElementRef;
  @ViewChild('particlesContainer') particlesContainer!: ElementRef;
  
  isLoaded = false;
  private animationFrame: number | null = null;
  private particlesAnimationFrame: number | null = null;
  private mousePosition = { x: 0, y: 0 };
  private trailPosition = { x: 0, y: 0 };
  private isBrowser: boolean;
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;

  projects: Project[] = [
    {
      id: 1,
      title: 'Portfolio Website',
      description: 'A personal portfolio website showcasing my skills, projects, and experience. Built with Angular and TailwindCSS, featuring responsive design and dynamic content.',
      image: 'https://via.placeholder.com/600x400?text=Portfolio+Website',
      technologies: [
        { name: 'Angular', color: 'red' },
        { name: 'TailwindCSS', color: 'blue' },
        { name: 'TypeScript', color: 'blue' }
      ]
    },
    {
      id: 2,
      title: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform with product catalog, shopping cart, user authentication, and payment processing. Integrated with Stripe for secure payments.',
      image: 'https://via.placeholder.com/600x400?text=E-Commerce+Platform',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Node.js', color: 'green' },
        { name: 'MongoDB', color: 'green' },
        { name: 'Stripe', color: 'purple' }
      ]
    },
    {
      id: 3,
      title: 'Task Management App',
      description: 'A productivity application for task management with features like Kanban boards, calendar view, task priorities, and team collaboration tools.',
      image: 'https://via.placeholder.com/600x400?text=Task+Management+App',
      technologies: [
        { name: 'Vue.js', color: 'green' },
        { name: 'Firebase', color: 'yellow' },
        { name: 'Vuetify', color: 'blue' }
      ]
    },
    {
      id: 4,
      title: 'Blockchain Explorer',
      description: 'A web application for exploring blockchain data, viewing transactions, blocks, and wallet details. Includes visualizations and search functionality.',
      image: 'https://via.placeholder.com/600x400?text=Blockchain+Explorer',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Web3.js', color: 'purple' },
        { name: 'Ethereum', color: 'teal' },
        { name: 'D3.js', color: 'orange' }
      ]
    }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private renderer: Renderer2) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Simulate loading time
    if (this.isBrowser) {
      setTimeout(() => {
        this.isLoaded = true;
      }, 1500);
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.addEventListeners();
      this.animateCursor();
      this.initParticles();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.removeEventListeners();
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      if (this.particlesAnimationFrame) {
        cancelAnimationFrame(this.particlesAnimationFrame);
      }
    }
  }

  private addEventListeners() {
    if (!this.isBrowser) return;
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private removeEventListeners() {
    if (!this.isBrowser) return;
    
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isBrowser) return;

    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;

    // Update glow positions
    if (this.glow?.nativeElement) {
      const vh = window.innerHeight;
      const glowSize = vh * 0.3; // 30vh
      const glowX = e.clientX - (glowSize / 2);
      const glowY = e.clientY - (glowSize / 2);
      this.glow.nativeElement.style.transform = `translate(${glowX}px, ${glowY}px)`;
    }

    if (this.secondaryGlow?.nativeElement) {
      const vh = window.innerHeight;
      const secondarySize = vh * 0.25; // 25vh
      const secondaryX = e.clientX - (secondarySize / 2);
      const secondaryY = e.clientY - (secondarySize / 2);
      this.secondaryGlow.nativeElement.style.transform = `translate(${secondaryX}px, ${secondaryY}px)`;
    }

    if (this.coreGlow?.nativeElement) {
      const vh = window.innerHeight;
      const coreSize = vh * 0.2; // 20vh
      const coreX = e.clientX - (coreSize / 2);
      const coreY = e.clientY - (coreSize / 2);
      this.coreGlow.nativeElement.style.transform = `translate(${coreX}px, ${coreY}px)`;
    }
  }

  private animateCursor() {
    if (!this.isBrowser) return;

    const animate = () => {
      // Smooth cursor movement
      if (this.cursor?.nativeElement) {
        const cursorX = this.mousePosition.x - 10; // Half of cursor width
        const cursorY = this.mousePosition.y - 10; // Half of cursor height
        this.cursor.nativeElement.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      }

      // Smooth trail movement with lag
      if (this.trail?.nativeElement) {
        this.trailPosition.x += (this.mousePosition.x - this.trailPosition.x - 24) * 0.1;
        this.trailPosition.y += (this.mousePosition.y - this.trailPosition.y - 24) * 0.1;
        
        this.trail.nativeElement.style.transform = `translate(${this.trailPosition.x}px, ${this.trailPosition.y}px)`;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  private onMouseEnter() {
    if (!this.isBrowser) return;

    if (this.cursor?.nativeElement) {
      this.cursor.nativeElement.style.opacity = '1';
    }
    if (this.trail?.nativeElement) {
      this.trail.nativeElement.style.opacity = '1';
    }
  }

  private onMouseLeave() {
    if (!this.isBrowser) return;

    if (this.cursor?.nativeElement) {
      this.cursor.nativeElement.style.opacity = '0';
    }
    if (this.trail?.nativeElement) {
      this.trail.nativeElement.style.opacity = '0';
    }
  }

  @HostListener('window:mouseover', ['$event'])
  onMouseOver(e: MouseEvent) {
    if (!this.isBrowser) return;

    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.transform = `translate(${this.mousePosition.x - 12}px, ${this.mousePosition.y - 12}px) scale(1.5)`;
      }
      if (this.trail?.nativeElement) {
        this.trail.nativeElement.firstElementChild?.classList.add('scale-150');
      }
    }
  }

  @HostListener('window:mouseout', ['$event'])
  onMouseOut(e: MouseEvent) {
    if (!this.isBrowser) return;

    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.transform = `translate(${this.mousePosition.x - 6}px, ${this.mousePosition.y - 6}px) scale(1)`;
      }
      if (this.trail?.nativeElement) {
        this.trail.nativeElement.firstElementChild?.classList.remove('scale-150');
      }
    }
  }

  private initParticles() {
    if (!this.isBrowser || !this.particlesContainer) return;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.particlesContainer.nativeElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    // Create particles
    this.createParticles();
    this.animateParticles();
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const container = this.particlesContainer.nativeElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  private createParticles() {
    if (!this.canvas) return;
    
    // Fewer particles for subtlety
    const numParticles = Math.floor((this.canvas.width * this.canvas.height) / 25000);
    this.particles = [];

    for (let i = 0; i < numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2, // Slower movement
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5, // Smaller particles
        color: this.getRandomColor()
      });
    }
  }

  private getRandomColor(): string {
    const colors = [
      'rgba(56, 189, 248, 0.4)',  // Blue
      'rgba(139, 92, 246, 0.4)',  // Purple
      'rgba(45, 212, 191, 0.4)',  // Teal
      'rgba(255, 255, 255, 0.3)'  // White
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private animateParticles() {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas with a transparent black
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position with mouse attraction
      const dx = this.mousePosition.x - p.x;
      const dy = this.mousePosition.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        p.vx += (dx / distance) * 0.01;
        p.vy += (dy / distance) * 0.01;
      }
      
      // Limit velocity
      p.vx = Math.min(Math.max(p.vx, -0.8), 0.8);
      p.vy = Math.min(Math.max(p.vy, -0.8), 0.8);
      
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle with glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Draw connections
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

    this.particlesAnimationFrame = requestAnimationFrame(this.animateParticles.bind(this));
  }

  // Helper method to get the appropriate background color class based on technology color
  getTechBgClass(color: string): string {
    const colorMap: {[key: string]: string} = {
      'red': 'bg-red-500/20 text-red-300',
      'blue': 'bg-blue-500/20 text-blue-300',
      'green': 'bg-green-500/20 text-green-300',
      'yellow': 'bg-yellow-500/20 text-yellow-300',
      'purple': 'bg-purple-500/20 text-purple-300',
      'teal': 'bg-teal-500/20 text-teal-300',
      'orange': 'bg-orange-500/20 text-orange-300',
      'gray': 'bg-gray-500/20 text-gray-300'
    };
    
    return colorMap[color] || 'bg-gray-500/20 text-gray-300';
  }
} 