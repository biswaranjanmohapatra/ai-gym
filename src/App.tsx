import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import TrainerAuthPage from "./pages/TrainerAuthPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import Dashboard from "./pages/Dashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentHistory from "./pages/PaymentHistory";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import DietPage from "./pages/DietPage";
import ExercisesPage from "./pages/ExercisesPage";
import CalendarPage from "./pages/CalendarPage";
import TrainersPage from "./pages/TrainersPage";
import RewardsPage from "./pages/RewardsPage";
import CommunityPage from "./pages/CommunityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppRole = "user" | "trainer" | "admin";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/user-login" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Redirect based on actual role dashboard if logged in with different role
    if (role === "trainer") return <Navigate to="/trainer-dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/user-login" element={<AuthPage />} />
            <Route path="/trainer-login" element={<TrainerAuthPage />} />
            <Route path="/admin-login" element={<AdminAuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/trainer-dashboard" element={<ProtectedRoute allowedRoles={["trainer"]}><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute allowedRoles={["user"]}><WorkoutsPage /></ProtectedRoute>} />
            <Route path="/diet" element={<ProtectedRoute allowedRoles={["user"]}><DietPage /></ProtectedRoute>} />
            <Route path="/exercises" element={<ProtectedRoute allowedRoles={["user"]}><ExercisesPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute allowedRoles={["user"]}><CalendarPage /></ProtectedRoute>} />
            <Route path="/trainers" element={<ProtectedRoute allowedRoles={["user"]}><TrainersPage /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute allowedRoles={["user"]}><RewardsPage /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={["user"]}><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="/payment-history" element={<ProtectedRoute allowedRoles={["user", "trainer", "admin"]}><PaymentHistory /></ProtectedRoute>} />
            <Route path="/booking-history" element={<ProtectedRoute allowedRoles={["user"]}><BookingHistoryPage /></ProtectedRoute>} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
