const request = require("supertest");
const app = require("../index");
const axios = require("axios");

jest.mock("axios");

describe("FDA Proxy API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/fda-proxy/adverse-events", () => {
    it("should return 400 if drugName is missing", async () => {
      const res = await request(app).get("/api/fda-proxy/adverse-events");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("drug name required");
    });

    it("should return data from mocked FDA API", async () => {
      const fakeResponse = { data: { results: ["event1", "event2"] } };
      axios.create = jest.fn(() => ({
        get: jest.fn().mockResolvedValue(fakeResponse),
      }));

      const res = await request(app)
        .get("/api/fda-proxy/adverse-events")
        .query({ drugName: "aspirin", limit: 5 });
      console.log(res);
      expect(res.status).toBe(200);
      expect(res.body.results).toEqual(["event1", "event2"]);
    });

    it("should handle FDA API failure", async () => {
      axios.create = jest.fn(() => ({
        get: jest.fn().mockRejectedValue({ response: { status: 500 } }),
      }));

      const res = await request(app)
        .get("/api/fda-proxy/adverse-events")
        .query({ drugName: "aspirin" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch data...");
    });
  });
});
