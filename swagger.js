require('dotenv').config();
const swaggerAutogen = require("swagger-autogen");

const host = process.env.NODE_ENV === "development" ? `localhost:${process.env.PORT}` : "";
const schemes = process.env.NODE_ENV === "development" ? ["http"] : ["https"];


const doc = {
  swagger: "2.0",
  info: {
    title: "Anchor Browser BookDP",
    version: "1.0.0",
  },
  host: host,
  basePath: "/",
  schemes: schemes,
  paths: {},
  tags: [
    {
      name: "Job",
    }
  ],
  definitions: {
    RequestSuccessful: {
      ok: true,
      message: "Request Successful",
      status: 200,
    },
    InternalServerError: {
      ok: false,
      message: "Sorry an internal server error occured.",
      status: 500,
    },
    BadRequest: {
      ok: false,
      message: "string",
      status: 400,
    },
    Unauthorized: {
      ok: false,
      message: "Unauthorized request",
      status: 401,
    },
    NotFound: {
      ok: false,
      message: "Information not found",
      status: 404,
    },
    Forbidden: {
      ok: false,
      message: "Access forbidden",
      status: 403,
    },
    ScrapePayload: {
      theme: "string"
    },
    GetJobResponse: {
      "ok": true,
      "message": "Request Successful.",
      "status": 200,
      "body": {
        "job": {
          "status": "running | completed | failed",
          "progress": "number",
          "id": "number",
          "theme": "string",
          "updatedAt": "date",
          "createdAt": "date"
        }
      }
    },
    ListJobBooksResponse: {
      "ok": true,
      "message": "Request Successful.",
      "status": 200,
      "body": {
        "books": [
          {
            "id": "number",
            "title": "string",
            "author": "string",
            "desc": "string",
            "summary": "string",
            "current_price": "number",
            "original_price": "number",
            "discount_amount": "number",
            "discount_percent": "number",
            "url": "string",
            "relevance_score": "number",
            "value_score": "number",
            "createdAt": "date",
            "updatedAt": "date",
            "job_id": "number"
          }
        ],
        "total_count": "number",
        "total_pages": "number",
        "limit": "number",
        "offset": "number"
      }
    }
  }
}


const outputFile = "./swagger-output-004weg24867t345rfubgb56661.json";
const routes = ["./src/app.ts"];

swaggerAutogen(outputFile, routes, doc);
