import React from 'react';
import { Bot } from '../components/Bot';

const BotPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bot Management</h1>
      <Bot />
    </div>
  );
};

export default BotPage; 