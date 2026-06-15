![DFS Visualizer](https://placehold.co/1200x300/0c4a6e/bae6fd?text=DFS+Visualizer)

# 🌐 DFS Visualizer

An interactive **Depth-First Search (DFS) algorithm visualizer** that helps you understand how DFS traverses a graph step by step, with animated highlights and flow arrows.

## ✨ Features

- 🎯 Visualizes the Depth-First Search algorithm on a graph in real time
- 🖱️ Interactive controls to start, pause, and step through the traversal
- 🔗 Animated flow arrows showing the path DFS takes between nodes
- 🎨 Clean, modern UI built with shadcn-ui and Tailwind CSS
- ⚡ Fast and responsive, powered by Vite + React + TypeScript

## 🛠️ Tech Stack

- ⚡ [Vite](https://vitejs.dev/) – fast build tooling
- ⚛️ [React](https://react.dev/) – UI library
- 🟦 [TypeScript](https://www.typescriptlang.org/) – type safety
- 🎨 [shadcn-ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) – styling & components

## 🖼️ Demo / Screenshots

![Visualizer Demo](https://placehold.co/800x450?text=Visualizer+Demo)

> 📌 *Replace the placeholder above with real screenshots or a GIF of the visualizer in action.*

## 📂 Project Structure

```
src/
├── components/      # UI components, including the DFS visualizer
│   ├── DFSVisualizer.tsx
│   ├── FlowArrows.tsx
│   └── ui/           # shadcn-ui components
├── hooks/            # Custom React hooks
└── App.tsx           # App entry point
```

## 📄 License

This project is open source and available for learning purposes.

---

## 🛠️ Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (with npm)

### Clone & Install

```sh
git clone https://github.com/IbrahimPopatiya/dfs-visualizer.git
cd dfs-visualizer
npm install
```

## 🚀 Run

### Development

```sh
npm run dev
```

This starts a local dev server with hot reloading.

### Production Build

```sh
npm run build
```

The optimized output will be generated in the `dist/` folder.
