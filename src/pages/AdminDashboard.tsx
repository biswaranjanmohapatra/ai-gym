import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Shield, Settings, BarChart3, UserCheck, Calendar, 
  TrendingUp, Activity, Award, AlertCircle, CheckCircle, XCircle,
  Database, Lock, Eye, EyeOff, DollarSign
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  totalTrainers: number;
  totalAdmins: number;
  activeUsers: number;
}

interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0, totalTrainers: 0, totalAdmins: 0, activeUsers: 0 });
  const [bookingStats, setBookingStats] = useState<BookingStats>({ totalBookings: 0, activeBookings: 0, completedBookings: 0, cancelledBookings: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trainers' | 'bookings' | 'payments' | 'subscriptions' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentUsers();
      fetchAdminData();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'users' || tab === 'trainers' || tab === 'bookings' || tab === 'payments' || tab === 'subscriptions' || tab === 'settings' || tab === 'overview') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchAdminData = async () => {
    const [{ data: trainers }, { data: bookings }, { data: payments }, { data: subscriptions }] = await Promise.all([
      supabase.from('trainer_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('trainer_bookings').select('*').order('booking_date', { ascending: false }),
      supabase.from('payments' as any).select('*').order('date', { ascending: false }),
      supabase.from('subscriptions' as any).select('*').order('created_at', { ascending: false }),
    ]);
    setAllTrainers(trainers || []);
    setAllBookings(bookings || []);
    setAllPayments(payments || []);
    setAllSubscriptions(subscriptions || []);
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) {
      toast.error('Failed to delete user');
      return;
    }
    toast.success('User removed');
    fetchRecentUsers();
  };

  const deleteTrainer = async (trainerId: string) => {
    const { error } = await supabase.from('trainer_profiles').delete().eq('id', trainerId);
    if (error) {
      toast.error('Failed to delete trainer');
      return;
    }
    toast.success('Trainer removed');
    fetchAdminData();
  };

  const fetchStats = async () => {
    try {
      // Fetch user role counts
      const { data: allRoles } = await supabase.from('user_roles').select('role');
      if (allRoles) {
        const totalUsers = allRoles.filter(r => r.role === 'user').length;
        const totalTrainers = allRoles.filter(r => r.role === 'trainer').length;
        const totalAdmins = allRoles.filter(r => r.role === 'admin').length;
        setUserStats({ 
          totalUsers, 
          totalTrainers, 
          totalAdmins, 
          activeUsers: allRoles.length 
        });
      }

      // Fetch booking stats
      const { data: bookings } = await supabase.from('trainer_bookings').select('status');
      if (bookings) {
        setBookingStats({
          totalBookings: bookings.length,
          activeBookings: bookings.filter(b => b.status === 'active').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      // Fetch recent user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .limit(10);
      
      if (roles) {
        // Fetch profiles for these users
        const userIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, created_at')
          .in('user_id', userIds);
        
        // Combine roles with profiles
        const usersWithRoles = roles.map(role => {
          const profile = profiles?.find(p => p.user_id === role.user_id);
          return {
            user_id: role.user_id,
            name: profile?.name || 'No name',
            role: role.role,
            created_at: profile?.created_at || new Date().toISOString(),
          };
        });
        setRecentUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'trainers' as const, label: 'Trainers', icon: Award },
    { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
    { id: 'payments' as const, label: 'Payments', icon: DollarSign },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: Database },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8" style={{ color: 'hsl(280 100% 50%)' }} />
            <h1 className="font-display text-4xl md:text-5xl text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, bookings, and system settings.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: 'Total Users', value: userStats.totalUsers, color: 'text-primary' },
                { icon: Award, label: 'Trainers', value: userStats.totalTrainers, color: 'text-accent' },
                { icon: Shield, label: 'Admins', value: userStats.totalAdmins, color: 'text-purple-400' },
                { icon: Activity, label: 'Active Users', value: userStats.activeUsers, color: 'text-primary' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Booking Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Calendar, label: 'Total Bookings', value: bookingStats.totalBookings, color: 'text-primary' },
                { icon: CheckCircle, label: 'Active', value: bookingStats.activeBookings, color: 'text-accent' },
                { icon: TrendingUp, label: 'Completed', value: bookingStats.completedBookings, color: 'text-primary' },
                { icon: XCircle, label: 'Cancelled', value: bookingStats.cancelledBookings, color: 'text-destructive' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Users */}
            <motion.div variants={itemVariants} className="glass-card p-6 mb-8">
              <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Recent Users
              </h3>
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((profile: any) => (
                    <motion.div key={profile.user_id} whileHover={{ x: 4 }} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                      <div>
                        <p className="text-foreground font-medium">{profile.name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground">
                          User ID: {profile.user_id?.substring(0, 8)}... • 
                          {profile.role || 'user'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No users found.</p>
              )}
            </motion.div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> All Users
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Total: {userStats.totalUsers} users, {userStats.totalTrainers} trainers, {userStats.totalAdmins} admins
            </p>
            <div className="space-y-3">
              {recentUsers.map((profile: any) => (
                <motion.div key={profile.user_id} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{profile.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">ID: {profile.user_id?.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      profile.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                      profile.role === 'trainer' ? 'bg-accent/10 text-accent' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {profile.role || 'user'}
                    </span>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => deleteUser(profile.user_id)}>
                        Delete User
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <h3 className="font-display text-xl text-foreground mt-8 mb-4">Manage Trainers</h3>
            <div className="space-y-3">
              {allTrainers.map((trainer: any) => (
                <div key={trainer.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                  <div>
                    <p className="text-foreground font-medium">{trainer.name}</p>
                    <p className="text-xs text-muted-foreground">{trainer.specialty} • ₹{trainer.price_per_session || 0}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => deleteTrainer(trainer.id)}>
                    Delete Trainer
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Manage Trainers
            </h3>
            <div className="space-y-3">
              {allTrainers.map((trainer: any) => (
                <div key={trainer.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                  <div>
                    <p className="text-foreground font-medium">{trainer.name}</p>
                    <p className="text-xs text-muted-foreground">{trainer.specialty} • ₹{trainer.price_per_session || 0}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => deleteTrainer(trainer.id)}>
                    Delete Trainer
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> All Bookings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
                <p className="font-display text-2xl text-primary">{bookingStats.totalBookings}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="font-display text-2xl text-accent">{bookingStats.activeBookings}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="font-display text-2xl text-primary">{bookingStats.completedBookings}</p>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              {allBookings.slice(0, 25).map((booking: any) => (
                <div key={booking.id} className="p-3 rounded-lg bg-secondary/40 flex justify-between">
                  <div>
                    <p className="text-sm text-foreground">User: {booking.user_id}</p>
                    <p className="text-xs text-muted-foreground">Trainer: {booking.trainer_id}</p>
                    <p className="text-xs text-muted-foreground">{booking.booking_date} • {booking.start_time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">₹{booking.payment_amount || 0}</p>
                    <p className="text-[10px] text-muted-foreground">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-display text-xl text-foreground mb-4">All Payments</h3>
            <div className="space-y-2">
              {allPayments.slice(0, 25).map((payment: any) => (
                <div key={payment.id} className="p-3 rounded-lg bg-secondary/40 flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">User: {payment.user_id}</p>
                    <p className="text-xs text-muted-foreground">Trainer: {payment.trainer_id || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">₹{payment.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4">All Payments</h3>
            <div className="space-y-2">
              {allPayments.map((payment: any) => (
                <div key={payment.id} className="p-3 rounded-lg bg-secondary/40 flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">User: {payment.user_id}</p>
                    <p className="text-xs text-muted-foreground">Trainer: {payment.trainer_id || '-'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">₹{payment.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{payment.type || 'trainer'} • {payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4">All Subscriptions</h3>
            <div className="space-y-2">
              {allSubscriptions.map((sub: any) => (
                <div key={sub.id} className="p-3 rounded-lg bg-secondary/40 flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">User: {sub.user_id}</p>
                    <p className="text-xs text-muted-foreground">Plan: {sub.plan}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">₹{sub.price}</p>
                    <p className="text-[10px] text-muted-foreground">{sub.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> System Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-foreground font-medium">Database Management</p>
                    <p className="text-xs text-muted-foreground">Manage database connections and backups</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-foreground font-medium">Security Settings</p>
                    <p className="text-xs text-muted-foreground">Configure security policies and access controls</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-foreground font-medium">System Analytics</p>
                    <p className="text-xs text-muted-foreground">View system performance and analytics</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

