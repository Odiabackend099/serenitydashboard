import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  message_content: string;
  message_type: string;
  timestamp: string;
  tool_executed?: string;
}

interface Conversation {
  id: string;
  patient_phone: string;
  patient_name?: string;
  patient_email?: string;
  conversation_status: string;
  last_message_at: string;
  last_message_from: string;
  messages?: Message[];
}

export function WhatsAppConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations
  useEffect(() => {
    loadConversations();

    // Real-time subscription
    const subscription = supabase
      .channel('whatsapp_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages' },
        () => {
          loadConversations();
          if (selectedConvId) {
            loadMessages(selectedConvId);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Failed to load conversations:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Failed to load messages:', error.message);
    }
  }

  function selectConversation(conv: Conversation) {
    setSelectedConvId(conv.id);
    loadMessages(conv.id);
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const filteredConversations = conversations.filter(conv =>
    conv.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.patient_phone.includes(searchQuery) ||
    conv.patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversation List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-3">WhatsApp Conversations</h2>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConvId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {conv.patient_name || conv.patient_phone}
                    </div>
                    {conv.patient_name && (
                      <div className="text-sm text-gray-500 truncate">
                        {conv.patient_phone}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(conv.last_message_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      conv.conversation_status === 'active' ? 'bg-green-100 text-green-800' :
                      conv.conversation_status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {conv.conversation_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedConv.patient_name || selectedConv.patient_phone}
                  </h3>
                  {selectedConv.patient_email && (
                    <p className="text-sm text-gray-500">{selectedConv.patient_email}</p>
                  )}
                </div>
                <button
                  onClick={() => {/* TODO: Implement archive/resolve */}}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        msg.direction === 'outbound'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{msg.message_content}</div>

                      {msg.tool_executed && (
                        <div className={`text-xs mt-2 pt-2 border-t ${
                          msg.direction === 'outbound' ? 'border-blue-400' : 'border-gray-200'
                        }`}>
                          <span className="font-semibold">Action:</span> {msg.tool_executed}
                        </div>
                      )}

                      <div className={`text-xs mt-2 ${
                        msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Quick Actions */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-500 text-center">
                Total messages: {messages.length}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
