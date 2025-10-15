import React from 'react';
import useGameStore from './store/gameStore';
import OnboardingScreen from './components/OnboardingScreen';
import GameScreen from './components/GameScreen';
import EndingScreen from './components/EndingScreen';

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);

  return (
    <div className="App">
      {gamePhase === 'onboarding' && <OnboardingScreen />}
      {gamePhase === 'playing' && <GameScreen />}
      {gamePhase === 'ending' && <EndingScreen />}
    </div>
  );
}

export default App;
