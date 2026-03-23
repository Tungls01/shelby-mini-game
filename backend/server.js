app.post("/upload", (req, res) => {
  const { score } = req.body;

  const data = {
    player: "Tung",
    score: score,
    time: new Date().toISOString(),
  };

  const fileName = `score-${Date.now()}.json`;
  const filePath = path.join("./data", fileName);

  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log("Saved file:", fileName); // 

  res.json({
    success: true,
    link: `http://localhost:3000/data/${fileName}`,
  });
});