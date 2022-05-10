import configBuild from '../config/config_build.json'



export default function config(build) {
    var config = {
        dev: {
            host: "localhost",
            port: 8005,
            dispatcher: false
        },
        build: configBuild
    };
    
    //>>excludeStart("prodHost", pragmas.prodHost);
    // config.local = cfg
    //>>excludeEnd("prodHost");
    
    return config;
}