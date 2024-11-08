//
// walk-thru.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Fall 2024
//
// This defines six object types that support a walk through a scene
// of objects. It is made up of several camera shots of that scene.
//
// It defines these classes
//
//  * Shot: the position and direction of a camera shot in the scene.
//
//  * Placement: the positioning, sizing, and orientation of an object
//      from an object library.
//
//  * WalkThru: a collection of shots and placements.
//
// It provides templates for code for these classes:
//
//  * SceneCamera: information for producing a snapshot of the scene
//      from a particular camera Shot.
//
//  * SceneObject: geometric information for the placememt of a
//      library object within a scene. This is used for projecting its
//      points and edges when taking a camera snapshot.
//
//  * SceneEdge: geometric information for the projection of an
//      SceneObject's edge. This is computed when taking a snapshot of
//      the scene.
//
// ------
//
// Assignment
//
// Your job is to get the code for the `toPDF` method of the
// `WalkThru` class fully working. This method should compile all the
// geometric information for the shots and object placements of the
// scene walk-through. Having done that, it should then produce a
// series of lines on the pages of a PDF documemt. Each page should
// correspond to a snapshot of the objects in the scene from some
// camera location, as directed by the series of shots.
//
// Each page should render the objects according to a perspective
// drawing of the edges/facets of each object in the scene, with
// "hidden lines removed." This means that if a portion of an edge is
// hidden behind a face of an object that sits closer to the camera,
// then that portion of the edge should not be drawn.
//
// There is a template worked out for the code for `WalkThru.toPDF`.
// It contains the skeleton of a solution as described in the
// assignment text. See the comments in that code, and the description
// in the assignment text, to complete the code according to that
// prescription.
//
// If you choose to follow the prescription, scan through the code of
// `WalkThru.toPDF` and then look for all the "TO DO" comments
// littered through its supporting code. Write that supporting code.
//
// If you instead choose to devise your own approach to a solution,
// then you can just rewrite `WalkThru.toPDF`, but you still might find
// the existing code's supporting code useful.
//

const MINIMUM_PLACEMENT_SCALE = 0.1; // Smallest object we can place.
const EPSILON = 0.00000001;

// Ink colors for drawing in the PDF
const BLACK = {r:25, g:25, b:25};
const PINK = {r:255, g:15, b:100};
const TEAL = {r:0, g:75, b:125};

// Colors of the included and excluded portions of a drawn edge.
// When the excluded color is `null`, then that portion is not
// drawn.
const gIncludedColor = BLACK;
const gExcludedColor = PINK; /* or could make PINK */

class Shot {
    constructor(position0, direction0) {
        this.position = position0;
        this.direction = direction0;
    }

    combo(amount, other) {
        //console.log(amount)
        //console.log(other)

        // simple combo for position
        const c_pos = this.position.combo(amount, other.position);
        //const c_dir = this.direction.combo(amount, other.direction);

        const vector_ratio = (this.direction.dot(other.direction)) / (this.direction.norm() * other.direction.norm());
        const angle_diff = Math.acos(vector_ratio);

        const angle_interpolate = angle_diff * amount;

        const vec_ratio_interpolate = Math.cos(angle_interpolate);
        const c_angle = this.direction.times(vec_ratio_interpolate)

        //console.log("New position:", c_pos);
        return new Shot(c_pos, c_angle);
    }
}

class Placement {
    //
    // Class representing the placement of a library object in the scene.
    //
    constructor(name, position0) {
        //
        // `name`: string of the object cloned from the library. This
        //         name is used to access the object's geometric info
        //         (its faceted surface) and also to render it with
        //         glBeginEnd.
        //
        // `position`, `scale`, `direction`: a `point`, number, and
        //         `vector` representing the location, size, and
        //         orientation of this object's placement in the
        //         scene.
        //
        this.name        = name;
        this.position    = position0;
        this.scale       = MINIMUM_PLACEMENT_SCALE;
        this.orientation = 0.0;
    }
    
