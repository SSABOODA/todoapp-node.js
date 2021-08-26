// node.js server 실행 setting 
const express = require('express');
const app = express();

// HTML form data에서 서버로 전송한 data를 받을려면 'bodyparser'라이브러리가 필요
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');



var db;
MongoClient.connect('mongodb+srv://ssaboo:bong2@cluster0.tz6ib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useUnifiedTopology:true}, (err, client) => {
    if(err) return console.log(err)

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

app.get('/pet', (req, res) => {
    res.send('펫용품 쇼핑 페이지입니다.');
});

app.get('/beauty', (req, res) => {
    res.send('뷰티용품 쇼핑 페이지입니다.');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
});

//클라이언트가 /add 경로로 POST 요청을 하면..
//??를 해주세요~

app.post('/add', (req, res) => {
    res.send('전송완료');
    
    db.collection('counter').findOne({name : '게시물갯수'}, (err, data) => {
        console.log(data.totalpost)
        var totalpost = data.totalpost
        db.collection('post').insertOne({_id : totalpost + 1, 제목 : req.body.title, 날짜 : req.body.date}, () => {
            console.log('저장완료')
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalpost:1} }, (err, data) => {
                if(err){return console.log('에러났음.')};

            });
        });
    });
});

// 클라이언트가 '/list' url로 GET요청하면
// HTML을 보여줌 (DB에 저장된 정보 응답)
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((err, data) => {
        res.render('list.ejs', { posts : data });
    });
  });

app.delete('/delete', (req, res) => {
    console.log(req.body)
    req.body._id = parseInt(req.body._id) 
    db.collection('post').deleteOne(req.body, (err, data) => {
        console.log('삭제완료');
        // res.status(200).send({ MESSAGE : '성공했습니다.' });
        res.status(400).send({ MESSAGE : '실패했습니다.' });
    });
});