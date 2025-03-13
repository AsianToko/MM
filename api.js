// Description: This file contains the code to fetch movies from the API, including trending and now playing movies.

const fetch = require("node-fetch");

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTIyMDU2NmFkZjhkZTE3MzkzYmRjZmIyYTEzZjExNSIsIm5iZiI6MTc0MDY4NDY3Mi4wNjYsInN1YiI6IjY3YzBiZDgwYmM2OTM1YTAwMWEyNWU3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hv_If1vHVfOooP9pySjD1zYPAe2MTK6I23DrlfFKuV4'
},
};


async function trending() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options);
    const data = await response.json();
    console.log('Trending movies:', data);
    return data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
}

async function nowplaying() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/now_playing', options);
    const data = await response.json();
    console.log('Now playing movies:', data);
    return data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
}

module.exports = { trending, nowplaying };
