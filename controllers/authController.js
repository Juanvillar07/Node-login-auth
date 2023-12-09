const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')
const { error } = require('console')


function renderAlert(res, view, title, message, icon, showButton, timer, route) {
    res.render(view, {
        alert: true,
        alertTitle: title,
        alertMessage: message,
        alertIcon: icon,
        showConfirmButton: showButton,
        timer: timer,
        ruta: route
    });
}

//procedimiento de registros 
exports.register = async(req, res) =>{
    try {
        const name = req.body.name
        const user = req.body.user
        const pass = req.body.pass
        let passHash = await bcryptjs.hash(pass, 8)
        //console.log(passHash)
        conexion.query('INSERT INTO users SET ?', {user:user, name: name, pass: passHash}, (error, results)=>{
            if(error){console.log(error)}
            res.redirect('/')
        })
    
    } catch (error) {
        console.log(error)
    }
}

//procedimiento login
exports.login = async (req, res)=>{
    try {
        const user = req.body.user
        const pass = req.body.pass
        //console.log(user + "-" + pass)

        if(!user || !pass){
            renderAlert(res, 'login', 
            "Advertencia", 
            "Ingrese un usuario y password", 
            'info',
            true, 
            false, 
            'login');
            // res.render('login',{
            //     alert:true,
            //     alertTitle: "Advertencia",
            //     alertMessage: "Ingrese un usuario y password",
            //     alertIcon: 'info',
            //     showConfirmButton: true,
            //     timer: false,
            //     ruta: 'login'
            // })
        }else{
            conexion.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
                if(results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass))){
                    res.render('login',{
                        alert:true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Contraseña incorrectas",
                        alertIcon: 'warning',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    })
                }else{
                    //inicio de sesion OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    //Generar token sin fecha de expiracion
                    //const token = jwt.sign({id:id}, process.env.JWT_SECRETO)
                    console.log("TOKEN: " + token + "para el usuario: "+user)

                    const cookieOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions)
                    res.render('login', {
                        alert:true,
                        alertTitle: "Conexion exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isAuthenticated = async (req, res, next)=>{
    if(req.cookies.jwt){
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.redirect('/login')
        next()
    }
}


exports.logout = (req, res) =>{
    res.clearCookie('jwt')
    return res.redirect('/')
}


exports.save = async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;
        const pass = req.body.pass
        let passHash = await bcryptjs.hash(pass, 8)
        const rol = req.body.rol;

         // Verificar si el usuario ya existe
         conexion.query('SELECT * FROM users WHERE user = ?', [user], (error, results) => {
            if (error) {
                // Manejar error de consulta
                console.log(error);
                return res.status(500).send('Error en el servidor');
            }

            if (results.length > 0) {
                // El usuario ya existe, enviar mensaje de error
                res.render('create', {
                    alert: false, // o true si necesitas mostrar la alerta
                    alertTitle: "Tu título",
                    alertMessage: "Tu mensaje",
                    alertIcon: 'info', // o 'warning', 'error', etc., según corresponda
                    showConfirmButton: true,
                    timer: false, // o la cantidad de milisegundos que desees
                    ruta: 'create'
                });
            }
            else{
                console.log(passHash)
                conexion.query('INSERT INTO users SET ?', {user:user, name:name, pass:passHash, rol:rol}, (error, results) => {
                    if (error) {
                        // Aquí puedes manejar el error de inserción si lo deseas.
                        console.log(error);
                    }
                    
                    else{
                        res.redirect('/')
                    }         
                });    
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.update = async (req, res)=>{
    try {
        const id = req.body.id;
        const user = req.body.user;
        const name = req.body.name;
        const rol = req.body.rol;
        console.log(id + user + name + rol)
        conexion.query('UPDATE users SET ? WHERE id = ?', [{user:user, name:name, rol:rol}, id], (error, results)=>{
        if (error) {
            // Aquí puedes manejar el error de inserción si lo deseas.
            console.log(error);
        }else{
            res.redirect('/')
        }         
    })
    } catch (error) {
        console.log(error);
    }   
}