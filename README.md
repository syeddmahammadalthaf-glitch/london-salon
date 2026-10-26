# The London Salon — Luxury Hair & Beauty Experience

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://london-salon.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Canvas-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A high-performance, immersive luxury salon and aesthetics web application engineered for **The London Salon**, Court Road, Anantapur. Features dynamic appointment scheduling, an ambient WebGL/Three.js interactive visual atmosphere, luxury service catalog, and a client-side administrative management dashboard.

🌐 **Live Deployment:** [https://london-salon.vercel.app](https://london-salon.vercel.app)

---

## 📸 Key Highlights & Features

- **Immersive 3D Experience:** Three.js-powered WebGL background with interactive ambient particles and floating luxury aesthetics that react smoothly to user cursor movement.
- **Dynamic Service Catalog:** Curated categorization of haircuts, British styling, Balayage, Kérastase treatments, nail extensions, and bridal packages with dynamic pricing calculations.
- **Interactive Booking Flow:** Streamlined appointment scheduling system with service selection, preferred stylist allocation, date/time validation, and instant confirmation modal.
- **Administrative Control Portal (`admin.html`):** Back-office dashboard allowing managers to review upcoming appointments, filter bookings by date/status, and manage client inquiries.
- **Responsive & Accessible Design:** Fully optimized fluid layout tailored for mobile devices, tablets, and high-DPI desktop screens using modern CSS Grid, Flexbox, and touch-friendly controls.
- **Custom Cursor & Smooth Micro-Interactions:** Bespoke magnetic cursor physics with interactive hover states and sound-enhanced navigation feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Structure** | Semantic HTML5, Schema.org JSON-LD Structured Data (Local Business & BeautySalon) |
| **Styling & Theme** | Vanilla CSS3, CSS Custom Properties (Design Tokens), Glassmorphism, Responsive Grid/Flexbox |
| **Graphics & 3D** | Three.js (r128) WebGL Particle System |
| **Application Logic** | Modern JavaScript (ES6+), Event-driven DOM manipulation, LocalStorage persistence |
| **Deployment** | Vercel Serverless Edge Hosting (`vercel.json`) |

---

## 📂 Project Architecture

```
london-salon/
├── index.html         # Main client landing page, 3D experience portal & booking UI
├── app.js             # Client application logic, Three.js canvas setup, service filters & booking
├── styles.css         # Complete design system, luxury dark typography, animations & responsive media queries
├── admin.html         # Administrative dashboard for appointment management
├── admin.js           # Admin portal controller & booking review logic
├── vercel.json        # Vercel deployment configuration & routing rules
├── assets/            # Optimized imagery, branding assets, and video tour elements
├── LICENSE            # MIT License
└── README.md          # Project documentation
```

---

## 🚀 Local Installation & Setup

No complex build pipeline or bundler required — runs cleanly in any modern web browser or lightweight HTTP server.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/syeddmahammadalthaf-glitch/london-salon.git
   cd london-salon
   ```

2. **Serve locally:**
   Using VS Code Live Server, Python HTTP server, or Node's `serve`:
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Or using npx
   npx serve .
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000` to view the client application, or `http://localhost:3000/admin.html` for the administration portal.

---

## 💡 Engineering & Technical Decisions

- **Zero-Dependency Core for Instant Load:** Instead of heavy frameworks for a marketing and booking experience, vanilla ES6+ and Three.js were utilized to ensure sub-second First Contentful Paint (FCP) and smooth 60 FPS particle animation.
- **Resilient Fallback Design:** In environments where WebGL is disabled or hardware acceleration is unavailable, graceful CSS degradation ensures the core booking workflows remain fully operational.
- **Mobile First Touch Adaptation:** Touch events seamlessly disable desktop custom cursor logic and adapt Three.js canvas resolution to preserve battery life on handheld devices.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to inspect, fork, and learn from the codebase.
