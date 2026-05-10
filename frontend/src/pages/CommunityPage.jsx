import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { getChatMessages, sendChatMessage, getFeed } from '../api/community';

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatRes, feedRes] = await Promise.all([
        getChatMessages({ room: 'general', limit: 50 }),
        getFeed({ page: 1, per_page: 6, sort: 'newest' }),
      ]);
      setMessages(chatRes.data.messages || []);
      setPosts(feedRes.data.posts || []);
    } catch {
      toast.error('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      getChatMessages({ room: 'general', limit: 50 })
        .then(({ data }) => setMessages(data.messages || []))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content) return;
    if (!isAuthenticated) {
      toast.error('Please login to join the community chat');
      return;
    }

    try {
      setSending(true);
      const { data } = await sendChatMessage({ room: 'general', content });
      setMessages((prev) => [...prev, data]);
      setMessageInput('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold">Community</h1>
          <p className="text-white/75 mt-2">Chat with travelers and discover what others are sharing right now.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card border border-border shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-body">General Chat</h2>
              <p className="text-sm text-muted">Talk to the WanderIQ community</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Live
            </span>
          </div>

          <div className="h-[28rem] overflow-y-auto px-6 py-5 space-y-4 bg-sand/40">
            {loading ? (
              <p className="text-muted text-sm">Loading community chat...</p>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {message.author?.first_name?.[0]}{message.author?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-body">
                          {message.author?.first_name} {message.author?.last_name}
                          {user?.id === message.author?.id ? ' (You)' : ''}
                        </p>
                        <p className="text-xs text-muted">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-body whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="text-muted text-sm">No messages yet. Start the conversation.</p>
            )}
          </div>

          <div className="p-4 border-t border-border bg-white">
            {!isAuthenticated && (
              <p className="text-sm text-muted mb-3">
                <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link> to send messages.
              </p>
            )}
            <div className="flex gap-3">
              <textarea
                rows={3}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Share travel ideas, ask questions, or help other explorers..."
                className="flex-1 input-field resize-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !messageInput.trim()}
                className="self-end px-5 py-3 bg-primary text-white rounded-input font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-body">Recent Posts</h2>
              <p className="text-sm text-muted">Latest trip shares from the community</p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-muted text-sm">Loading posts...</p>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="border border-border rounded-2xl p-4 bg-sand/30">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-body">{post.title}</h3>
                    {post.destination_tag && (
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{post.destination_tag}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted line-clamp-3">{post.content}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>{post.author?.first_name} {post.author?.last_name}</span>
                    <span>{post.like_count} likes · {post.comment_count} comments</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-sm">No community posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
