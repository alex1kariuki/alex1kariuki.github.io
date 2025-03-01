import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Categories } from '../../shared/models/category.model';
import { CommonModule } from '@angular/common';
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
  private animationFrame: number | null = null;

  categories: Categories[] = [{ title: '', image: '' }];

  constructor() {}

  ngOnInit(): void {
    this.categories = [
      { title: 'Web', image: 'http://' },
      { title: 'Mobile', image: 'http://' },
      { title: 'Backend', image: 'http://' },
      { title: 'Data', image: 'http://' },
    ];
  }

  ngAfterViewInit() {
    this.addEventListeners();
  }

  ngOnDestroy() {
    this.removeEventListeners();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private addEventListeners() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private removeEventListeners() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private onMouseMove(e: MouseEvent) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.left = `${clientX}px`;
        this.cursor.nativeElement.style.top = `${clientY}px`;
      }
    });
  }

  private onMouseEnter() {
    if (this.cursor?.nativeElement) {
      this.cursor.nativeElement.style.opacity = '1';
    }
  }

  private onMouseLeave() {
    if (this.cursor?.nativeElement) {
      this.cursor.nativeElement.style.opacity = '0';
    }
  }

  @HostListener('window:mouseover', ['$event'])
  onMouseOver(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.transform = 'translate(-50%, -50%) scale(1.5)';
        this.cursor.nativeElement.style.mixBlendMode = 'difference';
      }
    }
  }

  @HostListener('window:mouseout', ['$event'])
  onMouseOut(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
      if (this.cursor?.nativeElement) {
        this.cursor.nativeElement.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursor.nativeElement.style.mixBlendMode = 'difference';
      }
    }
  }
}
