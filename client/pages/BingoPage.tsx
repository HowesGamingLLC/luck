import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency, CurrencyType } from "@/contexts/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import {
  Target,
  Users,
  Clock,
  Gem,
  Coins,
  Trophy,
  Play,
  Pause,
  Star,
  Gift,
  ArrowLeft,
  Volume2,
  VolumeX,
  MessageCircle,
  Crown,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

interface BingoRoom {
  id: string;
  name: string;
  type: "speed" | "regular" | "coverall" | "progressive";
  buyIn: { gc: number; sc: number };
  prize: { gc: number; sc: number };
  players: number;
  maxPlayers: number;
  nextGame: Date;
  gameLength: number; // minutes
  difficulty: "Easy" | "Medium" | "Hard";
  isVip?: boolean;
}

interface BingoCard {
  id: string;
  numbers: (number | null)[][];
  marked: boolean[][];
}

interface CalledNumber {
  letter: string;
  number: number;
  timestamp: Date;
}

export default function BingoPage() {
  const { user, canAffordWager, updateBalance } = useCurrency();
  const [selectedRoom, setSelectedRoom] = useState<string>("speed-1");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    CurrencyType.GC,
  );
  const [bingoCards, setBingoCards] = useState<BingoCard[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState<CalledNumber[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMark, setAutoMark] = useState(true);

  const bingoRooms: BingoRoom[] = [
    {
      id: "speed-1",
      name: "Speed Bingo",
      type: "speed",
      buyIn: { gc: 10, sc: 0.1 },
      prize: { gc: 150, sc: 1.5 },
      players: 47,
      maxPlayers: 50,
      nextGame: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      gameLength: 5,
      difficulty: "Easy",
    },
    {
      id: "regular-1",
      name: "Classic 75-Ball",
      type: "regular",
      buyIn: { gc: 25, sc: 0.25 },
      prize: { gc: 400, sc: 4.0 },
      players: 89,
      maxPlayers: 100,
      nextGame: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      gameLength: 15,
      difficulty: "Medium",
    },
    {
      id: "coverall-1",
      name: "Coverall Challenge",
      type: "coverall",
      buyIn: { gc: 50, sc: 0.5 },
      prize: { gc: 1000, sc: 10.0 },
      players: 124,
      maxPlayers: 150,
      nextGame: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes
      gameLength: 25,
      difficulty: "Hard",
    },
    {
      id: "progressive-1",
      name: "Progressive Jackpot",
      type: "progressive",
      buyIn: { gc: 100, sc: 1.0 },
      prize: { gc: 5000, sc: 50.0 },
      players: 67,
      maxPlayers: 200,
      nextGame: new Date(Date.now() + 12 * 60 * 1000), // 12 minutes
      gameLength: 30,
      difficulty: "Hard",
      isVip: true,
    },
  ];

  const recentWinners = [
    {
      name: "Bingo_King***",
      room: "Speed Bingo",
      amount: "1.25 SC",
      pattern: "Line",
      time: "2m ago",
    },
    {
      name: "Lucky_B***",
      room: "Classic 75-Ball",
      amount: "3.50 SC",
      pattern: "X Pattern",
      time: "5m ago",
    },
    {
      name: "Pattern_Pro***",
      room: "Coverall Challenge",
      amount: "8.75 SC",
      pattern: "Coverall",
      time: "12m ago",
    },
    {
      name: "Jackpot_Jane***",
      room: "Progressive",
      amount: "25.00 SC",
      pattern: "Full House",
      time: "18m ago",
    },
  ];

  // Generate a random bingo card
  const generateBingoCard = (): BingoCard => {
    const card: (number | null)[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    const marked: boolean[][] = Array(5)
      .fill(false)
      .map(() => Array(5).fill(false));

    // B column: 1-15, I column: 16-30, N column: 31-45, G column: 46-60, O column: 61-75
    const ranges = [
      [1, 15], // B
      [16, 30], // I
      [31, 45], // N
      [46, 60], // G
      [61, 75], // O
    ];

    for (let col = 0; col < 5; col++) {
      const [min, max] = ranges[col];
      const usedNumbers = new Set<number>();

      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          // Center FREE space
          card[row][col] = null;
          marked[row][col] = true;
        } else {
          let num;
          do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (usedNumbers.has(num));
          usedNumbers.add(num);
          card[row][col] = num;
        }
      }
    }

    return {
      id: `card-${Date.now()}-${Math.random()}`,
      numbers: card,
      marked: marked,
    };
  };

  const currentRoom =
    bingoRooms.find((room) => room.id === selectedRoom) || bingoRooms[0];

  const getTimeUntilNextGame = (nextGame: Date) => {
    const diff = Math.max(0, nextGame.getTime() - Date.now());
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleJoinRoom = (room: BingoRoom) => {
    const cost =
      selectedCurrency === CurrencyType.GC ? room.buyIn.gc : room.buyIn.sc;

    if (!canAffordWager(selectedCurrency, cost)) {
      alert(`Insufficient ${selectedCurrency} balance`);
      return;
    }

    // Generate 4 bingo cards for the player
    const newCards = Array(4)
      .fill(null)
      .map(() => generateBingoCard());
    setBingoCards(newCards);
    setSelectedRoom(room.id);

    // Deduct buy-in cost
    updateBalance(
      selectedCurrency,
      -cost,
      `Bingo room buy-in: ${room.name}`,
      "wager",
    );
  };

  const markNumber = (cardIndex: number, row: number, col: number) => {
    setBingoCards((prev) =>
      prev.map((card, idx) => {
        if (idx === cardIndex) {
          const newMarked = [...card.marked];
          newMarked[row] = [...newMarked[row]];
          newMarked[row][col] = !newMarked[row][col];
          return { ...card, marked: newMarked };
        }
        return card;
      }),
    );
  };

  const checkWinPattern = (card: BingoCard): string | null => {
    const { marked } = card;

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (marked[row].every((cell) => cell)) return "Line";
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (marked.every((row) => row[col])) return "Line";
    }

    // Check diagonals
    if (marked.every((row, idx) => row[idx])) return "Diagonal";
    if (marked.every((row, idx) => row[4 - idx])) return "Diagonal";

    // Check coverall
    if (marked.every((row) => row.every((cell) => cell))) return "Coverall";

    return null;
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "speed":
        return "text-red-500 bg-red-500/20";
      case "regular":
        return "text-blue-500 bg-blue-500/20";
      case "coverall":
        return "text-purple-500 bg-purple-500/20";
      case "progressive":
        return "text-gold bg-gold/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1);

        // Simulate calling numbers
        if (Math.random() < 0.3) {
          // 30% chance each second
          const letters = ["B", "I", "N", "G", "O"];
          const ranges = [
            [1, 15],
            [16, 30],
            [31, 45],
            [46, 60],
            [61, 75],
          ];
          const letterIndex = Math.floor(Math.random() * 5);
          const [min, max] = ranges[letterIndex];
          const number = Math.floor(Math.random() * (max - min + 1)) + min;

          const newCall: CalledNumber = {
            letter: letters[letterIndex],
            number: number,
            timestamp: new Date(),
          };

          setCalledNumbers((prev) => [newCall, ...prev].slice(0, 20));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameActive]);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Bingo Rooms
            </h1>
            <p className="text-muted-foreground">
              Join live bingo games with players worldwide
            </p>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 mx-auto mb-2 text-gold" />
              <div className="text-sm text-muted-foreground">Gold Coins</div>
              <div className="font-bold text-gold">
                {user?.balance.goldCoins.toLocaleString() || 0} GC
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Gem className="h-6 w-6 mx-auto mb-2 text-teal" />
              <div className="text-sm text-muted-foreground">Sweep Coins</div>
              <div className="font-bold text-teal">
                {user?.balance.sweepCoins.toFixed(2) || "0.00"} SC
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-success" />
              <div className="text-sm text-muted-foreground">Games Won</div>
              <div className="font-bold text-success">23</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple" />
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="font-bold text-purple">18%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Bingo Rooms */}
          <div className="lg:col-span-1">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Available Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bingoRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRoom === room.id
                        ? "border-purple bg-purple/10"
                        : "border-border hover:border-purple/50"
                    }`}
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{room.name}</div>
                        {room.isVip && <Crown className="h-4 w-4 text-gold" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getRoomTypeColor(room.type)}>
                          {room.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {room.difficulty}
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Buy-in:</span>
                          <span>
                            {room.buyIn.gc} GC / {room.buyIn.sc} SC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prize:</span>
                          <span className="text-success">
                            {room.prize.gc} GC / {room.prize.sc} SC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Players:
                          </span>
                          <span>
                            {room.players}/{room.maxPlayers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Next game:
                          </span>
                          <span className="font-mono">
                            {getTimeUntilNextGame(room.nextGame)}
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={(room.players / room.maxPlayers) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Bingo Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lobby" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lobby">Room Lobby</TabsTrigger>
                <TabsTrigger value="game" disabled={bingoCards.length === 0}>
                  My Cards ({bingoCards.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lobby">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{currentRoom.name}</span>
                      <CurrencySelector
                        selectedCurrency={selectedCurrency}
                        onCurrencyChange={setSelectedCurrency}
                        variant="inline"
                        showBalance={false}
                        className="w-auto"
                      />
                    </CardTitle>
                    <CardDescription>
                      {currentRoom.players} players joined • Next game in{" "}
                      {getTimeUntilNextGame(currentRoom.nextGame)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Room Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-card/50 rounded-lg">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <div className="text-sm font-medium">
                            {currentRoom.gameLength} min
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Game Length
                          </div>
                        </div>
                        <div className="text-center p-3 bg-card/50 rounded-lg">
                          <Target className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                          <div className="text-sm font-medium">
                            {currentRoom.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Game Type
                          </div>
                        </div>
                        <div className="text-center p-3 bg-card/50 rounded-lg">
                          <Coins className="h-5 w-5 mx-auto mb-1 text-gold" />
                          <div className="text-sm font-medium">
                            {selectedCurrency === CurrencyType.GC
                              ? `${currentRoom.buyIn.gc} GC`
                              : `${currentRoom.buyIn.sc} SC`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Buy-in
                          </div>
                        </div>
                        <div className="text-center p-3 bg-card/50 rounded-lg">
                          <Trophy className="h-5 w-5 mx-auto mb-1 text-success" />
                          <div className="text-sm font-medium">
                            {selectedCurrency === CurrencyType.GC
                              ? `${currentRoom.prize.gc} GC`
                              : `${currentRoom.prize.sc} SC`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Prize Pool
                          </div>
                        </div>
                      </div>

                      {/* Join Game Button */}
                      <div className="text-center">
                        <Button
                          size="lg"
                          className="btn-primary"
                          onClick={() => handleJoinRoom(currentRoom)}
                          disabled={
                            !user ||
                            !canAffordWager(
                              selectedCurrency,
                              selectedCurrency === CurrencyType.GC
                                ? currentRoom.buyIn.gc
                                : currentRoom.buyIn.sc,
                            )
                          }
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Join Game (
                          {selectedCurrency === CurrencyType.GC
                            ? `${currentRoom.buyIn.gc} GC`
                            : `${currentRoom.buyIn.sc} SC`}
                          )
                        </Button>
                      </div>

                      {/* Game Rules */}
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2">
                          Game Rules
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • Mark numbers on your bingo cards as they're called
                          </li>
                          <li>
                            • First to complete a winning pattern gets the prize
                          </li>
                          <li>
                            •{" "}
                            {currentRoom.type === "speed"
                              ? "Fast-paced 5-minute games"
                              : currentRoom.type === "coverall"
                                ? "Mark all numbers on your card"
                                : currentRoom.type === "progressive"
                                  ? "Growing jackpot with each game"
                                  : "Classic 75-ball bingo"}
                          </li>
                          <li>• Auto-mark feature available for convenience</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="game">
                <div className="space-y-6">
                  {/* Game Controls */}
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant={gameActive ? "destructive" : "default"}
                            onClick={() => setGameActive(!gameActive)}
                          >
                            {gameActive ? (
                              <Pause className="h-4 w-4 mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {gameActive ? "Pause" : "Start"} Game
                          </Button>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Game Time:{" "}
                            </span>
                            <span className="font-mono">
                              {Math.floor(gameTime / 60)}:
                              {(gameTime % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoMark(!autoMark)}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            Auto-mark {autoMark ? "ON" : "OFF"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                          >
                            {soundEnabled ? (
                              <Volume2 className="h-4 w-4" />
                            ) : (
                              <VolumeX className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bingo Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {bingoCards.map((card, cardIndex) => (
                      <Card key={card.id} className="glass">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            Card {cardIndex + 1}
                            {checkWinPattern(card) && (
                              <Badge className="bg-success text-white">
                                {checkWinPattern(card)}!
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {/* BINGO Header */}
                            <div className="grid grid-cols-5 gap-1 text-center font-bold text-sm">
                              {["B", "I", "N", "G", "O"].map((letter) => (
                                <div
                                  key={letter}
                                  className="p-2 bg-purple text-white rounded"
                                >
                                  {letter}
                                </div>
                              ))}
                            </div>

                            {/* Bingo Numbers */}
                            <div className="grid grid-cols-5 gap-1">
                              {card.numbers.map((row, rowIndex) =>
                                row.map((number, colIndex) => (
                                  <Button
                                    key={`${rowIndex}-${colIndex}`}
                                    variant="outline"
                                    size="sm"
                                    className={`h-10 w-full p-0 text-xs ${
                                      card.marked[rowIndex][colIndex]
                                        ? "bg-success text-white border-success"
                                        : "hover:bg-purple/20"
                                    }`}
                                    onClick={() =>
                                      markNumber(cardIndex, rowIndex, colIndex)
                                    }
                                  >
                                    {number === null ? "FREE" : number}
                                  </Button>
                                )),
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Called Numbers */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gold" />
                  Called Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {calledNumbers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No numbers called yet
                    </p>
                  ) : (
                    calledNumbers.map((call, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          index === 0
                            ? "bg-gold text-black font-bold"
                            : "bg-card/50"
                        }`}
                      >
                        <span className="font-mono">
                          {call.letter}-{call.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {index === 0 ? "Latest" : `${index + 1} ago`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  Recent Winners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{winner.name}</span>
                      <span className="text-success font-semibold">
                        {winner.amount}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {winner.room} • {winner.pattern}
                      </span>
                      <span>{winner.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Room Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">Player123:</span> Good luck
                    everyone!
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">BingoQueen:</span> Need N-42!
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">Lucky777:</span> So close to
                    bingo!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
