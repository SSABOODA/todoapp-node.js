// node.js server 실행 setting 
const express = require('express');
const app = express();

// HTML form data에서 서버로 전송한 data를 받을려면 'bodyparser'라이브러리가 필요
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');



var db;
MongoClient.connect('mongodb+srv://ssaboo:bong2@cluster0.tz6ib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (에러, client) => {
    if(에러) return console.log(에러)

    db = client.db('todoapp');

    // db.collection('post').insertOne({id : 1, 이름 : 'John', 나이 : 25}, (에러, 결과) => {
    //     console.log('저장완료');
    // });

    app.listen(8080, () => {
        console.log('listening on 8080')    
    });
});


// () => Javascript ES6 문법 fuction(){} : ES6 이전 문법

//클라이언트가 /pet으로 url 입력하면
//pet관련된 페이지를 응답해주자.

app.get('/pet', (요청, 응답) => {
    응답.send('펫용품 쇼핑 페이지입니다.');
});

app.get('/beauty', (요청, 응답) => {
    응답.send('뷰티용품 쇼핑 페이지입니다.');
});

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
});

app.get('/write', (요청, 응답) => {
    응답.sendFile(__dirname + '/write.html')
});

//클라이언트가 /add 경로로 POST 요청을 하면..
//??를 해주세요~

app.post('/add', (요청, 응답) => {
    응답.send('전송완료');
    console.log(요청.body.title);
    console.log(요청.body.date);
    
    db.collection('post').insertOne({제목 : 요청.body.title, 날짜 : 요청.body.date}, (요청, 에러) => {

    });
});

// 클라이언트가 '/list' url로 GET요청하면
// HTML을 보여줌 (DB에 저장된 정보 응답)

app.get('/list', (req, res) => {
    res.render('list.ejs');

});