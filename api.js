require('dotenv').config();

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
  }
};

async function fetchData() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', options);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { fetchData };
