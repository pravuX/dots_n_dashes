import express from "express"
import { createServer } from "node:http"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { Server } from "socket.io"

const app = express()

const server = createServer(app)

const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve static files from the current directory
app.use(express.static(__dirname))

// route handler
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"))
})
app.get("/game", (req, res) => {
  res.sendFile(join(__dirname, "game_client.html"))
})

const io = new Server(server, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
})

io.on("connection", (socket) => {
  console.log("a user connected")

  socket.on("client move", (move, callback) => {
    console.log(move)
    socket.broadcast.emit("client move", move)
    callback("ok")
  })

  socket.on("client reload", (callback) => {
    io.emit("reload")
    callback()
  })
})

// start a server listening for connections on port 3000
const ip_address = "127.0.0.1"
const port_number = 3000

server.listen(port_number, ip_address, () => {
  console.log("server running at http://" + `${ip_address}:${port_number}`)
})
