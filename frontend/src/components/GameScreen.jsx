import React, { useState, useEffect } from "react";
import useGameStore, { CHARACTERS } from "../store/gameStore";
import { generateAIResponse, speechToText } from "../services/aiService";

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
  } = useGameStore();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputMethod, setInputMethod] = useState("text"); // 'text' or 'voice'

  // 배경 이미지 결정
  const getBackground = () => {
    if (!currentCharacter) return "/backgrounds/classroom.jpg";
    if (currentCharacter === "yuri") return "/backgrounds/classroom.jpg";
    if (currentCharacter === "jiho") return "/backgrounds/cafeteria.svg";
    if (currentCharacter === "seyeon") return "/backgrounds/library.svg";
    return "/backgrounds/classroom.jpg";
  };

  // 메시지 전송
  const handleSendMessage = () => {
    handleSendMessageWithText(inputText);
  };

  // 음성 입력 (자동 전송)
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
      alert(
        error.message || "음성 인식에 실패했습니다. 텍스트로 입력해주세요."
      );
    }
  };

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
      // AI 응답 생성
      const characterMessages = messages.filter(
        (msg) => msg.type === "user" || msg.type === "character"
      );

      const { response, intimacyChange } = await generateAIResponse(
        currentCharacter,
        messageText,
        characterMessages,
        intimacy[currentCharacter],
        storyPhase
      );

      // AI 응답 추가
      addMessage({
        type: "character",
        character: currentCharacter,
        content: response,
      });

      // 대화 기록에 추가 (캐릭터 응답)
      addConversationHistory({
        type: "character",
        character: currentCharacter,
        content: response,
      });

      // 친밀도 증가
      increaseIntimacy(currentCharacter, intimacyChange);
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

  const character = currentCharacter ? CHARACTERS[currentCharacter] : null;

  // 입력창 렌더링 (중복 제거)
  const renderInputSection = () => (
    <div className="flex gap-3 items-center max-w-5xl mx-auto">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          character ? `${character.name}에게 말을 걸어보세요...` : ""
        }
        className="flex-1 px-6 py-4 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 text-base font-light rounded-lg"
        disabled={isLoading || isListening}
      />
      <button
        onClick={handleVoiceInput}
        className={`px-5 py-4 transition-all rounded-lg text-xl ${
          isListening
            ? "bg-red-500 text-white"
            : "bg-white/20 hover:bg-white/30 text-white"
        }`}
        disabled={isLoading}
        title="음성 입력"
      >
        🎤
      </button>
      <button
        onClick={handleSendMessage}
        disabled={!inputText.trim() || isLoading || isListening}
        className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg text-base font-medium"
      >
        전송
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
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${getBackground()})`,
          filter: "brightness(0.85)",
        }}
      />

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 캐릭터 이미지 - 중앙 */}
      {currentCharacter && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <img
            src={`/characters/${currentCharacter}.png`}
            alt={character?.name}
            className="h-[85vh] object-contain drop-shadow-2xl"
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
        {(() => {
          const latestMessage = messages.slice(-1)[0];
          const isNarration = latestMessage?.type === "narration";
          const isHint = latestMessage?.type === "hint";
          const isCharacter = latestMessage?.type === "character";
          // 나레이션이나 힌트는 클릭 가능, 캐릭터 대화는 입력 후 넘어가므로 클릭 불가
          const canClick = isNarration || isHint;

          // 메시지가 있는 경우
          if (latestMessage && (isNarration || isHint || isCharacter)) {
            return (
              <div
                className={`bg-black/65 backdrop-blur-sm px-20 py-8 ${
                  canClick ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => {
                  if (canClick) {
                    handleNarrationClick(latestMessage.timestamp);
                  }
                }}
                title={canClick ? "클릭하여 넘기기" : ""}
              >
                <div className="relative min-h-[120px]">
                  {/* 중앙 텍스트 영역 */}
                  <div className="text-center max-w-5xl mx-auto">
                    {/* 캐릭터 이름 (캐릭터 대화일 때만) */}
                    {isCharacter && character && (
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-white text-base drop-shadow-lg">
                          ◆
                        </span>
                        <span className="text-white font-medium text-lg tracking-widest drop-shadow-lg">
                          {character.name}
                        </span>
                        <span className="text-white text-base drop-shadow-lg">
                          ◆
                        </span>
                      </div>
                    )}

                    {/* 텍스트 내용 */}
                    <p
                      className={`text-white text-lg leading-loose font-normal drop-shadow-lg mb-4 ${
                        isHint ? "italic" : ""
                      } ${isNarration ? "whitespace-pre-line" : ""}`}
                    >
                      {latestMessage.content}
                    </p>

                    {/* 진행 표시 */}
                    <div className="flex justify-center mt-2">
                      <span className="text-white text-2xl drop-shadow-lg">
                        ▼
                      </span>
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
            );
          }

          // 메시지가 없을 때
          if (currentCharacter) {
            return (
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
            );
          }

          return null;
        })()}
      </div>
    </div>
  );
};

export default GameScreen;
