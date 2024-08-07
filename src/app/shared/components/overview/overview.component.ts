import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';

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

  constructor() {}

  ngOnInit(): void {
    this.fetchCards();
  }
  // ngAfterViewInit(): void {
  //   this.startShuffling();
  // }
  // ngOnDestroy(): void {
  //   clearInterval(this.interval);
  // }

  fetchCards(): void {
    this.cards = [
      { title: 'Spotify Clone', link: 'http://', image: 'http://' },
      { title: 'Project 2', link: 'http://', image: 'http://' },
      { title: 'Project 3', link: 'http://', image: 'http://' },
      { title: 'Project 4', link: 'http://', image: 'http://' },
      { title: 'Project 5', link: 'http://', image: 'http://' },
      { title: 'Project 6', link: 'http://', image: 'http://' },
    ];
  }
  // startShuffling(): void {
  //   this.interval = setInterval(() => {
  //     if (this.cards.length > 1) {
  //       const lastCard = this.cards.pop();
  //       if (lastCard) {
  //         this.cards.unshift(lastCard);
  //       }
  //     }
  //   }, 2000);
  // }

  // onDragStart(event: DragEvent, card: Project): void {
  //   event.dataTransfer?.setData('text/plain', JSON.stringify(card));
  // }

  // onDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   const data = event.dataTransfer?.getData('text/plain');
  //   if (data) {
  //     const card = JSON.parse(data);
  //     const cardIndex = this.cards.findIndex((c) => c.title === card.title);
  //     if (cardIndex > -1) {
  //       this.cards.splice(cardIndex, 1);
  //       this.cards.unshift(card);
  //     }
  //   }
  // }

  // onDragOver(event: DragEvent): void {
  //   event.preventDefault();
  // }
}
