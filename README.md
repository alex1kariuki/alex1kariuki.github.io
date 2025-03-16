# Alex Kariuki - Portfolio Website

A modern, responsive portfolio website built with Angular and Tailwind CSS, showcasing my professional experience, projects, and skills.

![Portfolio Home Page](screenshots/homepage.png)
<!-- Add your screenshot here -->

## 🌟 Features

- **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop
- **Interactive UI**: Modern animations and interactive elements
- **Project Showcase**: Filterable portfolio of projects with detailed information
- **Category Filtering**: Filter projects by Web, Mobile, Web3, and Backend categories
- **Contact Form**: Integrated email contact form using EmailJS
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

## ⚙️ Configuration

The contact form is configured using EmailJS. To set up your own email service:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service and template
3. Update the service and template IDs in the contact component

## 🌐 Deployment

This project is configured for GitHub Pages deployment. To deploy:

```bash
# Build with base href configured for GitHub Pages
ng build --configuration production

# Deploy to GitHub Pages
npm run deploy
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/alex1kariuki/alex1kariuki.github.io/issues).

## 📝 License

This project is [MIT](LICENSE) licensed.

## 📧 Contact

Alex Kariuki - [alex@kariuki.dev](mailto:alex@kariuki.dev)

Project Link: [https://github.com/alex1kariuki/alex1kariuki.github.io](https://github.com/alex1kariuki/alex1kariuki.github.io)

---

© 2024 Alex Kariuki. All Rights Reserved.