    resize(scale, bounds) {
        //
        // Return the 2D orientation of the object as an angle in degrees.
        // This gives the "spin" of the clone around its base.
        //
        // Some checks prevent growing the clone beyond the scene bounds.
        //
        if (bounds != null) {
            scale = Math.max(scale, MINIMUM_PLACEMENT_SCALE);
            scale = Math.min(scale, bounds.right - this.position.x);
            scale = Math.min(scale, bounds.top - this.position.y);
            scale = Math.min(scale, this.position.x - bounds.left);
            scale = Math.min(scale, this.position.y - bounds.bottom);
        }
        this.scale = scale;    
    }

    moveTo(position, bounds) {
        //
        // Relocate the object.
        //
        // Some checks prevent the object from being placed outside
        // the scene bounds.
        //
        if (bounds != null) {
            position.x = Math.max(position.x ,bounds.left + this.scale);
            position.y = Math.max(position.y, bounds.bottom + this.scale);
            position.x = Math.min(position.x, bounds.right - this.scale);
            position.y = Math.min(position.y, bounds.top - this.scale);
        }
        this.position = position;
    }

    rotateBy(angle) {
        //
        // Re-orient the clone by spinning it further by and angle.
        //
        this.orientation += angle;
    }

    baseIncludes(queryPoint) {
        //
        // Checks whether the `queryPoint` lives within the circular base
        // of the clone.
        //
        const distance = this.position.dist2(queryPoint);
        return (distance < this.scale*this.scale);
    }

    draw(objectColor, highlightColor, drawBase, drawShaded) {
        //
        // Draws the object within the current WebGL/opengl context.
        //
        glPushMatrix();
        const position = this.position;
        const angle = this.orientation;
        const scale = this.scale;
        glTranslatef(this.position.x, this.position.y, this.position.z);
        glRotatef(angle, 0.0, 0.0, 1.0);
        glScalef(this.scale, this.scale, this.scale);
        //
        // draw
        if (drawShaded) {
            // Turn on lighting.
            glEnable(GL_LIGHTING);
            glEnable(GL_LIGHT0);
        }
        glColor3f(objectColor.r, objectColor.g, objectColor.b);
        glBeginEnd(this.name);
        if (drawShaded) {
            // Turn on lighting.
            glDisable(GL_LIGHT0);
            glDisable(GL_LIGHTING);
        }

        // draw with highlights
        if (highlightColor != null) {
            
            glColor3f(highlightColor.r,
                      highlightColor.g,
                      highlightColor.b);
            //
            // Draw its wireframe.
            glBeginEnd(this.name+"-wireframe");
            if (drawBase) {
                // Show its extent as a circle.
                glBeginEnd("BASE");
            }
            
        }

        glPopMatrix();
    }    
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   WALK THRU
*/

function toPDFcoord(p) {
    const x = p.x * 27 + 27 + 2;
    const y = 4 + (2.0 - p.y) * 27;
    return {x:x, y:y};
}

function pointIsHidden(camera, point, exclude, objects) {
    for (let object of objects) {
        if (object.hides(camera, point, exclude)) {
            return true;
        }
    }
    return false;
}

class WalkThru {
    
    constructor() {
        /*
         * new WalkThru
         *
         * Initializes an empty scene with a single shot of it.
         * The shot is on the left side facing right.
         */
        this.shot0 = new Shot(ORIGIN3D(), X_VECTOR3D());
        this.shots = [this.shot0];
        this.placements = [];

        // Suggestion from Duncan, adding a new array of shots
        // to hold the smooth interpolation of shots
        this.smooth_shots = [];
    }

    smoothen_path() {

        //
        // Make all the cameras from the walk-through's shots and smooth it out.
        //
        
        // begin with the defined shot list
        // we will save / update this as we do multiple rounds of smoothing
        let shot_list = this.shots;

        // set the rounds of smoothing
        let max_smoothness = 3;
        for (let i = 0; i < max_smoothness; i++) {

            // keey an index of all shots so we can reference previous ones
            let shot_count = 0;
            let num_shots = shot_list.length;

            // create a temporary list of smooth shots
            let tmp_smooth = [];

            // for a shot in the shot list
            for (let shot of shot_list) {
                //console.log(shot)
                // check if this is the first shot of the series (which we keep)
                if (shot_count == 0) {
                    
                    const start_shot = shot;
                    tmp_smooth.push(start_shot);

                } else {
                    // Otherwise, create the interpolated shots
                    const one_q = shot.combo(0.25, shot_list[shot_count-1]);
                    const three_q = shot.combo(0.75, shot_list[shot_count-1]);

                    tmp_smooth.push(three_q);
                    tmp_smooth.push(one_q);

                    // check if the shot is the final shot in the list, which we will keep
                    if (shot_count == num_shots - 1) {
                        const term_shot = shot
                        tmp_smooth.push(term_shot);
                    }
                }
                // increase shot count, loop again
                shot_count += 1;
            }
            // update shot_list with the list we generated
            shot_list = tmp_smooth;
        }
        // save the fully smoothed shotlist to a new attribute smooth_shots
        this.smooth_shots = shot_list;
    }


