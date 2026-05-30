import { Radio, Package, Map, UserCircle, Vault } from "lucide-react";
import { motion } from "motion/react";

interface MobileNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const navItems = [
    { id: "signals", icon: Radio, label: "FEED" },
    { id: "vault", icon: Vault, label: "VAULT" },
    { id: "market", icon: Package, label: "MARKET" },
    { id: "sectors", icon: Map, label: "MAP" },
    { id: "settings", icon: UserCircle, label: "ABOUT" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border md:hidden z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
                isActive ? "text-terminal-green" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-terminal-green"
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
