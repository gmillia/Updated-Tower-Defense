//grab canvas
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

//Button events
document.getElementById("start").addEventListener("click", startGame, false);
document.getElementById("pause").addEventListener("click", pauseGame, false);
document.getElementById("towerOne").addEventListener("click", chooseTower, false);
document.getElementById("towerTwo").addEventListener("click", chooseTower, false);

//Canvas Events
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseout", handleMouseOut);
canvas.addEventListener("click", handleMouseClick);

//holds mouse x/y position
var mouse = 
{
    x: -1,  //position y
    y: -1,  //position y
}

//create map and load Map1 (level1)
var gameMap = new map();
gameMap.level1();

var towers = [];  //holds all towers placed on map
var enemies = [];  //holds all enemies in the current wave
var killed = [];  //holds all indexes of killed enemies

var maxCool = 15;
var enemyCoolDown = 0;  //ticks between each enemy appearance
var maxEnemies = 25;  //enemy count for wave 1 (will be increased with each wave)
var enemyCount = 0;  //current enemy count
var pauseBetweenWaves = 500;
var maxWaves = 10;
var currWave = 1;

var towerSelected = true;  //button is selected
var towerRange = 1;  //radius of selected tower
var towerColor = null;  //color of currently selected tower
var objectType = null;

//Temporary objects
var tempT1 = new TowerOne(-1,-1);
var tempT2 = new TowerTwo(-1,-1);
var tile = new Tile();

//Game currently running/paused
var playing = false;

//START THE GAME
draw();

/*
Handles tower selection and updates global vars (tower color, tower object type etc)
*/
function chooseTower()
{
    if(this.id == "towerOne") 
    { 
        towerColor = tempT1.color; 
        objectType = 1; 
        towerRange = tempT1.range;
    }
    if(this.id == "towerTwo") 
    { 
        towerColor = tempT2.color; 
        objectType = 2;
        towerRange = tempT2.range;
    }
}


/*
Function that handles mouse clicks (places objects on the canvas)
TODO: when clicked on the tower give option to sell/upgrade
*/
function handleMouseClick(evt)
{
    if(mouse.x != -1 && mouse.y != -1)
    {
        var selectedTile = gameMap.getTile(mouse.x, mouse.y);
        //If tile is free (can place stuff on it) AND selected is tower
        if(selectedTile.placable)
        {
            var newTower = createObject();  //calls helper function to create a new tower
            towers.push(newTower);          //adds tower to the tower list
            selectedTile.placable = false;  //make tile non-placable
        }
    }
}

/*
Helper function that creates a new tower, by selecting tower that was clicked on last
*/
function createObject()
{
    if(objectType == 1) return new TowerOne(mouse.x * 30, mouse.y * 30);
    else return new TowerTwo(mouse.x * 30, mouse.y * 30);
}

/*
Handles mouse out of canvas movement -> sets x/y values to -1 to indicate
that mouse is currently out of canvas. This results in tower/radius etc not
being drawn
*/
function handleMouseOut(evt)
{
    mouse.x = -1;
    mouse.y = -1;
}

/*
Handles mouse movement on canvas -> Calculates mouse position, then find out which tile (x,y) is
assiciated with it (on which tile mouse is at currently).
Finally, calls draw method.
*/
function handleMouseMove(evt)
{
    if(towerSelected)  //
    {
        var mousePos = getMousePos(canvas, evt);  //Returns tuple of mouse pos on canvas (x,y)
        mouse.x = Math.floor(mousePos.x/30);  //find associated X-tile
        mouse.y = Math.floor(mousePos.y/30);  //find associated Y-tile
    }
}

/*
Helper function to calculate current mouse position on the canvas. Returns tuple (x,y) position
*/
function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


/*
Sets playing to true -> game starts running (enemies start moving)
*/
function startGame()
{
    playing = true;
}

/*
Function that gets called when pause button is pressed -> enemies stop moving, but 
can still place towers
*/
function pauseGame()
{
    playing = false;
}

/*
Function draws everything on the canvas (including the canvas) AND calculates everything else (either by calling objects funcs on by itself)
*/
function draw()
{
    //draw map
    gameMap.draw(ctx, gameMap);

    //add enemies:
    if(playing && pauseBetweenWaves >= 500)
        addEnemies();

    //Draw each enemy
    drawEnemies();

    //Draw each enemy
    drawTowers();

    //draw mouse
    drawMouse();

    if(playing)
        nextWave();

    requestAnimationFrame(draw);
}

/*
Helper function that draws all the otwers
*/
function drawTowers()
{
    for(var i = 0; i < towers.length; i++)
    {
        towers[i].draw(ctx, enemies);
        towers[i].coolDown--;
    }
}

/*
Helper function to draw all the enemies
*/
function drawEnemies()
{
    for(var i = 0; i < enemies.length; i++)
    {
        //If killed add to killed list, and don't draw
        if(enemies[i].alive) enemies[i].draw(ctx);
        else if(!killed.includes(i)) killed.push(i);

        //move only if game is not paused
        if(playing) enemies[i].move();

        //If we killed all enemies, clear killed and enemies list -> wave is over
        if(killed.length == maxEnemies) { killed.length = 0; enemies.length = 0;}
    }
}

function drawMouse()
{
    if(mouse.x != -1 && mouse.y != -1) 
    {
        drawRange();
        ctx.fillStyle = towerColor;  //Gets a color of the chosen tower
        ctx.fillRect(mouse.x*tile.size, mouse.y*tile.size, tile.size, tile.size);
    }
}

/*
Helper function that adds enemies to the enemy list every N-ms
*/
function addEnemies()
{
    if(enemyCoolDown <= 0 && enemyCount < maxEnemies)
    {
        enemies[enemyCount] = new FastWeakEnemy();
        enemyCount++;
        enemyCoolDown = maxCool;
        enemyCoolDown--;
    }
    else
        enemyCoolDown--;
}

/*
Helper function that draws range of the tower.
Arc (range circle) is being centered at the center of the tile mouse is currently at.
*/
function drawRange()
{
    ctx.fillStyle = "rgba(27,27,238, 0.5)";

    for(var i = -towerRange; i < towerRange + 1; i++)
    {
        for(var j = -towerRange; j < towerRange + 1; j++)
        {
            ctx.fillRect((mouse.x + i) * tile.size, (mouse.y + j) * tile.size, tile.size, tile.size);
        }
    }
}

/*
Helper function to reset values for the new wave
*/
function nextWave()
{
    if(enemies.length == 0 && currWave <= 10)
    {
        if(pauseBetweenWaves <= 0)
        {
            enemyCount = 0;
            maxCool -= 1;
            maxEnemies += 10;
            currWave++;
            pauseBetweenWaves = 500;
        }
        else
            pauseBetweenWaves--;
    }
}

