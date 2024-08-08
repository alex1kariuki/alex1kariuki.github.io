import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  cards: Project[] = [];
  interval: any;
  draggingIndex: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.fetchCards();
  }

  // ngOnDestroy(): void {
  //   clearInterval(this.interval);
  // }

  fetchCards(): void {
    this.cards = [
      { id: 1, title: 'Spotify Clone', link: 'http://', image: 'http://', type: 'big' },
      { id: 2, title: 'Project 2', link: 'http://', image: 'http://', type: 'big' },
      { id: 3, title: 'Project 3', link: 'http://', image: 'http://', type: 'big' },
      { id: 4, title: 'Project 4', link: 'http://', image: 'http://', type: 'big' },
      { id: 5, title: 'Project 5', link: 'http://', image: 'http://', type: 'big' },
      { id: 6, title: 'Project 6', link: 'http://', image: 'http://', type: 'big' },
    ];
  }

  onDragStart(event: DragEvent, index: number): void {
    this.draggingIndex = index;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(index));
  }

  onDragEnd(event: DragEvent): void {
    this.draggingIndex = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const index = event.dataTransfer!.getData('text/plain');
    const cardIndex = parseInt(index, 10);

    if (this.draggingIndex !== null) {
      const card = this.cards.splice(this.draggingIndex, 1)[0];
      this.cards.unshift(card);
      this.draggingIndex = null;
    }
  }

  onDrag(event: DragEvent): void {
    if (this.draggingIndex !== null && event.clientX > 0) {
      const element = event.target as HTMLElement;
      element.style.transform = `translateX(${event.clientX - 150}px)`;
    }
  }
  onProjectClick(projectTitle: string): void {
    this.router.navigate([projectTitle]);
  }
}
