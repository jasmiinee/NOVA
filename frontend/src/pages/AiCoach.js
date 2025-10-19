import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';

export const AiCoach = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hi! I'm PSA's AI Career Coach. I'm here to help you with your career development journey. What would you like to explore today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:3001/api/chat';

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
    const userInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: messages.length + 2,
        message: data.reply || "I couldn't generate a response. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error calling backend:', err);
      setError('Failed to connect to AI Coach. Make sure your backend is running on localhost:3001');
      
      const errorMessage = {
        id: messages.length + 2,
        message: "Sorry, I'm having trouble connecting to the server. Please check that your backend is running.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {error ? 'Offline' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            disabled={!inputMessage.trim() || isTyping}
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

  // Helper to render text with bold formatting
  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={idx} className="font-bold text-[17px] text-blue-900">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  // Parse and format the message
  const renderFormattedContent = (text) => {
    // Split by newlines
    const lines = text.split('\n');
    const sections = [];
    let currentSection = [];

    lines.forEach((line) => {
      // Check if line is a section header (starts with a heading pattern)
      // Patterns: "Day X:", "# Title", "## Title", "1. Title:", "Section Name:", etc.
      const isHeader = /^(Day\s+\d+|#{1,6}\s|\d+\.|[A-Z][^:]*:\s*$)/i.test(line.trim());
      
      if (isHeader && currentSection.length > 0) {
        // Save current section and start new one
        sections.push({
          header: currentSection[0],
          content: currentSection.slice(1)
        });
        currentSection = [line];
      } else {
        currentSection.push(line);
      }
    });

    // Don't forget the last section
    if (currentSection.length > 0) {
      sections.push({
        header: currentSection[0],
        content: currentSection.slice(1)
      });
    }

    // Render sections
    return sections.map((section, idx) => {
      const headerTrimmed = section.header.trim();
      const contentLines = section.content
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (!headerTrimmed) return null;

      return (
        <div key={idx} className="mb-4 pb-3 border-b border-gray-200 last:border-b-0">
          {/* Section Header */}
          <h3 className="font-semibold text-sm text-gray-900 mb-2">
            {renderBoldText(headerTrimmed)}
          </h3>

          {/* Section Content */}
          <div className="space-y-2">
            {contentLines.map((line, i) => {
              // Remove bullet/dash if present
              const cleanLine = line.replace(/^[-•]\s*/, '');
              
              return (
                <p key={i} className="text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-blue-500 flex-shrink-0">•</span>
                  <span>{renderBoldText(cleanLine)}</span>
                </p>
              );
            })}
          </div>
        </div>
      );
    });
  };

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
      <div className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
        isAI 
          ? 'bg-gray-50 text-gray-900 border border-gray-200' 
          : 'bg-blue-600 text-white'
      }`}>
        <div className={`text-sm ${isAI ? 'space-y-2' : ''}`}>
          {isAI ? renderFormattedContent(message.message) : message.message}
        </div>
        <p className={`text-xs mt-2 ${isAI ? 'text-gray-500' : 'text-blue-100'}`}>
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