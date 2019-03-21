/*
Illia Shershun - Personal "fun" project

Next:
1) Decrease the map (maybe 450x450) OR decrease to the point it fits the size of the laptop (for now)
DONE: Decreased to 450x900
TODO: Possibly decrease the tile size to fit more enemies/towers;
2) Make the logic for spawning enemies depending on the enemies speed
3) Make enemies spawn into different lists -> this way we can have multiple enemies per wave 
   OR
   Make random enemies in each wave after 3-4 wave
   DONE (partially) -> need to adjust so that enemies get stronger each round (or they already spanw faster/more)
4) Restyle the buttons and put them into different sides of the map
DONE (partially) -> restyle them to look good -> DONE (partially)
5) Add images for the towers and enemies
6) Possibly add an image over the canvas with the path, and hardcode the path to follow images path
7) Wait time for the next wave in seconds (not calls to the draw method)
8) Add health bar for each enemy
DONE

Problems: 
1) SlowStrongEnemy is getting stuck on the first row -> moving only works with 0.5 increments in speed -> needs fixing
DONE -> Issue was in the hardcoded move values == 870 instead of >= 870
2) Appropriate money vals for killed enemies + start money
3) Towers are shooting out of range -> need to adjust tiles
*/

//grab canvas
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

//Button events
document.getElementById("start").addEventListener("click", startGame, false);
document.getElementById("pause").addEventListener("click", pauseGame, false);
document.getElementById("towerOne").addEventListener("click", chooseTower, false);
document.getElementById("towerTwo").addEventListener("click", chooseTower, false);
document.getElementById("sell").addEventListener("click", sellTower, false);

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
var reachedEnd = [];  //holds all indexes of enemies that reached 

var maxCool = 35;  //max time wait between enemy spawns
var enemyCoolDown = 0;  //ticks between each enemy appearance
var maxEnemies = 25;  //enemy count for wave 1 (will be increased with each wave)
var enemyCount = 0;  //current enemy count
var pauseBetweenWaves = 500;  //pause between waves
var minWait = maxCool;

//Display values
var maxWaves = 10;  //NOT display value, but current max waves in the game
var currWave = 1;  //Holds value for the current wave (start with 1 = level 1)
var currMoney = 1000;  //Holds value for the money currently available -> TODO: change to appropriate start value
var lives = 10;  //Holds value for the lives player has left -> TODO: possibly increase

var towerSelected = false;  //button is selected
var towerRange = 1;  //radius of selected tower
var towerColor = null;  //color of currently selected tower
var objectType = null;  //used to identify which tower to create on click
var towerPrice = null;  //used to display tower price in the tower display box
var towerName = null;  //used to display tower name in the tower display box
var towerDamage = null;  //used to display tower damage per hit in the tower display box

//Temporary objects
var tempT1 = new TowerOne(-1,-1);
var tempT2 = new TowerTwo(-1,-1);
var tile = new Tile();
var towerIndex = {index: null, tower: null };  //used when we want to sell the tower

//Game currently running/paused
var playing = false;

//START THE GAME
draw();

/*
Handles tower selection and updates global vars (tower color, tower object type etc)
*/
function chooseTower()
{
    towerSelected = true;  //for displaying tower and range when mouse over the canvas
    if(this.id == "towerOne") 
    { 
        towerColor = tempT1.color; 
        objectType = 1; 
        towerRange = tempT1.range;
        towerPrice = tempT1.price;
        towerName = "Tower One";
        towerDamage = tempT1.damage;
    }
    if(this.id == "towerTwo") 
    { 
        towerColor = tempT2.color; 
        objectType = 2;
        towerRange = tempT2.range;
        towerPrice = tempT2.price;
        towerName = "Tower Two";
        towerDamage = tempT2.damage;
    }

    //Display chosen tower info in the tower display box
    displayTowerInfo();
}

