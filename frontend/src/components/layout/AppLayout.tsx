import { Outlet, useLocation } from "react-router-dom";
import { Scanlines } from "../scanlines";
import { NoiseOverlay } from "../noise-overlay";
import { CRTGlow } from "../crt-glow";
import { StatusBar } from "../status-bar";
import { Sidebar } from "../sidebar";
import { MobileNav } from "../mobile-nav";
import { SignalStrength } from "../signal-strength";
import { LoginScreen } from "../login-screen";
import { navRoutes } from "../nav-config";
import { useAuth } from "../../context/AuthContext";

export function AppLayout() {
  const { isLoggedIn, isInitializing } = useAuth();
  const location = useLocation();

  // While the session is being restored from the cookie, don't flash login.
  if (isInitializing) {
    return (
      <div className="size-full bg-background flex items-center justify-center">
        <div className="font-mono text-terminal-green text-sm tracking-widest animate-pulse">
          ESTABLISHING SIGNAL…
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const current = navRoutes.find((route) => route.path === location.pathname);

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden">
      <Scanlines />
      <NoiseOverlay />
      <CRTGlow />
      <StatusBar />

      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h1 className="tracking-tight text-white mb-1">
                  {current?.title}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {current?.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SignalStrength />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
