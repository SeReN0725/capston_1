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
${context ? `- **상황/행동 입력**: ${context}` : ''}

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
export const generateAIResponse = async (character, userMessage, conversationHistory, intimacy, storyPhase, userContext = '') => {
  try {
    const systemPrompt = generateSystemPrompt(character, intimacy, storyPhase, userContext);

    // 간단한 시나리오 컨텍스트 구성 (최근 대화 일부 + 스토리 단계 + 사용자 상황/행동)
    const recentContext = conversationHistory
      .slice(-6)
      .map(m => `${m.type === 'user' ? '유저' : '캐릭터'}: ${m.content}`)
      .join('\n');
    const scenario = `스토리 단계: ${storyPhase}\n캐릭터: ${CHARACTERS[character]?.name || character}\n최근 대화:\n${recentContext}${userContext ? `\n\n유저 상황/행동:\n${userContext}` : ''}`;

    const data = await askAI(userMessage, { persona: systemPrompt, scenario });
    const aiSpeech = data?.speech || data?.answer || '대답을 가져오지 못했어요. 다시 시도해볼까?';

    // 친밀도 변화 계산 (캐릭터별 차등 적용)
    const intimacyChange = calculateIntimacyChange(userMessage, aiSpeech, character);

    // 사용자 입력 기반 캐릭터 감지 폴백
    const detectNextCharacterFromText = (text) => {
      if (!text) return null;
      const t = text.toLowerCase();
      if (t.includes('지호') || t.includes('jiho')) return 'jiho';
      if (t.includes('유리') || t.includes('yuri')) return 'yuri';
      if (t.includes('세연') || t.includes('seyeon') || t.includes('se-yeon') || t.includes('se yeon')) return 'seyeon';
      return null;
    };

    const nextFromAI = data?.nextCharacter || null;
    const nextFromContext = detectNextCharacterFromText(userContext) || detectNextCharacterFromText(userMessage);
    const nextCharFinal = nextFromAI || nextFromContext;

    return {
      response: aiSpeech,
      intimacyChange,
      situation: data?.situation || '',
      action: data?.action || '',
      nextCharacter: nextCharFinal,
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

// 간단한 친밀도 변화 계산 (키워드 기반)
export const calculateIntimacyChange = (userMessage, aiMessage, character) => {
  const base = 3;
  const positiveKeywords = ['고마워', '좋아', '재밌', '멋있', '대단', '최고', '응원'];
  const negativeKeywords = ['싫어', '무서', '짜증', '화나', '지루', '실망'];

  let change = base;
  const msg = `${userMessage} ${aiMessage}`.toLowerCase();
  positiveKeywords.forEach(k => { if (msg.includes(k)) change += 2; });
  negativeKeywords.forEach(k => { if (msg.includes(k)) change -= 2; });

  // 캐릭터별 가중치
  if (character === 'yuri') change += 1; // 얘기 길수록 점수 조금 더
  if (character === 'jiho') change += 0; // 기본값 유지
  if (character === 'seyeon') change -= 1; // 처음엔 조금 엄격

  return Math.max(1, change);
};

// STT: 침묵 감지 기반 음성 입력
export const speechToText = async () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('이 브라우저는 음성 인식을 지원하지 않습니다.');
  }

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let silenceTimer = null;

    const SILENCE_DELAY = 900; // ms

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // 침묵 감지 → 자동 종료
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (interimTranscript.trim().length === 0) {
        silenceTimer = setTimeout(() => {
          try { recognition.stop(); } catch (_) {}
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
        reject(new Error('음성이 인식되지 않았습니다. 다시 시도해주세요.'));
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