/*
Helper "overloaded" function that updates the display-box info
*/
function ChooseTower(tower)
{
    if(tower.name == "Tower One") 
    { 
        towerRange = tempT1.range;
        towerPrice = tempT1.price;
        towerName = "Tower One";
        towerDamage = tempT1.damage;
    }
    if(tower.name == "Tower Two") 
    { 
        towerRange = tempT2.range;
        towerPrice = tempT2.price;
        towerName = "Tower Two";
        towerDamage = tempT2.damage;
    }

    //Display tower info in the tower display box
    displayTowerInfo();   
}

/*
Function that handles mouse clicks (places objects on the canvas)
TODO: Possibly make a separate function for each case
*/
function handleMouseClick(evt)
{
    //Case 1: Clicking on the canvas without "dragging" tower on it
    if(mouse.x != -1 && mouse.y != -1 && !towerSelected)
    {
        //Grab the tile on canvas where mouse was clicked
        var selectedTile = gameMap.getTile(mouse.x, mouse.y);

        //Is the tower on the tile?
        var selectedIsTower = tileIsTower(selectedTile.x, selectedTile.y);

        //Update the display info
        ChooseTower(selectedIsTower.tower);

        //If tile isn't placable (might remove) and tile holds tower
        if(!selectedTile.placable && selectedIsTower.tower != null)
        {
            //Case: Displays the sell option in the info box
            displaySellInfo();
        }
    }
    //Case 2: tower is selcted (is dragging with the mouse)
    else if(mouse.x != -1 && mouse.y != -1 && towerSelected)
    {
        //Grab the tile on canvas where mouse was clicked
        var selectedTile = gameMap.getTile(mouse.x, mouse.y);

        //If tile is free (can place stuff on it) AND selected is tower
        if(selectedTile.placable)
        {
            //Buy tower only if we have money for it
            if(currMoney >= towerPrice)
            {
                var newTower = createObject();  //calls helper function to create a new tower
                towers.push(newTower);          //adds tower to the tower list
                selectedTile.placable = false;  //make tile non-placable
                currMoney -= towerPrice;  //decrease amount of cash we have

                displayMoney();  //display money we have
                towerSelected = false;  //tower is placed on the canvas/map, deselect it (so that user can select a new one)
            }
        }
    }
}

