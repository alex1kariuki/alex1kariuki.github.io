import { Component, OnInit } from '@angular/core';
import { Project } from '../../shared/models/project.model';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../shared/services/project/project.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  cards: Project[] = [];
/**
 *
 */
constructor(private projectService: ProjectService) {
  
}
  ngOnInit(): void {
    // this.fetchCards();
    this.fetchProjects();
  }

  // fetchCards(): void {
  //   this.cards = [
  //     { id: 1, title: 'Spotify Clone', link: 'http://', image: 'http://', type: 'big' },
  //     { id: 2, title: 'Project 2', link: 'http://', image: 'http://', type: 'big' },
  //     { id: 3, title: 'Project 3', link: 'http://', image: 'http://', type: 'big' },
  //     { id: 4, title: 'Project 4', link: 'http://', image: 'http://', type: 'big' },
  //     { id: 5, title: 'Project 5', link: 'http://', image: 'http://', type: 'big' },
  //     { id: 6, title: 'Project 6', link: 'http://', image: 'http://', type: 'big' },
  //   ];
  // }
  fetchProjects(): void {
    this.projectService.getProjects().subscribe((data: Project[]) => {
      this.cards = data;
    });
  }
  isEven(index: number): boolean {
    return index % 2 === 0;
  }
}
