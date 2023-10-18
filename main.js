const express = require('express')
const mysql = require('mysql')

const jsonData= require('./users.json'); 
const fs = require("fs")

const app = express();

app.use("/scripts", express.static(__dirname+"/scripts"))
app.use('/static',express.static('static'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


const pool = mysql.createPool({
    host: '127.0.0.1',
    user:  'root',
    password: '2160',
    database: 'ums'
})



//const host = "localhost";


app.listen(3000, ()=> {
    console.log("누군가 연락했다");
});

// 처리해주는 함수
app.get('/', (req, res) => {
    res.sendStatus(404)
    //res.sendFile(__dirname+"/pages/index.html");
})

app.get('/about', (req, res) => {
    res.sendFile(__dirname+"/pages/about.html");
})

app.get('/signup', (req, res) => {
    res.sendFile(__dirname+"/pages/signup.html");
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname+"/register/register.html");
})

app.post('/register', (req, res) => {
    pool.getConnection((err, conn)=>{
        if (err) throw err;
        console.log("성공");
        // conn.query("select * from user", (err,result)=>{
        //     if (err) throw err;
        //     console.log(result);
            
        // });
        let req_body = req.body;
        console.log(req.body);
        let insert = "INSERT INTO USER (USERNAME,EMAIL,PASS) VALUES ('"+req_body['username']+"','"+req_body['email']+"','"+req_body['password']+"');";
        console.log(insert);
        conn.query(insert,(err,result)=>{
            if (err) throw err;
            console.log(result);
            let user_data = {"username":req_body['username'],"email":req_body['email'],"pass":req_body['password'],'login_count':0,'imported':0}
            jsonData.push(user_data);
            console.log(jsonData);
            fs.writeFileSync("users.json",JSON.stringify(jsonData));
        });
    
        conn.release();
    })
    res.sendFile(__dirname+"/register/register.html");
})

app.post('/login', (req, res) => {
    pool.getConnection((err, conn)=>{
        if (err) throw err;
        console.log("성공");
        
        let req_body = req.body;
        console.log(req.body);

        let query = "select * from user where email ='"+req_body['email']+"' AND pass = '"+req_body['password']+"'"
        console.log(query)
        console.log(jsonData);
        conn.query(query, (err,result)=>{
            if (err) throw err;
            console.log(result);
            if (result != 0){
                console.log(result);

                for (i in jsonData){
                    if (jsonData[i]['email'] == req_body['email']){
                        jsonData[i]['login_count'] += 1;
                        fs.writeFileSync("users.json",JSON.stringify(jsonData));
                    }
                }
            }
            
        });
    
        conn.release();
    })
    res.sendFile(__dirname+"/register/register.html");
})

app.post("/process/signup", (req, res) => {
    
    pool.getConnection((err, conn) => {
        if(err) throw err
        const params = req.body
        const username = params.username
        const pwd = params.pwd
        const email = params.email
        const gender = params.gender

        console.log("before query!!", username,pwd,email,gender)
        
        
        const exec = conn.query('INSERT INTO users (username, pwd, email, gender) VALUES (?, password(?), ?, ?)', [username, pwd, email, gender,'',''], (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(!err) {
                res.send(`User with record ID has been added`)
            }
            else {
                console.log(`The data from the user table are:11 \n`, rows)
            }
        })

        
    })
})