import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

interface GameStatusProps {
  currentPlayer: "player1" | "player2";
  gameState: "inProgress" | "player1Wins" | "player2Wins" | "draw";
  onReset: () => void;
}

export const GameStatus = ({ currentPlayer, gameState, onReset }: GameStatusProps) => {
  const getStatusMessage = () => {
    if (gameState === "player1Wins") return "You Win!";
    if (gameState === "player2Wins") return "Computer Wins!";
    if (gameState === "draw") return "It's a Draw!";
    return currentPlayer === "player1" ? "Your Turn" : "Computer's Turn";
  };

  const getStatusColor = () => {
    if (gameState === "player1Wins") return "text-player1";
    if (gameState === "player2Wins") return "text-player2";
    if (gameState === "draw") return "text-muted-foreground";
    return currentPlayer === "player1" ? "text-player1" : "text-player2";
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-md border border-border flex flex-col gap-3 min-w-[300px]">
      <div className="text-center">
        <h3 className={cn("text-2xl font-bold transition-colors", getStatusColor())}>
          {getStatusMessage()}
        </h3>
        {gameState === "inProgress" && (
          <p className="text-sm text-muted-foreground mt-1">
            Form lines of 4+ to deal damage
          </p>
        )}
      </div>

      {gameState !== "inProgress" && (
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>
      )}
    </div>
  );
};
