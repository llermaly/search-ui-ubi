# Getting Started

This project consists of a client and a server. To run the project, follow the instructions below.

## Client

The client is a React application that leverages the Search UI library for search functionality. To run the client, follow these steps:

1. Navigate to the client directory in your terminal.
2. Run `npm install` to install the dependencies.
3. Run `npm start` to start the client application. This will launch the application in your default web browser.

## Server

The server is a Node.js application that uses Express.js as the web framework and Elasticsearch for search functionality. To run the server, follow these steps:

1. Navigate to the server directory in your terminal.
2. Run `npm install` to install the dependencies.
3. Run `node index.js` to start the server. This will start the server on port 3001 by default.

## Configuration

The server configuration is stored in environment variables. Make sure to set the following environment variables before running the server:

* `ELASTICSEARCH_HOST`: The hostname of your Elasticsearch instance.
* `ELASTICSEARCH_API_KEY`: The API key for your Elasticsearch instance.
* `ELASTICSEARCH_INDEX`: The index name in Elasticsearch where your data is stored.

You can set these environment variables in a `.env` file in the server directory.
