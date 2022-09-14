const buildConfig = (getPort, dirname, dnsPrefix) => {
  return `

server {
  listen 80;
  listen 443 ssl;
  ssl_certificate      ${dirname}/sandbox/alloyio.com+1.pem;
  ssl_certificate_key  ${dirname}/sandbox/alloyio.com+1-key.pem;

  # rewrite ^([^.]*[^/])$ $1/ permanent;
  server_name ${dnsPrefix}alloyio.com;

  location /personalization-client-side {
    alias ${dirname}/personalization-client-side/public/;
    index index.html;
    try_files $uri $uri/ =404;
  }
  location /personalization-hybrid/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:${getPort()}/;
  }
  location /personalization-hybrid-spa/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:${getPort()}/;
  }
  location /personalization-server-side/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:${getPort()}/;
  }
  location /sandbox {
    alias ${dirname}/sandbox/build;
    try_files $uri $uri/ /sandbox/index.html;
  }
}
`;

};

if (require.main === module) {
  let port = 3000;
  const getPort = () => {
    port += 1;
    return port;
  }
  const config = buildConfig(getPort, __dirname, "samples.");
  console.log(config);
}

module.exports = buildConfig;
