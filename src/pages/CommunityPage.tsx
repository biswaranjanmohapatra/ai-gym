import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Heart, MessageCircle, Send, Trophy, Dumbbell, Target, Flame, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const postTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  achievement: { icon: Trophy, color: 'text-primary', label: '🏆 Achievement' },
  workout: { icon: Dumbbell, color: 'text-accent', label: '💪 Workout' },
  milestone: { icon: Target, color: 'text-primary', label: '🎯 Milestone' },
  general: { icon: Flame, color: 'text-accent', label: '🔥 General' },
};

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (user) fetchLikes();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const data = await fetchApi('/community');
      if (data) setPosts(data);
    } catch (err) {
      console.error('Fetch posts error', err);
    }
  };

  const fetchLikes = async () => {
    // With the new API, likes are included in the post object or we check the user id in the likes array
    // But we still might want a quick set of liked post IDs for UI tracking
  };

  const fetchComments = async (postId: string) => {
    try {
      const data = await fetchApi(`/community/${postId}/comments`);
      if (data) setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Fetch comments error', err);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    if (!user) { toast.error('Please sign in'); return; }
    try {
      await fetchApi('/community', {
        method: 'POST',
        body: JSON.stringify({ content: newPost, postType }),
      });
      toast.success('Posted! 🎉');
      setNewPost('');
      setShowNewPost(false);
      fetchPosts();
    } catch {
      toast.error('Failed to post');
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) { toast.error('Please sign in'); return; }
    try {
      const result = await fetchApi(`/community/${postId}/like`, { method: 'POST' });
      // Refresh posts to get new like counts
      fetchPosts();
    } catch {
      toast.error('Failed to toggle like');
    }
  };

  const addComment = async (postId: string) => {
    if (!newComment.trim() || !user) return;
    try {
      await fetchApi(`/community/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      fetchComments(postId);
      fetchPosts(); // Refresh comment counts
    } catch {
      toast.error('Failed to comment');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Community</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Fitness Feed</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Share achievements, inspire others, and stay motivated together.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* New Post */}
          {user && (
            <motion.div variants={itemVariants} className="mb-6">
              {!showNewPost ? (
                <Button onClick={() => setShowNewPost(true)} className="w-full bg-secondary/50 text-muted-foreground hover:bg-secondary/80 justify-start gap-2 py-6">
                  <Plus className="h-4 w-4" /> Share your fitness achievement...
                </Button>
              ) : (
                <div className="glass-card p-4 space-y-3">
                  <div className="flex gap-2">
                    {Object.entries(postTypeConfig).map(([key, cfg]) => (
                      <button key={key} onClick={() => setPostType(key)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${postType === key ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share your workout, achievement, or fitness tip..."
                    className="w-full rounded-lg bg-secondary/50 border border-border/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24" />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>Cancel</Button>
                    <Button size="sm" onClick={createPost} className="bg-primary text-primary-foreground"><Send className="h-3 w-3 mr-1" /> Post</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post, i) => {
              const config = postTypeConfig[post.postType] || postTypeConfig.general;
              const Icon = config.icon;
              const isLiked = user ? post.likes?.some((l: any) => l.userId === user.id) : false;
              return (
                <motion.div key={post.id} variants={itemVariants} className="glass-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.color} bg-primary/10`}>{config.label}</span>
                        <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/20">
                    <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 text-sm transition-colors hover:text-primary">
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-muted-foreground">{post.likes?.length || 0}</span>
                    </button>
                    <button onClick={() => { setShowComments(showComments === post.id ? null : post.id); if (showComments !== post.id) fetchComments(post.id); }}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      {post._count?.comments || 0} Comments
                    </button>
                  </div>

                  <AnimatePresence>
                    {showComments === post.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-border/20">
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                          {(comments[post.id] || []).map(c => (
                            <div key={c.id} className="bg-secondary/30 rounded-lg p-2 text-xs text-foreground">
                              <span className="font-bold text-primary mr-2">{c.user?.name || 'User'}:</span>
                              {c.content}
                              <span className="text-[10px] text-muted-foreground ml-2">{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                          ))}
                          {(comments[post.id] || []).length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
                        </div>
                        {user && (
                          <div className="flex gap-2">
                            <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..."
                              className="bg-secondary/50 border-border/30 text-sm h-8" />
                            <Button size="sm" onClick={() => addComment(post.id)} className="bg-primary text-primary-foreground h-8 px-3">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            {posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-primary/30" />
                <p>No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
