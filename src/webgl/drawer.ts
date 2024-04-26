import { Node } from './models/Node';
import * as m4 from "./utils/m4";
import * as webglUtils from "./utils/webGlUtils";
import * as primitives from "./utils/primitives";

import { createVertexShader, createFragmentShader } from "@/webgl/utils/create-shader";

function degToRad(d: any) {
    return d * Math.PI / 180;
}


export class Drawer {
    objects: any[];
    objectsToDraw: any[];
    nodeInfosByName: any;
    animate: boolean;
    fieldOfViewRadians: number;
    gl: any;
    programInfo: any;

    constructor(gl: any) {
        this.objects = [];
        this.objectsToDraw = [];
        this.nodeInfosByName = {};
        this.animate = true;
        this.fieldOfViewRadians = degToRad(60);
        this.gl = gl;
        this.initialize();
    }

    initialize() {
        const vertexShader = createVertexShader(this.gl);
        const fragmentShader = createFragmentShader(this.gl);
        // @ts-ignore
        this.programInfo = webglUtils.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    draw(scene: Node) {
        this.drawScene(scene, 0.01)
    }

    // Draw the scene.
    drawScene(scene: Node, time: any) {
        if (!this.gl) {
            return;
        }
        this.clear();

        time *= 0.001;

        webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        // Compute the projection matrix
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(this.fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        var cameraPosition = [4, 3.5, 10];
        var target = [0, 3.5, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        scene.updateWorldMatrix(null);

        var adjust;
        var speed = 3;
        var c = time * speed;

        // adjust = Math.abs(Math.sin(c));
        // nodeInfosByName["point between feet"].trs.translation[1] = adjust;
        // adjust = Math.sin(c);
        // nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
        // nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
        // adjust = Math.sin(c + 0.1) * 0.4;
        // nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
        // nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
        // adjust = Math.sin(c + 0.1) * 0.4;
        // nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
        // nodeInfosByName["right-foot"].trs.rotation[0] = adjust;

        // adjust = Math.sin(c) * 0.4;
        // nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
        // nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
        // adjust = Math.sin(c + 0.1) * 0.4;
        // nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
        // nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
        // adjust = Math.sin(c - 0.1) * 0.4;
        // nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
        // nodeInfosByName["right-hand"].trs.rotation[2] = adjust;

        // adjust = Math.sin(c) * 0.4;
        // nodeInfosByName["waist"].trs.rotation[1] = adjust;
        // adjust = Math.sin(c) * 0.4;
        // nodeInfosByName["torso"].trs.rotation[1] = adjust;
        // adjust = Math.sin(c + 0.25) * 0.4;
        // nodeInfosByName["neck"].trs.rotation[1] = adjust;
        // adjust = Math.sin(c + 0.5) * 0.4;
        // nodeInfosByName["head"].trs.rotation[1] = adjust;
        // adjust = Math.cos(c * 2) * 0.4;
        // nodeInfosByName["head"].trs.rotation[0] = adjust;

        scene.drawNode(this.gl, viewProjectionMatrix);


        // if (this.animate) {
        //     requestAnimationFrame(this.drawScene(scene, time));
        // }
    }

}