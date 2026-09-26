import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const ChatbotWidget = ({ openRef }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (openRef) {
      openRef.current = () => navigate('/dashboard/chatbot');
    }
    return () => {
      if (openRef) openRef.current = null;
    };
  }, [openRef, navigate]);

  return (
    <button
      onClick={() => navigate('/dashboard/chatbot')}
      className="fixed bottom-6 right-6 bg-[#22c55e] p-4 rounded-full z-50 shadow-[0_8px_30px_rgba(34,197,94,0.3)] hover:scale-110 active:scale-95 transition-all duration-200"
      aria-label="Redirect to Chatbot Assistant"
      title="Open Chatbot Assistant"
    >
      <MessageCircle color="white" size={24} />
    </button>
  );
};

export default ChatbotWidget;
