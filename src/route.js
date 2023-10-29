const express = require("express");
const router = express();

// 카카오 로그아웃
// auth//kakao/logout
router.get("/kakao/logout", async (req, res) => {
  // https://kapi.kakao/com/v1/user/logout
  let token;
  try {
    token = await axios({
      method: "post",
      url: "https://kapi.kakao.com/v1/user/unlink",
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });
  } catch (error) {
    console.error(error);
    res.json(error);
  }
  req.logout();
  req.session.destroy();

  res.redirect("/auth/info");
});

module.exports = router;
