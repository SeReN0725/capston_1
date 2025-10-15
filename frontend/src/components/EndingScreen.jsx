import React from 'react';
import useGameStore, { CHARACTERS } from '../store/gameStore';

const EndingScreen = () => {
  const { friends, intimacy, resetGame } = useGameStore();

  // 엔딩 타입 결정
  const getEndingType = () => {
    if (friends.length >= 3) return 'best';
    if (friends.length >= 2) return 'good';
    if (friends.length >= 1) return 'normal';
    return 'bad';
  };

  const endingType = getEndingType();

  const endingData = {
    best: {
      title: '베스트 엔딩 🏆',
      subtitle: '완벽한 학교 생활!',
      description: '축하합니다! 3명의 소중한 친구를 사귀었습니다. 고등학교 생활의 가장 아름다운 추억을 만들었네요. 졸업 후에도 이 우정이 계속되길 바랍니다!',
      bgColor: 'from-yellow-400 via-orange-400 to-pink-500',
      emoji: '🎊'
    },
    good: {
      title: '굿 엔딩 ✨',
      subtitle: '의미 있는 우정',
      description: '2명의 좋은 친구를 사귀었습니다. 비록 목표에는 조금 못 미쳤지만, 진정한 우정을 쌓았습니다. 이것만으로도 충분히 의미 있는 학교 생활이었어요!',
      bgColor: 'from-green-400 via-emerald-400 to-teal-500',
      emoji: '🌟'
    },
    normal: {
      title: '노멀 엔딩 💫',
      subtitle: '새로운 시작',
      description: '1명의 친구를 사귀었습니다. 비록 많은 친구를 사귀지는 못했지만, 한 명의 진실한 친구가 있다는 것은 큰 행운입니다. 앞으로 더 많은 기회가 있을 거예요!',
      bgColor: 'from-blue-400 via-cyan-400 to-sky-500',
      emoji: '🌈'
    },
    bad: {
      title: '배드 엔딩 😢',
      subtitle: '다시 도전해보세요',
      description: '아쉽게도 친구를 사귀지 못했습니다. 하지만 괜찮아요! 친구를 사귀는 것은 쉽지 않은 일이니까요. 다시 한 번 도전해서 더 적극적으로 대화해보는 건 어떨까요?',
      bgColor: 'from-gray-400 via-slate-400 to-zinc-500',
      emoji: '💭'
    }
  };

  const ending = endingData[endingType];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${ending.bgColor} flex items-center justify-center p-4`}>
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
        {/* 엔딩 타이틀 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{ending.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            {ending.title}
          </h1>
          <p className="text-xl text-gray-600">{ending.subtitle}</p>
        </div>

        {/* 엔딩 설명 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-gray-700 leading-relaxed text-center">
            {ending.description}
          </p>
        </div>

        {/* 친구 목록 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            사귄 친구들 ({friends.length}/3)
          </h2>
          
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {friends.map((friendId) => {
                const char = CHARACTERS[friendId];
                return (
                  <div
                    key={friendId}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 text-center"
                  >
                    <div className="text-5xl mb-3">
                      {friendId === 'yuri' ? '👧' : friendId === 'jiho' ? '👦' : '👩'}
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">
                      {char.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{char.mbti}</p>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      친밀도 {intimacy[friendId]}/100
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">아직 친구를 사귀지 못했습니다 😢</p>
              <p className="text-sm mt-2">다시 도전해보세요!</p>
            </div>
          )}
        </div>

        {/* 모든 캐릭터 친밀도 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 text-gray-800 text-center">
            최종 친밀도
          </h3>
          <div className="space-y-3">
            {Object.entries(CHARACTERS).map(([id, char]) => (
              <div key={id} className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{char.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
                      style={{ width: `${intimacy[id]}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600 w-12 text-right">
                    {intimacy[id]}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="flex-1 btn-primary text-lg py-4"
          >
            다시 하기 🔄
          </button>
        </div>

        {/* 메시지 */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>게임을 플레이해주셔서 감사합니다! 💕</p>
          <p className="mt-1">다른 선택을 하면 다른 결과를 볼 수 있어요!</p>
        </div>
      </div>
    </div>
  );
};

export default EndingScreen;
