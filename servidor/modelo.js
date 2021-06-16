function Juego(){
	this.partidas={};
	this.crearPartida=function(num,owner){
		let codigo="fallo";
		if (!this.partidas[codigo] && this.numeroValido(num)){
			codigo=this.obtenerCodigo();
			this.partidas[codigo]=new Partida(num,owner,codigo,this);
		}
		else{
			console.log(codigo);
		}
		return codigo;
	}
	this.unirAPartida=function(codigo,nick){
		var res=-1;
		if (this.partidas[codigo]){
			res=this.partidas[codigo].agregarUsuario(nick);
		}
		return res;
	}
	this.numeroValido=function(num){
		return (num>=4 && num<=10)
	}
	this.obtenerCodigo=function(){
		let cadena="ABCDEFGHIJKLMNOPQRSTUVXYZ";
		let letras=cadena.split('');
		let maxCadena=cadena.length;
		let codigo=[];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}
	this.eliminarPartida=function(codigo){
		delete this.partidas[codigo];
	}
	this.listaPartidasDisponibles=function(){
		var lista=[];
		var huecos=0;
		var maximo=0;
		for (var key in this.partidas){
			var partida=this.partidas[key];
			huecos=partida.obtenerHuecos();
			maximo=partida.maximo;
			if (huecos>0)
			{
			  lista.push({"codigo":key,"huecos":huecos,"maximo":maximo});
			}
		}
		return lista;
	}
	this.listaPartidas=function(){
		var lista=[];
		for (var key in this.partidas){
			var partida=this.partidas[key];
			var owner=partida.nickOwner;
			 lista.push({"codigo":key,"owner":owner});
		}
		return lista;
	}

	this.iniciarPartida=function(nick,codigo){
		var owner=this.partidas[codigo].nickOwner;
		if (nick==owner){
			this.partidas[codigo].iniciarPartida();
		}
	}
	this.lanzarVotacion=function(nick,codigo){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.lanzarVotacion();
	}
	this.saltarVoto=function(nick,codigo){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.saltarVoto();
	}
	this.votar=function(nick,codigo,sospechoso){
		var usr=this.partidas[codigo].usuarios[nick];
		//usr=this.partidas[codigo].obtenerUsuario(nick)
		usr.votar(sospechoso);
	}
	this.obtenerEncargo=function(nick,codigo){
		var res={};
		var encargo=this.partidas[codigo].usuarios[nick].encargo;
		var impostor=this.partidas[codigo].usuarios[nick].impostor;
		res={"nick":nick,"encargo":encargo,"impostor":impostor};

		return res;
	}
	this.atacar=function(nick,codigo,inocente){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.atacar(inocente);
	}
	this.obtenerListaJugadores=function(codigo){
		return this.partidas[codigo].obtenerListaJugadores();
	}
	this.realizarTarea=function(nick,codigo){
		this.partidas[codigo].realizarTarea(nick);
	}
	this.terminarTarea=function(nick,codigo){
		this.partidas[codigo].terminarTarea(nick);
	}
}

