import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
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

  constructor() { }

  ngOnInit(): void {
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