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
        name: "Auth",
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
        }
    }
}


const outputFile = "./swagger-output-004weg24867t345rfubgb56661.json";
const routes = ["./src/app.ts"];

swaggerAutogen(outputFile, routes, doc);
