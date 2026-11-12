# NEURAL WEB AI

**Turn a prompt into a responsive website.**

NEURAL WEB AI is a lightweight, static-first AI website builder. It includes a prompt workspace, live preview, HTML editor, responsive preview sizes, and HTML export.

## What's included

- Responsive dark-mode AI studio UI
- Prompt examples for quick starts
- Live website preview in a sandboxed iframe
- Generated HTML editor with live refresh
- Desktop, tablet, and mobile preview widths
- Export generated website as a standalone HTML file
- Optional secure AI proxy using a Cloudflare Worker
- Local fallback preview so the interface can be tested before connecting an AI provider

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Connect real AI generation

The browser must never contain your AI provider API key. Deploy `worker.js` as a Cloudflare Worker and store your key as a Worker secret.

1. Create a Cloudflare Worker and paste the contents of `worker.js`.
2. Add a Worker secret named `AI_API_KEY` containing your provider key.
3. Optional Worker variables:
   - `AI_BASE_URL`: defaults to `https://api.openai.com/v1`
   - `AI_MODEL`: defaults to `gpt-4o-mini`
4. Deploy the Worker. Its endpoint will look like `https://YOUR-WORKER.workers.dev/generate`.
5. Open NEURAL WEB AI, choose **Settings**, and paste that endpoint into **AI API Endpoint**.

The Worker expects an OpenAI-compatible `/chat/completions` API and returns `{ "html": "..." }`.

**Production security:** before sharing the Worker publicly, restrict CORS to your deployed website origin and add rate limiting / abuse protection. Never commit API keys, `.env` files, or `.dev.vars`.

## Deploy the frontend with GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main`. The workflow publishes the static frontend.
4. Configure the Worker endpoint in the deployed site's Settings dialog.

GitHub Pages hosts the frontend only; it does not run the AI Worker.

## Project structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   └── styles.css
├── worker.js
└── .github/
    └── workflows/
        └── pages.yml
```

## Current status

- [x] Initial responsive workspace UI
- [x] Prompt examples and character counter
- [x] Preview / code tabs
- [x] HTML editor and live preview
- [x] HTML export
- [x] Cloudflare Worker AI proxy starter
- [x] GitHub Pages workflow
- [ ] Configure and deploy AI Worker
- [ ] Restrict Worker CORS and add rate limiting
- [ ] Add ZIP export and multi-file project generation
- [ ] Add model selection and image generation

---

Built with care as **NEURAL WEB AI**.
