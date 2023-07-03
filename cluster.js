const cluster = require("cluster");
const os = require("os");

// Number of CPU cores
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

    console.log(`Worker ${process.pid} started`);

    // Import your Express.js app
    const app = require('./app');
    
    // Start the server
    const port = process.env.PORT || 3007;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}