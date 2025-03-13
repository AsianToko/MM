const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTIyMDU2NmFkZjhkZTE3MzkzYmRjZmIyYTEzZjExNSIsIm5iZiI6MTc0MDY4NDY3Mi4wNjYsInN1YiI6IjY3YzBiZDgwYmM2OTM1YTAwMWEyNWU3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hv_If1vHVfOooP9pySjD1zYPAe2MTK6I23DrlfFKuV4'
  }
};

async function fetchData(url) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Do not change this function
async function fetchData() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/278?language=en-US', options);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { fetchData };

