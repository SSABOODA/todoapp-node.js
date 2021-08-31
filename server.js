// 환경변수 등록을 위한 설정
require('dotenv').config()

// node.js server 실행 설정
const express = require('express');
const app = express();

// HTML form data에서 서버로 전송한 data를 받을려면 'bodyparser'라이브러리가 필요
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true})); 

// MongoDB 를 연결하기 위한 설정
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');

// HTML 상은 GET, POST 요청만 가능한데 PUT 요청을 가능하게 해주는 설정
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

// Login 관련 import
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

var db;
MongoClient.connect(process.env.DB_URL, {useUnifiedTopology:true}, (err, client) => {
    if(err) return console.log(err)

    db = client.db('todoapp');

    // db.collection('post').insertOne({id : 1, 이름 : 'John', 나이 : 25}, (에러, 결과) => {
    //     console.log('저장완료');
    // });

    app.listen(process.env.PORT, () => {
        console.log('start server')    
    });
});


// () => {} Javascript ES6 문법 fuction(){} : ES6 이전 문법

//클라이언트가 /pet으로 url 입력하면
//pet관련된 페이지를 응답해주자.

app.get('/pet', (req, res) => {
    res.send('펫용품 쇼핑 페이지입니다.');
});

app.get('/beauty', (req, res) => {
    res.send('뷰티용품 쇼핑 페이지입니다.');
});

app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html')
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    // res.sendFile(__dirname + '/write.html')
    res.render('write.ejs');
});


// 클라이언트가 '/list' url로 GET요청하면
// HTML을 보여줌 (DB에 저장된 정보 응답)
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((err, data) => {
        res.render('search.ejs', { posts : data });
    });
  });

// app.get('/search', (req, res) => {
//     // console.log(req.query.value);
//     db.collection('post').find( { $text : { $search: req.query.value } }).toArray((err, data) => {
//         res.render('search.ejs', { posts : data }); 
//         console.log(data)
//     });
// });
app.get('/search', (req, res) => {
    var search_condition = [
        {
            $search : {
                index : 'titleSearch',
                text : {
                    query : req.query.value,
                    path : "제목" // 제목, 날짜 둘 다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        // { $sort : { _id : -1 } }, // -1 : 내림차순 , 1 : 오름차순
        // { $limit : 10 } // paging 연산자
        { $project : { 제목 : 1, _id : 1, score: { $meta : "searchScore" } } }
    ]
    db.collection('post').aggregate( search_condition ).toArray( (err, data) => {
        console.log(data)
        res.render('search.ejs', { posts : data })
    });
});

app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, (err, data) => {
        console.log(data)
        res.render('detail.ejs', { data : data });
    }); 
});

app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id : parseInt(req.params.id) }, (err, data) => {
        res.render('edit.ejs', { post : data })
    });
});

app.put('/edit', (req, res) => {
    db.collection('post').updateOne({ _id : parseInt(req.body.id) }, {$set : { 제목: req.body.title, 날짜 : req.body.date }}, (err, data) => {
        console.log('수정완료')
        res.redirect('/list')
    });
});


// Login 관련 Logic
// app.use(middleware) 웹서버는 요청-응답해주는 머신
app.use(session({secret : 'secret code', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    res.render('login.ejs')

});

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), (req, res) => {
    res.redirect('/')
});

app.get('/mypage', userlogin, (req, res) => {
    console.log(req.user)
    res.render('mypage.ejs', {User : req.user})
});

function userlogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send('로그인 안하셨는데요?')
    }
}


// User information 검증 로직
passport.use(new LocalStrategy({
    usernameField : 'id',
    passwordField : 'pw',
    session : true,
    passReqToCallback : false,
}, (id, pw, done) => {
    console.log(id, pw)
    db.collection('login').findOne({ id : id }, (err, data) => {
        if (err) return done (err)

        if (!data) return done(null, false, { message : '아이디가 존재하지 않습니다.'})
        if (pw == data.pw) {
            return done(null, data)
        } else {
            return done(null, false, { message : '비밀번호가 틀렸습니다.'})
        }
    })
}));

passport.serializeUser( (user, done) => {
    done(null, user.id)
});
passport.deserializeUser( (id, done) => {
    db.collection('login').findOne({ id : id }, (err, data) => {
        done(null, data)
    });
    
});

app.post('/register', (req, res) => {
    db.collection('login').insertOne({ id : req.body.id, pw : req.body.pw }, (err, data) => {
        res.redirect('/')
        // 회원가입 유효성 검사도 필요함.!!
    });
});

//클라이언트가 /add 경로로 POST 요청을 하면..
//??를 해주세요~
app.post('/add', (req, res) => {
    res.send('전송완료');
    console.log(req.body)
    
    db.collection('counter').findOne({name : '게시물갯수'}, (err, data) => {
        console.log(data.totalpost)
        var totalpost = data.totalpost

        var save_post = {
            _id : totalpost + 1, 
            작성자 : req.user._id,
            제목 : req.body.title, 
            날짜 : req.body.date, 
        }

        db.collection('post').insertOne(save_post, (err, data) => {
            console.log('저장완료')
            console.log(save_post)
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalpost:1} }, (err, data) => {
                if(err){return console.log('에러났음.')};

            });
        });
    });
});

app.delete('/delete', (req, res) => {
    console.log(req.body)
    req.body._id = parseInt(req.body._id) 

    var del_post = {
        _id : req.body._id,
        작성자 : req.user._id,
    }

    db.collection('post').deleteOne(del_post, (err, data) => {
        console.log('삭제완료');
        if (err) {console.log('ERROR')}
        // res.status(200).send({ MESSAGE : '성공했습니다.' });
        res.status(400).send({ MESSAGE : '실패했습니다.' });
    });
});


app.use('/shop', require('./routes/shop.js'));
app.use('/board/sub', require('./routes/board.js'));
