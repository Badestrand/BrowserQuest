export function userAgentContains(string) {
    return navigator.userAgent.indexOf(string) != -1;
};

export function isTablet(screenWidth) {
    if(screenWidth > 640) {
        if((userAgentContains('Android') && userAgentContains('Firefox'))
        || userAgentContains('Mobile')) {
            return true;
        }
    }
    return false;
};

export function isWindows() {
    return userAgentContains('Windows');
}

export function isChromeOnWindows() {
    return userAgentContains('Chrome') && userAgentContains('Windows');
};

export function canPlayMP3() {
    return true  //Modernizr.audio.mp3;
};

export function isSafari() {
    return userAgentContains('Safari') && !userAgentContains('Chrome');
};

export function isOpera() {
    return userAgentContains('Opera');
};