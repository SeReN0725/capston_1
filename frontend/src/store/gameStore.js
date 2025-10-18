import { create } from "zustand";

// 캐릭터 데이터
export const CHARACTERS = {
  yuri: {
    id: "yuri",
    name: "유리",
    mbti: "ISFJ",
    personality: "책임감 강하고 조용하지만 따뜻함",
    speechStyle: "~요, ~죠",
    description: "내향형, 모범생, 반장 후보",
    firstMeeting: "첫 등교, 교실에서 책을 떨어뜨렸어요. 혹시 주워주실 수 있을까요? 저는 유리라고 해요. 이번에 3학년 1반이에요.",
    firstDialogue:
      "아, 죄송해요... 책을 떨어뜨렸네요. 혹시 주워주실 수 있을까요? 저는 유리라고 해요. 이번에 3학년 1반이에요.",
    conversationHint:
      "💡 유리는 조용하고 차분한 성격이에요. 책이나 공부 이야기를 하면 좋아할 거예요.",
    color: "#ec4899",
    image: "/characters/yuri.png",
    events: [
      { threshold: 50, message: "유리가 과제를 같이 하자고 제안합니다." },
      {
        threshold: 75,
        message: "유리가 도서관에서 시험 공부를 같이 하자고 합니다.",
      },
      { threshold: 100, message: "유리가 졸업식 사진을 찍자고 제안합니다." },
    ],
  },
  jiho: {
    id: "jiho",
    name: "지호",
    mbti: "ESFP",
    personality: "밝고 유쾌함, 사람을 좋아함",
    speechStyle: "~지?, 와!, 어, 고마워!",
    description: "외향형, 친근한 친구, 운동부",
    firstMeeting: "점심시간, 급식실에서 혼자 있음",
    firstDialogue:
      "어? 너도 혼자야? 나랑 같이 밥 먹을래? 나 지호야! 농구부인데 ㅋㅋ 같은 반 아니야? 처음 보는 것 같은데!",
    conversationHint:
      "💡 지호는 밝고 활발한 성격이에요. 운동이나 재미있는 이야기를 하면 좋아할 거예요.",
    color: "#3b82f6",
    image: "/characters/jiho.png",
    events: [
      { threshold: 50, message: "지호가 운동회 팀에 같이 하자고 제안합니다." },
      { threshold: 75, message: "지호가 수학여행 룸메이트를 하자고 합니다." },
      { threshold: 100, message: "지호가 졸업식 기념 셀카를 찍자고 합니다." },
    ],
  },
  seyeon: {
    id: "seyeon",
    name: "세연",
    mbti: "INTJ",
    personality: "지적이고 냉정하지만 정의감 강함",
    speechStyle: "~다, ~구나, 흥미로운 관점이군",
    description: "도도한 천재, 독서 동아리",
    firstMeeting: "방과 후, 도서관에서 책 읽는 중",
    firstDialogue:
      "...뭐야? 방해하지 마. 지금 중요한 부분 읽고 있어. 필요한 거 있으면 빨리 말해.",
    conversationHint:
      "💡 세연은 차갑고 논리적인 성격이에요. 지적인 대화나 과학 이야기를 하면 관심을 보일 거예요.",
    color: "#8b5cf6",
    image: "/characters/seyeon.png",
    events: [
      { threshold: 50, message: "세연이 과학 전시회에 참여하자고 제안합니다." },
      { threshold: 75, message: "세연이 논문 피드백을 요청합니다." },
      { threshold: 100, message: '세연: "내 연구에 네가 도움이 됐어"' },
    ],
  },
};

// 스토리 단계
export const STORY_PHASES = {
  INTRO: "intro", // 기 (도입)
  DEVELOPMENT: "development", // 승 (전개)
  CLIMAX: "climax", // 전 (절정)
  ENDING: "ending", // 결 (결말)
};

