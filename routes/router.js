const express = require('express')
const router = express.Router()

const authController= require('../controllers/authController');
const conexion = require('../database/db');


//router para vistas
// router.get('/', authController.isAuthenticated, (req, res) =>{
//     res.render('index', {user:req.user});
    
// })
router.get('/', authController.isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM users', (error, results) => {
        if (error) {
            console.log(error);
            // maneja el error según lo necesites
            return res.status(500).send("Error al obtener los datos");
        }else{
            res.render('index', { users: results, user: req.user });
        }
        
    });
});

router.get('/data', authController.isAuthenticated, (req, res) => {
    conexion.query('SELECT * FROM users', (error, results) => {
        if (error) {
            throw error;
        }else{
            data = JSON.stringify(results);
            res.send(data);
        }
        
    });
});


router.get('/edit/:id', authController.isAuthenticated, (req,res)=>{    
    const id = req.params.id;
    conexion.query('SELECT * FROM users WHERE id=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('edit.ejs', {user:results[0] });            
        }        
    });
});



router.get('/login', (req, res) =>{
    res.render('login', {alert:false})
})

router.get('/register', (req, res) =>{
    res.render('register')
})

router.get('/create', authController.isAuthenticated, (req, res)=>{
    res.render('create', {user:req.user});
    //res.render('create', {alert:false});
    //res.render('create')
})

//RUTA PARA ELIMINAR
router.get('/delete/:id', authController.isAuthenticated, (req, res)=>{
    const id = req.params.id;
    conexion.query('DELETE FROM users WHERE id = ?', [id], (error, results)=>{
        if (error) {
            throw error;
        }else{            
            res.redirect('/');            
        }       
    })
})

router.post('/save', authController.save);

router.post('/update', authController.update);

//router para motodos de controller
router.post('/register', authController.register)

router.post('/login', authController.login)

router.get('/logout', authController.logout)

module.exports = router
