const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const conn = require('./db');

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions))

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/predict', upload.single('file'), async (req, res) => {
    const resultData = req.file;

    if (!resultData) {
        return res.status(400).json({ message: 'Tidak ada berkas yang diunggah' });
    }

    try {
        const externalResponse = await axios.post('https://us-central1-deploy-402513.cloudfunctions.net/predict', resultData.buffer);

        const predictionData = externalResponse.data;

        const sql = 'INSERT INTO prediction_results (class, confidence, description, prevention) VALUES (?, ?, ?, ?)';
        const values = [predictionData.class, predictionData.confidence, predictionData.description, predictionData.prevention];

        conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Gagal menyimpan hasil prediksi ke database: ' + err.message);
            res.status(500).json({ message: 'Gagal menyimpan hasil prediksi ke database' });
        } else {
            console.log('Hasil prediksi berhasil disimpan ke database');
            res.json({ message: 'Hasil prediksi berhasil disimpan ke database' });
        }
        });
    } catch (error) {
        console.error('Gagal memanggil endpoint eksternal:', error);
        res.status(500).json({ message: 'Gagal memanggil endpoint eksternal' });
    }
});

const serverPort = process.env.PORT;
app.listen(serverPort, () => {
    console.log(`Server berjalan di http://localhost:${serverPort}`);
});
