import { ClientFunction } from "testcafe";

export default {
  clear: ClientFunction(() => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }),
  get: ClientFunction(name => {
    const cookies = document.cookie
      .split(";")
      .map(c => {
        const ct = c.trim();
        const index = ct.indexOf("=");
        return [ct.slice(0, index), ct.slice(index + 1)].map(
          decodeURIComponent
        );
      })
      .reduce((a, b) => {
        try {
          a[b[0]] = JSON.parse(b[1]);
        } catch (e) {
          a[b[0]] = b[1];
        }
        return a;
      }, {});

    return cookies[name] || undefined;
  })
};
