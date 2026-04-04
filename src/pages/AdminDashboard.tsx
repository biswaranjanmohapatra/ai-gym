import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Shield, Settings, BarChart3, UserCheck, Calendar,
  TrendingUp, Activity, Award, CheckCircle, XCircle,
  Database, Lock, IndianRupee, Trash2, Loader2, CreditCard
} from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trainers' | 'bookings' | 'payments' | 'subscriptions' | 'settings'>('overview');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    const validTabs = ['overview', 'users', 'trainers', 'bookings', 'payments', 'subscriptions', 'settings'];
    if (validTabs.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/dashboard/admin');

      setAllUsers(data.allUsers || []);
      setAllTrainers(data.allTrainers || []);
      setAllBookings(data.allBookings || []);
      setAllPayments(data.allPayments || []);
      setAllSubscriptions(data.allSubscriptions || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetchApi(`/dashboard/admin/users/${userId}`, { method: 'DELETE' });
      toast.success('User deleted');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete user: ' + error.message);
    }
  };

  const deleteTrainer = async (trainerId: string) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await fetchApi(`/dashboard/admin/trainers/${trainerId}`, { method: 'DELETE' });
      toast.success('Trainer deleted');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete trainer: ' + error.message);
    }
  };

  const setTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Stats
  const stats = {
    users: allUsers.filter(u => u.role === 'user').length,
    trainers: allUsers.filter(u => u.role === 'trainer').length,
    admins: allUsers.filter(u => u.role === 'admin').length,
    totalBookings: allBookings.length,
    pendingBookings: allBookings.filter((b: any) => b.status === 'pending').length,
    totalRevenue: allPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    activeSubscriptions: allSubscriptions.filter((s: any) => s.status === 'active').length,
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'users' as const, label: `Users (${stats.users})`, icon: Users },
    { id: 'trainers' as const, label: `Trainers (${stats.trainers})`, icon: Award },
    { id: 'bookings' as const, label: `Bookings (${stats.totalBookings})`, icon: Calendar },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: Database },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Full system control — users, trainers, bookings, payments</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 mb-7 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-[0_0_15px_hsl(280_100%_50%/0.3)]'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Users, label: 'Total Users', value: stats.users, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { icon: Award, label: 'Trainers', value: stats.trainers, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
                { icon: Shield, label: 'Admins', value: stats.admins, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
                { icon: Activity, label: 'Total Members', value: allUsers.length, color: 'text-foreground', bg: 'bg-secondary/30 border-border/30' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} className={`rounded-2xl border p-5 ${stat.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`font-black text-2xl ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Calendar, label: 'Total Bookings', value: stats.totalBookings, color: 'text-primary' },
                { icon: CheckCircle, label: 'Pending', value: stats.pendingBookings, color: 'text-yellow-400' },
                { icon: TrendingUp, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-green-400' },
                { icon: Database, label: 'Active Subs', value: stats.activeSubscriptions, color: 'text-purple-400' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} className="bg-secondary/20 border border-border/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`font-black text-2xl ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Users */}
            <motion.div variants={itemVariants} className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Recent Members
              </h3>
              {allUsers.length > 0 ? (
                <div className="space-y-2">
                  {allUsers.slice(0, 8).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-purple-400/10 text-purple-400' :
                        u.role === 'trainer' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-primary/10 text-primary'
                      }`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 text-sm">No users found.</p>
              )}
            </motion.div>
          </>
        )}

        {/* ─── USERS TAB ─── */}
        {activeTab === 'users' && (
          <motion.div variants={itemVariants} className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
            <h3 className="font-bold text-xl text-foreground mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> All Users
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              {stats.users} users · {stats.trainers} trainers · {stats.admins} admins
            </p>
            {allUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found.</p>
            ) : (
              <div className="space-y-3">
                {allUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.id.substring(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-purple-400/10 text-purple-400' :
                        u.role === 'trainer' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-primary/10 text-primary'
                      }`}>{u.role}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-8"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TRAINERS TAB ─── */}
        {activeTab === 'trainers' && (
          <motion.div variants={itemVariants} className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
            <h3 className="font-bold text-xl text-foreground mb-5 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" /> All Trainers
            </h3>
            {allTrainers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No trainers registered yet.</p>
            ) : (
              <div className="space-y-3">
                {allTrainers.map((trainer: any) => (
                  <div key={trainer.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trainer.emoji || '💪'}</span>
                      <div>
                        <p className="font-semibold text-foreground">{trainer.name}</p>
                        <p className="text-xs text-muted-foreground">{trainer.specialty}</p>
                        <p className="text-xs text-yellow-400">₹{trainer.pricePerSession?.toLocaleString()}/session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${trainer.isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {trainer.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-8"
                        onClick={() => deleteTrainer(trainer.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── BOOKINGS TAB ─── */}
        {activeTab === 'bookings' && (
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: allBookings.length, color: 'text-foreground' },
                { label: 'Pending', value: allBookings.filter((b: any) => b.status === 'pending').length, color: 'text-yellow-400' },
                { label: 'Approved', value: allBookings.filter((b: any) => b.status === 'approved' || b.status === 'active').length, color: 'text-primary' },
                { label: 'Cancelled', value: allBookings.filter((b: any) => b.status === 'cancelled').length, color: 'text-destructive' },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary/20 border border-border/30 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> All Bookings
              </h3>
              {allBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings found.</p>
              ) : (
                <div className="space-y-2">
                  {allBookings.slice(0, 50).map((booking: any) => (
                    <div key={booking.id} className="p-3 rounded-xl bg-secondary/30 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">User: {booking.userId.substring(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">Trainer: {booking.trainerId?.substring(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">{booking.bookingDate} · {booking.startTime} · {booking.sessionType}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">₹{booking.paymentAmount?.toLocaleString()}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                          booking.status === 'approved' ? 'bg-primary/10 text-primary' :
                          booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-secondary text-muted-foreground'
                        }`}>{booking.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PAYMENTS TAB ─── */}
        {activeTab === 'payments' && (
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-green-400/10 border border-green-400/20 rounded-2xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-2xl font-black text-green-400">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/20 border border-border/30 rounded-2xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-2">Trainer Sessions</p>
                <p className="text-2xl font-black text-yellow-400">{allPayments.filter((p: any) => p.type === 'trainer').length}</p>
              </div>
              <div className="bg-secondary/20 border border-border/30 rounded-2xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-2">Subscriptions</p>
                <p className="text-2xl font-black text-purple-400">{allPayments.filter((p: any) => p.type === 'subscription').length}</p>
              </div>
            </div>
            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> All Payments
              </h3>
              {allPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payments found.</p>
              ) : (
                <div className="space-y-2">
                  {allPayments.map((payment: any) => (
                    <div key={payment.id} className="p-3 rounded-xl bg-secondary/30 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{payment.type}</p>
                        <p className="text-xs text-muted-foreground">User: {payment.userId?.substring(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{payment.amount?.toLocaleString()}</p>
                        <span className="text-[10px] text-green-400">{payment.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── SUBSCRIPTIONS TAB ─── */}
        {activeTab === 'subscriptions' && (
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total', value: allSubscriptions.length, color: 'text-foreground' },
                { label: 'Active', value: allSubscriptions.filter((s: any) => s.status === 'active').length, color: 'text-primary' },
                { label: 'Subscription Revenue', value: `₹${allSubscriptions.filter((s: any) => s.status === 'active').reduce((s: number, sub: any) => s + (sub.price || 0), 0).toLocaleString()}`, color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary/20 border border-border/30 rounded-2xl p-5 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" /> All Subscriptions
              </h3>
              {allSubscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No subscriptions found.</p>
              ) : (
                <div className="space-y-2">
                  {allSubscriptions.map((sub: any) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-secondary/30 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">{sub.plan} Plan</p>
                        <p className="text-xs text-muted-foreground">User: {sub.userId?.substring(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400">₹{sub.price?.toLocaleString()}</p>
                        <span className={`text-[10px] ${sub.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>{sub.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <motion.div variants={itemVariants} className="space-y-4 max-w-2xl">
            {[
              { icon: Database, title: 'Database Management', desc: 'View Supabase connection and table health', button: 'Manage' },
              { icon: Lock, title: 'Security Settings', desc: 'Configure RLS policies and access controls', button: 'Configure' },
              { icon: BarChart3, title: 'Analytics', desc: 'System performance metrics and usage stats', button: 'View' },
              { icon: Settings, title: 'App Settings', desc: 'Configure application-level preferences', button: 'Edit' },
            ].map(setting => (
              <div key={setting.title} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                    <setting.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{setting.title}</p>
                    <p className="text-xs text-muted-foreground">{setting.desc}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10">
                  {setting.button}
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
