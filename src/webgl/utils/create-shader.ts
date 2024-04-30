import vertexShaderSource from "raw-loader!../shaders/vertex-shaders-3d.glsl";
import fragmentShaderSource from "raw-loader!../shaders/fragment-shaders-3d.glsl";

import vertexShaderPickingSource from "raw-loader!../shaders/picking/vertex-shaders-picking.glsl";
import fragmentShaderPickingSource from "raw-loader!../shaders/picking/fragment-shaders-picking.glsl";

import vertexPostProcessShader from "raw-loader!../shaders/postprocess/vertex-shaders-post.glsl";
import fragmentPostProcessShader from "raw-loader!../shaders/postprocess/fragment-shaders-post.glsl";

export function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
) {
    let shader = gl.createShader(type);

    if (!shader) {
        throw new Error("Could not create WebGL shader");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export function createVertexShader(gl: WebGLRenderingContext) {
    return createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
}

export function createFragmentShader(gl: WebGLRenderingContext) {
    return createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
}

export function createVertexShaderPicking(gl: WebGLRenderingContext) {
    return createShader(gl, gl.VERTEX_SHADER, vertexShaderPickingSource);
}

export function createFragmentShaderPicking(gl: WebGLRenderingContext) {
    return createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderPickingSource);
}

export function createVertexPostProcessShader(gl: WebGLRenderingContext) {
    return createShader(gl, gl.VERTEX_SHADER, vertexPostProcessShader);
}

export function createFragmentPostProcessShader(gl: WebGLRenderingContext) {
    return createShader(gl, gl.FRAGMENT_SHADER, fragmentPostProcessShader);
}