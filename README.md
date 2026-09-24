# Botanical Art Studio — Creative Practice & E-Learning Platform

A quiet, refined digital studio for learning art through observation, patience and practice. This local React MVP pairs editorial serif typography, warm ivory paper tones, and authentic botanical artwork with a complete student learning workflow and studio administration system.

---

## 👥 Demo User Accounts & Credentials

| Role | Display Name | Email | Password | Default Classes Owned | Primary Portal |
|---|---|---|---|---|---|
| **Student** | Student 1 | `student@demo.com` *(or `student1@demo.com`)* | `demo123` | **2 Classes** (*01 / Painting*, *02 / Botanical Art*) | `/dashboard` (Studio & Practice) |
| **Admin** | Admin | `admin@demo.com` | `admin123` | **All 4 Classes** *(Studio Administrator)* | `/admin` (Student Practice Manager) |
| **Student 2** | Student 2 | `student2@demo.com` | `demo123` | **3 Classes** (*Painting*, *Botanical Art*, *Zentangle*) | `/dashboard` |
| **Student 3** | Student 3 | `student3@demo.com` | `demo123` | **1 Class** (*Painting*) | `/dashboard` |
| **Student 4** | Student 4 | `student4@demo.com` | `demo123` | **All 4 Classes** (*Completed Curriculum*) | `/dashboard` |

*Quick **"Fill Student"** and **"Fill Admin"** buttons are available on the login page. In addition, an instant role switcher is accessible in the top studio bar.*

---

## 🎨 Studio Curriculum (4 Core Disciplines)

| Number | Class Title | Mode | Lessons | Duration | Tuition | Default Status (Student 1) |
|---|---|---|---|---|---|---|
| **01 /** | **Painting** | Online · Offline | 10 | 5h 15m | $65 | **Enrolled** |
| **02 /** | **Botanical Art** | Online · Offline | 10 | 6h 20m | $75 | **Enrolled** |
| **03 /** | **Zentangle** | Online · Offline | 10 | 4h 45m | $50 | Available to Enroll |
| **04 /** | **Line Arts** | Online · Offline | 10 | 5h 30m | $55 | Available to Enroll |

---

## 🌿 Visual Identity & Design Principles

* **Palette**: Warm Ivory (`#F8F7F2`), Soft White (`#FFFFFF`), Soft Beige (`#F1EEE7`), Primary Black (`#111111`), Soft Black (`#252422`), Warm Gray (`#77736B`), Light Warm Gray (`#A9A49B`), Beige Border (`#D9D4CA`). Monochromatic UI where color comes strictly from botanical artwork and paintings.
* **Typography**: Editorial serif (*Cormorant Garamond*) for titles, headlines, and numbers paired with restrained sans-serif (*Inter*) with wide letter spacing (`0.15em` to `0.25em`) for microtypography.
* **Asymmetrical Composition**: Distributed botanical hero imagery, pressed flora, and watercolor artwork.
* **Numbered Outlined Blocks**: Horizontally stacked numbered sections (`01 /`, `02 /`, etc.) with generous whitespace, thin borders, and understated thin progress lines.
* **Video Frame**: Simple rectangular video frame with thin border and clean editorial sidebar.

---

## 🛠️ Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Application runs locally at `http://localhost:5173`.
Progress, enrollments, and resume points are saved automatically in `localStorage`.
"# art-course-platform" 
