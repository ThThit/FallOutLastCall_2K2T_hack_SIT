import { Bell } from "lucide-react";

export function AlertsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-card border border-terminal-green/20 p-4 flex-1">
          <div className="text-2xl text-terminal-green font-mono mb-1">0</div>
          <div className="text-xs text-muted-foreground font-mono">UNREAD ALERTS</div>
        </div>
        <div className="bg-card border border-terminal-green/20 p-4 flex-1">
          <div className="text-2xl text-terminal-green font-mono mb-1">0</div>
          <div className="text-xs text-muted-foreground font-mono">TOTAL ALERTS</div>
        </div>
      </div>

      <div className="text-center py-16">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground font-mono text-sm">NO ALERTS</div>
        <p className="text-xs text-muted-foreground mt-2">
          Emergency alerts and system notifications will appear here
        </p>
      </div>
    </div>
  );
}
