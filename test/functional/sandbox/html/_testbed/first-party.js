/* eslint-disable func-style */
function setExpire() {
  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 864000;
  now.setTime(expireTime);
  return `;expires=${now.toGMTString()}`;
}

function setPath() {
  return ";path=/";
}

function updateCookie() {
  const oldcookie = document.cookie;
  const val = "firstparty1234567890";
  console.log(`read cookie: ${oldcookie}`);
  document.cookie = `firstparty=${encodeURIComponent(
    val
  )}${setExpire()}${setPath()}`;
  console.log(`updating cookie to:${document.cookie}`);
}

updateCookie();
