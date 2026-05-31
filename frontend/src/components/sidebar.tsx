import { motion } from "motion/react";
import { Radio, Package, Archive, Users, Map, UserCircle, Vault } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navItems = [
    { id: 'signals', icon: Radio, label: 'SIGNAL FEED' },
    { id: 'vault', icon: Vault, label: 'VAULT' },
    { id: 'market', icon: Package, label: 'MARKET' },
    { id: 'memories', icon: Archive, label: 'ARCHIVE' },
    { id: 'survivors', icon: Users, label: 'SURVIVORS' },
    { id: 'sectors', icon: Map, label: 'SECTORS' },
  ];

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 font-mono text-xs tracking-wide transition-colors relative ${
                  isActive
                    ? 'bg-terminal-green/10 text-terminal-green'
                    : 'text-muted-foreground hover:text-terminal-green hover:bg-terminal-green/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-terminal-green"
                  />
                )}
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => onSectionChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 font-mono text-xs tracking-wide transition-colors ${
            activeSection === 'settings'
              ? 'bg-terminal-green/10 text-terminal-green'
              : 'text-muted-foreground hover:text-terminal-green'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          ABOUT ME
        </button>
      </div>
    </div>
  );
}