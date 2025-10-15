import React from 'react';

const IntimacyBar = ({ character, intimacy, isFriend }) => {
  const getColorClass = () => {
    if (intimacy >= 75) return 'from-green-400 to-emerald-500';
    if (intimacy >= 50) return 'from-yellow-400 to-orange-500';
    if (intimacy >= 25) return 'from-blue-400 to-cyan-500';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{character.name}</span>
          {isFriend && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              친구 ✓
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-600">{intimacy}/100</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`intimacy-bar ${getColorClass()}`}
          style={{ width: `${intimacy}%` }}
        />
      </div>

      {/* 이벤트 마커 */}
      <div className="flex justify-between mt-1 px-1">
        {[25, 50, 75, 100].map((threshold) => (
          <div
            key={threshold}
            className={`text-xs ${
              intimacy >= threshold ? 'text-green-600 font-bold' : 'text-gray-400'
            }`}
          >
            {intimacy >= threshold ? '✓' : '○'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntimacyBar;
