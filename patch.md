# 현재 프로젝트 구성/역할/관계/워크플로우 정리

## 전체 구조
```
Project_StoryAI_by_Cochamjal/
├── backend/                 # Express 백엔드 (OpenRouter 프록시)
│   ├── server.js            # 서버 부팅, 보안/로그/CORS/레이트리밋, 라우팅/정적서빙
│   ├── routes/
│   │   └── aiRoutes.js      # /api 라우트 정의 (/ask, /ping)
│   ├── controllers/
│   │   └── aiController.js  # 입력검증, llmService 호출, 응답 포맷
│   ├── services/
│   │   └── llmService.js    # 모델선택, 메시지 구성, OpenRouter 호출
│   ├── middlewares/
│   │   └── errorHandler.js  # 중앙 에러 처리(JSON)
│   └── .env(.example)       # 백엔드 환경변수
├── frontend/                # React + Vite 프론트엔드
│   ├── public/              # 이미지/에셋(배경, 캐릭터)
│   ├── src/
│   │   ├── components/      # 화면/UI 컴포넌트(온보딩/게임/엔딩 등)
│   │   ├── services/        # API/AI/음성/친밀도 등 서비스 계층
│   │   │   ├── apiClient.js # `/api` 호출용 fetch 래퍼
│   │   │   ├── aiClient.js  # `/api/ask` 엔드포인트 전용 클라이언트
│   │   │   └── aiService.js # 페르소나 생성·대화·친밀도 계산·STT/TTS
│   │   └── store/
│   │       └── gameStore.js # Zustand 상태 관리(캐릭터/친밀도/진행도)
│   └── vite.config.js       # 개발 프록시(`/api` → 백엔드)
├── package.json             # 루트 실행/빌드 스크립트
└── README.md / patch.md     # 문서
```

## 백엔드 구성과 역할
- `server.js`
  - `dotenv`로 `.env` 로드, `helmet`/`cors`/`morgan`/`express-rate-limit` 적용
  - CORS 허용 오리진(`CORS_ORIGINS`) 처리, `/api` 라우터 마운트
  - 운영(`NODE_ENV=production`)일 때 `frontend/dist` 정적 서빙 및 SPA 라우팅
  - 중앙 에러 핸들러(`errorHandler`) 등록, `PORT`로 서버 바인딩
- `routes/aiRoutes.js`
  - `POST /api/ask`: AI 응답 생성 엔드포인트
  - `GET /api/ping`: 헬스 체크
- `controllers/aiController.js`
  - `message` 또는 `question` 입력 검증, `persona`/`scenario` 전달
  - `llmService.generateReply` 호출 → 일관된 응답 포맷으로 반환
- `services/llmService.js`
  - `parseAllowedModels`/`pickModel`: 모델 허용/선택 로직
  - `buildMessages`: `persona`/`scenario` 기반 메시지 구성
  - `generateReply`: OpenRouter `chat/completions` 호출, `{ answer, raw? }` 반환
- `middlewares/errorHandler.js`
  - 모든 에러를 `{ message, details? }` JSON으로 통일하여 응답

## 프론트엔드 구성과 역할
- `src/services/apiClient.js`
  - `apiFetch(path, options)`로 `/api` 프록시 호출 래핑, 에러 메시지 통일
- `src/services/aiClient.js`
  - `askAI(message, opts)`: `POST /api/ask` 전용 클라이언트
- `src/services/aiService.js`
  - 캐릭터별 시스템 프롬프트(페르소나) 생성, 최근 대화로 `scenario` 구성
  - `askAI`를 호출해 응답을 받음, 친밀도 변화 계산, STT/TTS 유틸 포함
- `src/store/gameStore.js`
  - 캐릭터 메타/친밀도/진행도 상태, 액션 관리(Zustand)
- `src/components/*`
  - 온보딩/게임/엔딩 화면, 대화 버블/히스토리, 친밀도 바 등 UI 책임

## 파일 간 관계(의존 흐름)
- UI(컴포넌트) → `aiService.generateAIResponse`
  - 내부에서 `aiClient.askAI` → `apiClient.apiFetch('/ask')`
  - 프록시로 백엔드 `/api/ask`에 전달
