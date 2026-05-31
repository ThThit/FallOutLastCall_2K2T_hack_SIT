import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { navRoutes } from "./nav-config";

export function MobileNav() {
  const navItems = navRoutes.filter((item) => item.mobileLabel);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border md:hidden z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
                  isActive ? "text-terminal-green" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute top-0 left-0 right-0 h-0.5 bg-terminal-green"
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-mono tracking-wider">
                    {item.mobileLabel}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
