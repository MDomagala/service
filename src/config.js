const convict = require('convict');

const config = convict({
    ip: {
        doc: "The IP address to bind.",
        format: "ipaddress",
        default: "0.0.0.0",
        env: "IP_ADDRESS",
    },
    port: {
        doc: "The port to bind.",
        format: "port",
        default: 6969,
        env: "PORT",
        arg: "port"
    },
});

config.validate({allowed: 'strict'});

module.exports = config;