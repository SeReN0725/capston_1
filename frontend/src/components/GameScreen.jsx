import React, { useState, useEffect } from "react";
import useGameStore, { CHARACTERS } from "../store/gameStore";
import { generateAIResponse, speechToText } from "../services/aiService";
import { generateVisuals } from "../services/visualService";

const GameScreen = () => {
  const {
    currentCharacter,
    messages,
    intimacy,
    friends,
    storyPhase,
    showIntimacyUI,
    addMessage,
    addConversationHistory,
    removeMessage,
    increaseIntimacy,
    progressStory,
    toggleIntimacyUI,
    meetCharacter,
  } = useGameStore();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputMethod, setInputMethod] = useState("text"); // 'text' or 'voice'
  // 상황/행동 추가 입력칸
  const [situationInput, setSituationInput] = useState("");
  const [actionInput, setActionInput] = useState("");

  // 캐릭터 감지(행동/상황/메시지에서) 유틸
  const detectCharacterFromText = (text) => {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes("지호") || t.includes("jiho")) return "jiho";
    if (t.includes("유리") || t.includes("yuri")) return "yuri";
    if (t.includes("세연") || t.includes("seyeon") || t.includes("se-yeon") || t.includes("se yeon")) return "seyeon";
    return null;
  };

  // 배경 이미지 결정
  const getBackground = () => {
    if (!currentCharacter) return "/backgrounds/classroom.jpg";
    if (currentCharacter === "yuri") return "/backgrounds/classroom.jpg";
    if (currentCharacter === "jiho") return "/backgrounds/cafeteria.jpg";
    if (currentCharacter === "seyeon") return "/backgrounds/library.jpg";
    return "/backgrounds/classroom.jpg";
  };

  // 동적 비주얼 배경 상태
  const [bgUrl, setBgUrl] = useState(getBackground());
  useEffect(() => {
    setBgUrl(getBackground());
  }, [currentCharacter]);

  // 동적 캐릭터 이미지 URL (표정 포함)
  const [charUrl, setCharUrl] = useState(currentCharacter ? `/characters/${currentCharacter}.png` : null);
  useEffect(() => {
    setCharUrl(currentCharacter ? `/characters/${currentCharacter}.png` : null);
  }, [currentCharacter]);

  // 텍스트로 메시지 전송
  const handleSendMessageWithText = async (text, method = "text") => {
    const messageText = text || inputText.trim();
    if (!messageText || !currentCharacter || isLoading) return;

    const currentInputMethod = method || inputMethod;
    setInputText("");
    setIsLoading(true);

    // 사용자 메시지 추가
    addMessage({
      type: "user",
      content: messageText,
    });

    // 대화 기록에 추가 (사용자 입력)
    addConversationHistory({
      type: "user",
      content: messageText,
      inputMethod: currentInputMethod,
    });

    try {
      // 전환 의도 사전 감지: 행동/상황에서만 대상 캐릭터 추출
      const requestedSwitch =
        detectCharacterFromText(actionInput) ||
        detectCharacterFromText(situationInput);
      const activeCharacter =
        requestedSwitch && CHARACTERS[requestedSwitch]
          ? requestedSwitch
          : currentCharacter;

      // 유저 컨텍스트 구성 (상황/행동)
      const userContextParts = [];
      if (situationInput.trim()) userContextParts.push(`상황: ${situationInput.trim()}`);
      if (actionInput.trim()) userContextParts.push(`행동: ${actionInput.trim()}`);
      const userContext = userContextParts.join("\n");

      // 사전 전환: 현재 캐릭터와 다르면 먼저 만남 처리 (행동/상황 기반)
      if (requestedSwitch && requestedSwitch !== currentCharacter && CHARACTERS[requestedSwitch]) {
        meetCharacter(requestedSwitch);
      }

      // AI 응답 생성 전에 대화 히스토리 추출 (사용자/캐릭터 발화만)
      const characterMessages = messages.filter(
        (msg) => msg.type === "user" || msg.type === "character"
      );

      const { response, intimacyChange, situation, action, nextCharacter } = await generateAIResponse(
        activeCharacter,
        messageText,
        characterMessages,
        intimacy[activeCharacter],
        storyPhase,
        userContext
      );

      // 상황 나레이션이 있으면 먼저 추가 (클릭 필요)
      if (situation) {
        addMessage({
          type: "narration",
          content: situation,
          requiresClick: true,
        });
      }

      const contentWithAction = action ? `${response} (${action})` : response;

      // AI 응답 추가 (행동 포함)
      addMessage({
        type: "character",
        character: activeCharacter,
        content: contentWithAction,
      });

      // 대화 기록에 추가 (캐릭터 응답, 행동 포함)
      addConversationHistory({
        type: "character",
        character: activeCharacter,
        content: contentWithAction,
      });

      // 친밀도 증가
      increaseIntimacy(activeCharacter, intimacyChange);

      // API가 제안한 캐릭터 전환(nextCharacter)은 즉시 적용하지 않음 (사용자 의도 기반으로만 전환)
      // if (nextCharacter && nextCharacter !== activeCharacter && CHARACTERS[nextCharacter]) {
      //   meetCharacter(nextCharacter);
      // }

      // 상황/행동 입력은 일회성으로 초기화
      setSituationInput("");
      setActionInput("");

      // 비주얼 결정 AI 호출 및 적용
      try {
        const visuals = await generateVisuals({
          currentCharacter: activeCharacter,
          nextCharacter,
          situation,
          action,
          speech: response,
          persona: CHARACTERS[activeCharacter]?.persona,
        });
        if (visuals?.backgroundUrl) {
          setBgUrl(visuals.backgroundUrl);
        }
        // 캐릭터 전환은 사용자의 행동/상황 의도에만 반응
        const effectiveCharacter = activeCharacter;
        // 표정 기반 캐릭터 이미지 적용 (제안된 캐릭터가 현재와 다르면 무시)
        if (visuals?.characterUrl && (!visuals.characterId || visuals.characterId === effectiveCharacter)) {
          setCharUrl(visuals.characterUrl);
        } else {
          setCharUrl(`/characters/${effectiveCharacter}.png`);
        }
      } catch (e) {
        // ignore visual errors and keep default background/character image
        console.warn('visuals error', e?.message || e);
        setCharUrl(activeCharacter ? `/characters/${activeCharacter}.png` : null);
      }
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      addMessage({
        type: "system",
        content: "응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
      setInputMethod("text");
    }
  };

  // Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setInputMethod("text");
      handleSendMessage();
    }
  };

  // 나레이션 클릭 핸들러
  const handleNarrationClick = (timestamp) => {
    removeMessage(timestamp);
  };

  // 메시지 전송 버튼 핸들러 (재추가)
  const handleSendMessage = () => {
    handleSendMessageWithText(inputText);
  };

  // 음성 입력 핸들러 (재추가)
  const handleVoiceInput = async () => {
    if (isListening || isLoading || !currentCharacter) return;

    setIsListening(true);
    setInputMethod("voice");
    try {
      const transcript = await speechToText();
      setInputText(transcript);
      setIsListening(false);

      // 음성 인식 후 자동으로 메시지 전송
      if (transcript.trim()) {
        setTimeout(() => {
          handleSendMessageWithText(transcript, "voice");
        }, 300);
      }
    } catch (error) {
      console.error("음성 인식 오류:", error);
      setIsListening(false);
      setInputMethod("text");
      alert(error.message || "음성 인식에 실패했습니다. 텍스트로 입력해주세요.");
    }
  };

  const character = currentCharacter ? CHARACTERS[currentCharacter] : null;

  const latestBlockingMessage = [...messages].reverse().find((m) => m.requiresClick);
  const latestMessage = latestBlockingMessage || messages.slice(-1)[0];
  const latestNarrationMsg = [...messages].reverse().find((m) => m.type === "narration" && m.requiresClick);
  const latestNarrationIndex = latestNarrationMsg ? messages.lastIndexOf(latestNarrationMsg) : -1;
  const latestCharacterMsgOverall = [...messages].reverse().find((m) => m.type === "character");
  const latestCharacterMsgAfterNarration = latestNarrationMsg
    ? [...messages.slice(latestNarrationIndex + 1)]
        .reverse()
        .find((m) => m.type === "character")
    : null;
  const isNarration = latestMessage?.type === "narration";
  const isHint = latestMessage?.type === "hint";
  const isCharacter = latestMessage?.type === "character";
  const canClick = Boolean(latestNarrationMsg);
  const showCharacterMsg = canClick ? latestCharacterMsgAfterNarration : latestCharacterMsgOverall;

  // NEW: 현재 표시할 캐릭터/콘텐츠스 메시지 타입에 맞게 결정
  const displayedCharacterId = isNarration
    ? (showCharacterMsg?.character || null)
    : isHint
      ? currentCharacter
      : isCharacter
        ? latestMessage?.character
        : null;

  const displayedContent = isNarration
    ? (showCharacterMsg?.content || null)
    : isHint
      ? latestMessage?.content
      : isCharacter
        ? latestMessage?.content
        : null;

  // 입력창 렌더링 (중복 제거)
  const renderInputSection = () => (
    <div className="flex gap-3 items-center max-w-5xl mx-auto">
      {/* 상황/행동 입력칸 */}
      <input
        type="text"
        value={situationInput}
        onChange={(e) => setSituationInput(e.target.value)}
        placeholder="상황 설명 (선택)"
        className="w-56 px-4 py-3 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm font-light rounded-lg"
        disabled={isLoading || isListening}
        title="현재 장면/상황 설명"
      />
      <input
        type="text"
        value={actionInput}
        onChange={(e) => setActionInput(e.target.value)}
        placeholder="행동 (선택)"
        className="w-40 px-4 py-3 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm font-light rounded-lg"
        disabled={isLoading || isListening}
        title="내가 하고 싶은 행동"
      />
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          currentCharacter ? `${CHARACTERS[currentCharacter].name}에게 말을 걸어보세요...` : ""
        }
        className="flex-1 px-6 py-4 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 text-base font-light rounded-lg"
        disabled={isLoading || isListening}
      />
      <button
        onClick={handleVoiceInput}
        className={`px-5 py-4 transition-all rounded-lg text-xl ${
          isListening ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"
        }`}
        disabled={isLoading}
        title="음성 입력"
      >
        🎤
      </button>
      <button
        onClick={handleSendMessage}
        className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white rounded-lg text-base"
        disabled={isLoading || !currentCharacter}
        title="메시지 전송"
      >
        보내기
      </button>
    </div>
  );

  // 우측 메뉴 버튼 렌더링 (중복 제거)
  const renderMenuButtons = () => (
    <div className="absolute top-0 right-0 flex flex-col gap-3 items-end pr-6">
      <button
        className="text-white hover:text-white/80 transition-colors text-sm font-normal tracking-wider drop-shadow-lg"
        title="저장"
      >
        SAVE
      </button>
      <button
        className="text-white hover:text-white/80 transition-colors text-sm font-normal tracking-wider drop-shadow-lg"
        title="불러오기"
      >
        LOAD
      </button>
      <button
        onClick={toggleIntimacyUI}
        className="text-white hover:text-white/80 transition-colors text-sm font-normal tracking-wider drop-shadow-lg"
        title="설정"
      >
        CONFIG
      </button>
      <button
        className="text-white hover:text-white/80 transition-colors text-sm font-normal tracking-wider drop-shadow-lg"
        title="타이틀로"
      >
        BACK TO TITLE
      </button>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경/캐릭터 이미지 렌더링과 하단 박스는 기존 로직 유지 (표시 캐릭터/콘텐츠 계산 부분은 앞에서 수정) */}
      {/* 배경 이미지 */}
      <img
        src={bgUrl}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85)" }}
      />

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 캐릭터 이미지 - 중앙 */}
      {currentCharacter && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <img
            src={charUrl || `/characters/${currentCharacter}.png`}
            alt={character?.name}
            className="h-[85vh] object-contain drop-shadow-2xl"
            onError={(e) => { e.currentTarget.src = `/characters/${currentCharacter}.png`; }}
          />
        </div>
      )}

      {/* 호감도 UI - CONFIG 버튼으로 토글 */}
      <div
        className={`absolute top-20 left-4 z-50 bg-white/95 rounded-2xl shadow-2xl p-4 backdrop-blur-md transition-all duration-500 ${
          showIntimacyUI
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💖</span>
            <span className="text-sm font-bold text-gray-700">호감도</span>
          </div>
          <span className="text-xs text-gray-500">친구 {friends.length}/3</span>
        </div>
        <div className="space-y-3">
          {Object.entries(CHARACTERS).map(([id, char]) => (
            <div key={id} className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 w-12">
                {char.name}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${intimacy[id]}%`,
                    background: `linear-gradient(90deg, ${char.color}dd, ${char.color})`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">
                {intimacy[id]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 통합 텍스트 박스 - 비주얼 노벨 스타일 */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* 최신 메시지 표시 (나레이션, 대화, 힌트 통합) */}
        {latestMessage && (isNarration || isHint || isCharacter) ? (
          <div
            className={`bg-black/65 backdrop-blur-sm px-20 py-8 ${
              canClick ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => {
              if (canClick && latestNarrationMsg) {
                removeMessage(latestNarrationMsg.timestamp);
              }
            }}
            title={canClick ? "클릭하여 넘기기" : ""}
          >
            <div className="relative min-h-[120px]">
              {/* 중앙 텍스트 영역 */}
              <div className="text-center max-w-5xl mx-auto">
                {/* 캐릭터 이름 (표시할 캐릭터가 있을 때만) */}
                {displayedCharacterId && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-white text-base drop-shadow-lg">◆</span>
                    <span className="text-white font-medium text-lg tracking-widest drop-shadow-lg">
                      {CHARACTERS[displayedCharacterId]?.name}
                    </span>
                    <span className="text-white text-base drop-shadow-lg">◆</span>
                  </div>
                )}

                {/* 텍스트 내용: 나레이션(있으면) + 캐릭터/힌트 콘텐츠 */}
                {latestNarrationMsg && (
                  <p
                    className={`text-white text-lg leading-loose font-normal drop-shadow-lg mb-3 whitespace-pre-line`}
                  >
                    {latestNarrationMsg.content}
                  </p>
                )}
                {displayedContent && (
                  <p
                    className={`text-white text-lg leading-loose font-normal drop-shadow-lg mb-4 ${
                      isHint ? "italic" : ""
                    }`}
                  >
                    {displayedContent}
                  </p>
                )}

                {/* 진행 표시 */}
                <div className="flex justify-center mt-2">
                  <span className="text-white text-2xl drop-shadow-lg">▼</span>
                </div>
              </div>

              {/* 우측 메뉴 버튼들 */}
              {renderMenuButtons()}
            </div>

            {/* 하단 입력창 */}
            <div className="mt-4 pt-4 border-t border-white/20">
              {renderInputSection()}
            </div>
          </div>
        ) : currentCharacter ? (
          <div className="bg-black/65 backdrop-blur-sm px-20 py-10">
            {renderInputSection()}

            {/* 로딩 표시 */}
            {isLoading && (
              <div className="text-center mt-3">
                <div className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GameScreen;
