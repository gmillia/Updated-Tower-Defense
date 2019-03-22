/*
Class that represents "abstract" tower -> other towers will be derived from this towe
*/
class Tower
{
    constructor(x, y, fireRate, coolDown, color, range, price, damage, name)
    {
        this.x = x;
        this.y = y;
        this.fireRate = fireRate;
        this.coolDown = coolDown;
        this.color = color;
        this.size = 30;
        this.range = range;
        this.price = price;
        this.damage = damage;
        this.name = name;
    }

    /*
    Helper method that draws the tower AND shoots each enemy in range (sight)
    */
    draw(ctx)
    {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, this.size - 1, this.size - 1);
    }

    /*
    Helper function that shoots an enemy
    */
    shootEnemy(enemy)
    {
        if(this.inRange(enemy) && enemy.alive)
        {
            if(this.coolDown <= 0)
            {
                //draw line aka bullet
                ctx.beginPath();
                ctx.moveTo(this.x + 7, this.y + 7);
                ctx.lineTo(enemy.x + 15, enemy.y + 15);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.lineWidth = 1;
                this.coolDown = this.fireRate;

                enemy.damage(this.damage);
            }
        }       
    }

    /*
    Helper function that determines if enemy is in the range of the tower
    30 = size of the tile
    */
    inRange(enemy)
    {
        //+1 lets us calculate position based on the right side of the enemy entrance (instead of left side)
        if(enemy.x >= (this.x - (this.range + 1) * 30) && enemy.x <= (this.x + (this.range) * 30) && enemy.y >= (this.y - (this.range + 1) * 30) && enemy.y <= (this.y + (this.range) * 30)) return true;
        else return false;
    }
}

/*
New tower type -> less damage/costs less/shoots less frequent
*/
class TowerOne extends Tower
{
    constructor(x,y)
    {
        //x, y, fireRate, coolDown, color, range, price, damage, name
        super(x, y, 50, 0, "blue", 1, 150, 150, "Tower One");
    }
}

/*
New tower type -> more damage/costs more/shoots more frequently
*/
class TowerTwo extends Tower
{
    constructor(x,y)
    {
        //x, y, fireRate, coolDown, color, range, price, damage, name
        super(x, y, 30, 0, "orange", 2, 300, 250, "Tower Two");
    }
}