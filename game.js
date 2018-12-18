

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var avocados;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{	//load game assets
  this.load.image('factory', 'assets/factory.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('jumppoint','assets/platform_small.png')
  this.load.image('avocado', 'assets/avocado.png');
  this.load.image('pineapple','assets/pineapple.png');
  this.load.image('bomb', 'assets/fire.png');
  this.load.image('lightning', 'assets/lightning.png');
  this.load.image('titlescreen','assets/titlescreen.png');
  this.load.image('startgame','assets/startgame.png');
  this.load.spritesheet('dude', 'assets/elon.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    // background for the game
    this.add.image(400, 300, 'factory');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(0, 300, 'ground');
    platforms.create(840, 220, 'ground');
    platforms.create(450,150,'jumppoint'); //smaller jumppoint area

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { avocadot: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { avocadot: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some avocados to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    avocados = this.physics.add.group({
        key: 'avocado',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    avocados.children.iterate(function (child) {

        //  Give each avocado a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });



    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '40px', fill: '#FFFFFF' });

    //  Collide the player and the avocados with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(avocados, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the avocados, if he does call the collectavocado function
    this.physics.add.overlap(player, avocados, collectavocado, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn',true);
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectavocado (player, avocado)
{
    avocado.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (avocados.countActive(true) === 0)
    {
        //  A new batch of avocados to collect
        avocados.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;



    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
