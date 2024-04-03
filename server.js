const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

const TMDB_API_KEY = 'c9cbc16ed2cc92ee656d643c52f8c6a1'; // Replace with your TMDB API key

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers (For development purposes, make sure to secure this in production)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname)));

// Endpoint to fetch the latest movies
app.get('/latest-movies', async (req, res) => {
    try {
        const page = req.query.page || '';
        const response = await axios.get(`https://vidsrc.to/vapi/movie/new/${page}`);
        const movies = response.data.result.items;

        // Fetch movie posters from TMDB
        for (let movie of movies) {
            if (movie.tmdb_id) {
                const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${TMDB_API_KEY}`);
                movie.poster_path = `https://image.tmdb.org/t/p/w500${tmdbResponse.data.poster_path}`;
            }
        }

        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest movies.' });
    }
});

// Endpoint to get movie by ID
app.get('/movie/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://vidsrc.to/embed/movie/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movie.' });
    }
});

// Endpoint to fetch the latest TV shows
app.get('/latest-tv', async (req, res) => {
    try {
        const page = req.query.page || '';
        const response = await axios.get(`https://vidsrc.to/vapi/tv/new/${page}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest TV shows.' });
    }
});

// After your other routes in server.js
app.get('/movie.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'movie.html'));
});


// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
