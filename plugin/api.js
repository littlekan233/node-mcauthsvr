var pluginsFile; 
var plugins = [];
var pluginsFolder;
var pluginsCommand = [];
var server, config, logger;
const parser = require("yargs-parser");
const fs = require("fs");
const path = require("path");
const internal = require("./internal");

module.exports = {
    _loadPlugin(){
        if(plugins){
            logger.error("[PluginAPI] Load plugins failed: Plugins already loaded.");
            return {
                code: 403,
                msg: "Access denied",
                desc: "Plugins already loaded."
            };
        }
        logger.info(`[PluginAPI] Loaded ${plugins.length} plugin(s): `);
        for(var i=0; i<global.plugins.length; i++){
            logger.info(` - ${require(path.join(pluginsFolder, global.plugins[i]))._PluginInfo().version}, version ${require(path.join(pluginsFolder, plugins[i]))._PluginInfo().version}`);
        }
        logger.info("[PluginAPI] Registering plugin(s)...");
        for(var i=0; i<plugins.length; i++){
            var plugin = require(path.join(pluginsFolder, global.plugins[i]));
            plugin._InitializePlugin(this);
            if(typeof plugin._ServerInject == "function"){
                plugin._ServerInject(this);
            }
            if(typeof plugin._CommandAdapter == "function"){
                if(plugin._PluginInfo().command){
                    pluginsCommand.join(plugin._PluginInfo().command);
                    pluginsCommand[pluginsCommand.length - 1]._adapter = plugin._CommandAdapter;
                }
            }
        }
    },
    _init(oSvr, oCfg, oLog){
        oLog.info("[PluginAPI] PluginAPI v1.0.0, with node-mcauthsvr 1.0.0, kernel version r100.");
        oLog.info("[PluginAPI] Copyright (C) 2023 littlekan233. All rights reserved. \n");
        if(server == oSvr && config == oCfg && logger == oLog){
            oLog.error("[PluginAPI] Can't initialize/reinitialize Plugin API: Permission denied. ");
            return {
                code: 403, 
                msg: "Access denied."
            };
        }else if(server && config && logger){
            oLog.warn("[PluginAPI] Detected Plugin API is modified! Reinitializing...");
        }else{
            oLog.info("[PluginAPI] Initializing API...");
        }
        server = oSvr;
        config = oCfg;
        logger = oLog;
        pluginsFile = path.join(config.datapath, "plugins.json");
        plugins = require(pluginsFile)
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
        var systempath = /(global.config.path.auth|global.config.path.skin|global.config.path.web|global.config.path.webapi)/g;
        if(systempath.test(path)){
            return {
                code: 403,
                msg: "Access denied.",
                desc: "Detected system path. Please use another path. "
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
                    msg: "Method not allowed. ",
                    desc: "Only GET & POST are support, PUT & DELETE are not available."
                };
        }
        return {
            code: 200,
            msg: "ok"
        };
    },
    getLogger(){
        return logger;
    }
}