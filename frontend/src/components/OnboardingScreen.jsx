import React from 'react';
import useGameStore from '../store/gameStore';

const OnboardingScreen = () => {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎓 친구 사귀기
          </h1>
          <p className="text-xl text-gray-600">
            AI 시뮬레이션 게임
          </p>
        </div>

        {/* 게임 설명 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 스토리</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            고등학교 3학년 새 학기가 시작되었습니다.<br />
            졸업까지 남은 6개월 동안 <span className="font-bold text-purple-600">3명의 친구</span>를 사귀는 것이 목표입니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            다양한 성격의 친구들과 대화하며 친밀도를 쌓아보세요!
          </p>
        </div>

        {/* 캐릭터 소개 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 등장인물</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 유리 */}
            <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
              <div className="text-center mb-2">
                <span className="text-4xl">👧</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 text-center mb-1">유리</h3>
              <p className="text-sm text-gray-600 text-center mb-2">ISFJ · 모범생</p>
              <p className="text-xs text-gray-500 text-center">
                책임감 강하고 따뜻한 반장 후보
              </p>
            </div>

            {/* 지호 */}
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-center mb-2">
                <span className="text-4xl">👦</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 text-center mb-1">지호</h3>
              <p className="text-sm text-gray-600 text-center mb-2">ESFP · 운동부</p>
              <p className="text-xs text-gray-500 text-center">
                밝고 유쾌한 친근한 친구
              </p>
            </div>

            {/* 세연 */}
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="text-center mb-2">
                <span className="text-4xl">👩</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 text-center mb-1">세연</h3>
              <p className="text-sm text-gray-600 text-center mb-2">INTJ · 천재</p>
              <p className="text-xs text-gray-500 text-center">
                지적이고 냉정한 독서 동아리
              </p>
            </div>
          </div>
        </div>

        {/* 조작법 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 조작법</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">💬</span>
              <span><strong>텍스트 입력:</strong> 채팅창에 직접 입력하여 대화</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎤</span>
              <span><strong>음성 입력:</strong> 마이크 버튼을 눌러 음성으로 대화</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❤️</span>
              <span><strong>친밀도:</strong> 대화를 통해 친밀도를 100까지 올리세요</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span><strong>목표:</strong> 졸업까지 3명의 친구를 사귀세요!</span>
            </li>
          </ul>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={startGame}
          className="w-full btn-primary text-xl py-4"
        >
          게임 시작하기 🚀
        </button>

        {/* 플레이 시간 안내 */}
        <p className="text-center text-gray-500 text-sm mt-4">
          ⏱️ 예상 플레이 시간: 5~10분
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
