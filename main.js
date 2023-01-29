const fastify = require("fastify")({
    logger: true
});
const sql = require("sqlite3");
const server = {
    auth: require("./server/auth"),
    skin: require("./server/skin"),
    web: require("./server/web"),
    webapi: require("./server/webapi")
};
const default_config = {
    address: "0.0.0.0",
    port: 80,
    paths: {
        auth: "/auth/",
        skin: "/skin/",
        web: "/",
        webapi: "/wapi/"
    },
    sql: "#USERDIR#/_mcauthsvr/users.sql",
    meta: {
        serverName: "My Yggdrasil API server",
        links: {
            homepage: "http:\/\/localhost:"+port+"\/",
            register: "http:\/\/localhost:"+port+"\/register\/"
        },
        skinDomains: ["localhost:"+port]
    }
};

export default {
    run(config = default_config){
        fastify.log.info("Initializing server config...");
        config.meta.implementationName = "node-mcauthsvr";
        config.meta.implementationVersion = "1.0.0";
        
        fastify.log.info("Registering server kernel...");
        fastify.log.info("[1/4] authserver/sessionserver");
        fastify.register(server.auth, {
            path: config.paths.auth | default_config.paths.auth,
            sql: config.sql | default_config.sql
        });
        fastify.log.info("[2/4] skin/cape texture");
        fastify.register(server.skin, {
            path: config.paths.skin | default_config.paths.skin,
            sql: config.sql | default_config.sql
        });
        fastify.log.info("[3/4] Website (UI)");
        fastify.register(server.web, {
            path: config.paths.web | default_config.paths.web,
            pathapi: config.paths.wapi | default_config.paths.wapi
        });
        fastify.log.info("[4/4] Website (API)");
        fastify.register(server.webapi, {
            path: config.paths.wapi | default_config.paths.wapi,
            sql: config.sql | default_config.sql
        });
        fastify.log.info("All server kernel registered and ready.");
        
        fastify.log.info("Starting server...");
        fastify.listen(config.port | default_config.port, config.address | default_config.address, (err, addr) => {
            if(err){
                fastify.log.error("Server is crashed! ");
                fastify.log.error("--- ! CRASH REPORT START ! ---");
                fastify.log.error("CRASH EVENT: Server starting");
                fastify.log.error(err);
                fastify.log.error("--- ! CRASH REPORT END ! ---");
                fastify.log.error(`This report is saved at `);
            }
        })
    }
};