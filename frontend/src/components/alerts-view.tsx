import { motion } from "motion/react";
import { AlertTriangle, Bell, CheckCircle, Clock } from "lucide-react";

interface Alert {
  id: string;
  type: "emergency" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  sector?: string;
  isRead: boolean;
}

export function AlertsView() {
  const alerts: Alert[] = [
    {
      id: "1",
      type: "emergency",
      title: "SECTOR 7 QUARANTINED",
      message:
        "All contact prohibited. Military enforcement active. Avoid all access points.",
      timestamp: "1h ago",
      sector: "SECTOR 7",
      isRead: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Water Contamination Alert",
      message:
        "River district water supply tested positive for toxins. Use filtration systems only.",
      timestamp: "3h ago",
      sector: "SECTOR 4",
      isRead: false,
    },
    {
      id: "3",
      type: "success",
      title: "Supply Drop Confirmed",
      message:
        "Medical supplies successfully delivered to northern checkpoint. Distribution begins 06:00.",
      timestamp: "5h ago",
      sector: "SECTOR 1",
      isRead: true,
    },
    {
      id: "4",
      type: "info",
      title: "Network Maintenance",
      message:
        "Communication network will undergo maintenance from 02:00 to 04:00. Expect service interruption.",
      timestamp: "8h ago",
      isRead: true,
    },
    {
      id: "5",
      type: "emergency",
      title: "Hostile Activity Detected",
      message:
        "Armed groups reported in eastern perimeter. Seek shelter immediately. Do not engage.",
      timestamp: "12h ago",
      sector: "SECTOR 8",
      isRead: true,
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case "emergency":
        return {
          border: "border-emergency-red",
          bg: "bg-emergency-red/10",
          text: "text-emergency-red",
          icon: AlertTriangle,
        };
      case "warning":
        return {
          border: "border-warning-amber",
          bg: "bg-warning-amber/10",
          text: "text-warning-amber",
          icon: AlertTriangle,
        };
      case "success":
        return {
          border: "border-terminal-green",
          bg: "bg-terminal-green/10",
          text: "text-terminal-green",
          icon: CheckCircle,
        };
      default:
        return {
          border: "border-cyan-accent",
          bg: "bg-cyan-accent/10",
          text: "text-cyan-accent",
          icon: Bell,
        };
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-card border border-terminal-green/20 p-4 flex-1">
          <div className="text-2xl text-terminal-green font-mono mb-1">
            {unreadCount}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            UNREAD ALERTS
          </div>
        </div>
        <div className="bg-card border border-terminal-green/20 p-4 flex-1">
          <div className="text-2xl text-terminal-green font-mono mb-1">
            {alerts.length}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            TOTAL ALERTS
          </div>
        </div>
        <button className="px-4 py-2 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green font-mono text-xs tracking-wide transition-colors border border-terminal-green/30">
          MARK ALL READ
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const config = getAlertColor(alert.type);
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-card border-l-4 ${config.border} p-4 ${
                !alert.isRead
                  ? "border-r border-t border-b " + config.border
                  : "border border-terminal-green/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 ${config.bg} ${!alert.isRead ? "animate-pulse" : ""}`}
                >
                  <Icon className={`w-5 h-5 ${config.text}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`${config.text} mb-1`}>{alert.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </div>
                        {alert.sector && (
                          <div className="px-2 py-0.5 bg-dark-gray">
                            {alert.sector}
                          </div>
                        )}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-emergency-red rounded-full" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <button className="px-3 py-1 text-xs font-mono text-terminal-green hover:bg-terminal-green/10 transition-colors">
                        MARK READ
                      </button>
                    )}
                    <button className="px-3 py-1 text-xs font-mono text-muted-foreground hover:text-emergency-red transition-colors">
                      DISMISS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