    toPDF(document, startNewPage) {
        
        const cameras = [];
        
        // All shots are calculated in a different method of WalkThru, we go through
        // a list of these smoothened shots
        for (let shot of this.smooth_shots) {
            // Performs STEP 1.
            const camera = new SceneCamera(shot.position,
                                           shot.direction,
                                           Z_VECTOR3D());
            cameras.push(camera);

        }

        //
        // Make all the scene objects from their placements.
        //
        const objects = [];
        for (let placement of this.placements) {
            const prototype = gObjectsLibrary.get(placement.name);
            const object = new SceneObject(prototype, placement);
            objects.push(object);
        }

        //
        // Render each page of the walk-through.
        //
        for (let camera of cameras) {
            
            // For now, one page per shot.
            startNewPage(document);

            // Ready to project from this perspective.
            for (let object of objects) {
                object.reset();
            }
            
            // Compute projected vertex information.
            for (let object of objects) {
                // Performs STEP 2.
                object.projectVertices(camera);
            }

            let edges = [];
            // Gather the projection info about the edges of each object.
            for (let object of objects) {
                const moreEdges = object.projectEdges(camera, objects);
                edges = edges.concat(moreEdges);
            }

            // Appropriately draw (the visible parts of) each edge. 
            for (let edge of edges) {
                // Performs STEPS 3 and 4.
                edge.draw(document, camera, edges, objects);
            }
        }        
    }
}

class SceneCamera {
    //
    // new SceneCamera(center, towards, upward)
    //
    // Represents the parameters of a 2-D snapshot of a 3-D scene.
    // This yields a perspective projection of a camera looking at
    // the scene in a direction `towards`, from the given `center` of
    // projection, with an orientation that puts a certain direction
    // `upward`.
    // 
    // Underlying the `Camera` object is an orthonormal frame whose
    // origin sits at `center`, and whose axes are `right`, `up`, and
    // `into`. This is a *left-handed* system. The vectors `right` and
    // `up` form a basis for the projection onto the virtual
    // film/screen/paper.  The `into` vector points towards/into
    // the scene.
    //
    constructor(center, towards, upward) {
        //
        // Constructs a left-handed orthonormal frame for projection.

        // STEP 1
        //
        // TO DO: figure out an orthonormal frame that gives the
        //        center of focus along with the orientation of the
        //        camera for its perspective.
        //

        // STARTER CODE: just sets the `into` direction along x,
        //               the `right` direction along y, and the
        //               `up` direction along z. 
        let e3 = towards.times(1/towards.norm())
        let e1 = (e3.cross(upward)).times(1/e3.cross(upward).norm())
        let e2 = e3.cross(e1).times(1/e3.cross(e1).norm())

        this.center = center;
        this.right  = e1;
        this.up     = e2;
        this.into   = e3;
    }

