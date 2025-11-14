import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PlayerHealthProps {
  player: "player1" | "player2";
  health: number;
  maxHealth: number;
  isActive: boolean;
}

export const PlayerHealth = ({ player, health, maxHealth, isActive }: PlayerHealthProps) => {
  const [prevHealth, setPrevHealth] = useState(health);
  const [isDamaged, setIsDamaged] = useState(false);

  useEffect(() => {
    if (health < prevHealth) {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 500);
    }
    setPrevHealth(health);
  }, [health, prevHealth]);

  const healthPercentage = (health / maxHealth) * 100;
  const playerName = player === "player1" ? "Player 1" : "Player 2";

  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-6 shadow-lg border-2 transition-all duration-300",
        "min-w-[200px]",
        isActive && "border-accent-foreground scale-105",
        !isActive && "border-border opacity-75",
        player === "player1" && isActive && "border-player1",
        player === "player2" && isActive && "border-player2"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full",
              player === "player1" && "bg-player1",
              player === "player2" && "bg-player2"
            )}
          />
          <h2 className="text-xl font-bold text-foreground">{playerName}</h2>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Health</span>
            <span
              className={cn(
                "text-3xl font-bold transition-all duration-300",
                player === "player1" && "text-player1",
                player === "player2" && "text-player2",
                isDamaged && "animate-damage-flash"
              )}
            >
              {health}
            </span>
          </div>

          <div className="h-4 bg-health-bar-bg rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                player === "player1" && "bg-player1",
                player === "player2" && "bg-player2"
              )}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>

          <div className="text-xs text-muted-foreground text-right">
            {health} / {maxHealth}
          </div>
        </div>
      </div>
    </div>
  );
};
