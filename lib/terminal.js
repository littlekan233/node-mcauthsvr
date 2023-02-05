var server, config, logger;
const parser = require("yargs-parser");
const plugin = require("node-mcauthsvr/plugin-api");

function executeCmd(cmd){
    var parsedCmd = parser(cmd);
    switch(parsedCmd._[0]){
        case "help":
            get_help((parsedCmd._[1] | "default"), logger);
            break;
        case "plugin":
            plugin_internal.cmd(cmd, server, config, logger);
            break;
        default:
            return plugin.cmd(cmd) ? true : false;
    }
    return true;
}

export default (cmd, oSvr, oCfg, oLogger) => {
    server = oSvr
    config = oCfg;
    logger = oLogger;
    switch(cmd){
        case "stop":
            return "§STOP§";
        case "restart":
            return "§RESTART§";
        default:
            return executeCmd(cmd) ? null : "〓INVALID〓";
    }
}