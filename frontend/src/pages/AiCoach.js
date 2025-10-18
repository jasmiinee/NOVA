import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { mockData } from '../data/mockData';

export const AiCoach = () => {
  const [messages, setMessages] = useState(mockData.chatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      message: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: messages.length + 2,
        message: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('pathway') || lowerMessage.includes('career')) {
      return "Based on your current role as Cloud Solutions Architect, I recommend focusing on the Senior Cloud Architect pathway. You're 75% ready and just need to develop leadership skills and multi-cloud strategy expertise. Would you like me to suggest specific courses or mentorship opportunities?";
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      return "Your strongest skills are in Cloud Architecture and DevOps. To advance to senior roles, I'd recommend developing your leadership and business strategy skills. The 'Leadership for Technical Professionals' course would be perfect for you. Shall I help you enroll?";
    } else if (lowerMessage.includes('mentor')) {
      return "I've found excellent mentor matches for you! Dr. James Wong (92% match) specializes in Enterprise Architecture, and Sarah Chen (88% match) is an expert in Cloud Security. Both align well with your career pathways. Would you like me to help you connect with either of them?";
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('wellbeing')) {
      return "I understand that career growth can sometimes feel overwhelming. PSA offers excellent wellbeing resources including counseling services and stress management workshops. Remember, professional development is a journey, not a race. Would you like me to connect you with our Employee Assistance Program?";
    } else {
      return "I'm here to help with your career development at PSA! I can assist with career pathways, skill recommendations, learning opportunities, mentorship matching, and general career guidance. What specific area would you like to explore today?";
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, you would integrate with speech recognition API here
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900">AI Career Coach</h1>
              <p className="text-sm text-gray-500">Your personalized career development assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <QuickActionButton
            text="Show my career pathways"
            onClick={() => setInputMessage("Show my career pathways")}
          />
          <QuickActionButton
            text="Recommend learning courses"
            onClick={() => setInputMessage("Recommend learning courses for me")}
          />
          <QuickActionButton
            text="Find me a mentor"
            onClick={() => setInputMessage("Help me find a mentor")}
          />
          <QuickActionButton
            text="Assess my leadership potential"
            onClick={() => setInputMessage("What's my leadership potential?")}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="typing-indicator flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full ${
              isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            } hover:bg-opacity-80 transition-colors`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your career development..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex items-start space-x-2 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
      <div className="flex-shrink-0">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isAI ? 'bg-blue-100' : 'bg-gray-200'
        }`}>
          {isAI ? (
            <Bot className="h-4 w-4 text-blue-600" />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </div>
      </div>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg chat-message ${
        isAI 
          ? 'bg-gray-100 text-gray-900' 
          : 'bg-blue-600 text-white'
      }`}>
        <p className="text-sm">{message.message}</p>
        <p className={`text-xs mt-1 ${isAI ? 'text-gray-500' : 'text-blue-100'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
  >
    {text}
  </button>
);