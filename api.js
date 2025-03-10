import { get } from "http";

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTIyMDU2NmFkZjhkZTE3MzkzYmRjZmIyYTEzZjExNSIsIm5iZiI6MTc0MDY4NDY3Mi4wNjYsInN1YiI6IjY3YzBiZDgwYmM2OTM1YTAwMWEyNWU3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hv_If1vHVfOooP9pySjD1zYPAe2MTK6I23DrlfFKuV4'
  }
};

async function fetchData() {
  try {
    const response =get('https://api.themoviedb.org/3/authentication', options);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
