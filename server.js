import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Log all incoming request paths
app.use((req, res, next) => {
  console.log("Incoming request path:", req.path);
  next();
});

// GET: Serve video data
app.get('/api/data.json', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    res.json(data);
  } catch (err) {
    console.error("Error reading data.json:", err);
    res.status(500).send("Error reading data");
  }
});

// POST: Update video count
app.post('/api/update-count', (req, res) => {
  const { videoId } = req.body;
  const dataPath = path.join(__dirname, 'data.json');

  fs.readFile(dataPath, 'utf-8', (err, jsonString) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file');
    }

    try {
      const data = JSON.parse(jsonString);
      const selectedVideo = data.find(video => video.id == videoId);

      if (selectedVideo) {
        selectedVideo.dataCount += 1;

        fs.writeFile(dataPath, JSON.stringify(data, null, 2), err => {
          if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error writing file');
          }
          res.send('Count updated successfully');
        });
      } else {
        res.status(404).send('Video not found');
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.status(500).send('Error parsing JSON');
    }
  });
});

// Serve React static files
app.use(express.static(path.join(__dirname, 'client/build')));

// Wildcard route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
