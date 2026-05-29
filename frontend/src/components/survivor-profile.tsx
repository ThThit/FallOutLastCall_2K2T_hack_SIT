import { motion } from "motion/react";
import { User, MapPin, Calendar, Award, Radio, AlertTriangle } from "lucide-react";
import { GlitchText } from "./glitch-text";

export function SurvivorProfile() {
  const stats = [
    { label: 'BROADCASTS', value: '47', trend: 'up' },
    { label: 'VERIFIED', value: '89%', trend: 'stable' },
    { label: 'TRADES', value: '23', trend: 'up' },
    { label: 'WARNINGS', value: '2', trend: 'down' },
  ];

  const recentActivity = [
    { type: 'broadcast', text: 'Shared safe shelter location', time: '2h ago' },
    { type: 'trade', text: 'Traded medicine for fuel', time: '5h ago' },
    { type: 'verified', text: 'Verified NOMAD-12 signal', time: '8h ago' },
    { type: 'warning', text: 'Flagged contaminated zone', time: '12h ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-dark-gray border border-terminal-green/30 flex items-center justify-center">
            <User className="w-12 h-12 text-terminal-green" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-white">
                <GlitchText text="OUTPOST-47" intensity={0.1} />
              </h2>
              <div className="px-2 py-1 bg-terminal-green/20 text-terminal-green text-xs font-mono">
                VERIFIED
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                SECTOR 3
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                JOINED 156 DAYS AGO
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                ACTIVE TRANSMITTER
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                TRUSTED TRADER
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className="bg-card border border-terminal-green/20 p-4 text-center"
          >
            <div className="text-2xl text-terminal-green font-mono mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-terminal-green/20 p-6">
        <h3 className="text-white mb-4">RECENT ACTIVITY</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 pb-3 border-b border-terminal-green/10 last:border-0"
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'broadcast' ? 'bg-terminal-green' :
                activity.type === 'trade' ? 'bg-cyan-accent' :
                activity.type === 'verified' ? 'bg-warning-amber' :
                'bg-emergency-red'
              }`} />
              <div className="flex-1">
                <div className="text-sm text-white">{activity.text}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-gray border border-warning-amber/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-amber mt-0.5" />
          <div>
            <div className="text-sm text-warning-amber font-mono mb-2">
              SURVIVAL TIP
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintain regular broadcasts to keep your trust score high. Verify other survivors' signals to build community reputation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
