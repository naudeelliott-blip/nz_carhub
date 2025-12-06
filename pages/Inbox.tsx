
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { DirectMessage } from '../types';
import { Send, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
  const { currentUser, directMessages, sendDirectMessage, markAsRead } = useStore();
  const navigate = useNavigate();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
        navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // 1. Identify all unique conversation partners
  const conversationPartners = Array.from(new Set(
      directMessages
        .filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)
        .flatMap(m => [m.senderId, m.receiverId])
  )).filter(id => id !== currentUser.id);

  // 2. Get details for partners (Name and Last Message)
  const conversations = conversationPartners.map(partnerId => {
      // Find a message involving this partner to get their name
      const relevantMsg = directMessages.find(m => 
        (m.senderId === partnerId && m.receiverId === currentUser.id) || 
        (m.receiverId === partnerId && m.senderId === currentUser.id)
      );
      
      const name = relevantMsg 
        ? (relevantMsg.senderId === partnerId ? relevantMsg.senderName : relevantMsg.receiverName)
        : 'Unknown User';

      // Get last message for preview
      const msgsWithPartner = directMessages.filter(m => 
        (m.senderId === partnerId && m.receiverId === currentUser.id) || 
        (m.receiverId === partnerId && m.senderId === currentUser.id)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
          partnerId,
          name,
          lastMessage: msgsWithPartner[0],
          unreadCount: msgsWithPartner.filter(m => m.receiverId === currentUser.id && !m.isRead).length
      };
  });

  // Sort conversations by last message date
  conversations.sort((a, b) => 
    new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  // Auto-select first conversation if none selected
  useEffect(() => {
      if (!selectedPartnerId && conversations.length > 0) {
          setSelectedPartnerId(conversations[0].partnerId);
      }
  }, [conversations, selectedPartnerId]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedPartnerId && currentUser) {
        // Check if there are unread messages to avoid infinite loops or unnecessary updates
        const hasUnread = directMessages.some(
            m => m.senderId === selectedPartnerId && m.receiverId === currentUser.id && !m.isRead
        );
        
        if (hasUnread) {
            markAsRead(selectedPartnerId);
        }
    }
  }, [selectedPartnerId, directMessages, currentUser, markAsRead]);

  // Scroll to bottom of chat
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPartnerId, directMessages]);

  const activeConversationMessages = selectedPartnerId 
    ? directMessages.filter(m => 
        (m.senderId === selectedPartnerId && m.receiverId === currentUser.id) || 
        (m.receiverId === selectedPartnerId && m.senderId === currentUser.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const handleSendReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPartnerId || !replyText.trim()) return;
      
      const partnerName = conversations.find(c => c.partnerId === selectedPartnerId)?.name || 'User';

      sendDirectMessage(selectedPartnerId, partnerName, replyText);
      setReplyText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-64px)]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex h-full">
            
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-100 dark:border-slate-700 flex flex-col bg-gray-50 dark:bg-slate-800">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                </div>
                <div className="overflow-y-auto flex-1">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No messages yet.
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.partnerId}
                                onClick={() => setSelectedPartnerId(conv.partnerId)}
                                className={`w-full text-left p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-start gap-3 ${
                                    selectedPartnerId === conv.partnerId ? 'bg-white dark:bg-slate-750 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-2 flex-shrink-0">
                                    <UserIcon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-semibold truncate ${selectedPartnerId === conv.partnerId ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                            {conv.name}
                                        </h3>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {conv.lastMessage.senderId === currentUser.id && 'You: '}
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
                {selectedPartnerId ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3 shadow-sm z-10 bg-white dark:bg-slate-800">
                            <div className="bg-gray-100 dark:bg-slate-700 p-2 rounded-full text-gray-600 dark:text-gray-300">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white">
                                    {conversations.find(c => c.partnerId === selectedPartnerId)?.name}
                                </h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900">
                            {activeConversationMessages.map(msg => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                                            isMe 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-bl-none'
                                        }`}>
                                            {msg.listingId && (
                                                <div className="mb-2 pb-2 border-b border-white/20 dark:border-gray-600 text-xs opacity-80 font-medium">
                                                    Reference: Listing #{msg.listingId}
                                                </div>
                                            )}
                                            <p>{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Type a message..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!replyText.trim()}
                                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-col">
                         <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                            <Send size={48} className="text-gray-300 dark:text-gray-600" />
                         </div>
                         <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Inbox;
