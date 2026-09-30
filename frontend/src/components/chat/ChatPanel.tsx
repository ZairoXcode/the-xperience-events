'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { ChatMessageItem } from '../../types';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PanelRightClose,
  Trash2,
} from 'lucide-react';

interface ChatPanelProps {
  eventId: string;
  eventType?: string;
  onEventUpdated: () => void;
  onCollapse?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  eventId,
  onEventUpdated,
  onCollapse,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      setFetchingHistory(true);
      const data = await api.getChatHistory(eventId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // Optimistically show user message
    const tempUserMsg: ChatMessageItem = {
      _id: `temp-${Date.now()}`,
      eventId,
      userId: '',
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.sendChatMessage(eventId, text);

      // Append assistant message with structured changes
      const assistantMsg: ChatMessageItem = {
        _id: `asst-${Date.now()}`,
        eventId,
        userId: '',
        role: 'ASSISTANT',
        content: response.message,
        appliedChanges: response.appliedChanges,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Inform parent dashboard to re-fetch live state
      onEventUpdated();
    } catch (error: any) {
      const errorMsg: ChatMessageItem = {
        _id: `err-${Date.now()}`,
        eventId,
        userId: '',
        role: 'ASSISTANT',
        content: `Error: ${error.message || 'Unable to process message. Please check API configuration.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setClearing(true);
      await api.clearChatHistory(eventId);
      setMessages([]);
      setShowClearConfirm(false);
      onEventUpdated();
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] min-h-[580px] bg-white rounded-2xl border border-[#E8E0D0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E8E0D0] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1F3A32] flex items-center justify-center text-[#C8A96B] shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32] leading-tight">
              Event Assistant
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A8A8A] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Clear Chat Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            title="Clear conversation"
            disabled={messages.length === 0}
            className="p-2 text-[#8A8A8A] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Panel Button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse"
              className="p-2 text-[#8A8A8A] hover:text-[#1F3A32] hover:bg-[#E8E0D0]/50 rounded-lg transition-colors cursor-pointer"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Banner */}
      {showClearConfirm && (
        <div className="px-4 py-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="text-xs font-medium">Clear this conversation?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
            >
              {clearing ? 'Clearing...' : 'Clear'}
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-white text-rose-800 border border-rose-200 rounded-md text-xs hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FAF7F2]/25">
        {fetchingHistory ? (
          <div className="flex items-center justify-center h-48 text-xs text-[#8A8A8A]">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#1F3A32] flex items-center justify-center text-[#C8A96B] mb-3.5 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-headline font-bold text-[#1F3A32] mb-1.5">
              How can I help with this event?
            </h4>
            <p className="text-xs text-[#5A5A5A] max-w-xs leading-relaxed">
              Share updates about vendors, tasks, deadlines, or guest counts. Any changes will be updated across your event panels.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'USER';
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[92%] sm:max-w-[88%] ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs shadow-xs mt-0.5 ${
                      isUser
                        ? 'bg-[#1F3A32] text-white'
                        : 'bg-linear-to-br from-[#1F3A32] to-[#2D5449] text-[#C8A96B]'
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Card (User vs Assistant / Others card) */}
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-4.5 sm:py-3.5 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#1F3A32] text-white rounded-tr-xs'
                        : 'bg-white text-[#1F2925] border border-[#E8E0D0] rounded-tl-xs'
                    }`}
                  >
                    {/* Header inside Assistant card */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#E8E0D0]/70">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#1F3A32] text-[11px] tracking-tight">
                            Assistant
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#A8B5A0]" />
                          <span className="text-[10px] text-[#8A8A8A]">
                            Event Operations
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8A8A8A]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Text Body */}
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Applied Changes Card (Others / Assistant updates) */}
                    {!isUser &&
                      msg.appliedChanges &&
                      msg.appliedChanges.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-[#E8E0D0]">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3A32]">
                              Updates applied:
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.appliedChanges.map((change, cIdx) => {
                              const isRisk =
                                change.includes('⚠') ||
                                change.toLowerCase().includes('risk');
                              return (
                                <div
                                  key={cIdx}
                                  className={`text-[11px] px-2.5 py-1.5 rounded-lg flex items-start gap-2 font-medium leading-snug ${
                                    isRisk
                                      ? 'bg-amber-50/80 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-50/80 text-emerald-950 border border-emerald-200'
                                  }`}
                                >
                                  {isRisk ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span>{change}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Timestamp for user message */}
                    {isUser && (
                      <div className="text-[9px] mt-1.5 text-right text-emerald-200/80">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator Card */}
        {loading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-linear-to-br from-[#1F3A32] to-[#2D5449] flex items-center justify-center text-[#C8A96B] shadow-xs flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-[#E8E0D0] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-[#5A5A5A]">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A32] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8B5A0] animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] text-[#8A8A8A] ml-1">
                  Updating event details...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-[#E8E0D0] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or instruction..."
              disabled={loading}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F3A32]/15 focus:border-[#1F3A32] text-[#202020] placeholder-[#8A8A8A] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#1F3A32] hover:bg-[#172C26] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A8A8A] px-1">
          <span>Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
