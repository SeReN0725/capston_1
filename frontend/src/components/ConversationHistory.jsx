import React, { useState } from 'react';
import useGameStore, { CHARACTERS } from '../store/gameStore';

const ConversationHistory = () => {
  const { conversationHistory } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 토글 버튼 - 좌상단 모서리 (항상 표시) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all hover:scale-105"
        title="대화 기록"
      >
        📝
      </button>

      {/* 대화 기록 패널 */}
      {isOpen && conversationHistory.length > 0 && (
        <div className="fixed left-4 top-20 z-50 w-96 max-h-[70vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h3 className="font-bold text-lg">대화 기록</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>

          {/* 대화 목록 */}
          <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-4 space-y-3">
            {conversationHistory.map((entry, index) => {
              const character = entry.character ? CHARACTERS[entry.character] : null;
              const isUser = entry.type === 'user';

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {/* 발신자 정보 */}
                    {!isUser && character && (
                      <div className="flex items-center gap-2 px-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: character.color }}
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {character.name}
                        </span>
                      </div>
                    )}

                    {/* 메시지 버블 */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isUser
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      style={{
                        borderBottomLeftRadius: isUser ? '1rem' : '0.25rem',
                        borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
                      }}
                    >
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                    </div>

                    {/* 입력 방식 표시 */}
                    {isUser && entry.inputMethod && (
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs text-gray-400">
                          {entry.inputMethod === 'voice' ? '🎤 음성' : '⌨️ 텍스트'}
                        </span>
                      </div>
                    )}

                    {/* 시간 표시 */}
                    <div className="px-2">
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationHistory;
