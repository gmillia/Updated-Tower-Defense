var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var gameMap = new map();
gameMap.level1();

var towers = [];
var enemies = [];
var eCoolDown = 50;

var enemyCoolDown = 150;
var maxEnemies = 25;
var enemyCount = 0;

ct = new tower();
towers[0] = ct;
towers[0].x = 247;
towers[0].y = 37;

nt = new tower();
towers[1] = nt;
towers[1].x = 127;
towers[1].y = 37;

//Start the game: TODO -> Only when Start button is pressed
draw();

//"Game loop" -> draws everything
function draw()
{
    //draw map
    gameMap.draw(ctx, gameMap);

    //add enemies: TODO -> clear array for the next wave
    addEnemies();

    //Draw each enemy: TODO -> make a separate function (similar do drawTowers)
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw(ctx);
        enemies[i].move();
    }

    //draw towers -> duh
    drawTowers();

    //Draw again -> TODO: check if pause button isn't pressed
    requestAnimationFrame(draw);
}

//Helper function to draw towers
function drawTowers()
{
    for(var i = 0; i < towers.length; i++)
    {
        towers[i].draw(ctx, enemies);
        towers[i].coolDown--;
    }
}

//Helper function to spawn enemies for each round
function addEnemies()
{
    if(enemyCoolDown <= 0 && enemyCount < maxEnemies)
    {
        //console.log(555);
        enemies[enemyCount] = new enemy();
        enemyCount++;
        enemyCoolDown = 150;
    }
    else
        enemyCoolDown--;
}
