//
// Program 1: object showcase
//
// showcase.js
//
// CSCI 385: Computer Graphics, Reed College, Fall 2024.
//
// This is a sample `opengl.js` program that displays a tetrahedron 
// made up of triangular facets, and also a cube and a cylinder.
//
// The OpenGL drawing part of the code occurs in `drawScene` and that
// function relies on `drawObject` to do its work. There is a global
// variable `gShowWhich` that can be changed by the user (by pressing
// number keys handled by handleKey). The `drawObject` code calls
// `glBeginEnd` to draw the chosen object.
//
// Your assignment is to add these models to the showcase code:
//
// - Sphere: A faceted model of the surface of a sphere.
// - Platonic: One of the other three Platomnic solids.
// - Torus: A faceted model of the surface of a torus.
// - Revolution: Two other *surfaces of revolution*.
//
// For each of these, you'll write functions that describe the
// object in 3-space, modify `drawObject` to draw them, and modify
// the keyboard handler code in `handleKey` to allow the user to
// select and configure them.
//
// This is all described in the web document
//
//   http://jimfix.github.io/csci385/assignments/showcase.html
//

// ***** GLOBALS *****

// Globals for tracking mouse drags.
//
let gOrientation = quatClass.for_rotation(0.0, new Vector3d(1.0,0.0,0.0));
let gMouseStart  = {x: 0.0, y: 0.0};
let gMouseDrag   = false;

// Global for which object is being shown.
//
let gShowWhich = 1;

let PHI = 1.618;
let glSmoothness = 12;

// MakeRevolution list of points
let points = [[0,1],[0.5,1],[1,.5],[.5,0],[1,-.5],[0.5,-1],[0,-1]]
let points1 = [[1,0],[1,.4],[.2,.4],[.2,.6],[.6,0],0,0]

// ***** MAKERS *****
//
// Functions that describe objects in the showcase. These get called
// in `main` when the applications sets itself up.
//

