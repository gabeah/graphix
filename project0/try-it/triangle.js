class Triangle {
    constructor(x, y, r) {
        this.centerx = x;
        this.centery = y;
        this.size = r;
        this.rotation = 0.0;
    }
}

let triangle = new Triangle(0.0, 0.0, 1.0, 0.0);

let canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl');;
if (!gl) {
    alert('Unable to initialize WebGL.')
}

const vsrc = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec4 color;
void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    color = aVertexColor;
}
          `;

const fsrc = `
varying lowp vec4 color;
void main(void) {
    lowp float r = color.x;
    lowp float g = color.y;
    lowp float b = color.z;
    lowp float maxc = 0.01;
    if (r > g) {
        if (r > b) {
            maxc = r;
        } else {
            maxc = b;
        }
    } else {
        if (g > b) {
            maxc = g;
        } else {
            maxc = b;
        }
    }
    gl_FragColor = (1.0/maxc) * color;
}
           `;

function loadShaders() {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        const errors = gl.getShaderInfoLog(vs);
        alert('Vertex shader failed to compile: ' + errors)
        gl.deleteShader(vs);
    }
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        const errors = gl.getShaderInfoLog(fs);
        alert('Fragment shader failed to compile: ' + errors)
        gl.deleteShader(fs);
    }
    let pg = gl.createProgram();
    gl.attachShader(pg, vs)
    gl.attachShader(pg, fs);
    gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) {
        alert("Failed to link shaders.")
    }
    return {
        program: pg,
        aVertexPosition: gl.getAttribLocation(pg, 'aVertexPosition'),
        aVertexColor: gl.getAttribLocation(pg, 'aVertexColor'),
        uModelViewMatrix: gl.getUniformLocation(pg, 'uModelViewMatrix'),
        uProjectionMatrix: gl.getUniformLocation(pg, 'uProjectionMatrix')
    }
}

function makeObject() {
    const vertices = [
        -0.5, -Math.sqrt(3.0) / 6, 0.0, 1.0, // left
        0.5, -Math.sqrt(3.0) / 6, 0.0, 1.0, // right
        0.0, Math.sqrt(3) / 3, 0.0, 1.0  // top
    ];
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const colors = [
        1.0, 0.0, 0.0, 1.0, // pure red, opaque
        0.0, 1.0, 0.0, 1.0, // pure green, opaque
        0.0, 0.0, 1.0, 1.0, // pure blue, opaque
    ];
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    return {
        size: 3,
        vertices: vbuf,
        colors: cbuf
    };
}

const shader = loadShaders();
const object = makeObject();

function rotateFrame(degrees) {
    triangle.rotation += degrees;
    requestAnimationFrame(render);
    console.log("rotating!");
}

function scaleFrame(percentage) {
    triangle.size *= percentage / 100.0;
    requestAnimationFrame(render);
    console.log("scaling!");
}

function drawTriangle(shader, cx, cy, sz, ag) {
    const orientMtx = mat4.create();
    mat4.translate(orientMtx, orientMtx, [cx, cy, 0.0]);
    mat4.scale(orientMtx, orientMtx, [sz, sz, sz]);
    const radians = Math.PI * ag / 180.0;
    mat4.rotate(orientMtx, orientMtx, radians, [0.0, 0.0, 1.0]);
    gl.uniformMatrix4fv(shader.uModelViewMatrix, false, orientMtx);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawSceneObjects() {
    let t = triangle
    drawTriangle(shader, t.centerx, t.centery, t.size, t.rotation);
}
    
function drawFrame() {
    // Ready the canvas and WebGL context.
    gl.clearColor(0.55, 0.5, 0.4, 1.0); // clay mud
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const w = canvas.width;
    const h = canvas.height;
    gl.viewport(0, 0, w, h);
    console.log("drawing! " + w.toString() + "x" + h.toString());

    // Set up coordinate transformations.
    const viewportMtx = mat4.create();
    if (w > h) {
        mat4.ortho(viewportMtx, -w / h, w / h, -1.0, 1.0, -1.0, 1.0);
    } else {
        mat4.ortho(viewportMtx, -1.0, 1.0, -h / w, h / w, -1.0, 1.0);
    }
    // Render the objects.
    gl.useProgram(shader.program);
    gl.uniformMatrix4fv(shader.uProjectionMatrix, false, viewportMtx);
    const vbuf = object.vertices;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.vertexAttribPointer(shader.aVertexPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.aVertexPosition);
    const cbuf = object.colors;
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.vertexAttribPointer(shader.aVertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.aVertexColor);

    drawSceneObjects()

    gl.disableVertexAttribArray(shader.aVertexPosition);
    gl.disableVertexAttribArray(shader.aVertexColor);
}

function render(time) {
    drawFrame();
}

function main() {
    requestAnimationFrame(render);
}

function remain() {
    requestAnimationFrame((time) => {
        render(time);
        remain();
    });
}

main();
