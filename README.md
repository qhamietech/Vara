# Vara 🧥 | Intelligent Wardrobe Orchestrator

**Vara** is a sophisticated wardrobe management platform that leverages advanced computer vision to digitize your closet. By transforming physical garments into structured data, Vara enables users to curate their style with analytical precision.

## 🌟 Overview
Vara was developed to solve the "static closet" problem. Most digital wardrobes require manual data entry; Vara automates this process using Multimodal LLMs to perceive texture, color, and thermal utility from a single image.

## 🧠 Core Architecture
* **Direct API Integration**: Implemented a robust RESTful interface to communicate with Google's Generative AI, ensuring high-availability and bypassing standard SDK limitations.
* **Next.js App Router**: Utilized the latest React framework features for optimized server-side rendering and efficient data fetching.
* **Intelligent Taxonomy**: Developed a custom tagging engine that classifies items based on warmth scores (1-10), color theory palettes, and situational appropriateness.
* **Mobile-First Synchronization**: Engineered for cross-device compatibility, allowing users to catalog items seamlessly via mobile camera or desktop uploads.

## 🛠️ Technical Stack
- **Framework**: Next.js 15 (TypeScript)
- **AI Engine**: Google Gemini Multimodal Vision
- **Styling**: Tailwind CSS & Lucide React
- **Infrastructure**: Vercel & GitHub Actions (CI/CD)

## 🗺️ Development Roadmap
- [x] **System Architecture**: Established secure API handshaking and environment variable management.
- [x] **AI Vision Logic**: Fine-tuned prompt engineering for consistent JSON-structured metadata output.
- [ ] **Data Persistence Layer**: Integration of localized or cloud-based storage for long-term closet management.
- [ ] **Recommendation Engine**: Predictive outfit suggestions based on item metadata and external environmental factors.
