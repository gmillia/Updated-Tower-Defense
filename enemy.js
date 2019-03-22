/*
Class that represents each individual enemy -> used as an "abstract" class to create actual different kind of enemies
Contains functions used for each kind of enemy
*/
class Enemy
{
    constructor(speed, color, health, reward)
    {
        this.x = 0;
        this.y = 0;
        this.size = 30;
        this.speed = speed;
        this.color = color;
        this.alive = true;
        this.health = health;
        this.reward = reward;
        this.oneHealthBar = Math.round(this.health / this.size);  //Breaks health into 30 pieces (size of the tile)
    }

    /*
    Helper function that draws the enemy
    */
    draw(ctx)
    {
        if(this.alive)
        {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size-1, this.size-1);

            var decreaseHealthBar = Math.round(this.health / this.oneHealthBar) - 30;  //calculates how much health is left
            ctx.fillStyle = "green";
            ctx.fillRect(this.x , this.y + 10, this.size + decreaseHealthBar, this.size / 3);  //start x, start y, width, height

            ctx.strokeStyle = "white";
            ctx.strokeRect(this.x, this.y, this.size - 1, this.size - 1);
        }
    }

    /*
    Helper function that moves the enemy to new (x,y) coordinates 
    ->Calls helper function to determine next valid move (up/down, left/right)
    */
    move()
    {
       if(this.alive)
       {
           var move = this.findDirection(this.x, this.y)
           if(move)
           {
                this.x = move[0];
                this.y = move[1];
           }
       }
    }

    /*
    Helper function that gets called when enemy attempts to move
    Determines next valid move.
    TODO: possibly have different findDirection functions for different maps
    TODO: do else if instad of ifs for better performance
    */
    findDirection(x,y)
    {
        //Move to the right
        if(x < 870 && (y == 0 || y == 120 || y == 240 || y == 360 || y == 480 || y == 600 || y == 720 || y == 840)) return [x + this.speed, y];
        //Move down on the left side
        if(x <= 0 && ((y >=60 && y < 120) || (y >= 180 && y < 240) || (y >= 300 && y < 360) || (y >= 420 && y < 480) || (y >= 540 && y < 600) || (y >= 660 && y < 720) || (y >= 780 && y < 840))) return [x, y + this.speed];
        //Move down on the right side
        if(x >= 870 && ((y >= 0 && y < 60) || (y >= 120 && y < 180) || (y >= 240 && y < 300) || (y >= 360 && y < 420) || (y >= 480 && y < 540) || (y >= 600 && y < 660) || (y >= 720 && y < 780) || (y >= 840 && y < 870))) return [x, y + this.speed];
        //Move to the left
        if(x > 0 && (y == 60 || y == 120 || y == 180 || y == 300 || y == 420 || y == 540 || y == 660 || y == 780 || y == 800)) return [x - this.speed, y];
    }

    /*
    Helper function that gets called from the Game.js (main game file) when enemy is hit from the tower
    Decreases enemy health
    */
    damage(dmg)
    {
        this.health -= dmg;

        if(this.health <= 0) this.alive = false;
    }
}

/*
New enemy type -> Fast and Weak
*/
class FastWeakEnemy extends Enemy
{
    constructor()
    {
        //speed, color, health, reward (per kill)
        super(3, 'brown', 500, 25);
    }
}

/*
New enemy type -> Slow and Strong
*/
class SlowStrongEnemy extends Enemy
{
    constructor()
    {
        //speed, color, health, reward (per kill)
        super(0.5, 'white', 7000, 100);
    }
}

/*
New enemy type -> Slow and Weak
*/
class SlowWeakEnemy extends Enemy
{
    constructor()
    {
        //speed, color, health, reward (per kill)
        super(0.5, 'silver', 300, 25);
    }
}

/*
New enemy type -> Fast and strong
*/
class FastStrongEnemy extends Enemy
{
    constructor()
    {
        //speed, color, health, reward (per kill)
        super(1.5, 'purple', 5000, 150)
    }
}