const useGameStore = create((set, get) => ({
  // 게임 상태
  gamePhase: "onboarding", // onboarding, playing, ending
  storyPhase: STORY_PHASES.INTRO,

  // 캐릭터 친밀도
  intimacy: {
    yuri: 0,
    jiho: 0,
    seyeon: 0,
  },

  // 현재 활성 캐릭터
  currentCharacter: null,

  // 자동 스토리 진행/전환 허용 플래그 (기본 비활성화)
  autoProgressEnabled: false,

  // 대화 기록
  messages: [],

  // 사용자 대화 기록 (음성/텍스트 입력 기록)
  conversationHistory: [],

  // 만난 캐릭터 기록
  metCharacters: [],

  // 친구가 된 캐릭터 (친밀도 100 달성)
  friends: [],

  // 발생한 이벤트 기록
  triggeredEvents: [],

  // 스토리 시퀀스 인덱스
  storySequenceIndex: 0,

  // 스토리 진행 대기 상태
  waitingForClick: false,

  // 호감도 UI 표시 상태
  showIntimacyUI: false,
  intimacyUITimer: null,

  // 게임 시작
  startGame: () => {
    set({
      gamePhase: "playing",
      storyPhase: STORY_PHASES.INTRO,
      storySequenceIndex: 0,
      messages: [],
    });

    // 첫 번째 스토리 이벤트 자동 시작 (초기 온보딩은 유지)
    setTimeout(() => {
      get().progressStory();
    }, 500);
  },

  // 스토리 수동 진행 (클릭 기반)
  progressStory: () => {
    const state = get();
    const sequences = [
      // 0: 게임 시작 + 유리와의 만남
      {
        narration:
          "3월, 새 학기가 시작되었습니다.\n고등학교 3학년 1반 교실에 들어서니 낯선 얼굴들이 보입니다.\n졸업까지 6개월... 이번 학기에는 친구를 사귀어보고 싶습니다.",
        waitForClick: true,
        characterMeet: "yuri",
      },
      // 1: 점심시간 - 지호와의 만남 (유리와 대화 후)
      {
        narration:
          "점심시간이 되었습니다.\n급식실로 향하는데, 한 학생이 혼자 앉아있는 모습이 보입니다.",
        characterMeet: "jiho",
        waitForClick: false,
      },
      // 2: 방과 후 - 세연과의 만남 (지호와 대화 후)
      {
        narration:
          "방과 후, 도서관에 들렀습니다.\n조용한 구석에서 책을 읽고 있는 학생이 눈에 띕니다.",
        characterMeet: "seyeon",
        waitForClick: false,
      },
      // 3: 한 달 후 - 관계 발전
      {
        narration:
          "한 달이 지났습니다.\n\n학교 생활에도 익숙해지고, 새로운 친구들과의 관계도 조금씩 깊어지고 있습니다.",
        phaseChange: STORY_PHASES.DEVELOPMENT,
        waitForClick: true,
      },
      // 4: 5월 - 축제 시즌
      {
        narration:
          "5월, 학교 축제와 수학여행 시즌입니다.\n\n친구들과의 관계가 더욱 깊어지는 중요한 시기입니다.",
        phaseChange: STORY_PHASES.CLIMAX,
        waitForClick: true,
      },
      // 5: 졸업 전
      {
        narration:
          "2월, 졸업식이 다가옵니다.\n\n그동안 쌓아온 우정의 결실을 맺을 시간입니다.",
        phaseChange: STORY_PHASES.ENDING,
        waitForClick: true,
        endGame: true,
      },
    ];

    if (state.storySequenceIndex >= sequences.length) return;

    const sequence = sequences[state.storySequenceIndex];

    // 내레이션 추가
    if (sequence.narration) {
      get().addMessage({
        type: "narration",
        content: sequence.narration,
        requiresClick: sequence.waitForClick,
      });
    }

    // 스토리 단계 변경
    if (sequence.phaseChange) {
      set({ storyPhase: sequence.phaseChange });
    }

    // 클릭 대기 설정
    if (sequence.waitForClick) {
      set({ waitingForClick: true });
      // 클릭 대기하지만 캐릭터 만남이 있는 경우 (첫 시작)
      // 클릭 후 캐릭터를 만나도록 characterMeet 정보 저장
    } else {
      // 캐릭터 만남 (클릭 대기 없음)
      if (sequence.characterMeet) {
        setTimeout(() => {
          get().meetCharacter(sequence.characterMeet);
        }, 1000);
      }
    }

    // 게임 종료
    if (sequence.endGame) {
      setTimeout(() => {
        get().endGame();
      }, 3000);
    }

    set({ storySequenceIndex: state.storySequenceIndex + 1 });
  },

  // 캐릭터 만남
  meetCharacter: (characterId) => {
    const state = get();
    const character = CHARACTERS[characterId];

    if (!state.metCharacters.includes(characterId)) {
      set({
        metCharacters: [...state.metCharacters, characterId],
        currentCharacter: characterId,
      });

      // 첫 만남 내레이션
      get().addMessage({
        type: "narration",
        content: character.firstMeeting,
        requiresClick: true,
      });

      // 클릭 대기 설정
      set({ waitingForClick: true });
    } else {
      set({ currentCharacter: characterId });
    }
  },

  // 캐릭터 대사 표시 (내레이션 클릭 후)
  showCharacterDialogue: (characterId) => {
    const character = CHARACTERS[characterId];

    get().addMessage({
      type: "character",
      character: characterId,
      content: character.firstDialogue,
      requiresClick: true,
    });

    set({ waitingForClick: true });
  },

  // 힌트 표시 (대화 클릭 후)
  showHint: (characterId) => {
    const character = CHARACTERS[characterId];

    get().addMessage({
      type: "hint",
      content: character.conversationHint,
    });

    set({ waitingForClick: false });
  },

  // 친밀도 증가 (차등 적용)
  increaseIntimacy: (characterId, amount) => {
    const state = get();
    const currentIntimacy = state.intimacy[characterId];
    const newIntimacy = Math.min(100, currentIntimacy + amount);

    set({
      intimacy: {
        ...state.intimacy,
        [characterId]: newIntimacy,
      },
    });

    // 호감도 UI 표시
    get().showIntimacyNotification();

    // 이벤트 트리거 체크
    const character = CHARACTERS[characterId];
    character.events.forEach((event) => {
      const eventKey = `${characterId}_${event.threshold}`;
      if (
        newIntimacy >= event.threshold &&
        currentIntimacy < event.threshold &&
        !state.triggeredEvents.includes(eventKey)
      ) {
        set({
          triggeredEvents: [...state.triggeredEvents, eventKey],
          messages: [
            ...get().messages,
            {
              type: "event",
              content: event.message,
              timestamp: Date.now(),
            },
          ],
        });
      }
    });

    // 친구 등록 (친밀도 100 달성)
    if (newIntimacy === 100 && !state.friends.includes(characterId)) {
      set({
        friends: [...state.friends, characterId],
        messages: [
          ...get().messages,
          {
            type: "system",
            content: `${character.name}와(과) 친구가 되었습니다! 🎉`,
            timestamp: Date.now(),
          },
        ],
      });
    }

    // 자동 진행 비활성화 시 종료
    if (!get().autoProgressEnabled) {
      return;
    }

    // 스토리 자동 진행 체크 (대화 기반 장면 전환)
    const updatedState = get();

    // 유리와 충분히 대화 후 지호 만남
    if (
      updatedState.storySequenceIndex === 1 &&
      characterId === "yuri" &&
      updatedState.intimacy.yuri >= 10
    ) {
      setTimeout(() => {
        get().addMessage({
          type: "system",
          content: "유리와의 대화가 즐거웠습니다. 이제 점심시간이 되었네요.",
        });
        setTimeout(() => get().progressStory(), 2000);
      }, 2000);
    }
    // 지호와 충분히 대화 후 세연 만남
    else if (
      updatedState.storySequenceIndex === 2 &&
      characterId === "jiho" &&
      updatedState.intimacy.jiho >= 10
    ) {
      setTimeout(() => {
        get().addMessage({
          type: "system",
          content:
            "지호와 즐거운 점심시간을 보냈습니다. 방과 후 도서관에 가볼까요?",
        });
        setTimeout(() => get().progressStory(), 2000);
      }, 2000);
    }
    // 세연과 충분히 대화 후 시간 경과
    else if (
      updatedState.storySequenceIndex === 3 &&
      characterId === "seyeon" &&
      updatedState.intimacy.seyeon >= 10
    ) {
      setTimeout(() => {
        get().addMessage({
          type: "system",
          content: "세연과의 관계가 많이 가까워졌습니다.",
        });
        setTimeout(() => get().progressStory(), 2000);
      }, 2000);
    }
    // 전체 친밀도 기준 스토리 진행
    else if (updatedState.storySequenceIndex === 4) {
      const totalIntimacy =
        updatedState.intimacy.yuri +
        updatedState.intimacy.jiho +
        updatedState.intimacy.seyeon;
      if (totalIntimacy >= 120) {
        // 평균 40 이상
        setTimeout(() => {
          get().addMessage({
            type: "system",
            content:
              "친구들과의 관계가 깊어졌습니다. 축제 시즌이 다가오고 있습니다.",
          });
          setTimeout(() => get().progressStory(), 2000);
        }, 2000);
      }
    } else if (updatedState.storySequenceIndex === 5) {
      const totalIntimacy =
        updatedState.intimacy.yuri +
        updatedState.intimacy.jiho +
        updatedState.intimacy.seyeon;
      if (totalIntimacy >= 200) {
        // 평균 66 이상
        setTimeout(() => {
          get().addMessage({
            type: "system",
            content:
              "소중한 추억들이 쌓였습니다. 이제 졸업이 다가오고 있습니다.",
          });
          setTimeout(() => get().progressStory(), 2000);
        }, 2000);
      }
    }
  },

  // 메시지 추가
  addMessage: (message) => {
    set({
      messages: [...get().messages, { ...message, timestamp: Date.now() }],
    });
  },

  // 사용자 대화 기록 추가
  addConversationHistory: (entry) => {
    set({
      conversationHistory: [
        ...get().conversationHistory,
        {
          ...entry,
          timestamp: Date.now(),
        },
      ],
    });
  },

  // 나레이션 제거 (클릭으로 넘기기)
  removeMessage: (timestamp) => {
    const state = get();
    const message = state.messages.find((msg) => msg.timestamp === timestamp);

    set({
      messages: state.messages.filter((msg) => msg.timestamp !== timestamp),
    });

    // 클릭 대기 중이었다면 다음 단계 진행
    if (message && message.requiresClick && state.waitingForClick) {
      set({ waitingForClick: false });

      // 캐릭터가 아직 없는 경우 (첫 나레이션) - 유리 만남
      if (
        message.type === "narration" &&
        !state.currentCharacter &&
        state.storySequenceIndex === 1
      ) {
        setTimeout(() => {
          get().meetCharacter("yuri");
        }, 500);
      }
      // 캐릭터 만남 후 대사 표시
      else if (message.type === "narration" && state.currentCharacter) {
        const character = CHARACTERS[state.currentCharacter];
        if (
          character &&
          state.metCharacters.includes(state.currentCharacter) &&
          state.messages.filter((m) => m.character === state.currentCharacter)
            .length === 0
        ) {
          setTimeout(() => {
            get().showCharacterDialogue(state.currentCharacter);
          }, 500);
        }
      }
      // 캐릭터 대사 후 힌트 표시
      else if (message.type === "character" && message.character) {
        setTimeout(() => {
          get().showHint(message.character);
        }, 500);
      }
    }
  },

  // 호감도 UI 표시
  showIntimacyNotification: () => {
    const state = get();

    // 기존 타이머 제거
    if (state.intimacyUITimer) {
      clearTimeout(state.intimacyUITimer);
    }

    set({ showIntimacyUI: true });

    // 3초 후 자동 숨김
    const timer = setTimeout(() => {
      set({ showIntimacyUI: false, intimacyUITimer: null });
    }, 3000);

    set({ intimacyUITimer: timer });
  },

  // 호감도 UI 토글
  toggleIntimacyUI: () => {
    const state = get();

    if (state.intimacyUITimer) {
      clearTimeout(state.intimacyUITimer);
      set({ intimacyUITimer: null });
    }

    set({ showIntimacyUI: !state.showIntimacyUI });
  },

  // 스토리 단계 진행
  advanceStoryPhase: () => {
    const state = get();
    const phases = Object.values(STORY_PHASES);
    const currentIndex = phases.indexOf(state.storyPhase);

    if (currentIndex < phases.length - 1) {
      const newPhase = phases[currentIndex + 1];
      set({ storyPhase: newPhase });

      // 단계별 내레이션
      const narrations = {
        [STORY_PHASES.DEVELOPMENT]:
          "한 달이 지났습니다. 학교 생활에도 익숙해지고, 새로운 친구들과의 관계도 조금씩 깊어지고 있습니다.",
        [STORY_PHASES.CLIMAX]:
          "5월, 학교 축제와 수학여행 시즌입니다. 친구들과의 관계가 더욱 깊어지는 중요한 시기입니다.",
        [STORY_PHASES.ENDING]:
          "2월, 졸업식이 다가옵니다. 그동안 쌓아온 우정의 결실을 맺을 시간입니다.",
      };

      if (narrations[newPhase]) {
        get().addMessage({
          type: "narration",
          content: narrations[newPhase],
        });
      }
    }
  },

  // 게임 종료
  endGame: () => {
    set({ gamePhase: "ending" });
  },

  // 게임 리셋
  resetGame: () => {
    const state = get();
    if (state.intimacyUITimer) {
      clearTimeout(state.intimacyUITimer);
    }

    set({
      gamePhase: "onboarding",
      storyPhase: STORY_PHASES.INTRO,
      intimacy: { yuri: 0, jiho: 0, seyeon: 0 },
      currentCharacter: null,
      messages: [],
      conversationHistory: [],
      metCharacters: [],
      friends: [],
      triggeredEvents: [],
      storySequenceIndex: 0,
      waitingForClick: false,
      showIntimacyUI: false,
      intimacyUITimer: null,
    });
  },
}));

export default useGameStore;
