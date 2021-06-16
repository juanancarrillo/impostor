/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

function lanzarJuego(){
  game = new Phaser.Game(config);
}

  const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    parent: "game-container",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  let game;// = new Phaser.Game(config);
  let cursors;
  let player;
  //let player2;
  var jugadores={}; //la colección de jugadores 
  let showDebug = false;
  let camera;
  var worldLayer;
  let map;
  var crear;
  var spawnPoint1, spawnPoint2, spawnPoint3, spawnPoint4, spawnPoint5, spawnPoint6, spawnPoint7, spawnPoint8, spawnPoint9, spawnPoint10;
  var recursos=[{frame:7,sprite:"jugador1"},{frame:4,sprite:"jugador2"},{frame:10,sprite:"jugador3"},{frame:1,sprite:"jugador4"},{frame:1,sprite:"jugador5"},{frame:1,sprite:"jugador6"},{frame:55,sprite:"jugador7"},{frame:49,sprite:"jugador8"},{frame:1,sprite:"jugador9"},{frame:52,sprite:"jugador10"}];
  var remotos;
  var muertos;
  var spawnPoints;
  var capaTareas;
  var final=false;
  var musica;
  var sonidoAtacar;
//  var tareaCompletada= false;





  function preload() {

    this.load.image("tiles", "cliente/assets/tilesets/completo.png");
    this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/mimapa.json");
    this.load.audio("musica", ["cliente/assets/sounds/music/No Quest.ogg"]);
    this.load.audio("atacar", ["cliente/assets/sounds/atacar/Retro Weapon Laser 25.wav"]);

    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
    //this.load.spritesheet("gabe","cliente/assets/images/gabe.png",{frameWidth:24,frameHeight:24});
    //this.load.spritesheet("gabe","cliente/assets/images/male01-2.png",{frameWidth:32,frameHeight:32});
   // this.load.spritesheet("varios","cliente/assets/images/final2.png",{frameWidth:24,frameHeight:32});
    this.load.spritesheet("jugadores1","cliente/assets/images/jugadores1.png",{frameWidth:48,frameHeight:56});
    this.load.spritesheet("jugadores2","cliente/assets/images/jugadores2.png",{frameWidth:48,frameHeight:48});
	  this.load.spritesheet("jugadores3","cliente/assets/images/jugadores3.png",{frameWidth:48,frameHeight:48});
	  this.load.spritesheet("jugadores4","cliente/assets/images/jugadores4.png",{frameWidth:48,frameHeight:48});
  	this.load.spritesheet("jugadores5","cliente/assets/images/jugadores5.png",{frameWidth:48,frameHeight:48});
	  this.load.spritesheet("jugadores6","cliente/assets/images/jugadores6.png",{frameWidth:48,frameHeight:52});
	  this.load.spritesheet("portal","cliente/assets/images/portal.png",{frameWidth:48,frameHeight:48});
    this.load.spritesheet("muertos","cliente/assets/images/muertos56.png",{frameWidth:56,frameHeight:50});
  }

  function create() {
    crear=this;
    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("32x32 mega", "tiles");

    musica = crear.sound.add("musica");
    musica.loop = true;
    //musica.play();

    sonidoAtacar = crear.sound.add("atacar");
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const rio = map.createStaticLayer("rio", tileset, 0, 0);
    const rio2 = map.createStaticLayer("rio2", tileset, 0, 0);

    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    capaTareas = map.createStaticLayer("CapaTareas", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByExclusion([-1]);

    capaTareas.setCollisionByExclusion([-1]);
 // capaTareas.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    spawnPoints=crear.add.group();
    spawnPoints[1] = map.findObject("Objects", obj => obj.name === "SpawnPoint");
    spawnPoints[2] = map.findObject("Objects", obj => obj.name === "SpawnPoint2");
    spawnPoints[3] = map.findObject("Objects", obj => obj.name === "SpawnPoint3");
    spawnPoints[4] = map.findObject("Objects", obj => obj.name === "SpawnPoint4");
    spawnPoints[5] = map.findObject("Objects", obj => obj.name === "SpawnPoint5");
    spawnPoints[6] = map.findObject("Objects", obj => obj.name === "SpawnPoint6");
    spawnPoints[7] = map.findObject("Objects", obj => obj.name === "SpawnPoint7");
    spawnPoints[8] = map.findObject("Objects", obj => obj.name === "SpawnPoint8");
    spawnPoints[9] = map.findObject("Objects", obj => obj.name === "SpawnPoint9");
    spawnPoints[10] = map.findObject("Objects", obj => obj.name === "SpawnPoint10");


    const anims = crear.anims;
    anims.create({
      key: "jugador1-front-walk",
      frames: anims.generateFrameNames("jugadores1", {
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      repeat: -1
    });
    anims.create({
      key: "jugador1-left-walk",
      frames: anims.generateFrameNames("jugadores1", {
          //prefix: "misa-left-walk.",
          start: 18,
          end: 20,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "jugador1-right-walk",
        frames: anims.generateFrameNames("jugadores1", {
          //prefix: "misa-left-walk.",
          start: 30,
          end: 32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "jugador1-back-walk",
        frames: anims.generateFrameNames("jugadores1", {
          //prefix: "misa-left-walk.",
          start: 42,
          end: 44,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims2 = crear.anims;
      anims2.create({
        key: "jugador2-front-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "jugador2-left-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 15,
          end: 17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "jugador2-right-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 27,
          end: 29,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "jugador2-back-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 39,
          end: 41,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims3 = crear.anims;
      anims3.create({
        key: "jugador3-front-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "jugador3-left-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 21,
          end: 23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "jugador3-right-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 33,
          end: 35,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "jugador3-back-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 45,
          end: 47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims4 = crear.anims;
      anims4.create({
        key: "jugador4-front-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "jugador4-left-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "jugador4-right-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "jugador4-back-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims5 = crear.anims;
      anims5.create({
         key: "jugador5-front-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "jugador5-left-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "jugador5-right-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "jugador5-back-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims6 = crear.anims;
      anims6.create({
        key: "jugador6-front-walk",
        frames: anims.generateFrameNames("jugadores4", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "jugador6-left-walk",
        frames: anims.generateFrameNames("jugadores4", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "jugador6-right-walk",
        frames: anims.generateFrameNames("jugadores4", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "jugador6-back-walk",
        frames: anims.generateFrameNames("jugadores4", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims7 = crear.anims;
      anims7.create({
		key: "jugador7-front-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 54,
          end: 56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jugador7-left-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 66,
          end: 68,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jugador7-right-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 78,
          end: 80,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "jugador7-back-walk",
        frames: anims.generateFrameNames("jugadores3", {
          //prefix: "misa-left-walk.",
          start: 90,
          end: 92,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims8 = crear.anims;
      anims8.create({
        key: "jugador8-front-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 48,
          end: 50,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "jugador8-left-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 60,
          end: 62,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "jugador8-right-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 72,
          end: 74,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "jugador8-back-walk",
        frames: anims.generateFrameNames("jugadores5", {
          //prefix: "misa-left-walk.",
          start: 84,
          end: 86,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims9 = crear.anims;
      anims9.create({
        key: "jugador9-front-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 54,
          end: 56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "jugador9-left-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 66,
          end: 68,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "jugador9-right-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 78,
          end: 80,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "jugador9-back-walk",
        frames: anims.generateFrameNames("jugadores6", {
          //prefix: "misa-left-walk.",
          start: 90,
          end: 92,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });


      const anims10 = crear.anims;
      anims10.create({
     	key: "jugador10-front-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 51,
          end: 53,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "jugador10-left-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 63,
          end: 65,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "jugador10-right-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 75,
          end: 77,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "jugador10-back-walk",
        frames: anims.generateFrameNames("jugadores2", {
          //prefix: "misa-left-walk.",
          start: 87,
          end: 89,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    cursors = crear.input.keyboard.createCursorKeys();
    remotos=crear.add.group();
    muertos=crear.add.group();
    teclaA=crear.input.keyboard.addKey('a');
    teclaV=crear.input.keyboard.addKey('v');
    teclaT=crear.input.keyboard.addKey('t');
    teclaX=crear.input.keyboard.addKey('x');
    lanzarJugador(ws.numJugador);
    ws.estoyDentro();

  }

    function crearColision(){
    if (crear && ws.impostor){
      crear.physics.add.overlap(player,remotos,kill);
      console.log("aaaaaaaaaaa");
    }
  }  

  function kill(sprite,inocente){
    var nick=inocente.nick;
    if (teclaA.isDown){
      ataquesOn=false;
      ws.atacar(nick);
      sonidoAtacar.play();
    }
  }
//
  function dibujarMuereInocente(inocente){

 if (ws.nick == inocente){
  var x=player.x;
  var y=player.y;
  var numJugador=ws.numJugador;

  var muerto = crear.physics.add.sprite(x,y,"muertos",numJugador);
  muertos.add(muerto);
 }
else{
  var x=jugadores[inocente].x;
  var y=jugadores[inocente].y;
  var numJugador=jugadores[inocente].numJugador; 

  var muerto = crear.physics.add.sprite(x,y,"muertos",numJugador);
  muertos.add(muerto);

  jugadores[inocente].setVisible(false);
  remotos.remove(jugadores[inocente]);
}
  crear.physics.add.overlap(player,muertos,votacion);
}
  

  function votacion(sprite,muerto){
    if (ws.estado != "muerto" && teclaV.isDown && ws.impostor== false){
      ws.lanzarVotacion();
    }
  }

  function tareas(sprite,objeto){
    if (ws.impostor==false && ws.encargo==objeto.properties.tarea && teclaT.isDown && objeto.properties.disponible){
      objeto.properties.disponible=false;      
      console.log("realizar tarea "+ws.encargo);
      ws.realizarTarea();
    }
  }

  function lanzarJugador(nick, numJugador){
   
    var num =ws.numJugador+1;
    player = crear.physics.add.sprite(spawnPoints[num].x, spawnPoints[num].y,"portal",0);   

    crear.physics.add.collider(player, worldLayer);
    crear.physics.add.collider(player, capaTareas, tareas);

    jugadores[nick]=player;
    jugadores[nick].nick=nick;
    jugadores[nick].numJugador=numJugador;


    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  function lanzarJugadorRemoto(nick,numJugador){

    var num =numJugador+1;
		jugadores[nick]=crear.physics.add.sprite(spawnPoints[num].x, spawnPoints[num].y,"portal",0);
	
    crear.physics.add.collider(jugadores[nick], worldLayer);
    jugadores[nick].nick=nick;
    jugadores[nick].numJugador=numJugador;
    remotos.add(jugadores[nick]);
  }

  function mover(datos)
  {
    var direccion=datos.direccion;
    var nick=datos.nick;
    var numJugador= datos.numJugador;
    var x=datos.x;
    var y=datos.y;
    var remoto=jugadores[nick];
    const speed = 175;
  //  const prevVelocity = player.body.velocity.clone();
    const nombre=recursos[numJugador].sprite;
    if (remoto&&!final)
    {
      remoto.body.setVelocity(0);
      remoto.setX(x);
      remoto.setY(y);
      remoto.body.velocity.normalize().scale(speed);
      if (direccion=="left") {
        remoto.anims.play(nombre+"-left-walk", true);
      } else if (direccion=="right") {
        remoto.anims.play(nombre+"-right-walk", true);
      } else if (direccion=="up") {
        remoto.anims.play(nombre+"-back-walk", true);
      } else if (direccion=="down") {
        remoto.anims.play(nombre+"-front-walk", true);
      } else {
        remoto.anims.stop();
      }
    }
  }

  function finPartida(data){
    final=true;
    cw.mostrarModalSimple("Se acabó la caza, "+data);
  }

  function update(time, delta) {
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();
    var direccion="stop";

    const nombre=recursos[ws.numJugador].sprite;

    if (!final){
    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-speed);
     direccion="left";
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(speed);
      direccion="right";
    }

    // Vertical movement
    if (cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      direcion="up";
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(speed);
      direccion="down";
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    ws.movimiento(direccion,player.x,player.y);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown) {
      player.anims.play(nombre+"-left-walk", true);
    } else if (cursors.right.isDown) {
      player.anims.play(nombre+"-right-walk", true);
    } else if (cursors.up.isDown) {
      player.anims.play(nombre+"-back-walk", true);
    } else if (cursors.down.isDown) {
      player.anims.play(nombre+"-front-walk", true);
    } else {
      player.anims.stop();
    }
  }
}