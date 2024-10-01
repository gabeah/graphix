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
const PINK = {r:255, g:225, b:240};
const TEAL = {r:0, g:75, b:125};

// Colors of the included and excluded portions of a drawn edge.
// When the excluded color is `null`, then that portion is not
// drawn.
const gIncludedColor = BLACK;
const gExcludedColor = null; /* or could make PINK */

class Shot {
    constructor(position0, direction0) {
        this.position = position0;
        this.direction = direction0;
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
    }

    toPDF(document, startNewPage) {
        //
        // Make all the cameras from the walk-through's shots.
        //
        const cameras = [];
        for (let shot of this.shots) {
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
        this.center = center;
        this.right  = new Vector2d( 0.0,-1.0, 0.0);
        this.up     = new Vector2d( 0.0, 0.0, 1.0);
        this.into   = new Vector2d( 1.0, 0.0, 0.0);
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
        const toLocation  = location.minus(this.center);
        const result = {
            point: location,
            projection: new Point2d(-toLocation.dy, toLocation.dz),
            depth: toLocation.dx
        };

        return result;
    }
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
        
        const crossings = [0.0,1.0];

        //
        // TO DO: collect any of other breakpoint locations
        //        of segements whose projection crosses this
        //        one. Use your 2D segment intersection code.
        //

        // STARTER CODE: an edge is only a single segment, from
        //               0.0 to 1.0.
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
        const crossings = this.breakpoints(segments);

        const p0  = this.start.point;
        const p1  = this.end.point;
        const pp0 = this.start.projection;
        const pp1 = this.end.projection;

        // TO DO: go through each of the segments of the edge, as
        //        defined by the breakpoints made by crossing edges.
        //        If the segment is visible (isn't obscured by some
        //        object's facet) draw it.

        // STARTER CODE: just draws the whole edge and its endpoints.

        const ppdf0 = toPDFcoord(pp0);
        const ppdf1 = toPDFcoord(pp1);        
        document.setLineWidth(0.125);
        document.setDrawColor(gIncludedColor.r,
                              gIncludedColor.g,
                              gIncludedColor.b);
        document.line(ppdf0.x, ppdf0.y, ppdf1.x, ppdf1.y);
        document.circle(ppdf0.x, ppdf0.y, 0.35, "F");
        document.circle(ppdf1.x, ppdf1.y, 0.35, "F");
    }        
}
