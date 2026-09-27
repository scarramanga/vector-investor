# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Stack AI page (`/chat`)

`/chat?token=...` is the conversational front door: a prospect arrives from a link in Andy's email with a token, talks to Stack AI, and is offered a door (Vector, the platform, or a call) when their own words earn it. The page holds no state. It reads the token from the URL, calls the conversation API through this server (`/api/chat/:token` for history and reopen, `/api/chat/:token/message` for a streamed reply), and renders what comes back: the reply played out word by word with a cursor, a thinking indicator before the first word, and a door card when the stream carries one. An unavailable token shows the API's fixed message as a plain page.

- **Config:** `STACKAI_API_BASE` is the conversation API's base URL. Default `http://127.0.0.1:8790` (a local engine). Set it in `vector-secrets` when the API is deployed.
- **Vector door:** opens `/quiz-v2` in place with the token; the belief and sell rule from the card's payload are already in place as answers, shown in the person's own words (the "Another reason" answer to the belief question, and "a predefined rule" under what would change their mind when a rule was stated). When the payload carries a cited `vector_route` (learning, developing, regular, established), "Which best describes you?" is pre-answered too and shows the words that earned it; when it is absent, Vector asks.
- **Platform door:** opens `https://app.stackmotiveapp.com/welcome?token=...`.
- **Reopen:** an email link back to `/chat?token=...` restores the whole conversation from the API before the person types.

The engine's API contract (Ripen spec, PR 3): `GET /conversation/{token}` and `POST /conversation/{token}/message` (text/plain stream, then `<<door>>{json}` on the last line when a door was earned).

## Deploying to production

The `vector-frontend` container image is published to DigitalOcean Container Registry (DOCR) under `registry.digitalocean.com/docr-prod/vector-frontend`. The same image is consumed by two workloads in the `vector-prod` namespace: the `vector-frontend` Deployment and the `vector-followup-job` CronJob. Both manifests must reference the same image tag.

Production images are pinned to the **short git SHA** at build time (not `:latest`). This makes rollouts deterministic and rollbacks unambiguous.

> **Warning — order of operations matters.** The SHA in the manifest must match the SHA of an image that has already been built and pushed to DOCR. Always build and push **first**, then update the manifests, then apply. If the manifests are updated and applied before the image is pushed, `kubectl rollout status` will hang on `ImagePullBackOff`.

### Build & deploy

```bash
SHA=$(git rev-parse --short HEAD)

# 1. Build and push the image (do this BEFORE editing manifests)
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/docr-prod/vector-frontend:$SHA .
docker push registry.digitalocean.com/docr-prod/vector-frontend:$SHA

# 2. Update both manifests to reference the new tag
#      k8s/deployment.yaml              -> image: ...:$SHA
#      k8s/vector-followup-cronjob.yaml -> image: ...:$SHA
# Commit the manifest change to the same PR as any code change.

# 3. Apply
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/vector-followup-cronjob.yaml
kubectl rollout status deployment vector-frontend -n vector-prod
```
