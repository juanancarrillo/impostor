var modelo=require("./modelo.js");

describe("El juego del impostor", function() {
  var juego;
  //var usr;
  var nick;

  beforeEach(function() {
  	juego=new modelo.Juego(4);
  	//usr=new modelo.Usuario("Pepe");
  	nick="Pepe";
  });

  it("comprobar valores iniciales del juego", function() {
  	expect(Object.keys(juego.partidas).length).toEqual(0);
  	expect(nick).toEqual("Pepe");
  	//expect(usr.juego).not.toBe(undefined);
  });

  it("comprobar valores de la partida",function(){
  	var codigo=juego.crearPartida(3,nick);
  	expect(codigo).toEqual("fallo");
  	codigo=juego.crearPartida(11,nick);
  	expect(codigo).toEqual("fallo");
  })

  describe("el usr Pepe crea una partida de 4 jugadores",function(){
	var codigo;
	beforeEach(function() {
	  	codigo=juego.crearPartida(4,nick);
	});
	it("se comprueba la partida",function(){ 	
	  	expect(codigo).not.toBe(undefined);
	  	expect(juego.partidas[codigo].nickOwner).toEqual(nick);
	  	expect(juego.partidas[codigo].maximo).toEqual(4);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
	 	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(1);
	  });

	it("no se puede crear partida si el num no está entre 4 y 10",function(){
		var codigo=juego.crearPartida(3,nick);
		expect(codigo).toEqual("fallo");
		codigo=juego.crearPartida(11,nick);
		expect(codigo).toEqual("fallo");
	});
	it("varios usuarios se unen a la partida",function(){
		juego.unirAPartida(codigo,"domingo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"lunes");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"jueves");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
	  });

	it("Pepe inicia la partida",function(){
		juego.unirAPartida(codigo,"domingo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"lunes");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"jueves");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		juego.iniciarPartida(nick,codigo);
		expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
	});
	it("abandonar partida",function(){
		juego.unirAPartida(codigo,"domingo");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"lunes");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"jueves");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		//expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");		
		var partida=juego.partidas[codigo];
		partida.usuarios["jueves"].abandonarPartida();
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		partida.usuarios["lunes"].abandonarPartida();
		partida.usuarios["domingo"].abandonarPartida();
		partida.usuarios["Pepe"].abandonarPartida();
		expect(partida.numeroJugadores()).toEqual(0);
		//juego.eliminarPartida(codigo);
		expect(juego.partidas[codigo]).toBe(undefined)
	});
   
	describe("las votaciones",function(){
		beforeEach(function() {
			juego.unirAPartida(codigo,"domingo");
			juego.unirAPartida(codigo,"lunes");
			juego.unirAPartida(codigo,"jueves");
			juego.iniciarPartida(nick,codigo);
		});

		it("todos skipean",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("domingo",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("lunes",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("jueves",codigo);
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata a un inocente",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["domingo"].impostor=false;
			partida.usuarios["lunes"].impostor=false;
			partida.usuarios["jueves"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"jueves");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("domingo",codigo,"jueves");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("lunes",codigo,"jueves");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("jueves",codigo,"lunes");
			expect(partida.usuarios["jueves"].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata al impostor, la partida termina",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["domingo"].impostor=false;
			partida.usuarios["lunes"].impostor=false;
			partida.usuarios["jueves"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"jueves");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("domingo",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("lunes",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("jueves",codigo,nick);
			expect(partida.usuarios[nick].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("final");
		});

		it("impostor ataca a todos y gana",function(){
			//atacar y comprobar
			var partida=juego.partidas[codigo];
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["domingo"].impostor=false;
			partida.usuarios["lunes"].impostor=false;
			partida.usuarios["jueves"].impostor=false;

			juego.atacar(nick,codigo,"domingo");
			expect(partida.usuarios["domingo"].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"lunes");
			expect(partida.usuarios["lunes"].estado.nombre).toEqual("muerto");
			expect(partida.fase.nombre).toEqual("final");
		});

		it("realizar tareas",function(){
			var partida=juego.partidas[codigo];
			expect(partida.obtenerPercentGlobal()).toEqual(0);
			for(var i=0;i<9;i++){
				for(var key in partida.usuarios){

					partida.usuarios[key].realizarTarea();
				}
				expect(partida.fase.nombre).toEqual("jugando");
				expect(partida.obtenerPercentGlobal()).toEqual((i+1)*100/10);
			}
			for(var key in partida.usuarios){
					partida.usuarios[key].realizarTarea();
			}
			expect(partida.obtenerPercentGlobal()).toEqual(100);
			expect(partida.fase.nombre).toEqual("final");
		});
	})
  });
})