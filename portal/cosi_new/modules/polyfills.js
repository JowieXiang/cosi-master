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
}
