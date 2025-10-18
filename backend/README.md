# Backend (Express)

Express 기반 백엔드로 OpenRouter Chat Completions API에 대한 프록시를 제공합니다.

## 설치
- 루트에서 의존성 설치: `npm install`
- 백엔드 환경변수: `backend/.env`
  - `OPENROUTER_API_KEY=YOUR_KEY`
  - `PORT=3000` (선택)
  - `CORS_ORIGINS=http://localhost:5173` (선택, 허용할 Origin 목록. 콤마로 구분)
  - `DEFAULT_MODEL=tngtech/deepseek-r1t2-chimera:free` (선택)
  - `ALLOWED_MODELS=tngtech/deepseek-r1t2-chimera:free,anthropic/claude-3.5-sonnet` (선택)
  - `EXPOSE_RAW=false` (선택, true면 응답에 raw 포함)

- 예시 파일: `backend/.env.example` 참고

## 실행
- 개발(루트에서): `npm run dev` (프론트+백엔드 동시 실행)
- 백엔드만: `npm run dev:server`
- 프로덕션:
  1. 프론트 빌드: `npm run build:client`
  2. 실행: `NODE_ENV=production node backend/server.js`

## API
- `POST /api/ask`
  - body: `{ question, model?, persona?, scenario?, referer? }`
  - 응답: 기본 `{ answer }`
    - `EXPOSE_RAW=true`인 경우 `{ answer, raw }`

## 참고
- 프론트엔드는 `http://localhost:5173`에서 실행되며 `/api`는 백엔드(`http://localhost:3000`)로 프록시됩니다.
- CORS는 환경변수 `CORS_ORIGINS`에 지정된 Origin만 허용합니다(기본: `http://localhost:5173`).

## 추가 정보
- 헬스체크: `GET /api/ping` → `{ ok: true }`
- 요청 바디: `message` 또는 `question` 중 하나의 비어있지 않은 문자열 필수. 선택: `persona`, `scenario`, `model`, `exposeRaw`
- 응답 포맷: 기본 `{ answer }` (+ `EXPOSE_RAW=true`일 때 `{ raw }` 포함)
- 에러 응답: 중앙 에러 핸들러를 통해 `{ message, code, details? }` JSON으로 통일
- 보안/로깅/레이트리미트: `helmet`/`morgan`/`express-rate-limit`/`cors`/`express.json` 적용
- Rate Limit: `RATE_LIMIT`(기본 60)으로 분당 요청 제한
- 프로덕션: `NODE_ENV=production`에서 `frontend/dist` 정적 서빙 + SPA fallback
