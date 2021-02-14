export class Env {
    static init() {
        const platformId = this.isCordova_() ? window.cordova.platformId : "";
        this.isTouch = (("ontouchstart" in window) || (navigator.msMaxTouchPoints > 0));
        this.cordova = this.isCordova_();
        this.windows = this.cordova === true ? (platformId === "windows" || platformId === "windows10" || platformId === "windowsphone") : this.windowsMobileAgent_();
        this.phone = this.isPhone_();
        this.tablet = this.isTablet_();
        this.android = this.cordova === true ? platformId === "android" : this.androidAny_();
        this.ios = this.cordova === true ? platformId === "ios" : this.isIos_();
        this.osx = this.cordova === true ? platformId === "osx" : this.isMac();
        this.mobile = this.cordova && !this.windows;
        this.pwa = this.isPwa_();
        if (this.passiveListeners_() === true) {
            this.useCapture = { passive: true };
        }
    }
    static getWebGLOptions_() {
        return {
            alpha: true,
            depth: true,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: true,
            powerPreference: this.mobile ? undefined : "high-performance",
        };
    }
    static isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl', Env.getWebGLOptions_())));
        }
        catch (e) {
            return false;
        }
    }
    static isWebGL2Available() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        }
        catch (e) {
            return false;
        }
    }
    static getWebGLErrorMessage() {
        return this.getWebGLErrorMessage_(1);
    }
    static getWebGL2ErrorMessage() {
        return this.getWebGLErrorMessage_(2);
    }
    static getWebGLErrorMessage_(version) {
        const names = {
            1: 'WebGL',
            2: 'WebGL 2'
        };
        const contexts = {
            1: window.WebGLRenderingContext,
            2: window.WebGL2RenderingContext
        };
        let message = '';
        if (contexts[version]) {
            message = 'Your graphics card does not seem to support $1.';
        }
        else {
            message = 'Your environment does not seem to support $1.';
        }
        return message.replace('$1', names[version]);
    }
    static passiveListeners_() {
        var supportsPassiveOption = false;
        try {
            var opts = Object.defineProperty({}, "passive", {
                get: function () {
                    supportsPassiveOption = true;
                }
            });
            window.addEventListener("test", null, opts);
        }
        catch (e) {
            supportsPassiveOption = false;
        }
        return supportsPassiveOption;
    }
    static hostEnvText() {
        return Env.cordova === true ? "cordova" : "browser";
    }
    static dragDrop() {
        const div = document.createElement("div");
        return ("draggable" in div) || ("ondragstart" in div && "ondrop" in div);
    }
    static deviceText() {
        return Env.mobile === true ? (Env.phone === true ? "phone" : "tablet") : "desktop";
    }
    static osText() {
        if (Env.android === true) {
            return "android";
        }
        else if (Env.ios === true) {
            return "ios";
        }
        else if (Env.windows === true) {
            return "windows";
        }
        else if (Env.osx === true) {
            return "osx";
        }
        else {
            return navigator.platform;
        }
    }
    static platformId() {
        if (this.tablet) {
            return 1;
        }
        else if (this.phone) {
            return 2;
        }
        return 0;
    }
    static appleAgent_() {
        let ua = navigator.userAgent, apple_phone = /iPhone/i, apple_ipod = /iPod/i, apple_tablet = /iPad/i;
        return {
            phone: this.match_(apple_phone, ua),
            ipod: this.match_(apple_ipod, ua),
            tablet: this.match_(apple_tablet, ua),
            device: this.match_(apple_phone, ua) || this.match_(apple_ipod, ua) || this.match_(apple_tablet, ua)
        };
    }
    static isIos_() {
        var aa = this.appleAgent_();
        return aa.device === true || aa.ipod === true || aa.phone === true || aa.tablet === true;
    }
    static isMac() {
        return navigator.platform.toLowerCase().indexOf("mac") + 1 > 0;
    }
    static androidAgent_() {
        let ua = navigator.userAgent, android_phone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, android_tablet = /Android/i;
        return {
            phone: this.match_(android_phone, ua),
            tablet: !this.match_(android_phone, ua) && this.match_(android_tablet, ua),
            device: this.match_(android_phone, ua) || this.match_(android_tablet, ua)
        };
    }
    static androidAny_() {
        let aa = this.androidAgent_();
        return aa.device || aa.phone || aa.tablet;
    }
    static windowsAgent_() {
        let ua = navigator.userAgent, windows_phone = /IEMobile/i, windows_tablet = /(?=.*\bWindows\b)(?=.*\bARM\b)/i;
        return {
            phone: this.match_(windows_phone, ua),
            tablet: this.match_(windows_tablet, ua),
            device: this.match_(windows_phone, ua) || this.match_(windows_tablet, ua)
        };
    }
    static windowsMobileAgent_() {
        var wa = this.windowsAgent_();
        return wa.device || wa.phone || wa.tablet;
    }
    static isCordova_() {
        return window.cordova !== undefined;
    }
    static isPwa_() {
        return ["fullscreen", "standalone", "minimal-ui"].some((displayMode) => window.matchMedia('(display-mode: ' + displayMode + ')').matches);
    }
    static isPhone_() {
        return this.appleAgent_().phone || this.androidAgent_().phone || this.windowsAgent_().phone;
    }
    static isTablet_() {
        return this.appleAgent_().tablet || this.androidAgent_().tablet || this.windowsAgent_().tablet;
    }
    static match_(regex, userAgent) {
        return regex.test(userAgent);
    }
}
Env.mobile = false;
Env.pwa = false;
Env.phone = false;
Env.tablet = false;
Env.cordova = false;
Env.android = false;
Env.ios = false;
Env.osx = false;
Env.windows = false;
Env.isTouch = false;
Env.useCapture = false;