function Partida(num,owner,codigo,juego){
	this.maximo=num;
	this.nickOwner=owner;
	this.codigo=codigo;
	this.juego=juego;
	this.fase=new Inicial();
	this.usuarios={};
	this.elegido="no hay nadie elegido";
	this.encargos=["huesos","raices","madera","seda","sangre","veneno","gemas","joyas","pocion","llamas"];
	this.agregarUsuario=function(nick){
		return this.fase.agregarUsuario(nick,this)
	}
	this.puedeAgregarUsuario=function(nick){
		let nuevo=nick;
		let contador=1;
		while(this.usuarios[nuevo]){
			nuevo=nick+contador;
			contador=contador+1;
		}
		this.usuarios[nuevo]=new Usuario(nuevo);
		this.usuarios[nuevo].partida=this;		
		var numero=this.numeroJugadores()-1;
		this.usuarios[nuevo].numJugador=numero
		if (this.comprobarMinimo()){
			this.fase=new Completado();
		}
		return {"codigo":this.codigo,"nick":nuevo,"numJugador":numero};
		//this.comprobarMinimo();		
	}
	this.obtenerListaJugadores=function(){
		var lista=[]
		for (var key in this.usuarios){
			var numero=this.usuarios[key].numJugador;
			lista.push({nick:key,numJugador:numero});
		}
		return lista;//Object.keys(this.usuarios);
	}
	this.obtenerListaJugadoresVivos=function(){
		var lista=[]
		for (var key in this.usuarios){
			if (this.usuarios[key].estadoVivo()){
				var numero=this.usuarios[key].numJugador;
				lista.push({nick:key,numJugador:numero});
			}
		}
		return lista;//Object.keys(this.usuarios);
	}
	this.obtenerHuecos=function(){
		return this.maximo-this.numeroJugadores();
	}
	this.numeroJugadores=function(){
		return Object.keys(this.usuarios).length;
	}
	this.comprobarMinimo=function(){
		return this.numeroJugadores()>=4;
	}
	this.comprobarMaximo=function(){
		return this.numeroJugadores()<this.maximo;
	}
	this.iniciarPartida=function(){
		this.fase.iniciarPartida(this);
	}

this.mezclarEncargos= function() {
      var j, x, i;
      //Recorremos el array del final hacia delante
      for (i = this.encargos.length - 1; i > 0; i--) {
        //Generamos una posicion comprendida entre los valores de nuestro array
        j = Math.floor(Math.random() * (i + 1));
        // Asignamos el valor de la posición actual a una variable
        x = this.encargos[i];
        //Intercambiamos los valores de las dos posiciones
        this.encargos[i] = this.encargos[j];
        this.encargos[j] = x;
      }
    }

	this.puedeIniciarPartida=function(){
		this.mezclarEncargos();
		this.asignarEncargos();
		this.asignarImpostor();
		this.fase=new Jugando();
		console.log("Partida "+this.codigo+" estado "+this.fase.nombre);		
	}


	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
	}
	this.puedeAbandonarPartida=function(nick){
		this.eliminarUsuario(nick);
		if (!this.comprobarMinimo()){
			this.fase=new Inicial();
		}
		if (this.numeroJugadores()<=0){
			this.juego.eliminarPartida(this.codigo);
		}
	}
	this.eliminarUsuario=function(nick){
		delete this.usuarios[nick];
	}
	this.asignarEncargos=function(){
		let ind=0;
		for (var key in this.usuarios) {
		    this.usuarios[key].encargo=this.encargos[ind];
		    ind=(ind+1)%(this.encargos.length)
		}
	}
	this.asignarImpostor=function(){
		let listaNicks=Object.keys(this.usuarios);
		let ind=randomInt(0,listaNicks.length-1);
		let nick=listaNicks[ind];
		this.usuarios[nick].asignarImpostor(); //impostor=true;
	}
	this.atacar=function(inocente){
		this.fase.atacar(inocente,this);
	}
	this.puedeAtacar=function(inocente){
		this.usuarios[inocente].esAtacado();
		//this.comprobarFinal();
	}
	this.numeroImpostoresVivos=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].impostor && this.usuarios[key].estadoVivo()){ //.nombre=="vivo"){
				cont++;
			}
		}
		return cont;
	}
	this.numeroCiudadanosVivos=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoVivo() && !this.usuarios[key].impostor){
				cont++;
			}
		}
		return cont;
	}
	this.numeroCiudadanos=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (!this.usuarios[key].impostor){
				cont++;
			}
		}
		return cont;
	}
	this.gananImpostores=function(){
		return (this.numeroImpostoresVivos()>=this.numeroCiudadanosVivos());
	}
	this.gananCiudadanos=function(){
		return (this.numeroImpostoresVivos()==0);
	}
	this.votar=function(sospechoso){
		this.fase.votar(sospechoso,this)
	}
	this.puedeVotar=function(sospechoso){
		this.usuarios[sospechoso].esVotado();
		this.comprobarVotacion();
	}
	this.masVotado=function(){
		let votado=undefined;
		let cont=0;
		let max=1;
		for (var key in this.usuarios) {
			if (max<this.usuarios[key].votos){
				max=this.usuarios[key].votos;
				votado=this.usuarios[key];
			}
		}
		for (var key in this.usuarios) {
			if (max==this.usuarios[key].votos){
				cont++;
			}
		}

		if (cont>1){
			votado=undefined;
		}
		return votado;
	}
	this.numeroSkips=function(){
		let cont=0;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoVivo() && this.usuarios[key].skip){
				cont++;
			}
		}
		return cont;
	}
	this.todosHanVotado=function(){
		let res=true;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoVivo() && !this.usuarios[key].haVotado){
				res=false;
				break;
			}
		}
		return res;
	}
	this.listaHanVotado=function(){
		var lista=[];
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoVivo() && this.usuarios[key].haVotado){
				lista.push(key);
			}
		}
		return lista;
	}
	this.comprobarVotacion=function(){
		if (this.todosHanVotado()){
			let elegido=this.masVotado();
			if (elegido && elegido.votos>this.numeroSkips()){
				elegido.esAtacado();
				this.elegido=elegido.nick;
			}
			this.finalVotacion();
		}
	}
	this.finalVotacion=function(){
		console.log("partida "+this.codigo+" estado "+this.nombre);
		this.fase=new Jugando();
		//this.reiniciarContadoresVotaciones(); 
		this.comprobarFinal();
	}
	this.reiniciarContadoresVotaciones=function(){
		this.elegido="no hay nadie elegido";
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoVivo()){
				this.usuarios[key].reiniciarContadoresVotaciones();
			}
		}
	}
	this.comprobarFinal=function(){
		if (this.gananImpostores()){
			this.finPartida();
		}
		else if (this.gananCiudadanos()){
			this.finPartida();
		}
	}
	this.finPartida=function(){
		console.log("partida "+this.codigo+" estado "+this.fase.nombre);
		this.fase=new Final();
	}
	this.lanzarVotacion=function(){
		this.fase.lanzarVotacion(this);
	}
	this.puedeLanzarVotacion=function(){
		this.reiniciarContadoresVotaciones();
		this.fase=new Votacion();
	}
	this.realizarTarea=function(nick){
		this.fase.realizarTarea(nick,this);
	}
	this.terminarTarea=function(nick){
		this.fase.terminarTarea(nick,this);
	}
	this.puedeRealizarTarea=function(nick){
		this.usuarios[nick].realizarTarea();
	}
	this.puedeTerminarTarea=function(nick){
		this.usuarios[nick].terminarTarea();
	}
	this.tareaTerminada=function(){
		if (this.comprobarTareasTerminadas()){
			this.finPartida();
		}
	}
	this.comprobarTareasTerminadas=function(){
		let res=true;
		for (var key in this.usuarios) {
			if (this.usuarios[key].estadoTarea!="completada"){
				res=false;
				break;
			}
		}
		return res;		
	}
	this.obtenerPercentTarea=function(nick){
		return this.usuarios[nick].obtenerPercentTarea();
	}
	this.obtenerPercentGlobal=function(){
		var total=0;
		for(var key in this.usuarios){
			if (!this.usuarios[key].impostor)
			{
				total=total+this.obtenerPercentTarea(key);
			}
		}
		total=total/this.numeroCiudadanos();
		return total;
	}
	this.agregarUsuario(owner);
}

