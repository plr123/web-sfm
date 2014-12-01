'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Plane = la.Plane;

//==========================================================


/**
 *
 * @param x
 * @param y
 * @param z
 * @returns {*}
 */
module.exports.getRotation = function getRotation(x,y,z){
    return rotateX(x).x(rotateY(y)).x(rotateZ(z));
};


/**
 * Convert euler angles to rotation matrix
 * @param {number} alpha
 * @param {number} beta
 * @param {number} gamma
 * @returns Matrix
 */
module.exports.getRotationFromEuler = function(alpha, beta, gamma){
    return rotateZ(gamma).x(rotateX(beta)).x(rotateZ(alpha));
};


/**
 * Convert rotation matrix to euler angles
 * alpha - axis z   , x->N
 * beta  - axis N(x), z->Z
 * gamma - axis Z   , N->X
 * @param {Matrix} R
 * @returns {number[]} - alpha, beta, gamma
 */
module.exports.getEulerAngles = function(R){

    // prepare

    var origin = Vector.create([0,0,0]),
        x = Vector.create([1,0,0]),
        y = Vector.create([0,1,0]),
        z = Vector.create([0,0,1]),
        X = R.x(x),
        Y = R.x(y),
        Z = R.x(z);

    // get alpha

    var xyPlane = Plane.create(origin, z),
        XYPlane = Plane.create(origin, Z),
        N = xyPlane.intersectionWith(XYPlane).direction;

    var x2n = exports.getRightHandRotation([x.e(1), x.e(2)], [N.e(1), N.e(2)]),
        alpha = x2n > Math.PI ? (x2n - Math.PI) : x2n;

    // get beta
    var beta = Z.angleFrom(z);

    // get gamma
    var gamma = X.angleFrom(N);

    return [alpha, beta, gamma];

};


/**
 * Get 3D right hand roation from fromV to toV of format (x,y) or (y,z) or (z,x)
 * @param {number[]} fromV
 * @param {number[]} toV
 * @returns {number}
 */
module.exports.getRightHandRotation = function(fromV, toV){};


/**
 * Distance from point to line
 * @param point - Vector
 * @param line - Vector
 */
module.exports.getPoint2Line = function(point, line){
    var a = line.e(1), b = line.e(2),
        modulus = Math.sqrt(a*a+b*b)*point.e(3);
    return Math.abs(point.dot(line)/modulus);
};


/**
 * Distance in (row,col)
 * @param {RowCol} rc1
 * @param {RowCol} rc2
 * @returns number
 */
module.exports.getDistanceRC = function(rc1, rc2){
    var dr = rc1.row - rc2.row;
    var dc = rc1.col - rc2.col;
    return Math.sqrt( dr*dr + dc*dc );
};


/**
 *
 * @param {RowCol} rc1
 * @param {RowCol} rc2
 * @param {Camera} cam
 * @returns number
 */
module.exports.getNormalizedDist = function(rc1, rc2, cam){
    var dr = (rc1.row - rc2.row)/cam.height;
    var dc = (rc1.col - rc2.col)/cam.width;
    return Math.sqrt( dr*dr + dc*dc );
};


//==========================================================


function rotateX(angle){
    return Matrix.create([
        [ 1, 0              ,  0               ],
        [ 0, Math.cos(angle), -Math.sin(angle) ],
        [ 0, Math.sin(angle),  Math.cos(angle) ]
    ]);
}


function rotateY(angle){
    return Matrix.create([
        [  Math.cos(angle), 0, Math.sin(angle) ],
        [  0              , 1, 0               ],
        [ -Math.sin(angle), 0, Math.cos(angle) ]
    ]);
}


function rotateZ(angle){
    return Matrix.create([
        [ Math.cos(angle), -Math.sin(angle), 0 ],
        [ Math.sin(angle),  Math.cos(angle), 0 ],
        [ 0              ,  0              , 1 ]
    ]);
}