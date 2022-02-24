import express from "express";
// import { App } from "@slack/bolt";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT ?? 8881;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/slack/slash/new", (req, res) => {
  console.log("HEi");
  console.log(req.body);
  res.send("OK");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
