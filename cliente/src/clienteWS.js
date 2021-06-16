function ClienteWS(){
	this.socket=undefined;
	this.nick=undefined;
	this.codigo=undefined;
	this.owner=false;
	this.numJugador=undefined;
	this.impostor;
	this.estado;
	this.encargo;
	this.terminado = false;

	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.crearPartida=function(nick,numero){
		this.nick=nick;
		this.socket.emit("crearPartida",nick,numero);//{"nick":nick,"numero":numero}
	}
	this.unirAPartida=function(nick,codigo){
		//this.nick=nick;
		this.socket.emit("unirAPartida",nick,codigo);
	}
	this.iniciarPartida=function(){
		this.socket.emit("iniciarPartida",this.nick,this.codigo);
	}
	this.abandonarPartida=function(){
		this.socket.emit("abandonarPartida",this.nick,this.codigo);
	}
	this.listaPartidasDisponibles=function(){
		this.socket.emit("listaPartidasDisponibles");
	}
	this.listaPartidas=function(){
		this.socket.emit("listaPartidas");
	}
	this.estoyDentro=function(){
		this.socket.emit("estoyDentro",this.nick,this.codigo);
	}
	this.lanzarVotacion=function(){
		this.socket.emit("lanzarVotacion",this.nick,this.codigo);
	}
	this.saltarVoto=function(){
		this.socket.emit("saltarVoto",this.nick,this.codigo);
	}
	this.votar=function(sospechoso){
		this.socket.emit("votar",this.nick,this.codigo,sospechoso);
	}
	this.obtenerEncargo=function(){
		this.socket.emit("obtenerEncargo",this.nick,this.codigo);
	}
	this.atacar=function(inocente){
		this.socket.emit("atacar",this.nick,this.codigo,inocente);
	}
	this.movimiento=function(direccion,x,y){
		var datos={nick:this.nick,codigo:this.codigo,numJugador:this.numJugador,direccion:direccion,x:x,y:y};
		this.socket.emit("movimiento",datos);
	}
	this.realizarTarea=function(){
		this.socket.emit("realizarTarea",this.nick,this.codigo);
	}
	this.terminarTarea=function(){
		this.socket.emit("terminarTarea",this.nick,this.codigo);
	}

	//servidor WS dentro del cliente
	this.lanzarSocketSrv=function(){
		var cli=this;
		this.socket.on('connect', function(){			
			console.log("conectado al servidor de WS");
		});
		this.socket.on('partidaCreada',function(data){
			cli.codigo=data.codigo;
			console.log(data);
			if (data.codigo!="fallo"){
				cli.owner=true;
				cli.numJugador=0;
				cli.estado="vivo";
				cw.mostrarEsperandoRival();
			}
		});
		this.socket.on('unidoAPartida',function(data){
			cli.codigo=data.codigo;
			cli.nick=data.nick;
			cli.numJugador=data.numJugador;
			cli.estado="vivo";

			console.log(data);
			cw.mostrarEsperandoRival();
		});
		this.socket.on('sinUnir',function(data){
			
			cli.codigo=undefined;
			cw.mostrarCrearPartida(4);

			ws.listaPartidasDisponibles();
		});
		this.socket.on('partidaAbandonada',function(data){
			cli.nick=undefined;
			cli.codigo=undefined;
			cli.owner=false;
			cli.numJugador=undefined;
			cli.estado=undefined;

			cw.limpiar();
			cw.mostrarCrearPartida(4);
			cli.listaPartidasDisponibles();	
		});
		this.socket.on('nuevoJugador',function(lista){
			cw.mostrarListaJugadores(lista);
		});
		this.socket.on('partidaIniciada',function(fase){
			console.log("jugador: "+cli.nick);
			console.log("Partida en fase: "+fase);
			if (fase=="jugando"){
				cli.obtenerEncargo();
				cw.limpiar();
				lanzarJuego();
			}
		});
		this.socket.on('recibirListaPartidasDisponibles',function(lista){
			console.log(lista);
			//cw.mostrarUnirAPartida(lista);
			if (!cli.codigo){
				cw.mostrarListaPartidas(lista);
			}
		});
		this.socket.on('recibirListaPartidas',function(lista){
			console.log(lista);
		});
		this.socket.on('dibujarRemoto',function(lista){
			console.log(lista);
			for(var i=0;i<lista.length;i++){
				if (lista[i].nick!=cli.nick){
					lanzarJugadorRemoto(lista[i].nick,lista[i].numJugador);
				}
			}
			crearColision();
		});
		this.socket.on("moverRemoto",function(datos){
			mover(datos);
		})
		this.socket.on("votacion",function(lista){
			console.log(lista);
			cw.mostrarModalVotacion(lista);
		});
		this.socket.on("finalVotacion",function(data){
			console.log(data);
			//cw.cerrarModal()
			$('#modalGeneral').modal('toggle');

			var resolucion = data.elegido;
			if (resolucion == "no hay nadie elegido"){
				cw.mostrarModalSimple("Tras muchas deliveraciones habeis decidido que no es posible identificar al enemigo, id con cuidado");
			}
			else{
			cw.mostrarModalSimple("Ha sido duro, pero habeis deducido que "+data.elegido+" era el traidor, y juntos le habeis dado su merecido.");
		}
		});
		this.socket.on("haVotado",function(data){
			console.log(data);
			//actualizar la lista
		});
		this.socket.on("recibirEncargo",function(data){
			console.log(data);
			cli.impostor=data.impostor;
			cli.encargo=data.encargo;
			if (data.impostor){
				//$('#avisarImpostor').modal("show");
				cw.mostrarModalSimple('Has decidido que tu especie será la única que sobrevivirá al ritual, utiliza la tecla a para atacar a tus adversarios.');
			}
			else{
				var cadena='La guerra con los humanos ha llegado a un punto critico, pero la Alianza aún';
				cadena=cadena+'tiene un ás en la manga, a traves de un ritual ancestral podreis trasladar a vuestra gente a un ';
				cadena=cadena+'planeta idilico, para realizar el ritual debereís reunir los ingredientes necesarios.';
				cadena=cadena+'Gracias a la magia del lugar podreis realizar vuestra tarea aunque murais, un noble sacrificio por el futuro de vuestra gente.';
				cadena=cadena+'Aunque eso no ocurrirá, despues de todo estaís entre aliados ¿verdad?.'
				cadena=cadena+'Para completar tu parte del ritual debes encontrar '+ws.encargo+', con 10 bastará, mejor apresurarse...'
				
				cw.mostrarModalSimple(cadena);   
			}
		});
		this.socket.on("final",function(data){
			console.log(data);
			finPartida(data);
		});
		this.socket.on("muereInocente",function(inocente){
			console.log('muere '+inocente);
			if (cli.nick==inocente){
				cli.estado="muerto";
			}
			dibujarMuereInocente(inocente);
		});
		this.socket.on("tareaRealizada",function(data){
			console.log(data);
			if (data.percent ==100){
				cli.terminado = true;
				cw.mostrarModalTarea("Ya has encontrado suficientes "+ws.encargo+" para el ritual, esperemos que tus compañeros no tarden...");
      		}	
     	 	else{
      			cw.mostrarModalTarea("Has encontrado "+ws.encargo+" valid@s para el ritual, aun faltan unos poc@s...");
    		}
		});		
		this.socket.on("hasAtacado",function(fase){
			if (fase=="jugando"){
				ataquesOn=true;
			}
		});
	}
	this.ini();
}
