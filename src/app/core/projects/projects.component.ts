import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';
import { InteractiveBackdropComponent } from '../../shared/interactive-backdrop/interactive-backdrop.component';
import { PdfExportService } from '../../shared/pdf-export.service';

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

interface Category {
  value: string;
  label: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InteractiveBackdropComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  private readonly isBrowser: boolean;

  /** Shown if a project screenshot is missing so cards never look broken. */
  readonly fallbackImage = 'assets/images/projects/placeholder.svg';

  // Non-technical-friendly disciplines.
  readonly categories: Category[] = [
    { value: 'All', label: 'All' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'DevOps', label: 'DevOps / SRE' },
  ];
  selectedCategory = 'All';

  allProjects: Project[] = [
    {
      id: 1,
      title: 'Modern Portfolio Website',
      description:
        'A personal portfolio built with Angular and TailwindCSS featuring an interactive animated space backdrop, responsive layouts and seamless routing across every device.',
      image: 'assets/images/projects/portfolio.png',
      technologies: [
        { name: 'Angular', color: 'red' },
        { name: 'TailwindCSS', color: 'blue' },
        { name: 'TypeScript', color: 'blue' },
      ],
      categories: ['Frontend'],
    },
    {
      id: 2,
      title: 'ShopHub Storefront',
      description:
        'A fast, accessible e-commerce storefront with product browsing, cart, and checkout flows. Built with Next.js and React for server-rendered performance and great SEO.',
      image: 'assets/images/projects/shophub-web.png',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'Next.js', color: 'gray' },
        { name: 'TailwindCSS', color: 'blue' },
        { name: 'Redux', color: 'purple' },
      ],
      categories: ['Frontend'],
    },
    {
      id: 3,
      title: 'TaskFlow Dashboard',
      description:
        'An intuitive project-management dashboard with Kanban boards, calendar views and real-time collaboration. A clean, data-dense interface that stays simple to use.',
      image: 'assets/images/projects/taskflow.png',
      technologies: [
        { name: 'Vue.js', color: 'green' },
        { name: 'Vuetify', color: 'blue' },
        { name: 'TypeScript', color: 'blue' },
      ],
      categories: ['Frontend'],
    },
    {
      id: 4,
      title: 'FitTrack Mobile App',
      description:
        'A cross-platform health and fitness app to track workouts, nutrition and progress, with customizable plans and smooth, native-feeling animations.',
      image: 'assets/images/projects/fittrack.png',
      technologies: [
        { name: 'Flutter', color: 'blue' },
        { name: 'Dart', color: 'teal' },
        { name: 'Firebase', color: 'yellow' },
      ],
      categories: ['Frontend'],
    },
    {
      id: 5,
      title: 'Insights Analytics UI',
      description:
        'A rich analytics experience with interactive charts, drill-downs and live-updating dashboards, turning complex datasets into clear, actionable visuals.',
      image: 'assets/images/projects/analytics.png',
      technologies: [
        { name: 'React', color: 'blue' },
        { name: 'D3.js', color: 'orange' },
        { name: 'GraphQL', color: 'pink' },
      ],
      categories: ['Frontend'],
    },
    {
      id: 6,
      title: 'ShopHub Commerce API',
      description:
        'The backend powering the ShopHub store: product catalog, authentication, orders and secure Stripe payments, backed by PostgreSQL and a clean REST/GraphQL surface.',
      image: 'assets/images/projects/shophub-api.png',
      technologies: [
        { name: 'Node.js', color: 'green' },
        { name: 'PostgreSQL', color: 'blue' },
        { name: 'Stripe', color: 'purple' },
        { name: 'GraphQL', color: 'pink' },
      ],
      categories: ['Backend'],
    },
    {
      id: 7,
      title: 'Realtime Collaboration Service',
      description:
        'A low-latency realtime service powering live updates, presence and notifications across TaskFlow using WebSockets and Redis pub/sub for horizontal scale.',
      image: 'assets/images/projects/realtime.png',
      technologies: [
        { name: 'Node.js', color: 'green' },
        { name: 'Socket.io', color: 'gray' },
        { name: 'Redis', color: 'red' },
      ],
      categories: ['Backend'],
    },
    {
      id: 8,
      title: 'Auth & Identity Service',
      description:
        'A secure identity platform handling sign-in, OAuth, JWT sessions and role-based access control, written in Go for speed and reliability at scale.',
      image: 'assets/images/projects/auth.png',
      technologies: [
        { name: 'Go', color: 'teal' },
        { name: 'PostgreSQL', color: 'blue' },
        { name: 'JWT', color: 'orange' },
      ],
      categories: ['Backend'],
    },
    {
      id: 9,
      title: 'Payments Ledger Service',
      description:
        'An event-driven payments ledger processing high-volume transactions with strong consistency guarantees, built on Java and Kafka for durable, ordered event streams.',
      image: 'assets/images/projects/ledger.png',
      technologies: [
        { name: 'Java', color: 'red' },
        { name: 'Kafka', color: 'gray' },
        { name: 'PostgreSQL', color: 'blue' },
      ],
      categories: ['Backend'],
    },
    {
      id: 10,
      title: 'Kubernetes Delivery Platform',
      description:
        'A production-grade Kubernetes platform with Helm charts, GitOps delivery via ArgoCD, and progressive rollouts, giving teams safe, self-service deployments.',
      image: 'assets/images/projects/k8s.png',
      technologies: [
        { name: 'Kubernetes', color: 'blue' },
        { name: 'Helm', color: 'blue' },
        { name: 'ArgoCD', color: 'orange' },
        { name: 'Docker', color: 'blue' },
      ],
      categories: ['DevOps'],
    },
    {
      id: 11,
      title: 'CI/CD & Infrastructure as Code',
      description:
        'Fully automated pipelines and reproducible cloud infrastructure defined in Terraform, deploying to AWS on every commit with built-in tests and approvals.',
      image: 'assets/images/projects/cicd.png',
      technologies: [
        { name: 'Terraform', color: 'purple' },
        { name: 'GitHub Actions', color: 'gray' },
        { name: 'AWS', color: 'orange' },
      ],
      categories: ['DevOps'],
    },
    {
      id: 12,
      title: 'Observability Stack',
      description:
        'End-to-end monitoring with metrics, logs and traces via Prometheus, Grafana and OpenTelemetry, plus SLO-based alerting that keeps services healthy and on-call calm.',
      image: 'assets/images/projects/observability.png',
      technologies: [
        { name: 'Prometheus', color: 'orange' },
        { name: 'Grafana', color: 'orange' },
        { name: 'OpenTelemetry', color: 'purple' },
      ],
      categories: ['DevOps'],
    },
  ];

  projects: Project[] = [];

  // PDF-to-email state
  pdfEmail = '';
  pdfSending = false;
  pdfStatus = '';
  pdfError = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private route: ActivatedRoute,
    private pdfService: PdfExportService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.projects = [...this.allProjects];

    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category && this.categories.some((c) => c.value === category)) {
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

  get selectedCategoryLabel(): string {
    return this.categories.find((c) => c.value === this.selectedCategory)?.label ?? 'All';
  }

  get pdfButtonLabel(): string {
    return this.selectedCategory === 'All'
      ? 'Email me all projects (PDF)'
      : `Email me the ${this.selectedCategoryLabel} PDF`;
  }

  /** EmailJS attachment delivery only works once a real PDF template is set. */
  get isPdfEmailConfigured(): boolean {
    const e = environment.emailjs;
    return (
      !!e.serviceId && !e.serviceId.startsWith('YOUR_') &&
      !!e.pdfTemplateId && !e.pdfTemplateId.startsWith('YOUR_')
    );
  }

  /** Build a PDF of the current category and email it to the visitor. */
  async emailPdf(): Promise<void> {
    if (!this.isBrowser || this.pdfSending) return;

    const email = this.pdfEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.pdfError = true;
      this.pdfStatus = 'Please enter a valid email address.';
      return;
    }

    this.pdfSending = true;
    this.pdfError = false;
    this.pdfStatus = 'Preparing your PDF…';

    const label = this.selectedCategoryLabel;
    const slug = this.selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `alex-kariuki-${slug}-projects.pdf`;

    try {
      const doc = await this.pdfService.build(
        label,
        this.projects.map((p) => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies,
          categories: p.categories,
        }))
      );

      if (this.isPdfEmailConfigured) {
        const content = this.pdfService.toBase64(doc);
        await emailjs.send(
          environment.emailjs.serviceId,
          environment.emailjs.pdfTemplateId,
          {
            to_email: email,
            to_name: email.split('@')[0],
            category: label,
            from_name: 'Alex Kariuki',
            filename,
            content,
            message: `Here are Alex Kariuki's ${label} projects, attached as a PDF.`,
          },
          { publicKey: environment.emailjs.publicKey }
        );
        this.pdfStatus = `Sent! Check ${email} for the ${label} projects PDF.`;
        this.pdfEmail = '';
      } else {
        // Graceful fallback until the EmailJS PDF template is configured.
        this.pdfService.download(doc, filename);
        this.pdfStatus =
          'Email delivery isn’t set up yet, so the PDF was downloaded for you instead.';
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      this.pdfError = true;
      this.pdfStatus = 'Sorry — something went wrong creating or sending the PDF. Please try again.';
    } finally {
      this.pdfSending = false;
    }
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
