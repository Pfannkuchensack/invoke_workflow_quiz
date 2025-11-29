# Workflow Quiz Game

Ein Quiz-Spiel basierend auf der InvokeAI Workflow Engine, bei dem Spieler fehlende Edges in "kaputten" Workflows verbinden müssen.

## Projekt-Struktur

```
workflow-quiz/
├── frontend/          # React + React Flow Frontend
├── backend/           # Node.js + Express Backend
└── shared/            # Gemeinsame TypeScript Types
```

## Setup & Installation

### Backend

```bash
cd workflow-quiz/backend
npm install
npm run dev
```

Das Backend läuft auf `http://localhost:3001`

### Frontend

```bash
cd workflow-quiz/frontend
npm install
npm run dev
```

Das Frontend läuft auf `http://localhost:3000`

## Hinweis zu Imports

Falls TypeScript-Fehler bei den Imports auftreten, müssen die Imports in den Frontend-Dateien korrigiert werden:

- Ändere `from '../../shared/types'` zu `from '../types'`
- Ändere `from '../../../shared/types'` zu `from '../../types'`

Betroffene Dateien:
- `frontend/src/store/quizStore.ts`
- `frontend/src/components/UI/StartScreen.tsx`
- `frontend/src/components/UI/QuizView.tsx`
- `frontend/src/components/QuizCanvas/QuizCanvas.tsx`
- `frontend/src/components/Node/QuizNode.tsx`

## Quiz-Workflows hinzufügen

Lege neue Quiz-Workflows als JSON-Dateien in `backend/quizzes/` ab.

Format:
```json
{
  "id": "quiz-001",
  "name": "Quiz Name",
  "description": "Beschreibung",
  "difficulty": "easy|medium|hard",
  "workflow": { /* InvokeAI WorkflowV3 JSON */ },
  "hiddenEdges": ["edge-id-1", "edge-id-2"]
}
```

## Features

- React Flow Canvas zum Verbinden von Edges
- Backend-Validierung für Typ-Kompatibilität
- Zyklen-Erkennung
- Schwierigkeitsstufen (easy, medium, hard)
- Hinweis-System
- Punktesystem
- LocalStorage für Spielfortschritt
