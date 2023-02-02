var server, config, logger, strparam;

function executeCmd(cmd){
    cmdarr = cmd.split(" ");
    for(var i=0; i<cmdarr.length; i++){
        if(cmdarr[i].startsWith("\"") || cmdarr[i].startsWith("'")){
            strparam+=cmdarr[i];
            strparam+=" ";
        }else if(){};
    }
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
            executeCmd(cmd);
    }
}