import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello From Acquisitions API!");
});

export default app;
