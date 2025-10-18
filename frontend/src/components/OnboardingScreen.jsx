import React from "react";
import useGameStore from "../store/gameStore";

const OnboardingScreen = () => {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/backgrounds/titlebg.png)",
        }}
      ></div>

      {/* 가독성을 위한 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>

      {/* 하단 그라데이션 (캐릭터 가독성 향상) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>

      <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12">
          {/* 왼쪽: 캐릭터 이미지 */}
          <div className="flex-1 relative h-[600px] lg:h-[750px] w-full max-w-3xl">
            <img
              src="/title/titlecharacter.png"
              alt="게임 캐릭터들"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
            />
          </div>

          {/* 오른쪽: 타이틀 및 버튼 */}
          <div className="flex-1 flex flex-col items-center text-center space-y-6 -mt-24">
            {/* 게임 타이틀 로고 */}
            <div>
              <img
                src="/title/titlelogo.png"
                alt="AI 대화형 스토리 시뮬레이션 게임"
                className="w-full max-w-sm lg:max-w-md drop-shadow-2xl mx-auto"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}
              />
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={startGame}
              className="transform hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <img
                src="/title/titlebtn.png"
                alt="게임 시작"
                className="w-auto h-12 lg:h-16 drop-shadow-xl"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
              />
            </button>

            {/* 부가 정보 */}
            <div className="space-y-2 text-white text-sm drop-shadow-lg">
              <p className="flex items-center gap-2 justify-center">
                <span>👥</span>
                <span>3명의 친구와 특별한 이야기를 만들어보세요</span>
              </p>
              <p className="flex items-center gap-2 justify-center">
                <span>⏱️</span>
                <span>예상 플레이 시간: 5~10분</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
