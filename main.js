var fastify = require("fastify");
const os = require("os");
const path = require("path");
const cmdProcess = require("./lib/terminal");
const plapi = require("./plugin/api");
const svrmodule = {
    auth: require("./server/auth"),
    skin: require("./server/skin"),
    web: require("./server/web"),
    webapi: require("./server/webapi")
};
const default_config = {
    address: "::", // Value "::" can listening both IPv4 and IPv6.
    port: 80,
    paths: {
        auth: "/auth/",
        skin: "/skin/",
        web: "/",
        webapi: "/wapi/"
    },
    datapath: path.join(os.homedir(), "_mcauthsvr"),
    sql: "users.sql",
    meta: {
        serverName: "My Yggdrasil API server",
        links: {
            homepage: "http:\/\/localhost:"+this.port+this.path.web,
            register: "http:\/\/localhost:"+this.port+this.path.web+"register\/"
        },
        skinDomains: ["localhost:"+port]
    },
    ssl: {
        enable: false,
        properties:{
            key: "",
            cert: ""
        }
    }
};

module.exports = class {
    constructor(config = default_config){
        var consuming = 0;
        var safeMode = false;
        const logger = require("./lib/logger")(config.datapath);
        var interval = setInterval(consuming++, 1);
        logger.info("Initializing server config...");
        config.meta.implementationName = "node-mcauthsvr";
        config.meta.implementationVersion = "1.0.0";
        const sqlpath = path.join(config.datapath, config.sql);
        let server;
        if(config.ssl.enable){
            server = fastify({ 
                https: {
                    key: config.ssl.properties.key,
                    cert: config.ssl.properties.cert,
                }
            });
        }else{
            logger.warn("IF YOU ARE DOING LOCAL DEBUG, PLEASE IGNORE IT.");
            logger.warn("You are not using SSL for this server. ");
            logger.warn("It is easy for hackers to steal the user's email address and password, resulting in irreversible consequences.");
            server = fastify();
        }
        
        logger.info("Registering server kernel...");
        logger.info("[1/4] authserver/sessionserver");
        server.register(svrmodule.auth, {
            path: config.paths.auth,
            sql: sqlpath
        });
        logger.info("[2/4] skin/cape texture");
        server.register(svrmodule.skin, {
            path: config.paths.skin,
            sql: sqlpath
        });
        logger.info("[3/4] Website (UI)");
        server.register(svrmodule.web, {
            path: config.paths.web,
            pathapi: config.paths.wapi
        });
        logger.info("[4/4] Website (API)");
        server.register(svrmodule.webapi, {
            path: config.paths.wapi,
            sql: sqlpath
        });
        logger.info("All server kernel registered and ready.");
        logger.info("Starting PluginAPI to load 3rd party plugins...");
        const initRet = plapi._init(server, config, logger);
        if(typeof initRet == "object" && initRet.code == 403){
            logger.error("Can't load plugin API module! Starting safe mode...");
            safeMode = true;
        }
        
        logger.info("Starting server...");
        server.listen({port: config.port, host: config.address}, (err, addr) => {
            if(err){
                logger.error("Server is crashed! ");
                logger.error("--- ! CRASH INFORMATION START ! ---");
                logger.error("CRASH EVENT: Server starting");
                logger.error(err);
                logger.error("--- ! CRASH INFORMATION END ! ---");
                process.exit(1);
            }
            clearInterval(interval);
            interval = undefined;
            logger.info(`Succesfully started on ${addr}! Time consuming: ${consuming}ms (${consuming/1000}s).`);
            this.cmd(server, config, logger);
        });
    }
    static stop(server, logger, restart = false){
        logger.info("Stopping server...");
        server.close();
        if(!restart){
            logger.info("Stopped! Bye!");
            process.exit();
        }
        logger.info("Stopped! Ready to restart!");
    }
    static restart(server, config, logger){
        this.stop(server, logger, true);
        logger.info("Restarting...");
        this.start(config);
        logger.info("Successfully restarted! ");
    }
    static cmd(server, config, logger){
        logger.info("Type \"help\" for more information.");
        while(true){
            var command = prompt("[root@mcauthsvr] r# ");
            var retmsg = cmdProcess(command, server, config, logger);
            switch(retmsg){
                case "§RESTART§":
                    this.restart(server, config, logger);
                    break;
                case "§STOP§":
                    this.stop(server, config);
                    break;
                case "〓INVALID〓":
                    logger.error("This command is invalid. Please check it.");
                    break;
                default:
                    break;
            }
        }
    }
};
