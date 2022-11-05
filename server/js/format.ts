import * as _ from 'underscore'

import * as log from './log'
import {Messages} from '../../shared/constants'




class FormatChecker {
    constructor() {
        this.formats = [];
        this.formats[Messages.MOVE] = ['n', 'n'],
        this.formats[Messages.LOOTMOVE] = ['n', 'n', 'n'],
        this.formats[Messages.AGGRO] = ['n'],
        this.formats[Messages.ATTACK] = ['n'],
        this.formats[Messages.HIT] = ['n'],
        this.formats[Messages.HURT] = ['n'],
        this.formats[Messages.CHAT] = ['s'],
        this.formats[Messages.LOOT] = ['n'],
        this.formats[Messages.TELEPORT] = ['n', 'n'],
        this.formats[Messages.ZONE] = [],
        this.formats[Messages.OPEN] = ['n'],
        this.formats[Messages.CHECK] = ['n']
        this.formats[Messages.SPEND_ATTR] = ['s']
    }
    
    check(msg) {
        var message = msg.slice(0),
            type = message[0],
            format = this.formats[type];
        
        message.shift();
        
        if(format) {    
            if(message.length !== format.length) {
                return false;
            }
            for(var i = 0, n = message.length; i < n; i += 1) {
                if(format[i] === 'n' && !_.isNumber(message[i])) {
                    return false;
                }
                if(format[i] === 's' && !_.isString(message[i])) {
                    return false;
                }
            }
            return true;
        }
        else if(type === Messages.WHO) {
            // WHO messages have a variable amount of params, all of which must be numbers.
            return message.length > 0 && _.all(message, function(param) { return _.isNumber(param) });
        }
        else {
            log.error("Unknown message type: "+type);
            return false;
        }
    }

    public formats: any
}

const checker = new FormatChecker

export default function check(msg) {
    return checker.check(msg)
}
