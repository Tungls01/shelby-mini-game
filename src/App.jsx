import { useEffect, useState, useRef } from "react";

// --- Public URLs từ GitHub ---
const COIN_URL = "https://raw.githubusercontent.com/your-username/your-repo/main/assets/logo.png";
const BOMB_URL = "https://raw.githubusercontent.com/your-username/your-repo/main/assets/fud.png";
const BASKET_URL = "https://raw.githubusercontent.com/your-username/your-repo/main/assets/nhanvat.png";
const BG_URL = "https://raw.githubusercontent.com/your-username/your-repo/main/assets/background.png";

// --- Fake leaderboard JSON public URL ---
const LEADERBOARD_URL = "https://raw.githubusercontent.com/your-username/your-repo/main/assets/scoresIndex.json";

function App() {
  // --- Game config ---
  const containerWidth = 520;
  const containerHeight = 700;
  const playerWidth = 90;
  const playerHeight = 90;
  const playerBottomOffset = 60;
  const itemSize = 70;

  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(180);
  const [leaderboard, setLeaderboard] = useState([]);

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const playerXRef = useRef(playerX);
  playerXRef.current = playerX;

  const keysPressed = useRef({ left: false, right: false });

  // --- Game input ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") keysPressed.current.left = true;
      if (e.key === "ArrowRight") keysPressed.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft") keysPressed.current.left = false;
      if (e.key === "ArrowRight") keysPressed.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const move = () => {
      setPlayerX((x) => {
        let newX = x;
        if (keysPressed.current.left) newX = Math.max(0, x - 0.8);
        if (keysPressed.current.right) newX = Math.min(100, x + 0.8);
        return newX;
      });
      requestAnimationFrame(move);
    };
    move();
  }, []);

  // --- Spawn items ---
  useEffect(() => {
    if (gameOver) return;
    const spawnInterval = setInterval(() => {
      setItems((prev) => [
        ...prev,
        Math.random() > 0.2
          ? { x: Math.random() * 80 + 10, y: 0, type: "good" }
          : { x: Math.random() * 80 + 10, y: 0, type: "bad" },
      ]);
    }, 800);
    return () => clearInterval(spawnInterval);
  }, [gameOver]);

  // --- Time & movement ---
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updatedItems = [];
        prev.forEach((i) => {
          const speedMultiplier = 1 + (180 - timeLeftRef.current) / 180;
          const newY = i.y + 3 * speedMultiplier;

          const itemY = (newY / 100) * containerHeight;
          const playerY = containerHeight - playerHeight - playerBottomOffset;
          const itemX = (i.x / 100) * containerWidth;
          const playerLeft = (playerXRef.current / 100) * containerWidth - playerWidth / 2;
          const playerRight = playerLeft + playerWidth;

          if (
            itemY + itemSize >= playerY &&
            itemY <= playerY + playerHeight &&
            itemX + itemSize / 2 >= playerLeft &&
            itemX - itemSize / 2 <= playerRight
          ) {
            if (i.type === "good") setScore(s => s + 10);
            else setGameOver(true);
          } else if (!i.hitBottom && newY >= 100) {
            if (i.type === "good") {
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) setGameOver(true);
                return newLives;
              });
            }
            i.hitBottom = true;
            updatedItems.push({ ...i, y: newY, hitBottom: true });
            return;
          } else {
            updatedItems.push({ ...i, y: newY });
          }
        });
        return updatedItems;
      });
    }, 50);
    return () => clearInterval(moveInterval);
  }, [gameOver]);

  // --- Fetch leaderboard từ GitHub public ---
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(LEADERBOARD_URL);
        const urls = await res.json(); // ["url1", "url2", ...]
        const scores = await Promise.all(
          urls.map(async url => {
            const r = await fetch(url);
            return await r.json();
          })
        );
        scores.sort((a, b) => b.score - a.score);
        setLeaderboard(scores);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };
    fetchLeaderboard();
  }, [gameOver]);

  const restart = () => {
    setScore(0);
    setItems([]);
    setPlayerX(50);
    setGameOver(false);
    setTimeLeft(180);
    setLives(5);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#2a1a14", color: "#ff4fa3", fontFamily: "Arial", textAlign: "center", padding: "20px" }}>
      <h1>Don’t Fud Shelby (Test Mode)</h1>
      <div style={{ position: "relative", width: `${containerWidth}px`, height: `${containerHeight}px`, margin: "40px auto", border: "2px solid #ff4fa3", borderRadius: "30px", overflow: "hidden", backgroundImage: `url(${BG_URL})`, backgroundSize: "cover" }}>
        <div style={{ position: "absolute", bottom: `${playerBottomOffset}px`, left: `${playerX}%`, transform: "translateX(-50%)" }}>
          <img src={BASKET_URL} style={{ width: `${playerWidth}px` }} />
        </div>
        {items.map((i, idx) => (
          <div key={idx} style={{ position: "absolute", top: `${i.y}%`, left: `${i.x}%`, transform: "translateX(-50%)" }}>
            <img src={i.type === "good" ? COIN_URL : BOMB_URL} style={{ width: `${itemSize}px` }} />
          </div>
        ))}
        {gameOver && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.6)", padding: "20px", borderRadius: "20px", color: "#ff4fa3" }}>
            <div>Your Score: {score}</div>
            <button onClick={restart}>Restart</button>
          </div>
        )}
      </div>

      {/* Leaderboard hiển thị trực tiếp */}
      {leaderboard.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Leaderboard (Test)</h2>
          <ol>
            {leaderboard.map((entry, idx) => (
              <li key={idx}>{entry.player}: {entry.score} pts</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;
