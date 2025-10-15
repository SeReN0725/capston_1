import React from 'react';
import useGameStore, { CHARACTERS } from '../store/gameStore';

const CharacterSelector = () => {
  const { currentCharacter, metCharacters, meetCharacter } = useGameStore();

  const handleSelectCharacter = (characterId) => {
    meetCharacter(characterId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">친구 선택 👥</h3>
      <div className="space-y-3">
        {Object.entries(CHARACTERS).map(([id, char]) => {
          const isActive = currentCharacter === id;
          const hasMet = metCharacters.includes(id);

          return (
            <button
              key={id}
              onClick={() => handleSelectCharacter(id)}
              className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : hasMet
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-2 border-dashed border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {id === 'yuri' ? '👧' : id === 'jiho' ? '👦' : '👩'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{char.name}</div>
                  <div className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                    {char.mbti} · {char.description.split(',')[0]}
                  </div>
                </div>
                {!hasMet && (
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    새로운 친구
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>팁:</strong> 각 캐릭터를 클릭하여 대화를 시작하세요!
        </p>
      </div>
    </div>
  );
};

export default CharacterSelector;
