# Alex Kariuki - Portfolio Website

A modern, responsive portfolio website built with Angular and Tailwind CSS, showcasing my professional experience, projects, and skills.

![Portfolio Home Page](screenshots/homepage.png)
<!-- Add your screenshot here -->

## 🌟 Features

- **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop
- **Interactive UI**: Modern animations and interactive elements
- **Project Showcase**: Filterable portfolio of projects with detailed information
- **Category Filtering**: Filter projects by Frontend, Backend, and DevOps / SRE
- **Contact Form**: Integrated email contact form using EmailJS
- **PDF Export by Email**: Visitors can have a PDF of any project category generated in-browser and emailed to them
- **Animated Space Backdrop**: A starfield, nebula and the occasional passing spacecraft
- **Blog Integration**: Direct links to Medium blog articles

## 🛠️ Technologies Used

- **Frontend**: Angular 18, Tailwind CSS
- **Animations**: Custom CSS animations and transitions
- **Deployment**: GitHub Pages
- **Contact**: EmailJS for form submissions
- **State Management**: Angular's built-in services and RxJS

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Angular CLI 18+

## 🚀 Getting Started

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/alex1kariuki/alex1kariuki.github.io.git

# Navigate to the project directory
cd alex1kariuki.github.io

# Install dependencies
npm install
```

### Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

### Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/alex1kariuki.github.io` directory.

## 📂 Project Structure

```
src/
├── app/
│   ├── core/           # Core components
│   │   ├── index/      # Home page component
│   │   ├── projects/   # Projects page component
│   │   └── contact/    # Contact page component
│   ├── shared/         # Shared components, directives, and pipes
│   ├── app.component.* # Root component
│   ├── app.routes.ts   # Application routes
│   └── app.config.ts   # App configuration
├── assets/             # Static assets (images, icons, etc.)
└── index.html          # Main HTML file
```

## 🖼️ Screenshots

### Home Page
![Home Page](screenshots/home.png)
<!-- Add your screenshot here -->

### Projects Page
![Projects Page](screenshots/projects.png)
<!-- Add your screenshot here -->

### Contact Page
![Contact Page](screenshots/contact.png)
<!-- Add your screenshot here -->

## 📱 Responsive Design

The portfolio is fully responsive and works across devices:

### Mobile View
![Mobile View](screenshots/mobile.png)
<!-- Add your screenshot here -->

### Tablet View
![Tablet View](screenshots/tablet.png)
<!-- Add your screenshot here -->

## 🖼️ Adding Project Screenshots

Project cards look for images in `public/assets/images/projects/` (e.g. `portfolio.png`, `shophub.png`, `taskflow.png`, …). Until a real screenshot is added, each card automatically falls back to a branded placeholder (`placeholder.svg`), so nothing ever renders broken. Drop in a PNG/JPG with the matching filename referenced in [projects.component.ts](src/app/core/projects/projects.component.ts) to replace it.

## ⚙️ Configuration

The contact form is configured using EmailJS. To set up your own email service:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service and template
3. Add your **Service ID**, **Template ID** and **Public Key** to [src/environments/environment.ts](src/environments/environment.ts)

Until real IDs are provided, the form detects the placeholder values and shows a friendly message pointing visitors to the direct email address instead of failing silently.

## 🌐 Deployment

This site deploys to **GitHub Pages as a fully static, prerendered site** via GitHub Actions — no server is required.

### One-time setup

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. After the first successful run you can delete the legacy `gh-pages` branch — it is no longer used.

### How it works

- The workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push to `master`.
- It runs `npm ci && npm run build`, which **prerenders** every route to static HTML in `dist/alex1kariuki.github.io/browser`.
- It adds a `404.html` (SPA fallback for deep links) and a `.nojekyll` file, then publishes the `browser` folder to Pages.

To build locally:

```bash
npm run build
# Static output: dist/alex1kariuki.github.io/browser
```

> **Note:** The project also contains an Angular SSR server entry (`server.ts`), used only at build time to prerender pages. GitHub Pages serves the static `browser/` output only — the Node server is never deployed.

## 🎨 Living theme system

The animated backdrop re-themes itself automatically — no redeploy needed — via [`theme.service.ts`](src/app/shared/theme.service.ts). It resolves entirely on the client, so each visitor sees the theme for **their** date, local clock and weather.

**How the active theme is chosen:**

1. **Intergalactic (default)** — the always-on theme: starfield, nebula, orbiting 🚀.
2. **Time of day** (from the visitor's clock) tints the sky: dawn, day, **golden sunset**, or night.
3. **Live weather** at the visitor's approximate location adds effects: rain, snow, drifting clouds, or a thunder flash.

The **favicon updates to match** the active weather/time (🌌 🌅 🌧️ ❄️ …).

**Scheduled themes are currently disabled.** The framework still ships a **World Cup 2026** theme (emerald pitch + orbiting ⚽) and a **winter/holiday** theme — both remain previewable and are one line from re-enabling in `resolveBaseTheme()` (see the commented checks there). Because resolution is date-based on the client, no GitHub Action or redeploy is needed to turn them back on.

**Preview any state** by appending query params:

```
?theme=worldcup | intergalactic | winter
?time=dawn | day | sunset | night
?weather=clear | clouds | rain | snow | thunder
```

Example: `/?theme=intergalactic&time=sunset&weather=rain`

> **Privacy:** live weather is best-effort and non-blocking. Location is approximated from IP via [ipwho.is](https://ipwho.is) (no permission prompt) and weather comes from the key-less [Open-Meteo](https://open-meteo.com) API. If either call fails or is blocked, the site simply falls back to the date + time-of-day theme.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/alex1kariuki/alex1kariuki.github.io/issues).

## 📝 License

This project is [MIT](LICENSE) licensed.

## 📧 Contact

Alex Kariuki - [alex@kariuki.dev](mailto:alex@kariuki.dev)

Project Link: [https://github.com/alex1kariuki/alex1kariuki.github.io](https://github.com/alex1kariuki/alex1kariuki.github.io)

---

© 2024 Alex Kariuki. All Rights Reserved.
