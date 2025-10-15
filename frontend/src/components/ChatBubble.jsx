import React from 'react';
import { CHARACTERS } from '../store/gameStore';

const ChatBubble = ({ message }) => {
  const isUser = message.type === 'user';
  const character = message.character ? CHARACTERS[message.character] : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* 캐릭터 아바타 (왼쪽) */}
        {!isUser && character && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {character.name[0]}
          </div>
        )}

        {/* 메시지 버블 */}
        <div className="flex flex-col">
          {!isUser && character && (
            <div className="text-xs text-gray-500 mb-1 ml-2">{character.name}</div>
          )}
          <div
            className={`chat-bubble ${
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
            style={{
              borderBottomLeftRadius: isUser ? '1rem' : '0.25rem',
              borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
            }}
          >
            {message.content}
          </div>
        </div>

        {/* 사용자 아바타 (오른쪽) */}
        {isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            나
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
