import { cn } from "@/lib/utils";

interface CellProps {
  player: "player1" | "player2" | null;
  onClick: () => void;
  isHighlighted: boolean;
  isLastPlaced: boolean;
  disabled: boolean;
}

export const Cell = ({ player, onClick, isHighlighted, isLastPlaced, disabled }: CellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || player !== null}
      className={cn(
        "w-12 h-12 md:w-14 md:h-14 rounded-lg transition-all duration-200",
        "flex items-center justify-center",
        "border-2 border-board-border",
        !player && !disabled && "hover:bg-board-hover hover:scale-105 cursor-pointer",
        !player && "bg-board-cell",
        player && "cursor-not-allowed",
        isHighlighted && "animate-line-pulse ring-4",
        isHighlighted && player === "player1" && "ring-player1",
        isHighlighted && player === "player2" && "ring-player2",
        disabled && !player && "opacity-50 cursor-not-allowed"
      )}
    >
      {player && (
        <div
          className={cn(
            "w-9 h-9 md:w-10 md:h-10 rounded-full",
            player === "player1" && "bg-player1",
            player === "player2" && "bg-player2",
            isLastPlaced && "animate-piece-drop",
            "shadow-lg"
          )}
        />
      )}
    </button>
  );
};
