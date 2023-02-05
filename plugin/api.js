var server, config, logger, pluginsFile, plugins, pluginsFolder;
var pluginsCommand = [];
const parser = require("yargs-parser");
const fs = require("fs");
const path = require("path");
const internal = require("./internal");

module.exports = {
    _loadPlugin(){
        fs.readFile(pluginsFile, { encoding: "utf8" }, (err, data) => {
            if(err){
                logger.error("Server is crashed! ");
                logger.error("--- ! CRASH INFORMATION START ! ---");
                logger.error("CRASH EVENT: Load plugins");
                logger.error(err);
                logger.error("--- ! CRASH INFORMATION END ! ---");
                process.exit(1);
            }
            if(!plugins || plugins != JSON.parse(data)){
                plugins = JSON.parse(data);
            }else{
                logger.error("[PluginAPI] A plugin was trying run system function, but access denied.");
            }
            logger.info(`[PluginAPI] Loaded ${plugins.length} plugin(s): `);
            for(var i=0; i<plugins.length; i++){
                logger.info(` - ${require(path.join(pluginsFolder, plugins[i]))._GetPluginInfo().id}, version ${require(path.join(pluginsFolder, plugins[i])).readPluginInfo().version}`);
            }
            logger.info("[PluginAPI] Registering plugin(s)...");
            for(var i=0; i<plugins.length; i++){
                var plugin = require(path.join(pluginsFolder, plugins[i]));
                plugin._InitializePlugin(this);
                if(typeof plugin._ServerInject == "function"){
                    server.register(plugin._ServerInject, this);
                }
                if(typeof plugin._CommandAdapter == "function"){
                    if(plugin._GetPluginInfo().command){
                        pluginsCommand.join(plugin._GetPluginInfo().command);
                        pluginsCommand[pluginsCommand.length - 1]._adapter = plugin._CommandAdapter;
                    }
                }
            }
        });
    },
    _init(oSvr, oCfg, oLog){
        logger.info("[PluginAPI] PluginAPI v1.0.0, with node-mcauthsvr 1.0.0, kernel version r100.");
        logger.info("[PluginAPI] Copyright (C) 2023 littlekan233. All rights reserved. \n");
        if(server == oSvr && config == oCfg && logger == oLog){
            logger.error("[PluginAPI] Can't initialize/reinitialize Plugin API object: Permission denied. ");
            return {
                code: 403, 
                msg: "Access denied."
            };
        }else if(server && config && logger){
            logger.warn("[PluginAPI] Detected Plugin API object is modified! Reinitializing...");
        }else{
            logger.info("[PluginAPI] Initializing API object...");
        }
        server = oSvr;
        config = oCfg;
        logger = oLog;
        pluginsFile = path.join(config.datapath, "plugins.json");
        pluginsFolder = path.join(config.datapath, "plugins");
        logger.info("[PluginAPI] Done.");
        logger.info("[PluginAPI] Loading plugins...");
        this._loadPlugin();
    },
    cmd(command){
        var cmdns = parser(command)._[0];
        for(var i=0; i<pluginsCommand.length; i++){
            oCmd = pluginsCommand[i];
            if(typeof oCmd.name == "array"){
                if(cmdns in oCmd.name){
                    oCmd._adapter(this, parser(command, {alias: oCmd.alias | []}));
                }else continue;
            }else if(typeof oCmd.name == "string"){
                oCmd._adapter(this, parser(command, {alias: oCmd.alias | []}));
            }else continue;
            return true;
        }
        return false;
    },
    addRoute(method = "GET", path, callback){
        if(path in systempath){
            return {
                code: 403,
                msg: "Access denied."
            };
        }
        switch(method.toUpperCase()){
            case "GET":
                server.get(path, callback);
                break;
            case "POST":
                server.post(path, callback);
                break;
            default:
                return {
                    code: 405,
                    msg: "Method not allowed. "
                };
        }
        return {
            code: 200,
            msg: "ok"
        };
    }
}