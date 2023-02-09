const parser = require("yargs-parser");
const path = require("path");
const fs = require("fs");
const api = require("./api");

function install(plugin, logger, config){
    const pl = require(plugin);
    const info = pl._PluginInfo();
    logger.info(`[PluginManager] Name: ${info.name}`);
    logger.info(`[PluginManager] Version: ${info.version}`);
    logger.info(`[PluginManager] Author: ${info.author}`);
    logger.info(`[PluginManager] Website: ${info.website | "<unknown>"}`);
    var choice = prompt("Want to install? [Y/n] ");
    if(choice != null){
        choice = choice.toUpperCase();
        if(choice == "N"){
            logger.info("[PluginManager] Install canceled.");
            return {
                code: -200,
                msg: "Canceled",
                desc: "Normally canceled install process."
            };
        }
    }
    var plugins = require(path.join(config.datapath, "plugins.json"));
    logger.info("[PluginManager] Copying plugin...")
    var pluginFileName = `${info.name.toLowerCase().replace(" ", "-")}$${info.version}.js`;
    fs.cp(plugin, path.join(config.datapath, "plugins", pluginFileName), (err) => {
        if(err){
            logger.error("[PluginManager] Failed to install! ");
            logger.error("[PluginMaganer] Track: ");
            logger.error(err);
            return {
                code: 500,
                msg: "Internal error",
                desc: "Install process has an error."
            };
        }
    });
    logger.info("[PluginManager] Setting up the plugin");
    plugins.join(pluginFileName);
    fs.writeFile(path.join(config.datapath, "plugins.json"), Buffer.from(plugins), (err) => {
        if(err){
            logger.error("[PluginManager] Write plugin file to plugin list failed!");
            logger.error("Track: ");
            logger.error(err);
            return {
                code: 500,
                msg: "Internal error",
                desc: "Install process has an error."
            };
        }
    });
    if(typeof pl._Setup == "function"){
        pl._Setup(api);
    }
    logger.info("[PluginManager] Done.");
    return {
        code: 200,
        msg: "ok",
        desc: "Installition complete."
    };
}

function uninstall(plugin, logger, config){}

module.exports = {
    cmd(command, server, config, logger){
        const cmdObject = parser(command, {
            alias: {
                install: ["i", "inst"],
                uninstall: ["r", "remove"],
                help: ["h"],
                list: ["ls"]
            }
        });
        if(cmdObject.install && cmdObject.install != true){
            install(cmdObject.install, logger, config);
        }else if(cmdObject.uninstall && cmdObject.uninstall != true){
            uninstall(cmdObject.uninstall, logger, config);
        }else{
            logger.error("[PluginManager] Invaild command/argument! ");
            logger.error("[PluginManager] Type \"plugin --help\" for more information.");
        }
    }
}