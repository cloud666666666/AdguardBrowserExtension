(function(source, args) {
    function NaverWcslog(source) {
        window.wcs_add = {};
        window.wcs_do = noopFunc;
        window.wcs = {
            inflow: noopFunc
        };
        hit(source);
    }
    function hit(source) {
        var ADGUARD_PREFIX = "[AdGuard]";
        if (!source.verbose) {
            return;
        }
        try {
            var trace = console.trace.bind(console);
            var label = "".concat(ADGUARD_PREFIX, " ");
            if (source.engine === "corelibs") {
                label += source.ruleText;
            } else {
                if (source.domainName) {
                    label += "".concat(source.domainName);
                }
                if (source.args) {
                    label += "#%#//scriptlet('".concat(source.name, "', '").concat(source.args.join("', '"), "')");
                } else {
                    label += "#%#//scriptlet('".concat(source.name, "')");
                }
            }
            if (trace) {
                trace(label);
            }
        } catch (e) {}
        if (typeof window.__debug === "function") {
            window.__debug(source);
        }
    }
    function noopFunc() {}
    const updatedArgs = args ? [].concat(source).concat(args) : [ source ];
    try {
        NaverWcslog.apply(this, updatedArgs);
    } catch (e) {
        console.log(e);
    }
})({
    name: "naver-wcslog",
    args: []
}, []);