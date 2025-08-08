const express = require("express");
const axios = require("axios")

const app = express()

const port = 3000

app.get('/', (_, res) => {
  res.send("Open FDA node handler");
});

const fdaApi = axios.create({
  timeout: 10000, // 10 seconds timeout
  family: 4, // Force IPv4
});

app.get("/api/fda-proxy/adverse-events", async (req, res) => {
  const { drugName } = req.query;
  if (!drugName) { 
    res.status(400).json({ error: "drug name required" })
    return
  }
  const fdaUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${
    
    encodeURIComponent(
    drugName)
  }"&limit=10`;

  try {
    const response = await fdaApi.get(fdaUrl);
    res.json(response.data);
  } catch (error) {
    console.error("FDA API request failed:", error);
    res.status(500).json({ error: "Failed to fetch data from FDA API" });
  }
});

app.get("/api/fda-proxy/drug-labels", async (req, res) => {
  const { drugName } = req.query;
  const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
    drugName
  )}"`;

  try {
    const response = await axios.get(fdaUrl);
    res.json(response.data);
  } catch (error) {
    console.error("FDA API request failed:", error);
    res.status(500).json({ error: "Failed to fetch data from FDA API" });
  }
});


app.listen(port, ()=>{console.log(`Starting server at ${port}`)})