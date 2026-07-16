import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InteractiveBackdropComponent } from '../../shared/interactive-backdrop/interactive-backdrop.component';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: Technology[];
  categories: string[];
}

interface Technology {
  name: string;
  color: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, InteractiveBackdropComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  private readonly isBrowser: boolean;

  /** Shown if a project screenshot is missing so cards never look broken. */
  readonly fallbackImage = 'assets/images/projects/placeholder.svg';

  categories: string[] = ['All', 'Web', 'Mobile', 'Backend', 'Web3'];
  selectedCategory = 'All';

  allProjects: Project[] = [
    {
      id: 1,
      title: 'Modern Portfolio Website',
      description:
        'A personal portfolio website developed with Angular and TailwindCSS. Features interactive animations, mouse effects, and responsive design. Implements Angular routing for seamless page transitions and optimized for all devices.',
      image: 'assets/images/projects/portfolio.png',
      technologies: [
        { name: 'Angular', color: 'red' },
        { name: 'TailwindCSS', color: 'blue' },
        { name: 'TypeScript', color: 'blue' },
        { name: 'GSAP', color: 'green' },
      ],
      categories: ['Web'],
    },
    {
      id: 2,
      title: 'ShopHub E-Commerce Platform',
      description:
        'A full-featured e-commerce solution with product catalog, user authentication, shopping cart functionality, and secure payment processing. Built with React and Node.js, utilizing MongoDB for data storage and Stripe for payment processing.',
      image: 'assets/images/projects/shophub.png',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Node.js', color: 'green' },
        { name: 'MongoDB', color: 'green' },
        { name: 'Stripe', color: 'purple' },
        { name: 'Redux', color: 'purple' },
      ],
      categories: ['Web', 'Backend'],
    },
    {
      id: 3,
      title: 'TaskFlow Management System',
      description:
        'An intuitive task management application featuring Kanban boards, calendar views, task priorities, and team collaboration tools. Includes real-time updates, mobile-responsive design, and integration with Google Calendar and Slack.',
      image: 'assets/images/projects/taskflow.png',
      technologies: [
        { name: 'Vue.js', color: 'green' },
        { name: 'Firebase', color: 'yellow' },
        { name: 'Vuetify', color: 'blue' },
        { name: 'Socket.io', color: 'gray' },
      ],
      categories: ['Web', 'Backend'],
    },
    {
      id: 4,
      title: 'BlockExplorer Analytics',
      description:
        'A comprehensive blockchain explorer providing data visualization, transaction history, block details, and wallet analytics. Features real-time updates, interactive charts using D3.js, and search capabilities across multiple blockchain networks.',
      image: 'assets/images/projects/blockexplorer.png',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Web3.js', color: 'purple' },
        { name: 'Ethereum', color: 'teal' },
        { name: 'D3.js', color: 'orange' },
        { name: 'GraphQL', color: 'pink' },
      ],
      categories: ['Web', 'Web3'],
    },
    {
      id: 5,
      title: 'FitTrack Health App',
      description:
        'A health and fitness tracking application that allows users to monitor workouts, nutrition, and progress over time. Features include customizable workout plans, nutrition tracking, progress charts, and integration with wearable devices.',
      image: 'assets/images/projects/fittrack.png',
      technologies: [
        { name: 'Flutter', color: 'blue' },
        { name: 'Firebase', color: 'yellow' },
        { name: 'Dart', color: 'teal' },
        { name: 'HealthKit', color: 'red' },
      ],
      categories: ['Mobile'],
    },
    {
      id: 6,
      title: 'NFT Marketplace',
      description:
        'A decentralized marketplace for creating, buying, and selling non-fungible tokens. Supports multiple blockchain networks, includes wallet integration, and offers advanced search and filtering capabilities.',
      image: 'assets/images/projects/nft-marketplace.png',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Solidity', color: 'purple' },
        { name: 'IPFS', color: 'teal' },
        { name: 'Ethers.js', color: 'orange' },
      ],
      categories: ['Web', 'Web3'],
    },
    {
      id: 7,
      title: 'Cloud Microservices API',
      description:
        'A scalable backend infrastructure built with microservices architecture. Features include API gateway, service discovery, load balancing, circuit breaking, and containerized deployment with Kubernetes.',
      image: 'assets/images/projects/microservices.png',
      technologies: [
        { name: 'Node.js', color: 'green' },
        { name: 'Docker', color: 'blue' },
        { name: 'Kubernetes', color: 'blue' },
        { name: 'Redis', color: 'red' },
        { name: 'PostgreSQL', color: 'blue' },
      ],
      categories: ['Backend'],
    },
  ];

  projects: Project[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private route: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.projects = [...this.allProjects];

    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category && this.categories.includes(category)) {
        this.filterProjects(category);
      }
    });
  }

  filterProjects(category: string): void {
    this.selectedCategory = category;
    this.projects =
      category === 'All'
        ? [...this.allProjects]
        : this.allProjects.filter((project) => project.categories.includes(category));
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategory === category;
  }

  /** Swap in the branded placeholder if a screenshot fails to load. */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith('placeholder.svg')) return;
    img.src = this.fallbackImage;
  }

  getTechBgClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500/20 text-red-300',
      blue: 'bg-blue-500/20 text-blue-300',
      green: 'bg-green-500/20 text-green-300',
      yellow: 'bg-yellow-500/20 text-yellow-300',
      purple: 'bg-purple-500/20 text-purple-300',
      teal: 'bg-teal-500/20 text-teal-300',
      orange: 'bg-orange-500/20 text-orange-300',
      gray: 'bg-gray-500/20 text-gray-300',
      pink: 'bg-pink-500/20 text-pink-300',
    };
    return colorMap[color] || 'bg-gray-500/20 text-gray-300';
  }
}
