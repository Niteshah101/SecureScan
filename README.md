# Sentinel CVE Intelligence

A full-stack SOC-style CVE intelligence dashboard.

## Architecture

- React + Vite + TypeScript frontend
- Express + TypeScript backend
- NVD API is used as the CVE source of truth
- Gemini is used only for analyst summaries and remediation guidance
- API keys stay on the backend

## Run server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Then edit `server/.env` and add your keys.

## Run client

```bash
cd client
npm install
npm run dev
```

## JSON upload example

Use `sample-packages.json` in the root folder.

```json
[
  { "software": "nginx", "version": "1.18.0" },
  { "software": "openssl", "version": "1.1.1" }
]
```
