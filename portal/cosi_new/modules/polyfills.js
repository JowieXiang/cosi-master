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
}
