const express = require("express");
// const bodyparse = require("body-parser");
const mongoose = require('mongoose');

const {body , validationResult} = require('express-validator');

mongoose.connect('mongodb://localhost/foro', {useNewUrlParser: true});

const esquemaComen = new mongoose.Schema({
    nombre: {type:String,required:[true,'campo requerido'],maxlength:20},
    mensaje: {type:String,required:[true,'campo requerido'],maxlength:100},
})

const esquemaMensa = new mongoose.Schema({
    nombre: {type:String,required:[true,'campo requerido'],maxlength:20},
    mensaje: {type:String,required:[true,'campo requerido'],maxlength:100},
    comentarios: [esquemaComen]
})

//const Comen = mongoose.model('Foro_Comen', esquemaComen);
const Mensa = mongoose.model('Foro_Mensas', esquemaMensa);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.use("/recursos", express.static(__dirname + "/public"));

const TraeMensaje = (req, res, error) => {
    Mensa.find()
    .then(data => {
        res.render("index", {mensajes: data, validaciones:error, valores:req.body})
    })
    .catch(err => res.json("::" + err));
}

app.get('/', (req, res) => {
    TraeMensaje(req, res);
})

app.post('/CrearMensaje', [
            body('nombre','Ingrese Nombre')
                .exists()
                .isLength({min:1}),
            body('mensaje','Ingrese Comentarios')
                .exists()
                .isLength({min:1}),
        ], (req, res) => {

        const errores = validationResult(req)
        if (!errores.isEmpty())
        {
            TraeMensaje(req, res, errores.array());
        }
        else{
            Mensa.create(req.body)
            .then(newUserData => console.log('user created: ', newUserData))
            .catch(err => console.log('err::'+err));
            res.redirect('/');
        }
})

app.post('/CrearComentario/:id', [
    body('nombre','Ingrese Nombre')
        .exists()
        .isLength({min:1}),
    body('mensaje','Ingrese Comentarios')
        .exists()
        .isLength({min:1}),
    ], (req, res) => {
        const errores = validationResult(req)
        if (!errores.isEmpty())
        {
            console.log(errores.array());
        }
        else{
            Mensa.findOneAndUpdate({_id:req.params.id},{$push:{comentarios:req.body}})
            .then(data => {
                res.redirect('/');
                })
            .catch(err => console.log(err));
        }
       
        res.redirect('/');
})

app.listen(8000, ()=>{
    console.log("Servidor escuchando el puerto 8000");
});