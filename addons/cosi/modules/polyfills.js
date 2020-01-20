/**
 * @description Polyfills to cover for lacks in older/weaker browsers
 * @returns {void}
 */
export function addPolyfills () {
    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
            value: function (callback, type, quality) {
                var canvas = this;

                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(",")[1]),
                        len = binStr.length,
                        arr = new Uint8Array(len);

                    for (let i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], {type: type || "image/png"}));
                });
            }
        });
    }

    if (!Array.prototype.flat) {
        // todo - add depth argument
        Object.defineProperty(Array.prototype, "flat", {
            value: function () {
                if (this.length === 0) {
                    return this;
                }
                return this.reduce(function (res, item) {
                    return Array.isArray(item) ? [...res, ...item.flat()] : [...res, item];
                }, []);
            }
        });
    }

    /**
    * detect IE & Edge
    * @returns {number | boolean} version of IE or false, if browser is not Internet Explorer
    */
    window.detectMS = function () {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE "),
            trident = ua.indexOf("Trident/"),
            edge = ua.indexOf("Edge/");

        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
        }

        if (trident > 0) {
            // IE 11 => return version number
            return parseInt(ua.substring(ua.indexOf("rv:") + 3, ua.indexOf(".", ua.indexOf("rv:"))), 10);
        }

        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
        }

        // other browser
        return false;
    }

}