//
// makeCube
//
// This describes the facets of a cube whose sides are unit length
// and is centered at the origin.
//
// The name of the object is "Cube".
//
function makeCube() {
    
    glBegin(GL_TRIANGLES,"Cube",true);
    // front
    glColor3f(0.5,0.5,0.0);
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f( 0.5,-0.5, 0.5);
    glVertex3f( 0.5, 0.5, 0.5);
    
    glVertex3f( 0.5, 0.5, 0.5);
    glVertex3f(-0.5, 0.5, 0.5);
    glVertex3f(-0.5,-0.5, 0.5);
    
    // back
    glColor3f(0.5,0.5,1.0);
    glVertex3f(-0.5,-0.5,-0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    
    glVertex3f( 0.5, 0.5,-0.5);
    glVertex3f(-0.5, 0.5,-0.5);
    glVertex3f(-0.5,-0.5,-0.5);

    // left
    glColor3f(1.0,0.5,0.5);
    glVertex3f(-0.5,-0.5,-0.5);
    glVertex3f(-0.5, 0.5,-0.5);
    glVertex3f(-0.5, 0.5, 0.5);
    
    glVertex3f(-0.5, 0.5, 0.5);
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f(-0.5,-0.5,-0.5);
    
    // right
    glColor3f(0.0,0.5,0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    glVertex3f( 0.5, 0.5, 0.5);
    
    glVertex3f( 0.5, 0.5, 0.5);
    glVertex3f( 0.5,-0.5, 0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    
    // top
    glColor3f(0.5,1.0,0.5);
    glVertex3f(-0.5, 0.5,-0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    glVertex3f( 0.5, 0.5, 0.5);
    
    glVertex3f( 0.5, 0.5, 0.5);
    glVertex3f(-0.5, 0.5, 0.5);
    glVertex3f(-0.5, 0.5,-0.5);

    // bottom
    glColor3f(0.5,0.0,0.5);
    glVertex3f(-0.5,-0.5,-0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    glVertex3f( 0.5,-0.5, 0.5);
    
    glVertex3f( 0.5,-0.5, 0.5);
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f(-0.5,-0.5,-0.5);

    //
    glEnd();
}

//
// makeCylinder
//
// Describes the facets of a cylindrical object. 
//
// The `smoothness` parameter gives the number of sides in the polygon
// of the cylinder's cross section. It should be even, because of the
// coloring.
//
// The object name for glBeginEnd is "Cylinder".
//
function makeCylinder(smoothness) {
    
    const width = 1.0;
    const numFacets = smoothness;
    const dAngle = 2.0 * Math.PI / numFacets;

    glBegin(GL_TRIANGLES, "Cylinder", true);

    // Produce the top.
    for (let i = 0; i < numFacets; i += 1) {
        const aTop = dAngle * i;
        const xTop0 = Math.cos(aTop);
        const yTop0 = Math.sin(aTop);
        const xTop1 = Math.cos(aTop + dAngle);
        const yTop1 = Math.sin(aTop + dAngle);
        if (i % 2 == 0) {
            glColor3f(0.25, 0.50, 0.75);
        } else {
            glColor3f(0.50, 0.75, 0.80);
        }
        glVertex3f(  0.0,   0.0, width / 2.0);
        glVertex3f(xTop0, yTop0, width / 2.0);
        glVertex3f(xTop1, yTop1, width / 2.0);
    }
    
    // Produce the sides.
    for (let i = 0; i < numFacets; i += 1) {
        const aMid = dAngle * i;
        const xMid0 = Math.cos(aMid);
        const yMid0 = Math.sin(aMid);
        const xMid1 = Math.cos(aMid + dAngle);
        const yMid1 = Math.sin(aMid + dAngle);
        
        glColor3f(0.25, 0.50, 0.75);
        glVertex3f(xMid0, yMid0,  width / 2.0);
        glVertex3f(xMid0, yMid0, -width / 2.0);
        glVertex3f(xMid1, yMid1, -width / 2.0);

        glColor3f(0.50, 0.75, 0.80);
        glVertex3f(xMid0, yMid0,  width / 2.0);
        glVertex3f(xMid1, yMid1, -width / 2.0);
        glVertex3f(xMid1, yMid1,  width / 2.0);

    }
    
    // Produce the bottom.
    for (let i = 0; i < numFacets; i += 1) {
        const aBottom = dAngle * i;
        const xBottom0 = Math.cos(aBottom);
        const yBottom0 = Math.sin(aBottom);
        const xBottom1 = Math.cos(aBottom + dAngle);
        const yBottom1 = Math.sin(aBottom + dAngle);
        if (i % 2 == 0) {
            glColor3f(0.25, 0.50, 0.75);
        } else {
            glColor3f(0.50, 0.75, 0.80);
        }
        glVertex3f(     0.0,      0.0, -width / 2.0);
        glVertex3f(xBottom0, yBottom0, -width / 2.0);
        glVertex3f(xBottom1, yBottom1, -width / 2.0);
    }
    
    glEnd();
}

//
// makeTetrahedron
//
// Describes the facets of a tetrahedron whose vertices sit at 4 of
// the 8 corners of the of the cube volume [-1,1] x [-1,1] x [-1,1].
//
// The name of the object is "Tetrahedron".
//
function makeTetrahedron() {

    // Draw all the triangular facets.
    glBegin(GL_TRIANGLES,"Tetrahedron",true);

    // The three vertices are +-+ ++- -++ ---

    // all but ---
    glColor3f(1.0,1.0,0.0);
    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f(-1.0, 1.0, 1.0);
    // all but ++-
    glColor3f(0.0,1.0,1.0);
    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f(-1.0, 1.0, 1.0);
    glVertex3f(-1.0,-1.0,-1.0);
    // all but -++
    glColor3f(1.0,0.0,1.0);
    glVertex3f(-1.0,-1.0,-1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f( 1.0,-1.0, 1.0);
    // all but +-+
    glColor3f(1.0,1.0,1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f(-1.0,-1.0,-1.0);
    glVertex3f(-1.0, 1.0, 1.0);

    glEnd();
}

// Gabe's Shapes!!
//
//makeSphere
//
// the js code to create a sphere, how? IDK YET
// Got some help/hints from Sam Gauck on this
function makeSphere(smoothness) {
    // begin by defining the variables
    const width = 2.0;
    // segments and rings used to be two paramaters defining the number
    // of longitudinal and latitudinal slices respectively
    const num_segs = smoothness;
    const num_rings = smoothness;

    const dAngle = 2 * Math.PI / num_segs;

    // Begin making a sphere
    glBegin(GL_TRIANGLES,"Sphere", true);

    //make a ring of triangles, try to do it iteratively, going ring by ring
    for (let ring = 0; ring < (num_rings); ring++){
        // Create var about the top and bottom of the ring
        const ring_top = (width/2.0) * (Math.cos(dAngle * ring));
        const ring_bottom = (width /2.0) * (Math.cos(dAngle * (ring + 1)));

        // Ring and Rung radius are a calculation of how far out the top
        // and bottom of each ring should be from center
        const ring_radius = (width / 2.0) * Math.sin(dAngle * ring);
        const rung_radius = (width / 2.0) * Math.sin(dAngle * (ring + 1));

        // Loop through every slice in the ring (named segments), then create
        // a quad based on the input information
        for (let i = 0; i < num_rings/2; i += 1) {
            const aMid = dAngle * i;
            
            // Mid0 and Mid1 are the coordinates for the top of the ring
            // based on the ring radius
            const xMid0 = Math.cos(aMid) * (ring_radius);
            const yMid0 = Math.sin(aMid) * (ring_radius);
            const xMid1 = Math.cos(aMid + dAngle) * (ring_radius);
            const yMid1 = Math.sin(aMid + dAngle) * (ring_radius);

            // Same thing, but for the bottom of the ring and rung_radius
            const xMid2 = Math.cos(aMid) * (rung_radius);
            const yMid2 = Math.sin(aMid) * (rung_radius);
            const xMid3 = Math.cos(aMid + dAngle) * (rung_radius);
            const yMid3 = Math.sin(aMid + dAngle) * (rung_radius);

            // Draw the triangles (finally)
            glColor3f(0.25, 0.50, 0.75);
            glVertex3f(xMid0, yMid0,  ring_top);
            glVertex3f(xMid2, yMid2, ring_bottom);
            glVertex3f(xMid3, yMid3, ring_bottom);

            glColor3f(0.50, 0.75, 0.80);
            glVertex3f(xMid0, yMid0,  ring_top);
            glVertex3f(xMid3, yMid3, ring_bottom);
            glVertex3f(xMid1, yMid1,  ring_top);

        }
    }
    glEnd();
}
//
// makeTorus
//
// no clue how im doing this either
function makeTorus(glSmoothness) {
// Thanks to Zeke for some help on figuring out the math
    
    // constants:   t_radius: total torus radius
    //              r_radius: radius of inner ring
    //              segments: smoothness
    const t_radius = 1.0;
    const r_radius = 0.5;
    const segments = glSmoothness;
    
    const dAngle = (2 * Math.PI) / segments;

    glBegin(GL_TRIANGLES, "Torus", true);

    for (let seg = 0; seg < segments; seg++){

        // Calculate the circle of center points
        const aSeg = dAngle * seg;
        const xSeg0_C = Math.cos(aSeg);
        const ySeg0_C = Math.sin(aSeg);
        const xSeg1_C = Math.cos(aSeg + dAngle);
        const ySeg1_C = Math.sin(aSeg + dAngle);
        
        // Draw it if you wish
        /*if (seg % 2 == 0) {
            glColor3f(0.25, 0.50, 0.75);
        } else {
            glColor3f(0.50, 0.75, 0.80);
        }
        
        glVertex3f(  0.0,   0.0, 0.0);
        glVertex3f(xSeg0_C, ySeg0_C, 0.0);
        glVertex3f(xSeg1_C, ySeg1_C, 0.0);*/

        for (let j = 0; j < segments; j++) {

            // Need to create a circle that is specified around that point
            // Create a bunch of constants specific to each ring
            // NOTE: Althrough similarly named, the _C constants refer to the circle of centerpoints
            //      while the _R constants refer to the points on the ring (that then rotate around origin)
            const rSeg = dAngle * j;
            const xSeg0_R = Math.cos(rSeg);
            const ySeg0_R = Math.sin(rSeg); //jSin
            const xSeg1_R = Math.cos(rSeg + dAngle);
            const ySeg1_R = Math.sin(rSeg + dAngle); //jSin

            // Draw the ring
            if (j % 2 == 0) {
                glColor3f(0.25,0.75,0.50);
            } else {
                glColor3f(0.8,0.5,0.75);
            }
            // Zeke helped me with getting these ratios right
            glVertex3f(xSeg0_C * (t_radius + xSeg0_R * r_radius), ySeg0_C * (t_radius + xSeg0_R * r_radius), ySeg0_R + r_radius);
            glVertex3f(xSeg1_C * (t_radius + xSeg0_R * r_radius), ySeg1_C * (t_radius + xSeg0_R * r_radius), ySeg0_R + r_radius);
            glVertex3f(xSeg0_C * (t_radius + xSeg1_R * r_radius), ySeg0_C * (t_radius + xSeg1_R * r_radius), ySeg1_R + r_radius);

            glVertex3f(xSeg1_C * (t_radius + xSeg1_R * r_radius), ySeg1_C * (t_radius + xSeg1_R * r_radius), ySeg1_R + r_radius);
            glVertex3f(xSeg1_C * (t_radius + xSeg0_R * r_radius), ySeg1_C * (t_radius + xSeg0_R * r_radius), ySeg0_R + r_radius);
            glVertex3f(xSeg0_C * (t_radius + xSeg1_R * r_radius), ySeg0_C * (t_radius + xSeg1_R * r_radius), ySeg1_R + r_radius);

        }
    }
    glEnd();
}
//
// make other polygon
// 
// thinking of icosahedron??

function makeIcosahedron(){

    // draw an icosahedron
    glBegin(GL_TRIANGLES, "Icosahedron", true);
    // An icosahedron is defined by three rectangles
    // which intersect, then draw triangles connecting
    // verts of the rectangles to verts nearby.
    //
    // I define the rectangles, then the triangles (based on the quads)
    // feel free to comment out the triangles to see the original quads.
    //
    // Define the three rectangles
    // Rect1 Yellow
    glColor3f(1.0,1.0,0.0);
    glVertex3f(1.618,0.0,-1.0); // V1
    glVertex3f(1.618,0.0,1.0); // V2 // Right angle
    glVertex3f(-1.618,0.0,1.0); // V3
    
    //Cyan
    glColor3f(0.0,1.0,1.0);
    glVertex3f(-1.618,0.0,1.0); // V3
    glVertex3f(-1.618,0.0,-1.0); // V4
    glVertex3f(1.618,0.0,-1.0); // V2

    // Rect2 Red/Pink
    glColor3f(1.0,0.0,0.3);
    glVertex3f(0.0,1.0,-1.618); // V5
    glVertex3f(0.0,1.0,1.618); // V6 // Right Angle
    glVertex3f(0.0,-1.0,1.618); // V7

    // Green
    glColor3f(0.0,1.0,0.0);
    glVertex3f(0.0,-1.0,1.618);
    glVertex3f(0.0,-1.0,-1.618); // V8 // Right Angle
    glVertex3f(0.0,1.0,-1.618);

    // Rect3 Black
    glColor3f(0.0,0.0,0.0);
    glVertex3f(-1.0,1.618,0.0); // V9
    glVertex3f(1.0,1.618,0.0); // V10
    glVertex3f(1.0,-1.618,0.0); // V11
    
    // Grey
    glColor3f(0.5,0.5,0.5);
    glVertex3f(1.0,-1.618,0.0);
    glVertex3f(-1.0,-1.618,0.0); // V12
    glVertex3f(-1.0,1.618,0.0);
    
    //Connecting Tris (Beware, there are many)
    //Blue
    glColor3f(0.0,0.0,1.0);
    glVertex3f(1.618,0.0,-1.0);
    glVertex3f(0.0,1.0,-1.618);
    glVertex3f(1.0,1.618,0.0); 
    // Orange
    glColor3f(1.0,0.5,0.0);
    glVertex3f(-1.0,1.618,0.0); 
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(-1.618,0.0,-1.0);
    // Magenta
    glColor3f(1.0,0.0,1.0);
    glVertex3f(1.0,1.618,0.0); 
    glVertex3f(1.618,0.0,-1.0);
    glVertex3f(1.618,0.0,1.0); 
    //Mauve
    glColor3f(0.7,0.4,0.6);
    glVertex3f(-1.0,1.618,0.0);
    glVertex3f(1.0,1.618,0.0); 
    glVertex3f(0.0,1.0,-1.618);
    //Teal/grey-blue
    glColor3f(0.4,0.6,0.7);
    glVertex3f(-1.0,1.618,0.0);
    glVertex3f(1.0,1.618,0.0); 
    glVertex3f(0.0,1.0,1.618); 
    //Leaf-green
    glColor3f(0.3,0.7,0.2);
    glVertex3f(1.0,1.618,0.0); 
    glVertex3f(0.0,1.0,1.618); 
    glVertex3f(1.618,0.0,1.0); 
    //pink-white
    glColor3f(1.0,0.7,0.7);
    glVertex3f(1.618,0.0,1.0); 
    glVertex3f(0.0,1.0,1.618); 
    glVertex3f(0.0,-1.0,1.618);
    // "brat" green
    glColor3f(0.5,0.7,0.0);
    glVertex3f(1.0,-1.618,0.0);
    glVertex3f(1.618,0.0,-1.0);
    glVertex3f(1.618,0.0,1.0); 
    //purple
    glColor3f(0.5,0.0,0.7);
    glVertex3f(-1.0,-1.618,0.0);
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(-1.618,0.0,-1.0);
    //light-blue
    glColor3f(0.8,0.8,1.0);
    glVertex3f(-1.0,-1.618,0.0); 
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(0.0,-1.0,1.618); 
    //tan
    glColor3f(0.9,0.7,0.6);
    glVertex3f(1.618,0.0,-1.0); 
    glVertex3f(0.0,1.0,-1.618); 
    glVertex3f(0.0,-1.0,-1.618); 
    // orange-yellow?
    glColor3f(1.0,0.8,0.4);
    glVertex3f(1.0,-1.618,0.0); 
    glVertex3f(-1.0,-1.618,0.0); 
    glVertex3f(0.0,-1.0,1.618); 
    //light-grey
    glColor3f(0.6,0.6,0.6);
    glVertex3f(-1.618,0.0,-1.0); 
    glVertex3f(0.0,1.0,-1.618); 
    glVertex3f(0.0,-1.0,-1.618); 
    //light-light-blue
    glColor3f(0.3,0.3,0.8);
    glVertex3f(1.0,-1.618,0.0); 
    glVertex3f(-1.0,-1.618,0.0); 
    glVertex3f(0.0,-1.0,-1.618); 
    //RED
    glColor3f(1.0,0.1,0.1);
    glVertex3f(-1.0,-1.618,0.0); 
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(-1.618,0.0,-1.0); 
    //Black
    glColor3f(0.0,0.0,0.0);
    glVertex3f(0.0,1.0,-1.618); 
    glVertex3f(-1.618,0.0,-1.0); 
    glVertex3f(-1.0,1.618,0.0); 
    //Bright-yellow
    glColor3f(1.0,1.0,0.0);
    glVertex3f(-1.618,0.0,-1.0); 
    glVertex3f(-1.0,-1.618,0.0); 
    glVertex3f(0.0,-1.0,-1.618); 
    //dark-grey
    glColor3f(0.4,0.4,0.4)
    glVertex3f(1.618,0.0,1.0); 
    glVertex3f(0.0,-1.0,1.618);
    glVertex3f(1.0,-1.618,0.0);
    //very-light-grey
    glColor3f(0.9,0.9,0.85)
    glVertex3f(0.0,-1.0,-1.618); 
    glVertex3f(1.0,-1.618,0.0);
    glVertex3f(1.618,0.0,-1.0); 
    //eycalyptus
    glColor3f(0.3,1.0,0.7);
    glVertex3f(0.0,-1.0,1.618); 
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(0.0,1.0,1.618); 
    //roywal purple (last one PHEW)
    glColor3f(0.4,0.3,0.6);
    glVertex3f(-1.618,0.0,1.0); 
    glVertex3f(0.0,1.0,1.618); 
    glVertex3f(-1.0,1.618,0.0); 

    glEnd();
}

// revolution!
// Function to take an object and revolve around an axis
function makeRevolution(smoothness, points){

    glBegin(GL_TRIANGLES, "Revolution1", true)
        const numFacets = smoothness;
        const dAngle = 2.0 * Math.PI / numFacets;
        const width = 1.0;

        // Loop for each slice of the object-to-be
        for(let facet = 0; facet < numFacets; facet++){
            const aCoord = dAngle * facet;

            // Also loop for each point in the object
            for(let i = 0; i < (points.length - 1); i++) {
                console.log(points[i])

                // It's not pretty, but these are all the points that
                // are rotated around
                const x0 = points[i][0];
                const xa0 =  (width * Math.sin(aCoord));
                const z0 = points[i][0];
                const za0 = Math.cos(aCoord);
                const x1 = points[i+1][0];
                const xa1 = (width * Math.sin(aCoord + dAngle));
                const z1 = points[i+1][0];
                const za1 = Math.cos(aCoord + dAngle);

                const y0 = points[i][1];
                const y1 = points[i+1][1];

                if (i % 2 == 0) {
                    glColor3f(0.5,0.3,0.3);
                } else {
                    glColor3f(0.3,0.5,0.3);
                }

                //  Draw it again
                glVertex3f(x0 * xa0,y0,z0 * za0);
                glVertex3f(x1 * xa0,y1,z1 * za0);
                glVertex3f(x0 * xa1,y0,z0 * za1);

                glVertex3f(x1 * xa1,y1,z1 * za1);
                glVertex3f(x1 * xa0,y1,z1 * za0);
                glVertex3f(x0 * xa1,y0,z0 * za1);

            }

        }
    glEnd();

}
// Essentially a carbon copy of the first function
function makeRevolution(smoothness, points){

    glBegin(GL_TRIANGLES, "Revolution2", true)
        const numFacets = smoothness;
        const dAngle = 2.0 * Math.PI / numFacets;
        const width = 1.0;

        for(let facet = 0; facet < numFacets; facet++){
            const aCoord = dAngle * facet;

            for(let i = 0; i < (points.length - 1); i++) {
                console.log(points[i])

                const x0 = points[i][0];
                const xa0 =  (width * Math.sin(aCoord));
                const z0 = points[i][0];
                const za0 = Math.cos(aCoord);
                const x1 = points[i+1][0];
                const xa1 = (width * Math.sin(aCoord + dAngle));
                const z1 = points[i+1][0];
                const za1 = Math.cos(aCoord + dAngle);

                const y0 = points[i][1];
                const y1 = points[i+1][1];

                if (i % 2 == 0) {
                    glColor3f(0.5,0.3,0.3);
                } else {
                    glColor3f(0.3,0.5,0.3);
                }

                glVertex3f(x0 * xa0,y0,z0 * za0);
                glVertex3f(x1 * xa0,y1,z1 * za0);
                glVertex3f(x0 * xa1,y0,z0 * za1);

                glVertex3f(x1 * xa1,y1,z1 * za1);
                glVertex3f(x1 * xa0,y1,z1 * za0);
                glVertex3f(x0 * xa1,y0,z0 * za1);

            }

        }
    glEnd();

}
// ***** RENDERING *****
//
// Functions for displaying the selected object of the showcase.
//

//
// drawObject
//
// Renders the 3-D object designated by the global `gShowWhich`.
//
function drawObject() {

    /*
     * Draw the object selected by the user.
     */
    
    if (gShowWhich == 1) {
        glBeginEnd("Tetrahedron");
    }
    if (gShowWhich == 2) {
        glBeginEnd("Cube");
    }
    if (gShowWhich == 3) {
        glBeginEnd("Cylinder");
    }
    //
    // Add other objects for the assignment here.
    //
    if (gShowWhich == 4) {
        glBeginEnd("Icosahedron");
    }
    if (gShowWhich == 5) {
        glBeginEnd("Sphere");
    }
    if (gShowWhich == 6) {
        glBeginEnd("Torus");
    }
    if (gShowWhich == 7) {
        glBeginEnd("Revolution1");
    }
    if (gShowWhich == 8) {
        glBeginEnd("Revolution2");
    }
    
}

function drawScene() {
    /*
     * Issue GL calls to draw the scene.
     */

    // Clear the rendering information.
    glClearColor(0.2,0.2,0.3);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glEnable(GL_DEPTH_TEST);

    // Clear the transformation stack.
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    // Transform the object by a rotation.
    gOrientation.glRotatef();

    // Draw the object.
    glPushMatrix();
    glScalef(0.5,0.5,0.5);
    drawObject();
    glPopMatrix();
    
    // Render the scene.
    glFlush();

}

// ***** INTERACTION *****
//
// Functions for supporting keypress and mouse input.

//
// handleKey
//
// Handles a keypress.
//
function handleKey(key, x, y) {

    //
    // Handle object selection.
    //
    if (key == '1') {
        gShowWhich = 1;
    }
    //
    if (key == '2') {
        gShowWhich = 2;
    }
    //
    if (key == '3') {
        gShowWhich = 3;
    }
    //
    if (key == '4') {
        gShowWhich = 4;
    }
    if (key == '5') {
        gShowWhich = 5;
    }
    if (key == '6') {
        gShowWhich = 6;
    }
    if (key == '7') {
        gShowWhich = 7;
    }
    if (key == '8') {
        gShowWhich = 8;
    }


    glutPostRedisplay();
}

//
// worldCoords
//
// Converts mouse click location coordinates to the OpenGL world's
// scene coordinates. Takes the mouse coordinates as `mousex` and `mousey`.
//
function worldCoords(mousex, mousey) {

    const pj = mat4.create();
    glGetFloatv(GL_PROJECTION_MATRIX,pj);
    const pj_inv = mat4.create();
    mat4.invert(pj_inv,pj);
    const vp = [0,0,0,0];
    glGetIntegerv(GL_VIEWPORT,vp);
    const mousecoords = vec4.fromValues(2.0*mousex/vp[2]-1.0,
                                        1.0-2.0*mousey/vp[3],
                                        0.0, 1.0);
    vec4.transformMat4(location,mousecoords,pj_inv);
    return {x:location[0], y:location[1]};
}    

// handleMouseClick
//
// Records the location of a mouse click in the OpenGL world's
// scene coordinates. Also notes whether the click was the
// start of the mouse being dragged.
//
// Sets the globals `gMouseStart` and `gMouseDrag` accordingly.
//
function handleMouseClick(button, state, x, y) {
    
    // Start tracking the mouse for trackball motion.
    gMouseStart  = worldCoords(x,y);
    if (state == GLUT_DOWN) {
        gMouseDrag = true;
    } else {
        gMouseDrag = false;
    }
    glutPostRedisplay()
}

// handleMouseMotion
//
// Reorients the object based on the movement of a mouse drag.
// This movement gets accumulated into `gOrientation`.
//
function handleMouseMotion(x, y) {
    
    /*
     * Uses the last and current location of mouse to compute a
     * trackball rotation. This gets stored in the quaternion
     * gOrientation.
     *
     */
    
    // Capture mouse's position.
    mouseNow = worldCoords(x,y)

    // Update object/light orientation based on movement.
    dx = mouseNow.x - gMouseStart.x;
    dy = mouseNow.y - gMouseStart.y;
    axis = (new Vector3d(-dy,dx,0.0)).unit()
    angle = Math.asin(Math.min(Math.sqrt(dx*dx+dy*dy),1.0))
    gOrientation = quatClass.for_rotation(angle,axis).times(gOrientation);

    // Ready state for next mouse move.
    gMouseStart = mouseNow;

    // Update window.
    glutPostRedisplay()
}

// ***** DRIVER *****

//
// Application driver and auxilliary functions.
//


function resizeWindow(w, h) {
    /*
     * Register a window resize by changing the viewport. 
     */
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    if (w > h) {
        glOrtho(-w/h, w/h, -1.0, 1.0, -1.0, 1.0);
    } else {
        glOrtho(-1.0, 1.0, -h/w * 1.0, h/w * 1.0, -1.0, 1.0);
    }
    glutPostRedisplay();
}


//
// Smoothness modification
//

function changeSmoothness(val){
    glSmoothness = glSmoothness + val;
    console.log("Changed!!")
    glutPostRedisplay();
}

function main() {
    /*
     * The main procedure, sets up GL and GLUT.
     */

    // set up GL and GLUT, its canvas, and other components.
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowPosition(0, 20);
    glutInitWindowSize(360, 360);
    glutCreateWindow('object showcase' )
    resizeWindow(360, 360);
    
    // Build the renderable objects.
    makeTetrahedron();
    makeCube();
    makeCylinder(glSmoothness);
    makeIcosahedron();
    makeSphere(glSmoothness);
    makeTorus(glSmoothness);
    makeRevolution(glSmoothness, points);
    makeRevolution(glSmoothness, points1);


    // Register interaction callbacks.
    glutKeyboardFunc(handleKey);
    glutReshapeFunc(resizeWindow);
    glutDisplayFunc(drawScene);
    glutMouseFunc(handleMouseClick)
    glutMotionFunc(handleMouseMotion)

    // Go!
    glutMainLoop();

    return 0;
}

glRun(main,true);
