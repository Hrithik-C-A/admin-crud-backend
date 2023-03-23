const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const session = require('express-session')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(bodyparser.urlencoded({extended:true}))
app.use(session({
    secret:'Key',
    cookie:{
      maxAge: 1000 * 3600 *24 *30 *2  // 60 day ( milliseconds )
    }}))

mongoose.connect('mongodb://0.0.0.0:27017/database')

app.set('view engine','hbs')
app.set('views',path.join(__dirname,'views'))

app.get('/',(req,res)=>{
    res.render('signin')
})

app.get('/dashboard',async (req,res)=>{
    if(req.session.loginstatus){
        const db = mongoose.connection.db;
        const find = await db.collection('employees').find().toArray();
        let loginstatus = req.session.login = true;
        console.log(loginstatus)
        res.render('dashboard', { find, user: true, name : req.session.admin.adminname });
    }
    else{
        res.redirect('/')
    }

})

app.post('/dashboard', async (req, res) => {
    const db = mongoose.connection.db;
    const find = await db.collection('employees').find().toArray();
    req.session.admin = {
        adminname: 'Admin123',
        adminpass: '123'
    }
    if (req.body.adminname == req.session.admin.adminname && req.body.adminpass == req.session.admin.adminpass) {
        req.session.loginstatus = true
        res.redirect('/dashboard');
    } else {
        req.session.loginstatus = false
        req.session.admin = null
        res.redirect('/dashboard');
    }
});

app.get('/empupdate/:id', async (req, res) => {
    const db = mongoose.connection.db;
    const find = await db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.render('empupdateform', { find });
});

app.post('/updatedata/:id', async (req, res) => {
    const user_id = req.params.id;
    const updatedEmployee = {
        name: req.body.name ,
        position: req.body.position,
        experience: req.body.experience
    };
    const db = mongoose.connection.db;
    await db.collection('employees').findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(user_id) }, // find the document with the specified ID
        { $set: updatedEmployee }, // update the specified fields
        { returnOriginal: false } // return the updated document
    );
    // const find = await db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    // res.render('updateddb',{find})
    res.redirect('/dashboard')
});

app.get('/empdelete/:id',async(req,res)=>{
    const user_id = req.params.id;
    const db = mongoose.connection.db;
    await db.collection('employees').findOneAndDelete(
        { _id: new mongoose.Types.ObjectId(user_id) }
    );
    res.redirect('/dashboard')
})

app.get('/addemp',(req,res)=>{
    res.render('empadd')
})

app.post('/adddata',async (req,res)=>{
    const AddedEmployee = {
        name: req.body.name ,
        position: req.body.position,
        experience: req.body.experience
    };
    const db = mongoose.connection.db;
    await db.collection('employees').insertOne(
        AddedEmployee
    );
    res.redirect('/dashboard')
})

app.get('/logout',(req,res)=>{
    req.session.loginstatus = false
    req.session.admin = null
    res.redirect('/')
})

app.listen(3000,()=>{
    console.log('App is running successfully')
});
