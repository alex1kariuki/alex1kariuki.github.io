import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Categories } from '../../shared/models/category.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OverviewComponent } from "../../shared/components/overview/overview.component";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, OverviewComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('trail') trail!: ElementRef;
  @ViewChild('glow') glow!: ElementRef;
  @ViewChild('secondaryGlow') secondaryGlow!: ElementRef;
  @ViewChild('coreGlow') coreGlow!: ElementRef;
  
  private animationFrame: number | null = null;
  private mousePosition = { x: 0, y: 0 };
  private trailPosition = { x: 0, y: 0 };
  private isBrowser: boolean;

  categories: Categories[] = [{ title: '', image: '' }];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.categories = [
      { title: 'Web', image: 'http://' },
      { title: 'Mobile', image: 'http://' },
      { title: 'Backend', image: 'http://' },
      { title: 'Data', image: 'http://' },
    ];
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.addEventListeners();
      this.animateCursor();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.removeEventListeners();
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
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
      const glowSize = vh * 0.95; // 95vh
      const glowX = e.clientX - (glowSize / 2);
      const glowY = e.clientY - (glowSize / 2);
      this.glow.nativeElement.style.transform = `translate(${glowX}px, ${glowY}px)`;
    }

    if (this.secondaryGlow?.nativeElement) {
      const secondarySize = vh * 0.75; // 75vh
      const secondaryX = e.clientX - (secondarySize / 2);
      const secondaryY = e.clientY - (secondarySize / 2);
      this.secondaryGlow.nativeElement.style.transform = `translate(${secondaryX}px, ${secondaryY}px)`;
    }

    if (this.coreGlow?.nativeElement) {
      const coreSize = vh * 0.5; // 50vh
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
}
