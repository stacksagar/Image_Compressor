const { workerData, parentPort } = require("worker_threads");
const path = require("path");
const sharp = require("sharp");

const { files, inputDir, outputDir } = workerData;

const compressImage = async (file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  try {
    await sharp(inputPath)
      .png({ quality: 1, compressionLevel: 5 })
      .toFile(outputPath);

    parentPort.postMessage(`✅ Compressed: ${file}`);
  } catch (error) {
    parentPort.postMessage(`❌ Error processing ${file}: ${error.message}`);
  }
};

// Process all images assigned to this worker
Promise.all(files.map(compressImage)).then(() => parentPort.close());
