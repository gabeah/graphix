//
// walk-thru.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Fall 2024
//
// This defines a library of geometric calculations used by
// `walk-thru.js` as part of the `WalkThru.toPDF` method.  These help
// us determine whether two edges of two scene objects intersect when
// projected to 2-D according to a perspective projection, and to
// determine whether a portion of an object edge is hidden by some
// other object.
//

function segmentsIntersect(P0, P1, Q0, Q1) {
    //
    // Determine whether two 2-D line segments intersect. The first
    // segment runs between points P0 and P1. The second segment runs
    // between Q0 and Q1. These are all Point2d objects.
    //
    // Returns `null` if they do not intersect. Returns a fraction
    // between 0.0 and 1.0 that locates the intersection point along
    // the first segment between P0 and P1.
    //
    // THat is to say, if this code returns a scalar value s, and if
    // R is the intersection point of the two line segments, then R
    // should be at P0.combo(s,P1).

    //
    // TO DO: compute the whether the segments intersect
    //
    
    // STARTER CODE: just assumes they intersect at the midpoint of
    //               segment P0 P1, i.e. s = 1/2.
    const EPSILON = 0.001  
    const origin = Q0;

    const u = Q1.minus(Q0).div(Q1.dist(Q0));
    const v = u.perp();

    const y0 = P0.minus(origin).dot(v);
    const y1 = P1.minus(origin).dot(v);

    if (y1 * y0 > 0){
        return null;
    }
    //console.log("y values: ", y0, y1)
    const s = y0/(y0-y1);
    const bigS = P0.combo(s, P1);

    //console.log("t is at: ", t)

    // Help from Zeke
    if (Q1.dist(bigS) + Q0.dist(bigS) <= Q1.dist(Q0) - EPSILON) {
        return null
    } else if (Q1.dist(bigS) + Q0.dist(bigS) >= Q1.dist(Q0) + EPSILON) {
        return null
    }

    if (s <= 0 || s >= 1) {
        return null
    }

    
    //console.log("Breakpoint located at", s, " of ", (P0,P1))
    return s; 
}

function rayFacetIntersect(Q1,Q2,Q3,R,Rp) {
    //
    // Determine whether a ray eminating from point R and passing
    // through point Rp intersects a triangular facet given by the
    // points Q1 Q2 Q3. These are all Point3d objects.
    //
    // Returns `null` if the ray doesn't hit the facet. If it does,
    // the code should return a primtive Javascript object with two
    // components:
    //
    //    point: the point on the facet struck by the ray
    //    distance: the distance from the ray source R to that point
    //


    //
    // TO DO: compute whether the ray hits the facet, and where.
    //
    
    // STARTER CODE: just assumes it hits the facet at its barycenter.
    //

    const v2 = Q2.minus(Q1);
    const v3 = Q3.minus(Q1);
    const r = Rp.minus(R)

    const normal = v2.cross(v3);

    const Delta = Q1.minus(R).dot(normal);
    const delta = r.dot(normal);

    const S = R.plus(r.times(Delta/delta));

    // Thanks Duncan
    const c1 = Q2.minus(Q1).cross(S.minus(Q1));
    const c2 = S.minus(Q1).cross(Q3.minus(Q1));

    const c3 = Q2.minus(Q3).cross(S.minus(Q3));
    const c4 = S.minus(Q3).cross(Q1.minus(Q3));

    if (Delta/delta > 1 || Delta/delta < 0) {return null}

    if (c1.dot(c2) <= 0 || c3.dot(c4) <= 0) {
        return null;
    }

    console.log(S)

    //let S = Q1.combo(0.66666667, Q2.combo(0.5,Q3));
    return {point:S, distance:S.dist(R)};
}    

