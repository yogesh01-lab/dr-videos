import express from "express";
import fs from "fs";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(cors());
app.use(express.json());


  

app.get('/api/data.json', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data.json'));
  res.json(data);
});


app.post('/api/update-count', (req, res) => {
  const { videoId } = req.body;

  fs.readFile('./data.json', 'utf-8', (err, jsonString) => {
    if (err) {
      console.log('Error reading file:', err);
      return res.status(500).send('Error reading file');
    }
    console.log("Raw JSON string:", jsonString); 
    try {
      const data = JSON.parse(jsonString);

      const selectedVideo = data.find(video => video.id == videoId);
      if (selectedVideo) {
        selectedVideo.dataCount += 1;

        fs.writeFile('./data.json', JSON.stringify(data, null, 2), err => {
          if (err) {
            console.log('Error writing file:', err);
            return res.status(500).send('Error writing file');
          }
          res.send('Count updated successfully');
        });
      } else {
        res.status(404).send('Video not found');
      }
    } catch (err) {
      console.log('Error parsing JSON:', err);
      res.status(500).send('Error parsing JSON');
    }
  });
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
  app.use((req, res, next) => {
    console.log("Incoming request path:", req.path);
    next();
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
