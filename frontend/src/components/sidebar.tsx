import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { navRoutes } from "./nav-config";

export function Sidebar() {
  // Everything except settings lives in the main nav; settings sits in the footer.
  const mainItems = navRoutes.filter((item) => item.path !== "/settings");
  const settings = navRoutes.find((item) => item.path === "/settings")!;
  const SettingsIcon = settings.icon;

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="font-mono tracking-widest text-terminal-green mb-1">
          LAST CALL
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          SURVIVOR NETWORK v2.1
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 font-mono text-xs tracking-wide transition-colors relative ${
                    isActive
                      ? "bg-terminal-green/10 text-terminal-green"
                      : "text-muted-foreground hover:text-terminal-green hover:bg-terminal-green/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-terminal-green"
                      />
                    )}
                    <Icon className="w-4 h-4" />
                    {item.sidebarLabel}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to={settings.path}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2 font-mono text-xs tracking-wide transition-colors ${
              isActive
                ? "bg-terminal-green/10 text-terminal-green"
                : "text-muted-foreground hover:text-terminal-green"
            }`
          }
        >
          <SettingsIcon className="w-4 h-4" />
          {settings.sidebarLabel}
        </NavLink>
      </div>
    </div>
  );
}