function Inicial(){
	this.nombre="inicial";
	this.agregarUsuario=function(nick,partida){
		return partida.puedeAgregarUsuario(nick);
		 if (partida.comprobarMinimo()){
		 	partida.fase=new Completado();
		 }		
	}
	this.iniciarPartida=function(partida){
		console.log("Faltan jugadores");
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
		//partida.eliminarUsuario(nick);
		//comprobar si no quedan usr
	}
	this.atacar=function(inocente){}
	this.lanzarVotacion=function(){}
	this.realizarTarea=function(){}
	this.terminarTarea=function(){}
}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		partida.puedeIniciarPartida();
		//partida.fase=new Jugando();
		//asignar encargos: secuencialmente a todos los usr
		//asignar impostor: dado el array usuario (Object.keys)
	}
	this.agregarUsuario=function(nick,partida){
		console.log("maximo dentro de la partid: "+this.maximo);
		if (partida.comprobarMaximo()){
			return partida.puedeAgregarUsuario(nick);
		}
		else{
			console.log("Lo siento, numero máximo")
		}
	}
	this.abandonarPartida=function(nick,partida){
		console.log("llega hasta 5 + codigo completado");
		partida.eliminarUsuario(nick);
		if (!partida.comprobarMinimo()){
			partida.fase=new Inicial();
		}
	}
	this.atacar=function(inocente){}
	this.lanzarVotacion=function(){}
	this.realizarTarea=function(){}
	this.terminarTarea=function(){}
}

function Jugando(){
	console.log("funcion jugando");
	this.nombre="jugando";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ya ha comenzado");
	}
	this.iniciarPartida=function(partida){
		console.log("iniciar partida - servidor - fase jugando");
	}
	this.abandonarPartida=function(nick,partida){
		console.log("llega hasta 5 + codigo jugando");
		partida.eliminarUsuario(nick);
		//comprobar si termina la partida
	}
	this.atacar=function(inocente,partida){
		partida.puedeAtacar(inocente);
	}
	this.lanzarVotacion=function(partida){
		partida.puedeLanzarVotacion();
	}
	this.votar=function(sospechoso,partida){}
	this.realizarTarea=function(nick,partida){
		partida.puedeRealizarTarea(nick);
	}
	this.terminarTarea=function(nick,partida){
		partida.puedeTerminarTarea(nick);
	}
}

