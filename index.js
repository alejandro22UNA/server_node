//Imports
var express = require('express');
var bodyparser = require('body-parser');
var cors = require('cors');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Conexion a la BD
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'icopoghru9oezxh8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'urvrvfvecpz7ylch',
    password: 'oat0320wzwz97kjs',
    database: 's8p42v8et5a7955q',
    debug: false
  });

//Funciones o consultas a las BD
function seleccionar(req, res) {

    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("select * from inventario", function (err, rows) {
        connection.release();
        if (!err) {
          res.json(rows);
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}
  
function seleccionarId(id, res) {
  
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("select * from inventario where id=?",id, function (err, rows) {
        connection.release();
        if (!err) {
          res.json(rows);
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}
  
function login(datos, res) {
  
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("select * from usuarios where user=? and pass=?",[datos.user, datos.pass],function (err, rows) {
        connection.release();
        if (!err) {
          if(rows.length == 0){
            console.log('No se encontro el usuario');
            res.send('nofound');
          }else{
            var token = jwt.sign({
                user: datos.user,
                rol: 'admin'
            },'secreto',{expiresIn: 40});
            res.send(token);
          }
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}

//Funcion de insertar
function insertar(datos, res) {

    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("insert into inventario set ?",datos,function (err, rows) {
        connection.release();
        if (!err) {
            res.send({estado: 'OK'});
        }else{
            res.send({estado: 'Error'});
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}

//Funcion de actualizar
function actualizar(datos, res) {

    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("update inventario set ? where id = ?",[datos,datos.id],function (err, rows) {
        connection.release();
        if (!err) {
            res.send({estado: 'OK'});
        }else{
            res.send({estado: 'Error'});
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}

//Funcion de borrar
function borrar(id, res) {

    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      }
  
      console.log('connected as id ' + connection.threadId);
  
      connection.query("delete from inventario where id = ?", id,function (err, rows) {
        connection.release();
        if (!err) {
            res.send({estado: 'OK'});
        }else{
            res.send({estado: 'Error'});
        }
      });
  
      connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
      });
    });
}

//Funcion comentada del tutorial
    /*app.use(expressjwt({secret:'secreto'})
   .unless({path:[
      '/auth/login'
   ]}));
   */

//Establecimiento de Rutas
    app.get("/", function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Servidor Node Funcionado correctamente :)');
        console.log('APP FUNCIONANDO');
    });
    
    app.get('/inventario', function (req, res) {
        seleccionar(req, res);
        console.log('Cargando todo el inventario!');
    })
    
    app.get('/inventario/:id/', function (req, res) {
        seleccionarId(req.params.id, res);
        console.log('Cargando articulo especifico!');
    })
    
    app.post('/auth/login/', function (req, res) {
        login(req.body, res);
        console.log('Login!');
    })

    app.post('/inventario/',function(req, res){
        insertar(req.body, res);
    })

    app.put('/inventario/', function(req, res){
        actualizar(req.body, res);
    })

    app.delete('/inventario/:id/',function(req, res){
        borrar(req.params.id, res);
    })

//Inicio de la App
    app.listen(process.env.PORT || 3000, function(){
        console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });

//Informacion Adicional
//DOCUMENTO DE ROUTES
/*
var db = require('./queries');

function http(){
    this.configurar = function(app){
        app.get('/inventario', function(solicitud, respuesta){
            db.seleccionar(respuesta);
        })

        app.get('/inventario/:id/',function(solicitud, respuesta){
            db.seleccionarId(solicitud.params.id,respuesta);
        })

        app.post('/inventario/',function(solicitud,respuesta){
            db.insertar(solicitud.body, respuesta);
        })

        app.put('/inventario/', function(solicitud, respuesta){
            db.actualizar(solicitud.body, respuesta);
        })

        app.delete('/inventario/:id/',function(solicitud,respuesta){
            db.borrar(solicitud.params.id, respuesta);
        })

        app.post('/auth/login/',function(solicitud,respuesta){
            db.login(solicitud.body, respuesta);
        })
    }
}
module.exports = new http();
*/

//DOCUMENTO DE QUERIES
/*
var conexion = require('./connection');
var jwt = require('jsonwebtoken');

function MetodosDB(){

    this.seleccionar  = function(respuesta){
        conexion.obtener(function(er,cn){
            cn.query('select * from inventario', function(error,resultado){
                cn.release();
                if(error){
                    respuesta.send({estado: 'Error'})
                }else{
                    respuesta.send(resultado);
                }
            })
        })
    }

    this.seleccionarId = function(id, respuesta){
        conexion.obtener(function(er, cn){
            cn.query('select * from inventario where id=?',id,function(error, resultado){
                cn.release();
                if(error){
                    respuesta.send({estado: 'Error'});
                }else{
                    respuesta.send(resultado);
                }
            })
        })
    } 

    this.insertar = function(datos, respuesta){
        conexion.obtener(function(er, cn){
            cn.query('insert into inventario set ?', datos,function(error, resultado){
                cn.release();
                if(error){
                    respuesta.send({estado: 'Error'});
                }else{
                    respuesta.send({estado: 'OK'});
                }
            })
        })
    }

    this.actualizar = function(datos,respuesta){
        conexion.obtener(function(er,cn){
            cn.query('update inventario set ? where id = ?',[datos,datos.id],function(error,resultado){
                cn.release();
                if(error){
                    respuesta.send({estado:'Error'});
                }else{
                    respuesta.send({estado: 'OK'});
                }
            })
        })
    }

    this.borrar = function(id, respuesta){
        conexion.obtener(function(er,cn){
            cn.query('delete from inventario where id = ?', id, function(error,resultado){
                cn.release();
                if(error){
                    respuesta.send({estado: 'Error'});
                }else{
                    respuesta.send({estado: 'OK'});
                }
            })
        })
    }

    this.login = function(datos, respuesta){
        conexion.obtener(function(er, cn){
            cn.query('select * from usuarios where user=? and pass=?',[datos.user, datos.pass],function(error, resultado){
                cn.release();
                if(error){
                    respuesta.send('error');
                }else{
                    if(resultado.length == 0){
                        console.log('No se encontro el usuario');
                        respuesta.send('nofound');
                    }else{
                        var token = jwt.sign({
                            user: datos.user,
                            rol: 'admin'
                        },'secreto',{expiresIn: '120s'});
                        respuesta.send(token);
                    }
                }
            })
        })
    }
}

module.exports = new MetodosDB();
*/