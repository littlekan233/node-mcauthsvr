const { getUser } = require("../lib/sql")();

async function authserver(fastify, options){
    fastify.post(`${options.path}authserver/authentication`, (req, res) => {
        //
    });
}

export default authserver;