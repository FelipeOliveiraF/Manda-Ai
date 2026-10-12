import { createServer } from "node:http";
import app from "../dist/server/index.js";

const port = Number(process.env.PORT || 4173);
const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `127.0.0.1:${port}`}`);
  const result = await app.fetch(new Request(url, { method: request.method }));
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(Buffer.from(await result.arrayBuffer()));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mostra aí disponível em http://127.0.0.1:${port}/`);
});
