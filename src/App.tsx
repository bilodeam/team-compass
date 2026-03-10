import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { StoreProvider } from "./store/useStore";
import Index from "./pages/Index";
import GoalsPage from "./pages/GoalsPage";
import ActionItemsPage from "./pages/ActionItemsPage";
import TeamDashboard from "./pages/TeamDashboard";
import GoalsSurveyPage from "./pages/GoalsSurveyPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/actions" element={<ActionItemsPage />} />
        <Route path="/goals-survey" element={<GoalsSurveyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </StoreProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
