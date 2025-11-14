import { useState, useEffect, useCallback } from "react";
import { Cell } from "./Cell";
import { PlayerHealth } from "./PlayerHealth";
import { GameStatus } from "./GameStatus";
import { toast } from "sonner";

type Player = "player1" | "player2" | null;
type Board = Player[][];
type GameState = "inProgress" | "player1Wins" | "player2Wins" | "draw";

interface Line {
  positions: [number, number][];
  length: number;
}

const BOARD_SIZE = 7;
const INITIAL_HEALTH = 15;

export const GameBoard = () => {
  const [board, setBoard] = useState<Board>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [player1Health, setPlayer1Health] = useState(INITIAL_HEALTH);
  const [player2Health, setPlayer2Health] = useState(INITIAL_HEALTH);
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">("player1");
  const [gameState, setGameState] = useState<GameState>("inProgress");
  const [highlightedLines, setHighlightedLines] = useState<Set<string>>(new Set());
  const [lastPlacedCell, setLastPlacedCell] = useState<[number, number] | null>(null);
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  const initializeGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setPlayer1Health(INITIAL_HEALTH);
    setPlayer2Health(INITIAL_HEALTH);
    setCurrentPlayer("player1");
    setGameState("inProgress");
    setHighlightedLines(new Set());
    setLastPlacedCell(null);
    setIsProcessingMove(false);
  };

  const detectLines = (row: number, col: number, player: Player): Line[] => {
    if (!player) return [];
    
    const lines: Line[] = [];
    const directions = [
      { dr: 0, dc: 1 },   // Horizontal
      { dr: 1, dc: 0 },   // Vertical
      { dr: 1, dc: 1 },   // Diagonal (main)
      { dr: 1, dc: -1 },  // Diagonal (anti)
    ];

    for (const { dr, dc } of directions) {
      const positions: [number, number][] = [[row, col]];
      
      // Scan in positive direction
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        positions.push([r, c]);
        r += dr;
        c += dc;
      }
      
      // Scan in negative direction
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        positions.unshift([r, c]);
        r -= dr;
        c -= dc;
      }
      
      if (positions.length >= 4) {
        lines.push({ positions, length: positions.length });
      }
    }
    
    return lines;
  };

  const calculateDamage = (lines: Line[]): number => {
    return lines.reduce((total, line) => total + line.length, 0);
  };

  const applyDamage = (player: "player1" | "player2", damage: number) => {
    if (player === "player1") {
      setPlayer1Health(prev => Math.max(0, prev - damage));
    } else {
      setPlayer2Health(prev => Math.max(0, prev - damage));
    }
  };

  const checkWinCondition = (): GameState => {
    if (player1Health <= 0 && player2Health <= 0) {
      return "draw";
    }
    if (player1Health <= 0) {
      return "player2Wins";
    }
    if (player2Health <= 0) {
      return "player1Wins";
    }
    
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull) {
      if (player1Health > player2Health) return "player1Wins";
      if (player2Health > player1Health) return "player2Wins";
      return "draw";
    }
    
    return "inProgress";
  };

  const placePiece = (row: number, col: number) => {
    if (gameState !== "inProgress" || board[row][col] !== null || isProcessingMove) return;

    setIsProcessingMove(true);
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastPlacedCell([row, col]);

    // Detect lines after board update
    setTimeout(() => {
      const lines = detectLines(row, col, currentPlayer);
      
      if (lines.length > 0) {
        const damage = calculateDamage(lines);
        const opponent = currentPlayer === "player1" ? "player2" : "player1";
        
        // Highlight formed lines
        const lineKeys = new Set<string>();
        lines.forEach(line => {
          line.positions.forEach(([r, c]) => {
            lineKeys.add(`${r}-${c}`);
          });
        });
        setHighlightedLines(lineKeys);
        
        // Apply damage
        applyDamage(opponent, damage);
        
        const playerName = currentPlayer === "player1" ? "You" : "Computer";
        toast.success(
          `${playerName} formed ${lines.length} line${lines.length > 1 ? "s" : ""}! Dealt ${damage} damage!`,
          { duration: 2000 }
        );
        
        // Clear highlights after animation
        setTimeout(() => setHighlightedLines(new Set()), 2000);
      }
      
      setCurrentPlayer(prev => prev === "player1" ? "player2" : "player1");
      setIsProcessingMove(false);
    }, 100);
  };

  // AI move evaluation
  const evaluatePosition = useCallback((testBoard: Board, row: number, col: number, player: Player): number => {
    if (!player || testBoard[row][col] !== null) return -1000;
    
    let score = 0;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 },
    ];

    for (const { dr, dc } of directions) {
      let count = 1;
      
      // Count in positive direction
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && testBoard[r][c] === player) {
        count++;
        r += dr;
        c += dc;
      }
      
      // Count in negative direction
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && testBoard[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
      }
      
      // Score based on line length
      if (count >= 4) {
        score += count * 100; // High priority for damage-dealing moves
      } else if (count === 3) {
        score += 30; // Good setup for future damage
      } else if (count === 2) {
        score += 10; // Potential line building
      }
    }
    
    // Small bonus for center positions
    const centerDist = Math.abs(row - 3) + Math.abs(col - 3);
    score += (7 - centerDist) * 2;
    
    return score;
  }, []);

  const makeAIMove = useCallback(() => {
    if (currentPlayer !== "player2" || gameState !== "inProgress" || isProcessingMove) return;

    // Delay AI move for better UX
    setTimeout(() => {
      let bestScore = -Infinity;
      let bestMoves: [number, number][] = [];

      // Evaluate all possible moves
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (board[row][col] === null) {
            // Check offensive potential (AI's moves)
            const offensiveScore = evaluatePosition(board, row, col, "player2");
            
            // Check defensive need (block Player 1)
            const defensiveScore = evaluatePosition(board, row, col, "player1") * 0.8;
            
            const totalScore = Math.max(offensiveScore, defensiveScore);
            
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestMoves = [[row, col]];
            } else if (totalScore === bestScore) {
              bestMoves.push([row, col]);
            }
          }
        }
      }

      // Pick random move from best moves
      if (bestMoves.length > 0) {
        const [row, col] = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        placePiece(row, col);
      }
    }, 800); // 800ms delay for AI move
  }, [currentPlayer, gameState, board, evaluatePosition, isProcessingMove]);

  // Trigger AI move when it's Player 2's turn
  useEffect(() => {
    if (currentPlayer === "player2" && gameState === "inProgress" && !isProcessingMove) {
      makeAIMove();
    }
  }, [currentPlayer, gameState, isProcessingMove]);

  useEffect(() => {
    const state = checkWinCondition();
    if (state !== "inProgress") {
      setGameState(state);
      setTimeout(() => {
        if (state === "player1Wins") {
          toast.success("Player 1 Wins!", { duration: 5000 });
        } else if (state === "player2Wins") {
          toast.success("Player 2 Wins!", { duration: 5000 });
        } else {
          toast.info("It's a Draw!", { duration: 5000 });
        }
      }, 500);
    }
  }, [player1Health, player2Health, board]);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-4 gap-8">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground">
        Health Tic-Tac-Toe
        <span className="block text-lg md:text-xl font-normal text-muted-foreground mt-2">
          You vs Computer
        </span>
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <PlayerHealth
          player="player1"
          health={player1Health}
          maxHealth={INITIAL_HEALTH}
          isActive={currentPlayer === "player1" && gameState === "inProgress"}
        />
        
        <div className="flex flex-col gap-4">
          <GameStatus
            currentPlayer={currentPlayer}
            gameState={gameState}
            onReset={initializeGame}
          />
          
          <div className="bg-card rounded-2xl p-4 shadow-2xl border-2 border-border">
            <div className="grid grid-cols-7 gap-1">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    player={cell}
                    onClick={() => placePiece(rowIndex, colIndex)}
                    isHighlighted={highlightedLines.has(`${rowIndex}-${colIndex}`)}
                    isLastPlaced={
                      lastPlacedCell?.[0] === rowIndex && lastPlacedCell?.[1] === colIndex
                    }
                    disabled={gameState !== "inProgress" || currentPlayer !== "player1" || isProcessingMove}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        <PlayerHealth
          player="player2"
          health={player2Health}
          maxHealth={INITIAL_HEALTH}
          isActive={currentPlayer === "player2" && gameState === "inProgress"}
        />
      </div>
    </div>
  );
};
