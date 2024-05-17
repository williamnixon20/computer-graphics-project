import { Node } from './models/Node';
import * as m4 from "./utils/m4";
import * as webglUtils from "./utils/webGlUtils";
import * as primitives from "./utils/primitives";

import { createVertexShader, createFragmentShader, createVertexShaderPicking, createFragmentShaderPicking, createVertexPostProcessShader, createFragmentPostProcessShader } from "@/webgl/utils/create-shader";
import { CameraInformation } from '@/app/type';

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
    pickingProgramInfo: any;
    postprocessProgramInfo: any;
    scene: any;
    viewProjectionMatrix: any;
    isPostprocess: boolean;

    constructor(gl: any) {
        this.objects = [];
        this.objectsToDraw = [];
        this.nodeInfosByName = {};
        this.animate = true;
        this.fieldOfViewRadians = degToRad(60);
        this.gl = gl;
        this.scene = null;
        this.isPostprocess = false;
        this.viewProjectionMatrix = null;
        this.initialize();
    }

    setPostprocess(checked: boolean) {
        this.isPostprocess = checked;
    }

    initialize() {
        const vertexShader = createVertexShader(this.gl);
        const fragmentShader = createFragmentShader(this.gl);
        // @ts-ignore
        this.programInfo = webglUtils.createProgramInfo(this.gl, [vertexShader, fragmentShader]);

        const pickingShader = createVertexShaderPicking(this.gl);
        const pickingFragmentShader = createFragmentShaderPicking(this.gl);
        // @ts-ignore
        this.pickingProgramInfo = webglUtils.createProgramInfo(this.gl, [pickingShader, pickingFragmentShader]);

        const postProcessVertexShader = createVertexPostProcessShader(this.gl);
        const postProcessFragmentShader = createFragmentPostProcessShader(this.gl);
        // @ts-ignore
        this.postprocessProgramInfo = webglUtils.createProgramInfo(this.gl, [postProcessVertexShader, postProcessFragmentShader]);

    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    draw(scene: Node, cameraInformation: CameraInformation) {
        this.drawScene(scene, cameraInformation, 0.01)
    }

    // Draw the scene.
    drawScene(scene: Node, cameraInformation: CameraInformation, time: number) {
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
        var projectionMatrix;
        
        const targetX = cameraInformation.translateX - cameraInformation.radiusRotate * Math.sin(cameraInformation.rotateX);
        const targetY = cameraInformation.translateY + cameraInformation.radiusRotate * Math.sin(cameraInformation.rotateY);
        var target;
        // if (cameraInformation.projType === "perspective") {
        //     const targetZ = cameraInformation.radiusRotate * (1 - (Math.cos(cameraInformation.rotateY) * Math.cos(cameraInformation.rotateX))) 
        //     target = [targetX,  targetY , targetZ];
        // } else {
        //     target = [targetX,  targetY , 0];
        // }

        const targetZ = cameraInformation.radiusRotate * (1 - (Math.cos(cameraInformation.rotateY) * Math.cos(cameraInformation.rotateX))) 
        target = [targetX,  targetY , targetZ];
        console.log("target: ", target);
        var up = [0, 1, 0];

        var cameraMatrix;
        if (cameraInformation.projType === "perspective") {
            projectionMatrix = m4.perspective(cameraInformation.fieldOfViewRadians, aspect, 1, 2000);

            cameraMatrix = m4.yRotation(cameraInformation.cameraAngleXRadians);
            cameraMatrix = m4.xRotate(cameraMatrix, cameraInformation.cameraAngleYRadians);
        } else {
            var left = -this.gl.canvas.clientWidth/128;
            var right = this.gl.canvas.clientWidth/128;
            var bottom = this.gl.canvas.clientHeight/128;
            var top = -this.gl.canvas.clientHeight/128;
            var near = 50;
            var far = -50;
            projectionMatrix = m4.orthographic(left, right, bottom, top, near, far);
            up[1] = -1;

            if (cameraInformation.projType === "oblique") {
                projectionMatrix = m4.multiply(
                    projectionMatrix,
                    m4.oblique(degToRad(75), degToRad(75))
                  );
            }

            cameraMatrix = m4.yRotation(cameraInformation.cameraAngleXRadians + degToRad(180));
            cameraMatrix = m4.xRotate(cameraMatrix, -cameraInformation.cameraAngleYRadians);            
        }

        cameraMatrix = m4.translate(cameraMatrix, cameraInformation.translateX, cameraInformation.translateY, cameraInformation.radius);

        // Get the camera's position from the matrix we computed
        var cameraPosition: number[] = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14],
        ];

        cameraMatrix = m4.lookAt(cameraPosition, target, up);


        cameraMatrix = m4.translate(cameraMatrix, 0, 0, 0);
        if (cameraInformation.projType === "perspective") {
            cameraMatrix = m4.xRotate(cameraMatrix, cameraInformation.rotateY);
        } else {
            cameraMatrix = m4.xRotate(cameraMatrix, -cameraInformation.rotateY);
        }
        cameraMatrix = m4.yRotate(cameraMatrix, cameraInformation.rotateX);

        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        scene.updateWorldMatrix(null);

        scene.updateCameraInformation(cameraInformation);

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

        this.scene = scene;
        this.viewProjectionMatrix = viewProjectionMatrix;

        if (this.isPostprocess) {
            this.postprocess();
        } else {
            scene.drawNode(this.gl, viewProjectionMatrix, this.programInfo);
        }
        // if (this.animate) {
        //     requestAnimationFrame(this.drawScene(scene, time));
        // }
    }

    postprocess() {
        this.clear();
        let gl = this.gl;
        let scene = this.scene;
        let viewProjectionMatrix = this.viewProjectionMatrix;


        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);


        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clearColor(1, 1, 1, 1);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        scene.drawNode(gl, viewProjectionMatrix, this.programInfo);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.postprocessProgramInfo.program);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        // Link the position attribute
        const positionAttributeLocation = gl.getAttribLocation(this.postprocessProgramInfo.program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        // Bind the texture to the texture unit
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.uniform1i(gl.getUniformLocation(this.postprocessProgramInfo.program, "u_texture"), 0);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        // SAMPLE THE WHOLE TEXTURE UP TO CANVAS

        // scene.drawNode(gl, viewProjectionMatrix, this.postprocessProgramInfo);
    }


    getPickingId(mouseX: number, mouseY: number) {
        console.log("PICKING EXEC")
        let gl = this.gl;
        let scene = this.scene;
        let viewProjectionMatrix = this.viewProjectionMatrix;

        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

        function setFramebufferAttachmentSizes(width: any, height: any) {
            console.log("WIDTH", width, "HEIGHT", height)
            gl.bindTexture(gl.TEXTURE_2D, targetTexture);
            // define size and format of level 0
            const level = 0;
            const internalFormat = gl.RGBA;
            const border = 0;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            const data = null;
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border,
                format, type, data);

            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        }

        // Create and bind the framebuffer
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

        // make a depth buffer and the same size as the targetTexture
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        scene.drawNode(this.gl, viewProjectionMatrix, this.pickingProgramInfo);

        const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
        const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
        const data = new Uint8Array(4);
        gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            gl.RGBA,           // format
            gl.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        return id;
    }

}