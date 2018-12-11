const convict = require('convict');

const config = convict({
    ip: {
        doc: "The IP address to bind.",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "IP_ADDRESS",
        arg: "ip_address"
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