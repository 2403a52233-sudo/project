Backend MongoDB Setup

- **Purpose**: Optional MongoDB persistence for the existing backend. If `MONGO_URI` is set in environment, the server uses MongoDB via `mongoose`. Otherwise it falls back to `data.json` file storage (existing behavior).

Quick start (PowerShell):

```powershell
cd backend
# install dependencies
npm install

# copy example env and set MONGO_URI if using MongoDB
copy .env.example .env
# edit .env to set your MongoDB connection string

# start server
npm start
```

Notes:
- When using MongoDB, collections are: `buses`, `routes`, `drivers`, `students`, `statuses`, `locations`, `attendances`.
- Endpoints remain the same; when creating items the response includes `id` when stored in MongoDB.
- To reset storage:
  - With file storage: `POST /reset` will overwrite `data.json`.
  - With MongoDB: `POST /reset` will clear the collections.

Migration: If you want to import existing `data.json` to MongoDB, I can add a small script to read `data.json` and insert documents into the corresponding collections. Ask me to add that if needed.
