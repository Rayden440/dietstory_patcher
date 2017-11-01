# Dietstory Patcher
The client is built on [Electron](https://electron.atom.io/) framework which in turn is built on top of Node.js, the server is also built on Node.js. Therefore, you must grab yourself a copy of [Node.js](https://nodejs.org/en/) if you don't already have it.

### Server
Navigate into the */server* folder and execute `npm install` in your terminal or command line to download all the dependencies. Read the *readme.txt* in while you're there on how to set up your own environment variables file. Note: in order to use HTTPS protocol, **key.pem** and **cert.pem** must be present in the */ssl* folder. After configuring server, run it using Node.js `node app.js`

### Client
Pretty much the same as the server, do a `npm install` in the client folder. The difference is you run it by executing `npm start`