    project(location) {
        //
        // Compute the projection information of a `location` in the
        // scene, given as a `point3d` object. The result gets
        // reported as a point in 2D along with a depth. These are
        // found by performing a perspective projection from this
        // SceneCamera.
        //

        // STEP 2
        //
        // TO DO: compute the projection of a 3D point according to
        //        this camera's perspective.

        // STARTER CODE: just performs a orthographic projection as if
        //               the camera is looking directly along the x
        //               axis from where it sits.
        //
        // const toLocation  = location.minus(this.center);
        // const result1 = {
        //     point: location,
        //     projection: new Point2d(-toLocation.dy, toLocation.dz),
        //     depth: toLocation.dx
        // };

        // Gabe's Code
        const toLocation  = location.minus(this.center);

        // Create the vector (through similar triangles) that represents
        // the point projected on the camera
        const locPrime = this.center.plus(location.minus(this.center).div(toLocation.norm()));
        // console.log("location given at:");
        // console.log(location);

        // console.log("initial locPrime cal at:");
        // console.log(locPrime);
        
        // Got an error when trying to call the y,z values, thus dumped the
        // values to a list and went from there
        
        // Provided by Jim (correcting my errors)
        const d = location.minus(this.center).dot(this.into);
        const x =  location.minus(this.center).dot(this.right)/d;
        const y =  location.minus(this.center).dot(this.up)/d;

        const result = {
            point: location,
            projection: new Point2d(x, -y),
            depth: d
        };

        // so.. much.. debugging..
        // console.log(locxyz)

        // console.log("locprime dy:")
        // console.log(locPrime.dy)

        // console.log("result is:")
        // console.log(result)

        return result;}
}

class SceneObject extends CGObject {
    
    constructor(cgobject, placement) {
        // Compile geometric info from a placed object,
        super();
        this.cloneFromObject(cgobject, placement);
        
        // Clear projection info.
        this.vertexProjections = null;
    }

    cloneFromObject(cgobject, placement) {
        /*
         * Sets the faces, edges, and vertices of a CGObject so
         * that they share the topology of another object, and 
         * so that the vertex locations correspond to a placement
         * of the vertices of that other object.
         */
        
        const vs = cgobject.allVertices();
        for (let v of vs) {
            this.addVertex(v.getRelativePosition(placement));
        }
        const fs = cgobject.allFaces();
        for (let f of fs) {
            this.addFace(f.vertexi[0],
                         f.vertexi[1],
                         f.vertexi[2],
                         f.id);
        }
        this.lock = true;
    }

    reset() {
        // Reset projection info.
        this.vertexProjections = new Map();
    }

    projectVertices(camera) {
        for (let v of this.allVertices()) {
            // Get the projection info.
            const projection = camera.project(v.position);
            // Store that info in the Map, as an entry for that vertex.
            this.vertexProjections.set(v,projection);
        }
    }
    
    projectEdges(camera) {
        const segments = []
        for (let e of this.allEdges()) {
            //
            const v0 = e.vertex(0); // source vertex
            const v1 = e.vertex(1); // target vertex
            //
            const pj0 = this.vertexProjections.get(v0); // projected locations
            const pj1 = this.vertexProjections.get(v1);
            //
            if ((pj0.depth > 0) && (pj1.depth > 0)) {
                //
                // Only include edges whose two endpoints are in front of
                // the camera.
                //
                // Return the projected segment info for this scene object.
                const segment = new SceneEdge(pj0, pj1, e.faces());
                segments.push(segment);
            }
        }
        return segments;
    }
}

class SceneEdge {

    constructor(pj0, pj1, fs) {
        //
        // new SceneEdge(pj0, pj1, fs)
        //
        // This represents the projection of the edge of an object in
        // the scene.  The projection info of its two endpoints are
        // provided as `pj0` and `pj1`. This is data computed by
        // SceneCamera.project.  The edge is formed between the one
        // or two faces listed in the array `fs`.
        //
        this.start = pj0;
        this.end   = pj1;
        this.faces = fs;
    }
    
