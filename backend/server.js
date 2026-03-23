import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Upload endpoint
app.post("/upload", (req, res) => {
  const { score } = req.body;

  const data = {
    player: "Tung",
    score: score,
    time: new Date().toISOString(),
  };

  const fileName = `score-${Date.now()}.json`;
  const filePath = path.join("./data", fileName);

  // Create folder if it doesn't exist
  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log("Saved file:", fileName);

  res.json({
    success: true,
    link: `http://localhost:${PORT}/data/${fileName}`,
  });
});

// Serve files from the data folder
app.use("/data", express.static(path.join("./data")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
