var router = require('express').Router();

function userlogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send('로그인 안하셨는데요?')
    }
}

router.use('/shirts', userlogin);

router.get('/shirts', (req, res) => {
    res.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', (req, res) => {
    res.send('바지 파는 페이지입니다.');
});

module.exports = router;


