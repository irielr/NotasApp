
var app = {	
	//model: { "notas": [] }, 
	model: { "notas": [{ "titulo": "Subiendo a Firebase", "contenido": "Esta es una primera nota de prueba" }] },
    
	var myFBconfig = {	apiKey: "AIzaSyCzIVOqoX7UQ_vnkMQ0tbIGOoPC3mi5BTw",
						authDomain: "notesapp-iriel.firebaseapp.com",
						databaseURL: "https://notesapp-iriel.firebaseio.com", 
						storageBucket: "notesapp-iriel.appspot.com",
						projectId: "notesapp-iriel",	
						messagingSenderId: "599993888245",
						appId: "1:599993888245:android:d64fd621ce4149de1304bc"
					}, 
	
	inicio: function(){
		this.iniciarFirebase();
		this.iniciarFastClick();
		this.iniciarBotones();
		this.refrescarLista();
	},
	
	iniciarFirebase: function() {
		//firebase.initializeApp(app.myFBconfig);
		firebase.initializeApp(myFBconfig);
	},
	
	iniciarFastClick: function(){
		FastClick.attach(document.body);
	},
		
	iniciarBotones: function(){
		// se asocia al id del button en el html
		var btnNueva = document.querySelector('#nueva');
        var btnSalvar = document.querySelector('#salvar'); 
		var btnSubirNube = document.querySelector('#nube');
		
		btnNueva.addEventListener('click', this.mostrarEditor, false);
		btnSalvar.addEventListener('click', this.salvarNota, false);
		btnSubirNube.addEventListener('click', this.subirNube, false);
	},
	
	mostrarEditor: function(){
		document.body.className = '';
		document.getElementById('titulo').value = '';
		document.getElementById('comentario').value = '';
		document.getElementById('note-editor').style.display = 'block';
		document.querySelector('#titulo').className = 'titulo';
		document.getElementById('titulo').focus();
	},
	
	salvarNota: function(){
		var nuevoTitulo = app.extraerTitulo()
		if (nuevoTitulo!='') {
			var listaNotas = app.model.notas;
			listaNotas.push({"titulo": nuevoTitulo, "contenido": app.extraerComentario()});
			app.refrescarLista();
			app.guardarDatos();
			document.getElementById('note-editor').style.display = 'none';
		} else {
			document.querySelector('#titulo').className = 'titulo-alerta';
			document.getElementById('titulo').focus();
		}
	},
		
	refrescarLista: function(){
		var lista = document.getElementById('notes-list');
		var notas = this.model.notas;
		var nuevoDiv = '';
		for (var i in notas) {
			var itemTitulo = notas[i].titulo;
			nuevoDiv = nuevoDiv + this.agregarDivTag(i, itemTitulo);
		}
		lista.innerHTML = nuevoDiv;
	},
	
	agregarDivTag: function(id, itemTitulo) {
		return "<div class='note-item' id='notas[" + id + "]'>" + itemTitulo + "</div>";
	},
	
	extraerTitulo: function() {
		return document.getElementById('titulo').value;
	},
	
	extraerComentario: function() {
		return document.getElementById('comentario').value;
	},
	
	//////////////////////////////////////////////
	guardarDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, app.writeFileSystem, app.fail);
	}, 
	
	writeFileSystem: function(fileSystem) {
		fileSystem.getFile('files/model.json', {create: true, exclusive: false}, app.writeBuffer, app.fail);
	},
	
	writeBuffer: function(bufferEntry) {
		//document.body.className = 'error';
		bufferEntry.createWriter(app.fileBufferedWriter, app.fail);
	},
		
	fileBufferedWriter: function(fileWriter) {
		//fileWriter.onwriteend = function(e) { console.log('Guardado exitosamente'); }; 
		fileWriter.onwriteend = function(e) { document.querySelector('#nube').style.display = 'inline'; }; 
		fileWriter.onerror = function (e) { document.body.className = 'error'; };
		fileWriter.write(JSON.stringify(app.model));
	},
	
	//////////////////////////////////////////////	
	leerDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, app.readFileSystem, app.fail);
	},
	
	readFileSystem: function(fileSystem) {
		fileSystem.getFile("files/model.json", null, app.readBuffer, app.fail);
	},

	readBuffer: function(bufferEntry) {
		bufferEntry.file(app.fileBufferedReader, app.fail);
	},
			
	fileBufferedReader: function(file) {
		var fileReader = new FileReader();
		fileReader.onloadend = function(evt) { 
			var data = evt.target.result; 
			app.model = JSON.parse(data);
			app.inicio();
		};
		fileReader.readAsText(file);
	},
	
	////////////////////////////////////////////////////////////////
	
	subirNube: function() {
		if (navigator.connection.type !== Connection.NONE) { 
			var myStorage = firebase.storage().ref('model.json');
			myStorage.putString(JSON.stringify(app.model));
		} else {
			document.body.className = 'error';
		};
		document.querySelector('#nube').style.display = 'none';
	},
		/*
		var networkState = navigator.connection.type;
		var states = {};states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';
		*/

	////////////////////////////////////////////////////////////////
	fail: function(error) {
		if (error.code==1) {
			// Error 1: FILE NOT FOUND.... (al pricipio no existe el archivo "model.json")
			app.inicio();
		} else {
			document.body.className = 'error';
			console.log("Error: " + error.code);
			app.refrescarLista();
		};
	}
};

if ('addEventListener' in document) {
	document.addEventListener('deviceready', function() { app.leerDatos(); }, false );
}