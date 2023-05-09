const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1

app.get("/players/", async (request, response) => {
  const listOfPlayersQuery = `
    SELECT * FROM cricket_team
    ORDER BY player_id;`;

  let convertDbObjectToResponseObject = (eachPlayer) => {
    return {
      playerID: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_number,
      role: eachPlayer.role,
    };
  };
  const playersList = await db.all(listOfPlayersQuery);

  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2

app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;
  const addPlayerQuery = `
    INSERT INTO 
        cricket_team (player_name , jersey_number , role)
    VALUES (
        '${playerName}',
        '${jerseyNumber}', 
        '${role}'
        );`;
  const dbResponse = await db.run(addPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM 
        cricket_team
    WHERE 
        player_id = '${playerId}';`;
  let player = await db.get(getPlayerQuery);
  response.send(player);
});

//API4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
    WHERE 
        player_id = '${playerId}';`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team 
    WHERE player_id = '${playerId}';`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