function Votacion(){
	this.nombre="votacion";
	this.agregarUsuario=function(nick,partida){}
	this.iniciarPartida=function(partida){}
	console.log("iniciar partida - servidor - fase votacion");
	this.abandonarPartida=function(nick,partida){}
	this.atacar=function(inocente){}
	this.lanzarVotacion=function(){}
	this.votar=function(sospechoso,partida){
		partida.puedeVotar(sospechoso);
	}
	this.realizarTarea=function(){}
	this.terminarTarea=function(){}
}

function Final(){
	this.nombre="final";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ha terminado");
	}
	this.iniciarPartida=function(partida){
		console.log("iniciar partida - servidor - fase final");
	}
	this.abandonarPartida=function(nick,partida){
		//esto es absurdo (salvo para Javier)
	}
	this.atacar=function(inocente){}
	this.lanzarVotacion=function(){}
	this.realizarTarea=function(){}
	this.terminarTarea=function(){}
}

function Usuario(nick){
	this.nick=nick;
	//this.juego=juego;
	this.partida;
	this.impostor=false;
	this.numJugador;
	this.encargo="ninguno";
	this.estado=new Vivo();
	this.votos=0;
	this.skip=false;
	this.haVotado=false;
	this.realizado=0;
	this.estadoTarea="no terminada";
	this.maxTarea=10;
	this.iniciarPartida=function(){
		console.log("iniciar partida - servidor - usuario");
		this.partida.iniciarPartida();
	}
	this.estadoVivo=function(){
		return this.estado.estadoVivo();
	}
	this.asignarImpostor=function(){
		this.impostor=true;
		this.estadoTarea="completada";
		this.realizado=this.maxTarea;
	}
	this.abandonarPartida=function(){
		console.log("llega hasta 5 + codigo usuario");
		this.partida.abandonarPartida(this.nick);
		if (this.partida.numeroJugadores()<=0){
			console.log(this.nick," era el último jugador");
		}
	}
	this.atacar=function(inocente){
		if (this.impostor && !(this.nick==inocente)){
			this.partida.atacar(inocente);
		}
	}
	this.esAtacado=function(){
		this.estado.esAtacado(this);
	}
	this.saltarVoto=function(){
		this.skip=true;
		this.haVotado=true;
		this.partida.comprobarVotacion();
	}
	this.lanzarVotacion=function(){
		this.estado.lanzarVotacion(this);
	}
	this.puedeLanzarVotacion=function(){
		this.partida.lanzarVotacion();
	}
	this.votar=function(sospechoso){
		this.haVotado=true;
		this.partida.votar(sospechoso);
	}
	this.esVotado=function(){
		this.votos++;
	}
	this.reiniciarContadoresVotaciones=function(){
		this.votos=0;
		this.haVotado=false;
		this.skip=false;
	}
	this.realizarTarea=function(){
		if (!this.impostor){
			this.realizado++;
			if (this.realizado>=this.maxTarea){
				this.estadoTarea="completada";
				this.partida.tareaTerminada();
			}
		}
		console.log("usuario "+this.nick+" realiza tarea "+this.encargo+" estadoTarea: "+this.estadoTarea);
	}
	this.terminarTarea=function(){
		if (!this.impostor){
			this.realizado = this.maxTarea;
				this.estadoTarea="completada";
				this.partida.tareaTerminada();
		}
		console.log("usuario "+this.nick+" termina completamente la tarea "+this.encargo);
	}
	this.obtenerPercentTarea=function(){
		return 100*(this.realizado/this.maxTarea);
	}
}

function Vivo(){
	this.nombre="vivo";
	this.esAtacado=function(usr){
		usr.estado=new Muerto();
		usr.partida.comprobarFinal();
	}
	this.lanzarVotacion=function(usr){
		usr.puedeLanzarVotacion();
	}
	this.estadoVivo=function(){
		return true;
	}
}

function Muerto(){
	this.nombre="muerto";
	this.esAtacado=function(usr){}
	this.lanzarVotacion=function(usr){}
	this.estadoVivo=function(){
		return false;
	}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;