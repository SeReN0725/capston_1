# AI 친구 사귀기 시뮬레이션 (StoryAI)

고등학생 친구들과 대화를 나누며 친밀도를 쌓아 스토리를 진행하는 웹 애플리케이션입니다. 프론트엔드(React + Vite)와 백엔드(Express)로 구성되어 있으며, 백엔드가 OpenRouter Chat Completions API에 대한 프록시 역할을 합니다.

## 폴더 구조

```
Project_StoryAI_by_Cochamjal/
├── backend/                  # Express 백엔드 서버
│   ├── README.md
│   └── server.js            # /api/ask 엔드포인트 및 정적 배포 서버
├── frontend/                 # React + Vite 프론트엔드
│   ├── README.md
│   ├── index.html           # 엔트리 HTML, root div 정의
│   ├── vite.config.js       # 개발 서버 포트 및 /api 프록시 설정
│   ├── tailwind.config.js   # Tailwind 테마/애니메이션 설정
│   ├── public/
│   │   ├── backgrounds/     # 배경 이미지 등 정적 자산
│   │   └── characters/      # 캐릭터 관련 정적 자산
│   └── src/
│       ├── main.jsx         # 프론트엔트리 (ReactDOM.createRoot)
│       ├── App.jsx          # 화면 전환 제어 (onboarding/playing/ending)
│       ├── index.css        # Tailwind 기반 글로벌 스타일
│       ├── store/
│       │   └── gameStore.js # Zustand 스토어(게임 상태/친밀도/스토리 진행)
│       ├── services/
│       │   └── aiService.js # AI 호출, STT/TTS, 친밀도 변화 계산
│       └── components/      # UI 컴포넌트(온보딩/게임/엔딩 등)
├── package.json             # 루트 스크립트(동시 개발 실행 등)
├── package-lock.json
└── .gitignore
```

## 기술 스택 및 역할

- 프론트엔드: `React 18`, `Vite 5`, `Tailwind CSS`, `Zustand`
- 백엔드: `Express`, `cors`, `dotenv`
- AI 연동: `OpenRouter` Chat Completions API (백엔드 프록시 경유)
- 음성: 브라우저 `Web Speech API`(STT/TTS)
- 개발 편의: `concurrently`로 프론트/백엔드 동시 실행

## 실행/빌드 워크플로우

- 개발 실행
  - 루트에서 의존성 설치: `npm install`
  - 백엔드 환경변수 파일: `backend/.env` 생성 (아래 환경변수 섹션 참고)
  - 동시 실행: `npm run dev` (Express 서버와 Vite 개발 서버를 동시에 시작)
    - 프론트엔드: `http://localhost:5173`
    - 백엔드: `http://localhost:3000`
  - 프록시: `frontend/vite.config.js`에 따라 `/api/*` 요청은 자동으로 `http://localhost:3000`으로 프록시됩니다.

- 프로덕션 배포
  - 프론트 빌드: `npm run build:client` (결과물은 `frontend/dist`)
  - 서버 실행: `NODE_ENV=production node backend/server.js`
    - 프로덕션 모드에서 Express가 `frontend/dist`를 정적으로 서빙하고, 나머지 라우팅을 `index.html`로 처리합니다.

## 데이터/요청 흐름(워크플로우 상세)

1. 사용자가 `GameScreen`에서 텍스트 입력 또는 음성(STT)으로 메시지를 보냅니다.
2. 프론트엔드 `services/aiService.js`의 `generateAIResponse`가 다음을 수행합니다:
   - 캐릭터, 친밀도, 스토리 단계에 맞춘 `persona`(시스템 프롬프트) 생성
   - 최근 대화 일부를 바탕으로 `scenario` 컨텍스트 구성
   - `fetch('/api/ask', { question, persona, scenario })`로 백엔드 호출
3. Vite 프록시 설정에 의해 `/api/ask` 요청은 `http://localhost:3000`의 Express로 전달됩니다.
4. 백엔드 `backend/server.js`는 `POST /api/ask`에서:
   - `OPENROUTER_API_KEY`를 사용해 OpenRouter Chat Completions API로 요청
   - 전달받은 `persona` 또는 `scenario`에 맞춰 `messages`를 구성
   - 모델은 `DEFAULT_MODEL/ALLOWED_MODELS` 설정을 바탕으로 화이트리스트 내에서만 사용
   - 응답에서 `answer` 텍스트를 추출하여 프론트엔드로 반환 (`EXPOSE_RAW=true`면 raw 포함)
5. 프론트엔드가 응답을 수신하면:
   - 대화 기록과 상태(Zustand)를 업데이트
   - `calculateIntimacyChange`로 친밀도 증감 계산 및 이벤트/스토리 진행
   - 필요 시 `textToSpeech`로 TTS 재생
6. 전체 친밀도 및 캐릭터별 이벤트 조건에 따라 스토리가 `onboarding → playing → ending`으로 진행됩니다.

## 주요 파일 요약

- `backend/server.js`: CORS 제한, `/api/ask` 구현, OpenRouter 프록시, 프로덕션 정적 서빙
- `frontend/vite.config.js`: 개발 서버 포트(`5173`)와 `/api` 프록시(`http://localhost:3000`) 설정
- `frontend/src/main.jsx`: React 엔트리 포인트
- `frontend/src/App.jsx`: 현재 게임 단계에 따라 화면 전환
- `frontend/src/store/gameStore.js`: 게임 전역 상태(Zustand), 친밀도/이벤트/스토리 로직
- `frontend/src/services/aiService.js`: 시스템 프롬프트 생성, API 호출, STT/TTS, 친밀도 변화 계산
- `frontend/src/components/*`: 온보딩/게임/엔딩 UI 컴포넌트

## 환경 변수 (`backend/.env`)

다음 변수로 백엔드 동작을 제어합니다.

- `OPENROUTER_API_KEY`(필수): OpenRouter API 키
- `PORT`(선택): 백엔드 서버 포트, 기본 `3000`
- `CORS_ORIGINS`(선택): 허용할 Origin 목록(콤마 구분), 기본 `http://localhost:5173`
- `DEFAULT_MODEL`(선택): 기본 모델, 예) `tngtech/deepseek-r1t2-chimera:free`
- `ALLOWED_MODELS`(선택): 허용 모델 화이트리스트, 콤마 구분
- `EXPOSE_RAW`(선택): `true`면 응답에 원본(`raw`) 포함

## 개발 참고

- 브라우저 권장: Chrome 최신 버전
- 음성 인식(STT): `SpeechRecognition`/`webkitSpeechRecognition` 기반, 자동 침묵 감지
- 음성 합성(TTS): `speechSynthesis` 기반
- 포트 충돌 방지: 프론트 `5173`, 백엔드 `3000` 사용

---

질문이나 개선 사항이 있으면 언제든지 이 README를 업데이트해주세요.