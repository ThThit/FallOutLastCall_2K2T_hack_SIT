import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Shield, Skull, MapPin, X, Package } from "lucide-react";

interface Supply {
  name: string;
  quantity: number;
  condition: string;
}

interface Sector {
  id: string;
  name: string;
  status: 'safe' | 'caution' | 'danger' | 'quarantine';
  population: number;
  threats: string[];
  supplies: Supply[];
}

export function SectorMap() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const sectors: Sector[] = [
    {
      id: '1',
      name: 'SECTOR 1',
      status: 'safe',
      population: 234,
      threats: [],
      supplies: [
        { name: 'MEDICAL KITS', quantity: 12, condition: 'Good' },
        { name: 'CANNED FOOD', quantity: 45, condition: 'Good' },
        { name: 'BATTERIES', quantity: 67, condition: 'Pristine' },
        { name: 'WATER FILTERS', quantity: 8, condition: 'Good' },
      ]
    },
    {
      id: '2',
      name: 'SECTOR 2',
      status: 'caution',
      population: 156,
      threats: ['Low supplies'],
      supplies: [
        { name: 'CANNED FOOD', quantity: 8, condition: 'Worn' },
        { name: 'BATTERIES', quantity: 12, condition: 'Good' },
      ]
    },
    {
      id: '3',
      name: 'SECTOR 3',
      status: 'safe',
      population: 312,
      threats: [],
      supplies: [
        { name: 'MEDICAL KITS', quantity: 15, condition: 'Good' },
        { name: 'FUEL CANISTERS', quantity: 23, condition: 'Good' },
        { name: 'AMMUNITION', quantity: 89, condition: 'Pristine' },
        { name: 'RADIO PARTS', quantity: 5, condition: 'Worn' },
        { name: 'CANNED FOOD', quantity: 56, condition: 'Good' },
      ]
    },
    {
      id: '4',
      name: 'SECTOR 4',
      status: 'danger',
      population: 45,
      threats: ['Hostile activity'],
      supplies: [
        { name: 'AMMUNITION', quantity: 34, condition: 'Damaged' },
        { name: 'BATTERIES', quantity: 6, condition: 'Worn' },
      ]
    },
    {
      id: '5',
      name: 'SECTOR 5',
      status: 'caution',
      population: 189,
      threats: ['Unstable structures'],
      supplies: [
        { name: 'MEDICAL KITS', quantity: 7, condition: 'Worn' },
        { name: 'CANNED FOOD', quantity: 23, condition: 'Good' },
        { name: 'WATER FILTERS', quantity: 4, condition: 'Damaged' },
      ]
    },
    {
      id: '6',
      name: 'SECTOR 6',
      status: 'safe',
      population: 267,
      threats: [],
      supplies: [
        { name: 'FUEL CANISTERS', quantity: 18, condition: 'Good' },
        { name: 'BATTERIES', quantity: 45, condition: 'Good' },
        { name: 'CANNED FOOD', quantity: 67, condition: 'Pristine' },
        { name: 'RADIO PARTS', quantity: 3, condition: 'Good' },
      ]
    },
    {
      id: '7',
      name: 'SECTOR 7',
      status: 'quarantine',
      population: 0,
      threats: ['Contaminated', 'Military lockdown'],
      supplies: []
    },
    {
      id: '8',
      name: 'SECTOR 8',
      status: 'danger',
      population: 23,
      threats: ['No communication'],
      supplies: [
        { name: 'AMMUNITION', quantity: 12, condition: 'Damaged' },
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'border-terminal-green bg-terminal-green/5';
      case 'caution': return 'border-[#ffff00] bg-warning-amber/5';
      case 'danger': return 'border-[#ff0000] bg-[#ff0000]/5';
      case 'quarantine': return 'border-[#ff8800] bg-[#ff8800]/20';
      default: return 'border-muted-foreground bg-muted/5';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return Shield;
      case 'caution': return AlertTriangle;
      case 'danger': return AlertTriangle;
      case 'quarantine': return Skull;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-gray border border-emergency-red/30 p-4">
        <div className="text-xs font-mono text-emergency-red tracking-wide mb-2">
          ⚠ TACTICAL OVERVIEW
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time sector status updated every 15 minutes. Avoid quarantine zones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectors.map((sector) => {
          const StatusIcon = getStatusIcon(sector.status);

          return (
            <motion.div
              key={sector.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedSector(sector)}
              className={`border-2 p-4 cursor-pointer ${getStatusColor(sector.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white mb-1">
                    {sector.name}
                  </h4>
                  <div className="text-xs text-muted-foreground font-mono">
                    POP: {sector.population}
                  </div>
                </div>
                <StatusIcon className={`w-5 h-5 ${
                  sector.status === 'safe' ? 'text-terminal-green' :
                  sector.status === 'caution' ? 'text-[#ffff00]' :
                  sector.status === 'danger' ? 'text-[#ff0000]' :
                  sector.status === 'quarantine' ? 'text-[#ff8800]' :
                  'text-[#ff8800]'
                }`} />
              </div>

              <div className={`px-2 py-1 text-xs font-mono uppercase mb-3 ${
                sector.status === 'safe' ? 'bg-terminal-green/20 text-terminal-green' :
                sector.status === 'caution' ? 'bg-[#ffff00]/20 text-[#ffff00]' :
                sector.status === 'danger' ? 'bg-[#ff0000]/20 text-[#ff0000]' :
                sector.status === 'quarantine' ? 'bg-[#ff8800]/30 text-[#ff8800]' :
                'bg-[#ff8800]/30 text-[#ff8800]'
              }`}>
                {sector.status}
              </div>

              {sector.threats.length > 0 && (
                <div className="space-y-1">
                  {sector.threats.map((threat, index) => (
                    <div key={index} className="text-xs font-mono text-muted-foreground">
                      • {threat}
                    </div>
                  ))}
                </div>
              )}

              {sector.status === 'quarantine' && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mt-3 pt-3 border-t border-[#ff8800]/30"
                >
                  <div className="text-xs font-mono text-[#ff8800]">
                    ⚠ DO NOT ENTER
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card border border-terminal-green/20 p-6">
        <h3 className="text-white mb-4">LEGEND</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-terminal-green" />
            <span className="text-xs font-mono text-muted-foreground">SAFE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ffff00]" />
            <span className="text-xs font-mono text-muted-foreground">CAUTION</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ff0000]" />
            <span className="text-xs font-mono text-muted-foreground">DANGER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ff8800]" />
            <span className="text-xs font-mono text-muted-foreground">QUARANTINE</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedSector(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-dark-gray border-2 border-terminal-green/30 p-6"
            >
              <button
                onClick={() => setSelectedSector(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-terminal-green transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-white mb-2">{selectedSector.name}</h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <div>POPULATION: {selectedSector.population}</div>
                  <div className={`px-2 py-1 uppercase ${
                    selectedSector.status === 'safe' ? 'bg-terminal-green/20 text-terminal-green' :
                    selectedSector.status === 'caution' ? 'bg-[#ffff00]/20 text-[#ffff00]' :
                    selectedSector.status === 'danger' ? 'bg-[#ff0000]/20 text-[#ff0000]' :
                    'bg-[#ff8800]/30 text-[#ff8800]'
                  }`}>
                    {selectedSector.status}
                  </div>
                </div>
              </div>

              {selectedSector.threats.length > 0 && (
                <div className="bg-emergency-red/10 border border-emergency-red/30 p-4 mb-6">
                  <div className="text-xs font-mono text-emergency-red tracking-wide mb-2">
                    ⚠ ACTIVE THREATS
                  </div>
                  <div className="space-y-1">
                    {selectedSector.threats.map((threat, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {threat}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-terminal-green" />
                  AVAILABLE SUPPLIES
                </h3>
                {selectedSector.supplies.length === 0 ? (
                  <div className="bg-charcoal border border-emergency-red/30 p-6 text-center">
                    <div className="text-sm text-emergency-red font-mono">
                      NO SUPPLIES AVAILABLE
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {selectedSector.status === 'quarantine' ? 'Sector is under quarantine' : 'Area depleted'}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedSector.supplies.map((supply, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-charcoal border border-terminal-green/20 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-terminal-green" />
                          <div>
                            <div className="text-sm text-terminal-green font-mono">
                              {supply.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-1">
                              CONDITION: {supply.condition.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-terminal-green font-mono">
                          QTY: {supply.quantity}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedSector(null)}
                className="w-full px-4 py-3 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm tracking-wide hover:bg-terminal-green/20 transition-colors"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
