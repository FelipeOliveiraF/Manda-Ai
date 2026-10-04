import http from "node:http";
import app from "../worker/index.js";

const server = http.createServer(async (req, res) => {
  const request = new Request(`http://127.0.0.1:4173${req.url}`, { method: req.method });
  const response = await app.fetch(request, {}, {});
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
