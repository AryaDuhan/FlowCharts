# Visual Pipeline Builder

A powerful, interactive drag-and-drop DAG (Directed Acyclic Graph) pipeline editor designed for building, validating, and visualizing complex workflows.

## Features

- **Interactive Canvas**: Drag-and-drop pipeline editor built with React Flow, supporting 9 abstracted node types.
- **Canvas Tools**: Includes freehand drawing, an eraser, undo/redo, copy/paste, and element locking for precise control.
- **Backend Validation**: FastAPI backend endpoint that ingests pipeline graph data, validates whether the node-edge structure forms a valid DAG, and returns parsed analytics (node count, edge count, DAG status).
- **Extensive Theming**: 7 fully swappable UI themes (Omori, Neo-Brutalist, Editorial, Corporate, Playful, Wireframe, Medical) with a CSS-scoped architecture and zero feature loss between themes.
- **Immersive UX**: Features an interactive onboarding tutorial for the default theme and a physics-based animated background.
- **Export Functionality**: High-quality, optimized parallel PNG and SVG image export of your flowchart.

## Tech Stack

- **Frontend**: React, React Flow, Zustand, HTML-to-Image, Vanilla CSS
- **Backend**: Python, FastAPI, Uvicorn
- **Architecture**: REST API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)

### Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the dependencies:
   ```bash
   pip install fastapi uvicorn
   ```
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will run on `http://127.0.0.1:8000`.

### Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`.

### Production Deployment

To serve an optimized production build of the frontend:

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Build the app for production:
   ```bash
   npm run build
   ```
3. Install the `serve` package globally (if you haven't already):
   ```bash
   npm install -g serve
   ```
4. Serve the `build` directory:
   ```bash
   serve -s build
   ```
   The production app will now be running on `http://localhost:3000`.

## How to Use

1. **Add Nodes**: Drag and drop nodes from the toolbar (Input, LLM, Output, Text, Logic, Math, API, Note, Timer) onto the canvas.
2. **Connect Nodes**: Click and drag from a handle on one node to a handle on another to create an edge.
3. **Text Variables**: In the Text node, you can dynamically create new input handles by typing variables enclosed in double curly braces, e.g., `{{ input_1 }}`.
4. **Drawing**: Click the Sketchbook icon (or select the draw tool) to freehand draw on the canvas. Use the Eraser tool to remove drawings.
5. **Themes**: Use the dropdown menu in the top left, or interact with the "Door" icon in the Omori theme, to switch between the 7 different aesthetics.
6. **Validation**: Click the "Submit" button to send your pipeline to the backend. It will analyze your graph and display an alert telling you the number of nodes, edges, and whether the graph is a valid Directed Acyclic Graph (DAG).
7. **Export**: Click the Laptop icon to download a high-resolution PNG or SVG image of your current pipeline.
