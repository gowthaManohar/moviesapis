const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
let dbpath = path.join(__dirname, "moviesData.db");

let initializationDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error ${e.message}`);
    process.exit(1);
  }
};

initializationDbAndServer();

let getmovie = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

let responseobject = (object) => {
  return {
    movieName: object.movie_name,
  };
};

let directorob = (ob) => {
  return {
    directorId: ob.director_id,
    directorName: ob.director_name,
  };
};

//api 1 get movie names
app.get("/movies/", async (request, response) => {
  let query = `SELECT movie_name FROM movie ;`;

  let dbresponse = await db.all(query);
  response.send(dbresponse.map((moviename) => responseobject(moviename)));
});

//api2 get one movie

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let query = `SELECT * 
  FROM movie 
  WHERE movie_id = ${movieId};`;

  let dbresponse = await db.get(query);
  response.send(getmovie(dbresponse));
});

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;

  let addquery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}');`;

  let dbresponse = await db.run(addquery);
  response.send("Movie Successfully Added");
});

// update 4
app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, movieName, leadActor } = request.body;
  let query = `UPDATE movie 
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId}; `;

  let dbresponse = await db.run(query);
  response.send("Movie Details Updated");
});

//api 5
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let query = `DELETE FROM movie WHERE 
   movie_id = ${movieId};`;

  let dbresponse = await db.run(query);
  response.send("Movie Removed");
});

//api 6 get directors

app.get("/directors/", async (request, response) => {
  let query = `SELECT * FROM director`;
  let dbresponse = await db.all(query);
  response.send(dbresponse.map((director) => directorob(director)));
});

// API 7 GET MOVIES
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let query = `SELECT movie_name From movie WHERE 
     director_id = ${directorId};`;

  let dbresponse = await db.all(query);
  response.send(dbresponse.map((movie) => responseobject(movie)));
});

module.exports = app;