    breakpoints(edges) {
        
        // Figure out what edges cross this segment. Records a
        // fractional value (from 0.0 to 1.0) locating each crossing
        // edge along `this` edge.
        //
        // Each pair of consecutive values determines a
        // segment of the edge.
        
        // Make sure to include 0.0 and 1.0
        const crossings = [0.0,1.0];

        //
        // TO DO: collect any of other breakpoint locations
        //        of segements whose projection crosses this
        //        one. Use your 2D segment intersection code.
        //

        const P0 = this.start.projection;
        const P1 = this.end.projection;

        for (let edge of edges) {

            //console.log(edge)
            const Q0 = edge.start.projection;
            const Q1 = edge.end.projection;
            //console.log("Q0 & Q1: ", Q0, Q1)

            // THANKS DUNCAN AND ZEKE FOR DISCUSSING THIS IF STATEMENT
            if (Q1.minus(Q0).cross(P1.minus(P0)) != 0) {

                // run segmentsIntersect on points, hope for a scalar
                const s = segmentsIntersect(P0, P1, Q0, Q1);
                //console.log("s found at: ", s)

                // ended up getting NaN outputted. I expect this is due to
                // parallel lines. I don't believe the if-statement will
                // actually catch it, luckily I fixed the problem of NaN
                if (s != null) {
                    if (s != NaN) {
                    crossings.push(s);
                    }
                }
                //if (s == NaN) {console.log("HELP IM NOT A NUMBER!");}
            }
        }

        // Courtesy of Duncan, apparently just running list.sort() can throw
        // errors in encoding, this simple helper function sorts it properly
        function sort_assist(a, b){
            return a-b;
        }

        crossings.sort(sort_assist);
        //console.log("breakpoints array ", crossings);
        return crossings;
    }

    isSegmentVisible(breakpointA, breakpointB, camera, objects) {

        // TO DO:
        //
        // Figure out whether an edge's segment, from `breakpointA`
        // to `breakpointB`, is hidden by a collection of `objects`
        // when viewed from the perspective of the given `camera`.
        //
        // STARTER CODE: just says all edge segments are visible.

        // Define a midpoint to set Rp to when running RFI
        const breakMid = breakpointA.combo(0.5, breakpointB);

        // Not close to optimized, but iterate through ALL objects...
        for (let object of objects) {
            // ALL the faces of the object...
            for (let face of object.faces) {

                //
                if (this.faces.includes(face)) {continue;}

                // Pull out the Q1, Q2, Q3 that define each face
                const Q1 = object.vertex(face.vertexi[0]).position;
                const Q2 = object.vertex(face.vertexi[1]).position;
                const Q3 = object.vertex(face.vertexi[2]).position;

                // run RFI
                const doesIntersect = rayFacetIntersect(Q1, Q2, Q3, camera.center, breakMid);

                // if RFI outputs anything, then a face exists which means the segment
                // shan't be visible
                if (doesIntersect != null) {return false;}
            }
        }
        // if no face intersects, then return true
        return true;
    }
        
    draw(document, camera, segments, objects) {
        //
        // Draw the edge but by showing only its segments that aren't
        // hidden by object facets in the scene.
        //

        // Compute any/all breakpoints along the segment.
        // These are places where the other scene edge crosses this edge
        // when looking through this camera.

        // run breakpoints for all segments, put all the intersections with
        // a given scene edge into a list
        const crossings = this.breakpoints(segments);
        //console.log(crossings)

        // given by Jim
        const p0  = this.start.point;
        const p1  = this.end.point;
        const pp0 = this.start.projection;
        const pp1 = this.end.projection;

        // Set line width
        document.setLineWidth(0.125);

        // Iterate through all scalars from crossings
        for (let b = 0; b < crossings.length-1; b++) {
            //console.log(crossings[b]);
            
            //const intersect = pp0.combo(crossings[b], pp1);
            //console.log("intersect: ",intersect);
            
            // define 2 points defined by the previous/next intersection point
            const breakA = p0.combo(crossings[b], p1);
            const breakB = p0.combo(crossings[b+1], p1);

            // check if the segment defined by breakA & breakB is visible
            const edge_check = this.isSegmentVisible(breakA, breakB, camera, objects);

            // project what the points would be onto the camera plane
            const projA = pp0.combo(crossings[b], pp1);
            const projB = pp0.combo(crossings[b+1], pp1);

            // turn that into PDF coords
            const pdfA = toPDFcoord(projA);
            const pdfB = toPDFcoord(projB);

            // if the segment is visible (yay!), set the color to black and draw the line
            if (edge_check) {
                document.setDrawColor(gIncludedColor.r,gIncludedColor.g,gIncludedColor.b);
                document.line(pdfA.x, pdfA.y, pdfB.x, pdfB.y);
            }

            // To show all the intersection points.
            //document.circle(pdfA.x, pdfA.y, 0.35, "F");
            //document.circle(pdfB.x, pdfB.y, 0.35, "F");
            
        }

        
    }        
}
