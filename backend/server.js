// core modules


const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


// local modules

const dashboardRouter = require("./router/dashborad");





// Initialize Express app and HTTP server
const app = express();

const server = http.createServer(app);

const io = new Server(server);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "../frontend/views"));



// Routes
app.use( dashboardRouter);



// port section 
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



