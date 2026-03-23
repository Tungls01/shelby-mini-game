import { useEffect, useState, useRef } from "react";
import coinImg from "./assets/logo.png";
import bombImg from "./assets/fud.png";
import basketImg from "./assets/nhanvat.png";
import bgImg from "./assets/background.png";

function App() {
  const containerWidth = 520;
  const containerHeight = 700;
  const playerWidth = 90;
  const playerHeight = 90;
  const playerBottomOffset = 60;
  const itemSize = 70;

  const timerRef = useRef(null);

  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [link, setLink] = useState("");
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(180);

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const playerXRef = useRef(playerX);
  playerXRef.current = playerX;

  const sendScore = async (score) => {
    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });

      const data = await res.json();
      console.log("Response:", data);

      setLink(data.link);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const keysPressed = useRef({ left: false, right: false });

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

  useEffect(() => {
    if (gameOver) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
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
          }
          else if (!i.hitBottom && newY >= 100) {
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
          }
          else {
            updatedItems.push({ ...i, y: newY });
          }
        });

        return updatedItems;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      if (timeLeftRef.current <= 0) {
        setGameOver(true);
        clearInterval(timer);
      } else {
        setTimeLeft((t) => t - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      console.log("Game Over → sending score:", score);
      sendScore(score);
    }
  }, [gameOver]);

  const restart = () => {
    setScore(0);
    setItems([]);
    setPlayerX(50);
    setGameOver(false);
    setTimeLeft(180);
    setLives(5);

    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#2a1a14", color: "#ff4fa3", fontFamily: "Arial", textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "36px", color: "#ff4fa3" }}>Don’t Fud Shelby</h1>
      <p style={{ opacity: 0.7 }}>Web3 mini game inspired by Shelby</p>
      
      {link && (
        <div style={{ marginTop: "10px" }}>
          <p>Saved on backend:</p>
          <a href={link} target="_blank">{link}</a>
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          margin: "40px auto",
          borderRadius: "30px",
          overflow: "hidden",
          background: "linear-gradient(#87CEEB, #e0f7ff)",
          border: "2px solid #ff4fa3",
          boxShadow: "0 0 40px rgba(255,79,163,0.4)",
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        <div style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          fontSize: "24px",
          zIndex: 10,
        }}>
          {Array.from({ length: lives }).map((_, index) => (
            <span key={index}>❤️</span>
          ))}
        </div>

        <h2 style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          margin: 0,
          color: "#ff4fa3",
          fontSize: "20px",
          textShadow: "0 0 5px black",
          zIndex: 10,
        }}>
          Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </h2>

        <h2 style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          margin: 0,
          color: "#ff4fa3",
          fontSize: "20px",
          textShadow: "0 0 5px black",
        }}>
          Score: {score}
        </h2>

        {gameOver && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ff4fa3",
            fontSize: "32px",
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "20px 40px",
            borderRadius: "20px",
            zIndex: 20,
          }}>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "10px",
              textShadow: "0 0 5px black",
            }}>
              Your Score: {score}
            </div>

            <div>Game Over</div>

            <button
              onClick={restart}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                borderRadius: "999px",
                border: "none",
                background: "#ff4fa3",
                color: "#2a1a14",
                cursor: "pointer",
              }}
            >
              Restart
            </button>
          </div>
        )}

        <div style={{ position: "absolute", bottom: `${playerBottomOffset}px`, left: `${playerX}%`, transform: "translateX(-50%)" }}>
          <img src={basketImg} style={{ width: `${playerWidth}px` }} />
        </div>

        {items.map((i, index) => (
          <div key={index} style={{ position: "absolute", top: `${i.y}%`, left: `${i.x}%`, transform: "translateX(-50%)" }}>
            <img src={i.type === "good" ? coinImg : bombImg} style={{ width: `${itemSize}px`, filter: i.type === "good" ? "drop-shadow(0 0 8px #ff4fa3)" : "none" }} />
          </div>
        ))}
      </div>

      <p style={{ opacity: 0.4, fontSize: "12px" }}>Built with Shelby community 💖</p>
    </div>
  );
}

export default App;