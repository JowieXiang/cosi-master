/* eslint-disable */

/** Compute Pearson's correlation coefficient */
var computePearsons = function (arrX, arrY) {
    var num = covar(arrX, arrY);
    var denom = d3.deviation(arrX) * d3.deviation(arrY);
    return num / denom;
}

/** Kendall's tau-a (does not handle tie breaking) */
var computeKendalls = function (arrX, arrY) {
    var n = arrX.length;

    return con_dis_diff(arrX,arrY)/(n*(n-1)/2);
}

/** Computes the covariance between random variable observations
 * arrX and arrY
 */
var covar = function (arrX, arrY) {
    var u = d3.mean(arrX);
    var v = d3.mean(arrY);
    var arrXLen = arrX.length;
    var sq_dev = new Array(arrXLen);
    var i;
    for (i = 0; i < arrXLen; i++)
        sq_dev[i] = (arrX[i] - u) * (arrY[i] - v);
    return d3.sum(sq_dev) / (arrXLen - 1);
}

export {computePearsons, computeKendalls, covar};
