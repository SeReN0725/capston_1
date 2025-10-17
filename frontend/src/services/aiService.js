import { CHARACTERS } from '../store/gameStore';
import { askAI } from './aiClient';

// 백엔드 API 설정 (Vite 프록시로 연결)


// 캐릭터별 시스템 프롬프트 생성
const generateSystemPrompt = (character, intimacy, storyPhase, context = '') => {
  const char = CHARACTERS[character];
  
  const intimacyLevel = intimacy < 30 ? '낯선 사이' : intimacy < 60 ? '알아가는 사이' : intimacy < 90 ? '친한 친구' : '매우 친밀한 친구';
  
  const characterDetails = {
    yuri: {
      background: '책을 좋아하고 성적이 우수한 모범생입니다. 반장 후보로 추천받았지만 부담스러워합니다. 조용하지만 누군가 도움이 필요하면 먼저 다가갑니다.',
      interests: '독서, 공부, 조용한 카페, 클래식 음악',
      fears: '사람들 앞에서 발표하기, 기대에 못 미칠까 봐 걱정',
      conversationStyle: '차분하고 정중하게 말하며, "~요", "~죠", "~네요" 같은 존댓말을 사용합니다. 상대방의 말을 경청하고 공감하는 반응을 보입니다.',
      firstMeetingTone: '조심스럽지만 친절하게 대합니다.'
    },
    jiho: {
      background: '농구부 소속으로 활발하고 사교적입니다. 항상 웃는 얼굴로 주변 사람들에게 긍정적인 에너지를 줍니다. 친구들과 함께 있는 것을 가장 좋아합니다.',
      interests: '농구, 운동, 게임, 친구들과 놀기, 음악 듣기',
      fears: '혼자 있는 것, 친구들이 자신을 싫어할까 봐 걱정',
      conversationStyle: '밝고 친근하게 말하며, "~지?", "~야", "ㅋㅋ", "와!", "대박!" 같은 표현을 자주 씁니다. 감탄사와 이모티콘을 자연스럽게 사용합니다.',
      firstMeetingTone: '먼저 다가가서 친근하게 말을 겁니다.'
    },
    seyeon: {
      background: '전교 1등을 놓치지 않는 천재입니다. 독서 동아리 회장이며 과학 올림피아드 준비 중입니다. 겉으로는 차가워 보이지만 정의감이 강합니다.',
      interests: '과학, 철학, 논리 퍼즐, 체스, 고전 문학',
      fears: '자신의 약점을 드러내는 것, 감정적으로 보이는 것',
      conversationStyle: '간결하고 논리적으로 말하며, "~다", "~군", "~구나" 같은 평서형 어미를 사용합니다. 처음에는 무뚝뚝하지만 친해지면 따뜻한 면을 보입니다.',
      firstMeetingTone: '관심 없는 척하지만 대화 내용은 주의 깊게 듣습니다.'
    }
  };
  
  const details = characterDetails[character];
  
  return `당신은 한국 고등학교 3학년 학생 "${char.name}"입니다. 실제 고등학생처럼 자연스럽고 생동감 있게 대화하세요.

## 캐릭터 프로필
- **이름**: ${char.name}
- **MBTI**: ${char.mbti}
- **성격**: ${char.personality}
- **배경**: ${details.background}
- **관심사**: ${details.interests}
- **고민/두려움**: ${details.fears}

## 현재 상황
- **친밀도**: ${intimacy}/100 (${intimacyLevel})
- **스토리 단계**: ${storyPhase === 'intro' ? '첫 만남' : storyPhase === 'development' ? '관계 발전' : storyPhase === 'climax' ? '중요한 시기' : '졸업 전'}
${context ? `- **상황 맥락**: ${context}` : ''}

## 대화 스타일
${details.conversationStyle}

${details.firstMeetingTone}

## 중요한 연기 지침
1. **사용자의 말을 깊이 이해하고 반응하세요**: 단순한 응답이 아닌, 상대방의 감정과 의도를 파악하여 공감하거나 적절히 반응하세요.

2. **친밀도에 따라 태도를 변화시키세요**:
   - 0-30: ${character === 'jiho' ? '밝지만 아직 서먹함' : character === 'yuri' ? '정중하고 조심스러움' : '무관심하거나 짧게 대답'}
   - 31-60: ${character === 'jiho' ? '편하게 농담도 하고 같이 놀자고 제안' : character === 'yuri' ? '조금씩 마음을 열고 개인적인 이야기도 함' : '관심을 보이기 시작하고 질문도 함'}
   - 61-90: ${character === 'jiho' ? '진짜 친구처럼 고민도 털어놓고 같이 있고 싶어함' : character === 'yuri' ? '따뜻하게 걱정해주고 먼저 연락하고 싶어함' : '솔직한 감정을 표현하고 의지함'}
   - 91-100: ${character === 'jiho' ? '가장 소중한 친구, 졸업 후에도 계속 연락하고 싶음' : character === 'yuri' ? '평생 친구로 남고 싶다는 마음을 표현' : '자신의 약점까지 보여주며 신뢰함'}

3. **자연스러운 고등학생 대화**: 교과서적이지 않고, 실제 10대 후반 학생처럼 말하세요. 유행어나 줄임말도 캐릭터에 맞게 사용하세요.

4. **상황에 맞는 반응**: 질문에는 답하고, 칭찬에는 기뻐하고, 위로가 필요하면 공감하세요. 대화의 흐름을 이어가세요.

5. **응답 길이**: 1-3문장으로 간결하게, 하지만 의미 있게 답하세요.

6. **감정 표현**: ${character === 'jiho' ? '이모티콘이나 감탄사를 자주 사용' : character === 'yuri' ? '부드러운 이모지를 가끔 사용' : '이모지는 거의 사용하지 않음'}

지금부터 ${char.name}의 입장에서 진심으로 대화하세요. 상대방의 말을 이해하고, ${char.name}라면 어떻게 반응할지 생각하며 답하세요.`;
};

