const fs = require("fs");
const path = require("path");
const { Worker } = require("worker_threads");
const os = require("os");

const inputDir = path.join(__dirname, "images"); // NFTs directory
const outputDir = path.join(__dirname, "compressed"); // Compressed images

// Ensure output directory exists
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(inputDir).filter((file) => file.endsWith(".png"));
const numCPUs = os.cpus().length; // Get available CPU cores
const chunkSize = Math.ceil(files.length / numCPUs); // Divide work among CPUs

console.log(`Found ${files.length} PNG files. Using ${numCPUs} threads...`);

// Split files into chunks for each worker
for (let i = 0; i < numCPUs; i++) {
  const chunk = files.slice(i * chunkSize, (i + 1) * chunkSize);

  if (chunk.length > 0) {
    const worker = new Worker(path.join(__dirname, "workers.js"), {
      workerData: { files: chunk, inputDir, outputDir },
    });

    worker.on("message", (msg) => console.log(`Worker ${i}: ${msg}`));
    worker.on("error", (err) => console.error(`Worker ${i} Error:`, err));
    worker.on("exit", (code) => {
      if (code !== 0) console.error(`Worker ${i} exited with code ${code}`);
    });
  }
}
