const express = require("express");
const app = express();

app.use(express.json());

let items = {}; // in-memory store

// Root
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Node.js API on AWS!" });
});

// Get all items
app.get("/items", (req, res) => {
  res.send(items);
});

// Get item by id
app.get("/items/:id", (req, res) => {
  const { id } = req.params;
  if (!items[id]) return res.status(404).send({ error: "Item not found" });
  res.send({ [id]: items[id] });
});

// Create item
app.post("/items/:id", (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  if (items[id]) return res.status(400).send({ error: "Item already exists" });
  items[id] = value;
  res.send({ [id]: value });
});

// Update item
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  if (!items[id]) return res.status(404).send({ error: "Item not found" });
  items[id] = value;
  res.send({ [id]: value });
});

// Delete item
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  if (!items[id]) return res.status(404).send({ error: "Item not found" });
  delete items[id];
  res.send({ message: `Item ${id} deleted` });
});

// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`🚀 Node.js API running on port ${PORT}`);
});
