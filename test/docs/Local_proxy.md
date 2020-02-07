Configuring local proxy with SSL on MacOS using proxy bash script.

Generate SSL certs - 
1) Navigate to scripts/cert/generate-ssl.sh
2) The options.conf file contains the domain domain names to included in the certificate.
3) The certificate-authority-options.conf provides the certificate authority certificate (optional).
4) Run sudo ./generate-ssl.sh localalloy.com where localalloy.com is the name of the cert that will be generated.
5) The script will ask you for your system password which it needs to add the root certificate to Keychain

Example use: 

"function https-server() {
  http-server --ssl --cert ~/.localhost-ssl/localhost.crt --key ~/.localhost-ssl/localhost.key
}"

Local Proxy Script - 
1) Update the "proxy.sh" permissions: "chmod +x proxy.sh"
2) Run the script using sudu: "sudo ./proxy.sh"
3) Options available: 

a) Retrieve adobedc ip. 
b) Add, remove and update local host files.
c) Backup and restore host file. 

--

To Do: 
Automate the proxy setup flow without step prompts. 

1) Host entry - localalloy.com
2) CNAME entry - firstparty.localalloy.com
3) Check if konductor works with the edgedomain set to firstparty.localalloy.com