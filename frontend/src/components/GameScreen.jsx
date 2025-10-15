import React, { useState, useRef, useEffect } from "react";
import useGameStore, { CHARACTERS } from "../store/gameStore";
import {
  generateAIResponse,
  speechToText,
  textToSpeech,
} from "../services/aiService";
import NarrationBox from "./NarrationBox";
import ConversationHistory from "./ConversationHistory";

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
  const [showHint, setShowHint] = useState(true);
  const [inputMethod, setInputMethod] = useState("text"); // 'text' or 'voice'
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 배경 이미지 결정
  const getBackground = () => {
    if (!currentCharacter) return "/backgrounds/classroom.jpg";
    if (currentCharacter === "yuri") return "/backgrounds/classroom.jpg";
    if (currentCharacter === "jiho") return "/backgrounds/cafeteria.svg";
    if (currentCharacter === "seyeon") return "/backgrounds/library.svg";
    return "/backgrounds/classroom.jpg";
  };

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setShowHint(false);

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

  // 현재 대화 메시지 가져오기 (내레이션 제외)
  const getCurrentDialogue = () => {
    const dialogueMessages = messages.filter(
      (msg) =>
        msg.type === "character" || msg.type === "user" || msg.type === "hint"
    );
    return dialogueMessages[dialogueMessages.length - 1];
  };

  // 사용자 입력 가능 여부 체크
  const canUserInput = () => {
    // 힌트가 표시되었거나, 캐릭터 대화가 있고 힌트가 없는 경우
    const hasHint = messages.some((msg) => msg.type === "hint");
    const hasCharacterDialogue = messages.some(
      (msg) => msg.type === "character"
    );
    return hasHint || (hasCharacterDialogue && currentCharacter);
  };

  const currentDialogue = getCurrentDialogue();
  const character = currentCharacter ? CHARACTERS[currentCharacter] : null;
  const inputEnabled = canUserInput();

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

      {/* 상단 우측 버튼들 - 비주얼 노벨 스타일 */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {/* 저장 버튼 */}
        <button
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm"
          title="저장"
        >
          💾 저장
        </button>
        {/* 불러오기 버튼 */}
        <button
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm"
          title="불러오기"
        >
          📂 불러오기
        </button>
        {/* 타이틀로 버튼 */}
        <button
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm"
          title="타이틀로"
        >
          🏠 타이틀로
        </button>
        {/* 설정 버튼 */}
        <button
          onClick={toggleIntimacyUI}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm"
          title="설정"
        >
          ⚙️ 설정
        </button>
      </div>

      {/* 상단 UI - 호감도 표시 (자동 숨김) - 대화 기록 버튼 아래 */}
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

      {/* 캐릭터 이미지 (중앙, 전체 높이) */}
      {character && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-full w-auto z-20 animate-fade-in">
          <div className="h-full w-auto flex items-end justify-center">
            {/* 캐릭터 이미지 또는 이모지 */}
            {character.id === "yuri" ? (
              <img
                src="/characters/yuri.jpg"
                alt="유리"
                className="h-full w-auto object-contain"
                style={{
                  maxHeight: "100%",
                  filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))",
                }}
              />
            ) : (
              <div
                className="text-center"
                style={{
                  fontSize: "20rem",
                  lineHeight: "1",
                  opacity: 0.95,
                  filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))",
                }}
              >
                {character.id === "jiho" ? "👦" : "👩"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 캐릭터 이름 박스 (좌측 상단) */}
      {character && (
        <div className="absolute left-8 top-[45%] z-30 animate-fade-in">
          <div className="bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-xl">
            <span className="text-white font-bold text-lg">
              {character.name}
            </span>
          </div>
        </div>
      )}

      {/* 대화 기록 컴포넌트 - 상단 버튼과 통합 */}
      <ConversationHistory />

      {/* 하단 대화창 - 비주얼 노벨 스타일 */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* 내레이션 표시 영역 */}
        <div className="px-8 pb-4">
          {messages.slice(-1).map((message, index) => {
            if (message.type === "narration") {
              return (
                <div
                  key={message.timestamp || index}
                  className="mb-4 animate-fade-in cursor-pointer transition-all"
                  onClick={() => handleNarrationClick(message.timestamp)}
                  title="클릭하여 넘기기"
                >
                  <div className="bg-black/50 backdrop-blur-sm text-white px-8 py-6 rounded-xl shadow-2xl max-w-5xl mx-auto border-2 border-white/20">
                    <p className="text-lg leading-relaxed whitespace-pre-line text-center">
                      {message.content}
                    </p>
                    <div className="flex justify-center mt-4">
                      <span className="text-white animate-bounce text-xl">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* 대화 박스 - 비주얼 노벨 스타일 */}
        {currentDialogue &&
          (currentDialogue.type === "character" ||
            currentDialogue.type === "hint") && (
            <div className="px-8 pb-6">
              <div
                className={`bg-white/85 backdrop-blur-sm shadow-2xl px-10 py-8 animate-slide-up transition-all max-w-5xl mx-auto rounded-xl border-4 ${
                  currentDialogue.type === "hint" || !inputEnabled
                    ? "cursor-pointer border-purple-400/50"
                    : "cursor-default border-pink-400/50"
                }`}
                onClick={() => {
                  if (currentDialogue.type === "hint" || !inputEnabled) {
                    handleNarrationClick(currentDialogue.timestamp);
                  }
                }}
                title={
                  currentDialogue.type === "hint" || !inputEnabled
                    ? "클릭하여 넘기기"
                    : ""
                }
              >
                {currentDialogue.type === "character" && character && (
                  <>
                    <p className="text-gray-800 text-xl leading-relaxed mb-4">
                      {currentDialogue.content}
                    </p>
                    {!inputEnabled && (
                      <div className="flex justify-end">
                        <span className="text-purple-400 animate-bounce text-xl">
                          ▼
                        </span>
                      </div>
                    )}
                  </>
                )}

                {currentDialogue.type === "hint" && (
                  <>
                    <p className="text-gray-600 text-base italic mb-3">
                      {currentDialogue.content}
                    </p>
                    <div className="flex justify-end">
                      <span className="text-purple-400 animate-bounce text-xl">
                        ▼
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        {/* 입력 영역 - 우측 하단 버튼 스타일 */}
        {currentCharacter && inputEnabled && (
          <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2">
            {/* 스킵 버튼 */}
            <button
              className="px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm text-gray-700"
              title="스킵"
            >
              ⏭️ 스킵
            </button>
            {/* 자동 버튼 */}
            <button
              className="px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm text-gray-700"
              title="자동"
            >
              ▶️ 자동
            </button>
            {/* 로그 버튼 */}
            <button
              className="px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 font-bold text-sm text-gray-700"
              title="로그"
            >
              📜 로그
            </button>
          </div>
        )}

        {/* 입력창 - 하단 중앙 (입력 가능할 때만) */}
        {currentCharacter && inputEnabled && (
          <div className="px-8 pb-6">
            <div className="max-w-5xl mx-auto flex gap-3 items-center">
              {/* 텍스트 입력 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    character ? `${character.name}에게 말을 걸어보세요...` : ""
                  }
                  className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg text-lg border-2 border-purple-300/50"
                  disabled={isLoading || isListening}
                />
                {isListening && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              {/* 음성 입력 버튼 */}
              <button
                onClick={handleVoiceInput}
                className={`w-14 h-14 rounded-xl shadow-lg flex items-center justify-center text-2xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse scale-110"
                    : "bg-white/90 hover:bg-white text-gray-700 hover:scale-105 border-2 border-purple-300/50"
                }`}
                disabled={isLoading}
                title="음성 입력"
              >
                🎤
              </button>

              {/* 전송 버튼 */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading || isListening}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 text-lg"
              >
                전송
              </button>
            </div>

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
        )}

        {/* 대화 대기 상태 */}
        {!currentCharacter && (
          <div className="bg-black/80 backdrop-blur-sm px-8 py-8 text-center">
            <p className="text-white text-lg">스토리가 진행 중입니다...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
