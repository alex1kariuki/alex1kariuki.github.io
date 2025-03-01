import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, PLATFORM_ID, Inject, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface ChatMessage {
  text: string;
  isAI: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('trail') trail!: ElementRef;
  @ViewChild('glow') glow!: ElementRef;
  @ViewChild('secondaryGlow') secondaryGlow!: ElementRef;
  @ViewChild('coreGlow') coreGlow!: ElementRef;
  @ViewChild('particlesContainer') particlesContainer!: ElementRef;
  
  private animationFrame: number | null = null;
  private particlesAnimationFrame: number | null = null;
  private mousePosition = { x: 0, y: 0 };
  private trailPosition = { x: 0, y: 0 };
  private isBrowser: boolean;
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Chat related properties
  isChatOpen = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  isTyping = false;

  categories = [{ title: '', image: '' }];

  private tawkTo: any;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private renderer: Renderer2) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.categories = [
      { title: 'Web', image: 'http://' },
      { title: 'Mobile', image: 'http://' },
      { title: 'Backend', image: 'http://' },
      { title: 'Data', image: 'http://' },
    ];

    // Initialize with welcome message
    this.messages = [{
      text: "Hi! I'm Alex's AI assistant. How can I help you today?",
      isAI: true,
      timestamp: new Date()
    }];

    this.loadTawkTo();
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

    // Get viewport height for calculations
    const vh = window.innerHeight;

    // Update layered glow positions with different offsets for depth effect
    if (this.glow?.nativeElement) {
      const glowSize = vh * 0.3; // 30vh
      const glowX = e.clientX - (glowSize / 2);
      const glowY = e.clientY - (glowSize / 2);
      this.glow.nativeElement.style.transform = `translate(${glowX}px, ${glowY}px)`;
    }

    if (this.secondaryGlow?.nativeElement) {
      const secondarySize = vh * 0.25; // 25vh
      const secondaryX = e.clientX - (secondarySize / 2);
      const secondaryY = e.clientY - (secondarySize / 2);
      this.secondaryGlow.nativeElement.style.transform = `translate(${secondaryX}px, ${secondaryY}px)`;
    }

    if (this.coreGlow?.nativeElement) {
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
        // Calculate trail position with smooth following
        this.trailPosition.x += (this.mousePosition.x - this.trailPosition.x - 24) * 0.1; // 24 is half of trail width
        this.trailPosition.y += (this.mousePosition.y - this.trailPosition.y - 24) * 0.1; // 24 is half of trail height
        
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

    // More transparent trail
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position with gentler mouse attraction
      const dx = this.mousePosition.x - p.x;
      const dy = this.mousePosition.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) { // Reduced interaction range
        p.vx += (dx / distance) * 0.01;
        p.vy += (dy / distance) * 0.01;
      }
      
      // Lower velocity limits
      p.vx = Math.min(Math.max(p.vx, -0.8), 0.8);
      p.vy = Math.min(Math.max(p.vy, -0.8), 0.8);
      
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Subtle particle glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Draw connections with subtle gradients
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) { // Shorter connection range
          const gradient = this.ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
          gradient.addColorStop(0, p.color.replace('0.4', '0.15')); // More transparent connections
          gradient.addColorStop(1, p2.color.replace('0.4', '0.15'));
          
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = Math.max(0.1, (1 - distance / 100) * 0.5); // Thinner lines
          this.ctx.stroke();
        }
      }
    }

    this.particlesAnimationFrame = requestAnimationFrame(this.animateParticles.bind(this));
  }

  // Chat related methods
  toggleChat(): void {
    if (this.isBrowser) {
      this.isChatOpen = !this.isChatOpen;
      const chatGroup = document.querySelector('.chat-group');
      if (chatGroup) {
        chatGroup.classList.toggle('active');
      }
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.messages.push({
      text: this.currentMessage,
      isAI: false,
      timestamp: new Date()
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      this.messages.push({
        text: `I received your message: "${userMessage}". This is a placeholder response.`,
        isAI: true,
        timestamp: new Date()
      });
      this.isTyping = false;
    }, 1000);
  }

  private loadTawkTo() {
    // Create Tawk.to script
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      var Tawk_API = Tawk_API || {};
      var Tawk_LoadStart = new Date();
      (function(){
        var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/YOUR_TAWK_TO_SITE_ID/default';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    
    // Append script to body
    this.renderer.appendChild(document.body, script);

    // Store Tawk_API reference
    window.addEventListener('tawkReady', () => {
      this.tawkTo = (window as any).Tawk_API;
      // Hide the widget by default
      this.tawkTo.hideWidget();
    });
  }

  openTawkChat() {
    if (this.tawkTo) {
      this.tawkTo.maximize();
    }
  }
}
