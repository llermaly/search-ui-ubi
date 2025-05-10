import "dotenv/config";

import express from "express";
import cors from "cors";
import ElasticSearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import { Client } from "@elastic/elasticsearch";
import { v4 as uuidv4 } from "uuid";

const app = express();

const PORT = process.env.PORT || 3001;

const esClient = new Client({
  node: process.env.ELASTICSEARCH_HOST,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  },
});

class UBIConnector extends ElasticSearchAPIConnector {
  async onSearch(requestState, queryConfig) {
    const result = await super.onSearch(requestState, queryConfig);

    result.requestId = uuidv4();
    console.log(`Request id: ${result.requestId}`)

    return result;
  }
}

const connector = new UBIConnector(
  {
    host: process.env.ELASTICSEARCH_HOST,
    index: process.env.ELASTICSEARCH_INDEX,
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  },
  (requestBody, requestState, queryConfig) => {
    requestBody.ext = {
      ubi: {
        query_id: requestState.requestId,
        user_query: requestState.searchTerm || "",
      },
    };
    if (!requestState.searchTerm) return requestBody;
    requestBody.query = {
      multi_match: {
        query: requestState.searchTerm,
        fields: Object.keys(queryConfig.search_fields),
      },
    };
    return requestBody;
  }
);

app.use(cors());
app.use(express.json());

app.post("/api/search", async (req, res, next) => {
  try {
    const { state, queryConfig } = req.body;
    const response = await connector.onSearch(state, queryConfig);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.post("/api/autocomplete", async (req, res, next) => {
  try {
    const { state, queryConfig } = req.body;
    const response = await connector.onAutocomplete(state, queryConfig);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.post("/api/analytics", async (req, res, next) => {
  try {
    console.log(`Sending analytics for query_id: ${req.body.query_id}`)

    await esClient.index({
      index: "ubi_events",
      body: req.body,
    });


    console.log(req.body);
    res.status(200).json({ message: "Analytics event saved successfully" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", async (req, res) => {
  try {
    const clusterInfo = await esClient.cluster.health();
    res.json({
      status: "ok",
      elasticsearch: clusterInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get Elasticsearch cluster info",
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res) => {
  // eslint-disable-next-line no-console
  console.error("Server error:", err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
