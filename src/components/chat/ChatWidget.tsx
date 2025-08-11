import React, { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../../utils/analytics-manager';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'form' | 'file';
  metadata?: any;
}

interface QuickReply {
  id: string;
  text: string;
  payload?: string;
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  accentColor?: string;
  autoOpen?: boolean;
  showOnPages?: string[];
  hideOnPages?: string[];
  triggerAfterSeconds?: number;
  minimized?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  position = 'bottom-right',
  primaryColor = '#20466f',
  accentColor = '#ffd147',
  autoOpen = false,
  showOnPages = [],
  hideOnPages = [],
  triggerAfterSeconds = 30,
  minimized = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({});
  const [showForm, setShowForm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if widget should be shown on current page
    const currentPath = window.location.pathname;
    
    if (hideOnPages.length > 0 && hideOnPages.some(path => currentPath.includes(path))) {
      return;
    }
    
    if (showOnPages.length > 0 && !showOnPages.some(path => currentPath.includes(path))) {
      return;
    }

    // Initialize chat with welcome message
    initializeChat();

    // Auto-open after specified time
    if (!autoOpen && triggerAfterSeconds > 0) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setIsOpen(true);
          trackEvent({
            name: 'chat_auto_opened',
            parameters: { trigger_time: triggerAfterSeconds }
          });
        }
      }, triggerAfterSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chat opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: "👋 Hi there! I'm here to help you learn about our conversion optimization services. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    setIsConnected(true);

    // Add quick reply options
    setTimeout(() => {
      const quickReplyMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        text: "Here are some quick options:",
        sender: 'bot',
        timestamp: new Date(),
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { id: 'pricing', text: 'View Pricing', payload: 'show_pricing' },
            { id: 'demo', text: 'Request Demo', payload: 'request_demo' },
            { id: 'contact', text: 'Contact Sales', payload: 'contact_sales' },
            { id: 'calculator', text: 'ROI Calculator', payload: 'open_calculator' }
          ]
        }
      };
      setMessages(prev => [...prev, quickReplyMessage]);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Track user message
    trackEvent({
      name: 'chat_message_sent',
      parameters: {
        message_length: messageText.length,
        session_id: getSessionId()
      }
    });

    // Simulate typing and bot response
    setIsTyping(true);
    setTimeout(() => {
      handleBotResponse(messageText);
      setIsTyping(false);
    }, 1500);
  };

  const handleBotResponse = (userMessage: string) => {
    const response = generateBotResponse(userMessage);
    
    const botMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      type: response.type,
      metadata: response.metadata
    };

    setMessages(prev => [...prev, botMessage]);

    // Handle special response types
    if (response.action) {
      handleBotAction(response.action, response.payload);
    }
  };

  const generateBotResponse = (userMessage: string): any => {
    const message = userMessage.toLowerCase();

    // Intent detection (simplified - in production use NLP service)
    if (message.includes('pricing') || message.includes('cost') || message.includes('price')) {
      return {
        text: "Our CRO services start at $5,000 for the Foundation package. This includes framework selection, implementation, and 30-day support. Would you like to see detailed pricing or calculate your potential ROI?",
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { id: 'pricing_details', text: 'View Pricing Details', payload: 'show_pricing' },
            { id: 'roi_calc', text: 'Calculate ROI', payload: 'open_calculator' }
          ]
        }
      };
    }

    if (message.includes('demo') || message.includes('example')) {
      return {
        text: "I'd be happy to show you our conversion optimization frameworks in action! We have demos for Authority Framework, Mobile-PWA, CRE Methodology, and Conversion-Centered Design. Which interests you most?",
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { id: 'demo_authority', text: 'Authority Framework', payload: 'demo_authority' },
            { id: 'demo_mobile', text: 'Mobile-PWA', payload: 'demo_mobile' },
            { id: 'demo_cre', text: 'CRE Methodology', payload: 'demo_cre' },
            { id: 'demo_ccd', text: 'Conversion-Centered', payload: 'demo_ccd' }
          ]
        }
      };
    }

    if (message.includes('contact') || message.includes('talk') || message.includes('call')) {
      return {
        text: "Perfect! I'd love to connect you with our team. Could you share your email so we can send you our calendar link? Or would you prefer to fill out a quick contact form?",
        action: 'show_contact_form'
      };
    }

    if (message.includes('help') || message.includes('support')) {
      return {
        text: "I'm here to help! I can answer questions about:\n\n• Our CRO frameworks and methodologies\n• Pricing and package options\n• Case studies and results\n• Booking a consultation\n• ROI calculations\n\nWhat would you like to know more about?",
        type: 'quick_reply',
        metadata: {
          quickReplies: [
            { id: 'frameworks', text: 'CRO Frameworks', payload: 'explain_frameworks' },
            { id: 'results', text: 'Case Studies', payload: 'show_results' },
            { id: 'consultation', text: 'Book Consultation', payload: 'book_consultation' }
          ]
        }
      };
    }

    // Default response
    return {
      text: "Thanks for your message! I'm designed to help with questions about our conversion optimization services. You can ask me about pricing, request a demo, or get in touch with our team. How can I help you today?",
      type: 'quick_reply',
      metadata: {
        quickReplies: [
          { id: 'pricing', text: 'Pricing Info', payload: 'show_pricing' },
          { id: 'demo', text: 'Request Demo', payload: 'request_demo' },
          { id: 'contact', text: 'Contact Sales', payload: 'contact_sales' }
        ]
      }
    };
  };

  const handleBotAction = (action: string, payload?: any) => {
    switch (action) {
      case 'show_contact_form':
        setShowForm(true);
        break;
      case 'open_calculator':
        window.open('/calculator', '_blank');
        break;
      case 'show_pricing':
        window.open('/#pricing', '_blank');
        break;
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
    
    // Handle payload actions
    if (reply.payload) {
      switch (reply.payload) {
        case 'show_pricing':
          setTimeout(() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop, behavior: 'smooth' }), 1000);
          break;
        case 'open_calculator':
          setTimeout(() => window.open('/calculator', '_blank'), 1000);
          break;
        case 'contact_sales':
          setTimeout(() => setShowForm(true), 1000);
          break;
        case 'request_demo':
          setTimeout(() => window.open('/demos', '_blank'), 1000);
          break;
        case 'demo_authority':
          setTimeout(() => window.open('/demo/authority', '_blank'), 1000);
          break;
        case 'demo_mobile':
          setTimeout(() => window.open('/demo/mobile-pwa', '_blank'), 1000);
          break;
        case 'demo_cre':
          setTimeout(() => window.open('/demo/cre', '_blank'), 1000);
          break;
        case 'demo_ccd':
          setTimeout(() => window.open('/demo/conversion-centered', '_blank'), 1000);
          break;
      }
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      setUnreadCount(0);
      trackEvent({
        name: 'chat_opened',
        parameters: { session_id: getSessionId() }
      });
    } else {
      trackEvent({
        name: 'chat_closed',
        parameters: { 
          session_id: getSessionId(),
          message_count: messages.length
        }
      });
    }
  };

  const handleSubmitForm = (formData: { name: string; email: string; message: string }) => {
    const formMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: `Thanks ${formData.name}! I've sent your information to our team. We'll reach out to ${formData.email} within 24 hours to schedule your consultation.`,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, formMessage]);
    setShowForm(false);

    // Track form submission
    trackEvent({
      name: 'chat_lead_form_submitted',
      parameters: {
        name: formData.name,
        email: formData.email,
        session_id: getSessionId()
      }
    });

    // TODO: Send to backend/CRM
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50 font-sans`}>
      {/* Chat Widget */}
      <div
        ref={chatContainer}
        className={`
          bg-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out
          ${isOpen ? 'w-80 h-96' : 'w-16 h-16'}
          ${isMinimized ? 'h-12' : ''}
        `}
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        {/* Chat Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg text-white cursor-pointer"
          style={{ backgroundColor: primaryColor }}
          onClick={isOpen ? () => setIsMinimized(!isMinimized) : handleToggleChat}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              💬
            </div>
            <div>
              <h3 className="font-semibold text-sm">AktivCRO Assistant</h3>
              <p className="text-xs opacity-75">
                {isConnected ? 'Online' : 'Offline'} • Usually replies in minutes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && !isOpen && (
              <span 
                className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {unreadCount}
              </span>
            )}
            
            {isOpen && (
              <button
                onClick={handleToggleChat}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        {isOpen && !isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`
                      inline-block max-w-xs px-3 py-2 rounded-lg text-sm
                      ${message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-800 shadow-sm border'
                      }
                    `}
                  >
                    {message.text}
                  </div>
                  
                  {/* Quick Replies */}
                  {message.type === 'quick_reply' && message.metadata?.quickReplies && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.metadata.quickReplies.map((reply: QuickReply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-white px-3 py-2 rounded-lg text-sm text-gray-600 shadow-sm border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Contact Form Modal */}
            {showForm && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-72">
                  <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleSubmitForm({
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      message: formData.get('message') as string
                    });
                  }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      className="w-full p-2 border rounded mb-3 text-sm"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      className="w-full p-2 border rounded mb-3 text-sm"
                      required
                    />
                    <textarea
                      name="message"
                      placeholder="How can we help you?"
                      className="w-full p-2 border rounded mb-4 text-sm h-20 resize-none"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 border text-gray-600 py-2 px-4 rounded text-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Minimized View */}
        {!isOpen && (
          <button
            onClick={handleToggleChat}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl hover:scale-105 transition-transform"
            style={{ backgroundColor: primaryColor }}
            aria-label="Open chat"
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;