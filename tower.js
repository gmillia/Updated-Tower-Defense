class Tower
{
    constructor(x, y, fireRate, coolDown, color, range, price, damage)
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
    }

    draw(ctx, enemies)
    {
        //draws tower
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        //checkForEnemies(enemies) and shoot (if possible)
        for(var i = 0; i < enemies.length; i++)
        {
            let enemy = enemies[i];

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
    }

    inRange(enemy)
    {
        if(enemy.x >= (this.x - (this.range + 1) * 30) && enemy.x <= (this.x + (this.range) * 30) && enemy.y >= (this.y - (this.range + 1) * 30) && enemy.y <= (this.y + (this.range) * 30)) return true;
        else return false;
    }
}

class TowerOne extends Tower
{
    constructor(x,y)
    {
        //x, y, fireRate, coolDown, range, price, damage
        super(x, y, 50, 0, "blue", 1, 25, 150);
    }
}

class TowerTwo extends Tower
{
    constructor(x,y)
    {
        //x, y, fireRate, coolDown, range, price, damage
        super(x, y, 30, 0, "orange", 2, 50, 250);
    }
}