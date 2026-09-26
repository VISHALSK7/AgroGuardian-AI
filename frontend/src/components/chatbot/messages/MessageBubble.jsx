import React from 'react';
import AIMessage from './AIMessage';
import UserMessage from './UserMessage';

const MessageBubble = ({ message, isStreaming }) => {
  const isBot = message.role === 'bot' || message.role === 'assistant';

  if (isBot) {
    return <AIMessage message={message} isStreaming={isStreaming} />;
  }

  return <UserMessage message={message} />;
};

export default MessageBubble;