- 백엔드 `/api/ask`
  - `aiRoutes` → `aiController.askAI` → `llmService.generateReply`
  - OpenRouter 호출 후 `{ answer, raw? }` 응답 → 프론트로 반환
- 에러/로그/레이트리밋/CORS 등은 `server.js`에서 일괄 적용

## 워크플로우(개발 모드)
1. 루트에서 `npm run dev` 실행
   - `concurrently`로 백엔드(`http://localhost:3000`)와 프론트(`http://localhost:5173`) 동시 기동
   - Vite가 `/api/*`를 백엔드로 프록시
2. 사용자가 메시지 입력 → 컴포넌트에서 `aiService.generateAIResponse` 호출
3. `aiService`가 `persona/scenario` 생성 후 `aiClient.askAI` 호출
4. 백엔드가 OpenRouter로 요청 → 결과를 `{ answer }`로 반환
5. 프론트가 응답을 화면에 반영하고 친밀도 변화 계산
6. 헬스 체크는 `GET /api/ping`으로 확인 가능

## 워크플로우(운영 모드)
1. 프론트 빌드: `npm run build:client`
2. 서버 시작: `npm start`(prod)
   - 동일 오리진에서 `dist` 정적 서빙 + `/api` 제공 → CORS 이슈 최소화
3. 환경변수는 `backend/.env`에서 관리하고 키는 프론트에 노출하지 않음

## 환경 변수(backend/.env)
- `OPENROUTER_API_KEY`(필수): OpenRouter API 키
- `PORT`(선택): 백엔드 포트, 기본 `3000`
- `CORS_ORIGINS`(선택): 허용 오리진 목록(쉼표 구분), 기본 `http://localhost:5173`
- `DEFAULT_MODEL`(선택): 기본 모델
- `ALLOWED_MODELS`(선택): 허용 모델 목록
- `RATE_LIMIT`(선택): 분당 요청 수 제한(기본 60)
- `EXPOSE_RAW`(선택): `true`면 OpenRouter 응답 원본 포함
- `X_TITLE`(선택): OpenRouter 메타 타이틀

## 실행/검증 스크립트(루트)
- 개발: `npm run dev`
- 프론트 빌드: `npm run build:client`
- 운영 시작: `npm start`
- 프론트만: `npm run dev --prefix frontend`
- 백엔드만: `npm run dev:server`

## 확인 체크리스트
- 프론트 접속: `http://localhost:5173`
- 핑: `GET /api/ping` → `{ ok: true }`
- 대화: `POST /api/ask` 바디에 `{ message|question, persona, scenario }`
  - 정상 응답 `{ answer }` 수신

## 패치 요약(2025-10-17)
- 라우팅 통합: `server.js`에서 `/api`는 `routes/aiRoutes.js`를 통해 `controllers/aiController.askAI`로 연결
- 헬스체크 추가: `GET /api/ping` 라우트 확인 및 동작 검증
- 미들웨어 적용: `helmet`/`morgan`/`express-rate-limit`/`cors`/`express.json` 활성화
- 프록시 구성: `frontend/vite.config.js`에서 `/api` → `http://localhost:3000` 프록시 확인
- 에러 처리: `middlewares/errorHandler.js`로 `{ message, code, details? }` JSON 응답 일관화
- 운영 정적 서빙: `NODE_ENV=production`에서 `frontend/dist` 서빙 및 SPA fallback

## 검증 결과
- 개발 서버 재시작: `npm run dev`로 백엔드(`http://localhost:3000`)와 프론트(`http://localhost:5173`) 정상 기동
- 프록시 핑: `GET http://localhost:5173/api/ping` → `{ ok: true }` 확인
- 대화 엔드포인트: `POST http://localhost:5173/api/ask` 바디 `{ message|question, persona, scenario }` → 정상 응답 `{ answer }` 수신
- 로깅 확인: 터미널에 `morgan` 접근 로그 출력
- 레이트리미트: 1분 내 요청 과다 시 `429` 응답 기대(기본 60회/분, `RATE_LIMIT`로 조정)

## 추가 메모
- `CORS_ORIGINS`로 허용 오리진 제어(기본 `http://localhost:5173`)
- `OPENROUTER_API_KEY`는 백엔드 `.env`에만 존재(프론트 노출 금지)
- `X_TITLE`은 선택적 메타 헤더로 사용 가능