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


function segmentsIntersect(P0,P1,Q0,Q1) {
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
    
    return 0.5; 
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

    let S = Q1.combo(0.66666667, Q2.combo(0.5,Q3));
    return {point:S, distance:S.dist(R)};
}    

