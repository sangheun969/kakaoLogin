const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const axios = require("axios");
const qs = require("qs");
const session = require("express-session");
require("dotenv").config();

app.set("view engine", "html");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views/public"));
nunjucks.configure("views", {
  express: app,
});
app.use(
  session({
    secret: "ras",
    resave: false, // false로 변경
    saveUninitialized: true, // true로 변경
  })
);

const kakao = {
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  redirectUri: process.env.REDIRECTURI,
};

app.get("/auth/kakao", (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
  res.redirect(kakaoAuthURL);
});

app.get("/auth/kakao/callback", async (req, res) => {
  let token;
  try {
    token = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type: "authorization_code",
        client_id: kakao.clientID,
        client_secret: kakao.clientSecret,
        redirectUri: kakao.redirectUri,
        code: req.query.code,
      }),
    });
  } catch (err) {
    res.json(err.data);
  }
  let user;
  try {
    user = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });
  } catch (e) {
    res.json(e.data);
  }

  req.session.kakao = user.data;
  console.log(user);

  res.send("success");
});

app.get("/auth/info", (req, res) => {
  if (!req.session.kakao || !req.session.kakao.properties) {
    res.redirect("/auth/kakao"); // 오류 처리
    return;
  }

  const { nickname, profile_image } = req.session.kakao.properties;
  res.render("info", {
    nickname,
    profile_image,
  });
});

app.get("/", (req, res) => {
  res.render("layout");
});

app.listen(3000, () => {
  console.log(`server start 3000`);
});
