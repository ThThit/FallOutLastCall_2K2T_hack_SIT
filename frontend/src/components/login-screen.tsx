import { useState } from "react";
import { motion } from "motion/react";
import { Radio, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { GlitchText } from "./glitch-text";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [callsign, setCallsign] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (callsign.length < 3) {
      setWarningMessage("CALLSIGN TOO SHORT");
      setShowWarning(true);
      return;
    }
    
    if (password.length < 6) {
      setWarningMessage("PASSWORD MUST BE AT LEAST 6 CHARACTERS");
      setShowWarning(true);
      return;
    }
    
    if (isRegisterMode && password !== confirmPassword) {
      setWarningMessage("PASSWORDS DO NOT MATCH");
      setShowWarning(true);
      return;
    }
    
    onLogin();
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.02)_2px,rgba(0,255,65,0.02)_4px)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        <div className="bg-dark-gray border-2 border-terminal-green/30 p-8">
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{
                opacity: [1, 0.7, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Radio className="w-16 h-16 text-terminal-green" />
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h1 className="tracking-widest text-terminal-green mb-2">
              <GlitchText text="LAST CALL" intensity={0.2} />
            </h1>
            <div className="text-xs text-muted-foreground font-mono tracking-wide">
              SURVIVOR COMMUNICATION NETWORK
            </div>
            <div className="text-xs text-warning-amber font-mono mt-2">
              v2.1.47 // EXPERIMENTAL BUILD
            </div>
          </div>

          <div className="bg-charcoal border border-emergency-red/30 p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-emergency-red mt-0.5" />
              <div className="text-xs text-muted-foreground font-mono leading-relaxed">
                <p className="text-emergency-red mb-2">SYSTEM WARNING</p>
                <p>Network unstable. Signal interference detected. Connection may be monitored.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                {isRegisterMode ? 'CREATE CALLSIGN' : 'ENTER CALLSIGN'}
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => {
                  setCallsign(e.target.value.toUpperCase());
                  setShowWarning(false);
                }}
                placeholder="SURVIVOR-###"
                className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-terminal-green font-mono focus:border-terminal-green focus:outline-none transition-colors"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                {isRegisterMode ? 'CREATE PASSWORD' : 'ENTER PASSWORD'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowWarning(false);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-terminal-green font-mono focus:border-terminal-green focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-terminal-green transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setShowWarning(false);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-terminal-green font-mono focus:border-terminal-green focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-terminal-green transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {showWarning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-emergency-red font-mono"
              >
                {warningMessage}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-terminal-green/10 hover:bg-terminal-green/20 border border-terminal-green text-terminal-green py-3 font-mono tracking-widest transition-colors"
            >
              {isRegisterMode ? 'REGISTER & CONNECT' : 'ESTABLISH CONNECTION'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setShowWarning(false);
                setConfirmPassword("");
              }}
              className="w-full bg-charcoal border border-terminal-green/30 hover:border-terminal-green/50 text-muted-foreground hover:text-terminal-green py-3 font-mono text-xs tracking-wide transition-colors"
            >
              {isRegisterMode ? 'ALREADY REGISTERED? LOG IN' : 'NEW SURVIVOR? REGISTER'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-terminal-green/10">
            <div className="text-xs text-muted-foreground font-mono text-center space-y-1">
              <p>NETWORK STATUS: DEGRADED</p>
              <p>ACTIVE SURVIVORS: 1,247</p>
              <p>LAST BROADCAST: 47 SEC AGO</p>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center text-xs text-muted-foreground font-mono mt-4"
        >
          [SEARCHING FOR SIGNAL...]
        </motion.div>
      </motion.div>
    </div>
  );
}