// AI 응답 생성
export const generateAIResponse = async (character, userMessage, conversationHistory, intimacy, storyPhase) => {
  try {
    const systemPrompt = generateSystemPrompt(character, intimacy, storyPhase);

    // 간단한 시나리오 컨텍스트 구성 (최근 대화 일부 + 스토리 단계)
    const recentContext = conversationHistory
      .slice(-6)
      .map(m => `${m.type === 'user' ? '유저' : '캐릭터'}: ${m.content}`)
      .join('\n');
    const scenario = `스토리 단계: ${storyPhase}\n캐릭터: ${CHARACTERS[character]?.name || character}\n최근 대화:\n${recentContext}`;

    const data = await askAI(userMessage, { persona: systemPrompt, scenario });
    const aiResponse = data?.answer || '대답을 가져오지 못했어요. 다시 시도해볼까?';

    // 친밀도 변화 계산 (캐릭터별 차등 적용)
    const intimacyChange = calculateIntimacyChange(userMessage, aiResponse, character);

    return {
      response: aiResponse,
      intimacyChange
    };

  } catch (error) {
    console.error('AI 응답 생성 오류:', error);
    
    // 폴백 응답
    const char = CHARACTERS[character];
    const fallbackResponses = {
      yuri: ['그렇군요. 더 이야기해 주실래요?', '흥미로운 이야기네요.', '저도 그렇게 생각해요.'],
      jiho: ['오, 그렇구나! 재밌는데?', '와, 대박! 더 얘기해줘!', '그거 좋은데? ㅎㅎ'],
      seyeon: ['흥미로운 관점이군.', '그렇게 생각할 수도 있겠어.', '논리적인 접근이야.']
    };
    
    const responses = fallbackResponses[character] || ['그렇군요.'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      response: randomResponse,
      intimacyChange: 3
    };
  }
};

// 캐릭터별 선호 키워드 및 성향
const CHARACTER_PREFERENCES = {
  yuri: {
    positive: ['책', '공부', '도서관', '조용', '차분', '진지', '성적', '시험', '과제', '열심', '노력', '계획'],
    negative: ['시끄', '파티', '술', '담배', '게임', '놀자'],
    personality: 'calm' // 차분한 대화 선호
  },
  jiho: {
    positive: ['농구', '운동', '게임', '재밌', '신나', '같이', '놀자', '친구', '파티', '축제', '웃', '즐거'],
    negative: ['공부', '조용', '지루', '심심', '혼자'],
    personality: 'energetic' // 활발한 대화 선호
  },
  seyeon: {
    positive: ['과학', '논리', '철학', '책', '연구', '실험', '지적', '흥미로', '분석', '이론', '생각'],
    negative: ['감정', '느낌', '별로', '시끄', '유치'],
    personality: 'intellectual' // 지적인 대화 선호
  }
};

