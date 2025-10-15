import React from 'react';

const NarrationBox = ({ message }) => {
  const getStyle = () => {
    switch (message.type) {
      case 'narration':
        return 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-900';
      case 'event':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-orange-900';
      case 'system':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900';
      case 'hint':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'narration':
        return '📖';
      case 'event':
        return '⭐';
      case 'system':
        return '🎉';
      case 'hint':
        return '💡';
      default:
        return '💬';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 text-center ${getStyle()} animate-fade-in`}>
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">{getIcon()}</span>
        <p className="font-medium">{message.content}</p>
      </div>
    </div>
  );
};

export default NarrationBox;
