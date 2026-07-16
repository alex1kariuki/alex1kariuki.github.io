import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InteractiveBackdropComponent } from '../../shared/interactive-backdrop/interactive-backdrop.component';

interface TechLogo {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule, InteractiveBackdropComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent {
  readonly categories = [
    { title: 'Web', description: 'Full-stack web development', category: 'Web' },
    { title: 'Mobile', description: 'Cross-platform mobile apps', category: 'Mobile' },
    { title: 'Web3', description: 'Blockchain & dApps', category: 'Web3' },
    { title: 'Backend', description: 'Scalable solutions', category: 'Backend' },
  ];

  // Rendered twice in the template for a seamless marquee loop.
  readonly techLogos: TechLogo[] = [
    { name: 'React', icon: 'react' },
    { name: 'Angular', icon: 'angular' },
    { name: 'Vue.js', icon: 'vue' },
    { name: 'TypeScript', icon: 'typescript' },
    { name: 'JavaScript', icon: 'javascript' },
    { name: 'Tailwind CSS', icon: 'tailwind' },
    { name: 'Flutter', icon: 'flutter' },
    { name: 'Kotlin', icon: 'kotlin' },
    { name: 'Swift', icon: 'swift' },
    { name: 'Node.js', icon: 'nodejs' },
    { name: 'Python', icon: 'python' },
    { name: 'Go', icon: 'go' },
    { name: 'PostgreSQL', icon: 'postgresql' },
    { name: 'Docker', icon: 'docker' },
    { name: 'Kubernetes', icon: 'kubernetes' },
    { name: 'Solidity', icon: 'solidity' },
  ];
}