/*
Helper function that returns tower (if selected tile includes tower) OR null
*/
function tileIsTower(x, y)
{
    //Case 1: Tower is on the canvas/map 
    for(var i = 0; i < towers.length; i++)
    {
        if(towers[i].x == x && towers[i].y == y)
        {
            towerIndex = {index: i, tower: towers[i]};  
            return towerIndex;  //return tuple of tower index and tower
        }
    }
    //Case 2: Selected tile isn't a tower -> return null
    return null;
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
    var mousePos = getMousePos(canvas, evt);  //Returns tuple of mouse pos on canvas (x,y)
    mouse.x = Math.floor(mousePos.x/30);  //find associated X-tile
    mouse.y = Math.floor(mousePos.y/30);  //find associated Y-tile
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
    //If we haven't died yet
    if(lives > 0)
        playing = true;
    //else restart
    else
        window.location.reload();
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

    //shoot enemies from the towers
    shootEnemies();

    //Draw each enemy
    drawTowers();

    //draw mouse
    drawMouse();

    //check if it's time for the next wave
    if(playing)
        nextWave();

    //Display money -> updates every turn
    displayMoney();

    //redraw again
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
Helper function that shoots enemies from towers
*/
function shootEnemies()
{
    if(playing)
    {
        for(var i = 0; i < towers.length; i++)
        {
            let tower = towers[i];
            for(var j = 0; j < enemies.length; j++)
            {
                tower.shootEnemy(enemies[j]);
            }
        }
    }
}

/*
Helper function to draw all the enemies
*/
function drawEnemies()
{
    //Display enemies remaining in the wave
    displayRemainingEnemies();

    //Draw each enemy in the enemies list
    for(var i = 0; i < enemies.length; i++)
    {
        //If enemy is alive -> draw it
        if(enemies[i].alive) enemies[i].draw(ctx);
        //Else if enemy is not on the killed list AND it's not alive AND hasn't reached the end
        else if(!killed.includes(i) && !reachedEnd.includes(i)) 
        {
            killed.push(i);  //add to the killed list

            //add money
            currMoney += enemies[i].reward;
        }

        //Check if enemy reached final destination
        if(enemies[i].x == 0 && enemies[i].y == 420 && enemies[i].alive) // && enemies[i].alive && !reachedEnd.includes(i))
        {
            enemies[i].alive = false;
            lives--;  //decrease lives left
            displayLives();  //Display lives left

            reachedEnd.push(i);  //add enemies to the list of those that reached the end

            //End of the game check
            if(lives <= 0) 
            {
                document.getElementById("start").innerHTML = "Restart";  //Rename the start button to Restart
                playing = false;  //pause the game
            }
        }
        //move only if game is not paused
        else if(playing && enemies[i].alive) enemies[i].move();
    }

    //If we killed all enemies, clear killed and enemies list -> wave is over
    if((killed.length + reachedEnd.length) >= maxEnemies) 
    { 
        //clear lists
        killed.length = 0; 
        enemies.length = 0;
        reachedEnd.length = 0;
    }
}

/*
Helper function that draws the tower and its range over the canvas (when tower is chosen)
*/
function drawMouse()
{
    //If mouse is on the/points over the canvas/map -> draw it
    if(mouse.x != -1 && mouse.y != -1) 
    {
        //Tower is currenlty selected -> otherwise we don't draw the tower
        if(towerSelected)
        {
            drawRange();  //draw range of the tower
            ctx.fillStyle = towerColor;  //Gets a color of the chosen tower
            ctx.fillRect(mouse.x*tile.size, mouse.y*tile.size, tile.size, tile.size);  //draw tower over the range (to not mix the colors)
        }
    }
}

/*
Helper function that adds enemies to the enemy list every N-ms: TODO -> add random enemy selection
*/
function addEnemies()
{
    //Case 1: Time to spawn enemy
    if(enemyCoolDown <= 0 && enemyCount < maxEnemies)
    {
        randomEnemy(Math.floor(Math.random() * 4));
        enemyCount++;  //increase current enemy count
        enemyCoolDown = maxCool;  //reset current coolDown
        enemyCoolDown--;  //decrease enemyCoolDOwn by 1 each call
    }
    //Case 2: Not time to spawn enemy -> decrease wait time for the next enemy spawn
    else
        enemyCoolDown--;
}

/*
Helper function to addEnemies that will choose enemy based on it's type (type is an int that will be randomly chosen)
*/
function randomEnemy(kind)
{
    var newEnemy = null;
    if(kind == 0) newEnemy = new FastWeakEnemy();
    else if(kind == 1) newEnemy = new SlowStrongEnemy();
    else if(kind == 2) newEnemy = new SlowWeakEnemy();
    else if(kind == 3) newEnemy = new FastStrongEnemy();

    enemies[enemyCount] = newEnemy;
}

/*
Helper function that draws range of the tower.
Square is being centered at the center of the tile mouse is currently at.
*/
function drawRange()
{
    //Tower is currently selected
    if(towerSelected)
    {
        //Currently blue color for range with opacity 0.5
        var currTile = gameMap.getTile(mouse.x, mouse.y);
        //console.log(Math.floor(mouse.x), Math.floor(mouse.y));
        if(currTile.placable) ctx.fillStyle = "rgba(207, 0, 15, 0.5)";
        else ctx.fillStyle = "rgba(27,27,238, 0.5)";

        //Find appropriate tiles (next to tower) that are in range and draw range over them (with opacity)
        for(var i = -towerRange; i < towerRange + 1; i++)
        {
            for(var j = -towerRange; j < towerRange + 1; j++)
            {
                ctx.fillRect((mouse.x + i) * tile.size, (mouse.y + j) * tile.size, tile.size, tile.size);
            }
        }
    }
}

/*
Helper function to reset values for the new wave
*/
function nextWave()
{
    if(enemies.length == 0 && currWave < 10 )//&& enemyCoolDown == 0)
    {
        //Case 1: Wave is over -> time to start new wave -> reset the values and display 0 for the wait time (next wave)
        if(pauseBetweenWaves <= 0)
        {
            enemyCount = 0;  //reset current enemy count
            maxCool -= 1;  //reduce wait time between enemy spawns
            maxEnemies += 10;  //increase amount of enemies in each wave
            currWave++;  //increase wave count
            pauseBetweenWaves = 500;  //reset pause between waves

            //Display current wave
            displayCurrWave();
            //Display wait time for the next wave -> 0 because it's current wave
            displayNextWave(0);
        }
        else
        {
            pauseBetweenWaves--;  //reduce pause time till the next wave
            var timeLeft = Math.round(pauseBetweenWaves / 50);  //calculate approximate time until the next wave
            displayNextWave(timeLeft);  //Display time left for the next wave
        }
    }
}

/*
Helper function that gets called when we need to display money
*/
function displayMoney()
{
    document.getElementById('money').innerHTML = "Money: " + currMoney;
}

/*
Helper function that gets called when we need to display time left for the next wave
*/
function displayNextWave(timeLeft)
{
    document.getElementById('nextWave').innerHTML = "Next Wave In: " + timeLeft;  //display time left until next wave
}

/*
Helper function that get called when we need to display current wave
*/
function displayCurrWave()
{
    document.getElementById('wave').innerHTML = 'Wave: ' + currWave;
}

/*
Helper function that gets called when we need to display current lives
*/
function displayLives()
{
    document.getElementById('lives').innerHTML = "Lives: " + lives;  //display lives left
}

/*
Helper function to display tower info on the page
*/
function displayTowerInfo()
{
    document.getElementById("tower").innerHTML = "Tower: " + towerName;
    document.getElementById("price").innerHTML = "Price: " + towerPrice;
    document.getElementById("range").innerHTML = "Range: " + towerRange + " tiles";
    document.getElementById("damage").innerHTML = "Damage: " + towerDamage;
    document.getElementById('sell').style.display = "none";
    document.getElementById('upgrade').style.display = "none";
    document.getElementById("towerInfo").style.display = "block";
}

/*
Helper function to display tower info WITH the sell button (once tower is pressed)
*/
function displaySellInfo()
{
    document.getElementById("tower").innerHTML = "Tower: " + towerName;
    document.getElementById("price").innerHTML = "Price: " + towerPrice;
    document.getElementById("range").innerHTML = "Range: " + towerRange + " tiles";
    document.getElementById("damage").innerHTML = "Damage: " + towerDamage;
    document.getElementById('sell').style.display = "block";
    document.getElementById('upgrade').style.display = "block";
    document.getElementById("towerInfo").style.display = "block";
}

/*
Helper function that shows enemies remaining in the wave
*/
function displayRemainingEnemies()
{
    document.getElementById("remaining").innerHTML = "Remaining Enemies: " + (maxEnemies - enemyCount) + "/" + maxEnemies;
}

/*
Function that gets called when Sell button is clicked:
Removes tower from the towers list
TODO: Recolor the tile and return the money (half the money)
*/
function sellTower()
{
    //Remove tower from the list
    towers.splice(towerIndex.index, 1);

    //Make tile available again
    gameMap.getTile(towerIndex.tower.x/30, towerIndex.tower.y/30).placable = true;

    //return half the money
    currMoney += Math.floor(towerPrice/2);

    //Don't show tower info
    document.getElementById("towerInfo").style.display = "none";
}

