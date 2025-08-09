const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const limit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
});
app.use(limit);
app.use(cors());

app.get("/", (_, res) => {
  res.send("Open FDA node handler");
});

const fdaApi = axios.create({
  timeout: 10000, // 10 seconds timeout
  family: 4, // Force IPv4
});

app.get("/api/fda-proxy/adverse-events", async (req, res) => {
  const { drugName } = req.query;
  if (!drugName) {
    res.status(400).json({ error: "drug name required" });
    return;
  }
  const limit = req.query.limit || 10;
  const skip = req.query.skip || 0;

  const fdaUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(
    drugName
  )}"&limit=${limit}&skip=${skip}`;

  try {
    const response = await fdaApi.get(fdaUrl);
    res.json(response.data);
  } catch (error) {
    console.error(
      "FDA API request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
    const status = error.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch data..." });
  }
});

app.get("/api/fda-proxy/drug-labels", async (req, res) => {
  const { drugName } = req.query;
  if (!drugName) {
    res.status(400).json({ error: "Drug name required" });
    return;
  }

  const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
    drugName
  )}"`;

  try {
    const response = await fdaApi.get(fdaUrl);
    res.json(response.data);
  } catch (error) {
    console.error(
      "FDA API request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
    const status = error.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch data..." });
  }
});

app.get("/api/drugbank/interactions", async (req, res) => {
  res.status(501).json({
    error:
      "DrugBank interaction API not yet implemented. Awaiting API key approval.",
    status: "stub",
  });
});

app.get("/api/drugbank/drug-info", async (req, res) => {
  res.status(501).json({
    error:
      "DrugBank information API not yet implemented. Awaiting API key approval",
    status: "stub",
  });
});

app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

module.exports = app;