// 친밀도 변화 계산 (캐릭터 성향별 차등 적용)
const calculateIntimacyChange = (userMessage, aiResponse, characterId) => {
  let change = 3; // 기본 친밀도 증가 (감소)
  
  const prefs = CHARACTER_PREFERENCES[characterId];
  if (!prefs) return change;
  
  const userLower = userMessage.toLowerCase();
  
  // 캐릭터 선호 키워드 체크
  const positiveMatches = prefs.positive.filter(keyword => userLower.includes(keyword)).length;
  const negativeMatches = prefs.negative.filter(keyword => userLower.includes(keyword)).length;
  
  // 선호 키워드 보너스 (각 키워드당 +2)
  change += positiveMatches * 2;
  
  // 비선호 키워드 페널티 (각 키워드당 -3)
  change -= negativeMatches * 3;
  
  // 공통 긍정 키워드
  const commonPositive = ['좋아', '고마워', '재밌', '멋져', '최고', '같이', '함께', '친구', '도와', '응원'];
  const commonNegative = ['싫어', '별로', '안 돼', '귀찮', '바빠', '관심없'];
  
  if (commonPositive.some(keyword => userLower.includes(keyword))) {
    change += 2;
  }
  
  if (commonNegative.some(keyword => userLower.includes(keyword))) {
    change -= 4;
  }
  
  // 메시지 길이에 따른 보너스 (관심도)
  if (userMessage.length > 50) {
    change += 3; // 긴 메시지는 진심이 담김
  } else if (userMessage.length > 30) {
    change += 1;
  } else if (userMessage.length < 10) {
    change -= 1; // 너무 짧은 메시지는 성의 없음
  }
  
  // 질문 포함 시 보너스 (관심 표현)
  if (userLower.includes('?') || userLower.includes('뭐') || userLower.includes('어떻') || 
      userLower.includes('왜') || userLower.includes('언제')) {
    change += 2;
  }
  
  // 캐릭터 성향별 추가 보너스
  switch (prefs.personality) {
    case 'calm': // 유리: 정중하고 차분한 대화 선호
      if (userMessage.includes('요') || userMessage.includes('습니다') || userMessage.includes('해요')) {
        change += 2; // 존댓말 사용
      }
      if (userMessage.includes('!') || userMessage.includes('ㅋ') || userMessage.includes('ㅎ')) {
        change -= 1; // 너무 들뜬 분위기
      }
      break;
      
    case 'energetic': // 지호: 활발하고 즐거운 대화 선호
      if (userMessage.includes('!') || userMessage.includes('ㅋ') || userMessage.includes('ㅎ')) {
        change += 2; // 밝은 분위기
      }
      if (userMessage.length < 15 && !userMessage.includes('!')) {
        change -= 1; // 너무 무뚝뚝함
      }
      break;
      
    case 'intellectual': // 세연: 논리적이고 지적인 대화 선호
      if (userMessage.includes('왜') || userMessage.includes('어떻게') || userMessage.includes('생각')) {
        change += 2; // 사고를 자극하는 질문
      }
      if (userMessage.includes('ㅋ') || userMessage.includes('ㅎ') || userMessage.includes('ㅠ')) {
        change -= 2; // 감정적인 표현
      }
      break;
  }
  
  return Math.max(1, Math.min(15, change)); // 최소 1, 최대 15
};

// STT (Speech to Text) - 개선된 버전 (말 끝 자동 감지)
export const speechToText = () => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('이 브라우저는 음성 인식을 지원하지 않습니다.'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.continuous = true; // 연속 인식 활성화
    recognition.interimResults = true; // 중간 결과 활성화
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let silenceTimer = null;
    const SILENCE_DELAY = 1500; // 1.5초 침묵 후 종료

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // 침묵 타이머 리셋
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // 말이 끝난 것으로 판단되면 자동 종료
      if (finalTranscript.trim()) {
        silenceTimer = setTimeout(() => {
          recognition.stop();
        }, SILENCE_DELAY);
      }
    };

    recognition.onend = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (finalTranscript.trim()) {
        resolve(finalTranscript.trim());
      } else {
        reject(new Error('음성이 인식되지 않았습니다.'));
      }
    };

    recognition.onerror = (event) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      
      // 음성이 없는 경우 에러가 아닌 것으로 처리
      if (event.error === 'no-speech') {
        reject(new Error('음성이 감지되지 않았습니다. 다시 시도해주세요.'));
      } else {
        reject(new Error(`음성 인식 오류: ${event.error}`));
      }
    };

    recognition.start();
  });
};

// TTS (Text to Speech)
export const textToSpeech = (text) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('이 브라우저는 음성 합성을 지원하지 않습니다.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
};
