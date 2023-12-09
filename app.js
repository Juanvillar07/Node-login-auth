const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const app = express()

//seteamos el moto de plantillas
app.set('view engine', 'ejs')

//seteamos la carpeta public
app.use(express.static('public'))

//para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//seteamos variables de entorno
dotenv.config({path: './env/.env'})

//para trabjar con cookies
app.use(cookieParser())

//Llamar al router
app.use('/', require('./routes/router'))


//Para eliminar el cache y que no se pueda devolver con el boton luego de que hacemos un logout
app.use(function(req, res, next){
    if(!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


app.listen(3000, ()=>{
    console.log('SERVER UP running in http://localhost:3000');
})
