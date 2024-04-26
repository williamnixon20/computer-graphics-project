"use client";

import { useEffect, useRef } from "react";
import TRS from "../webgl/utils/trs";

import { Node } from "../webgl/models/node";

import * as m4 from "../webgl/utils/m4";
import * as webglUtils from "../webgl/utils/webGlUtils";
import * as primitives from "../webgl/utils/primitives";
import { createVertexShader, createFragmentShader } from "@/webgl/utils/create-shader";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setupWebGL();
  }, []);

  function setupWebGL() {
    if (!canvasRef.current) {
      console.error("Canvas not found");
      return;
    }
    var gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 1);

    const vertexShader = createVertexShader(gl);
    const fragmentShader = createFragmentShader(gl);
    var programInfo = webglUtils.createProgramInfo(gl, [vertexShader, fragmentShader]);
    console.log(programInfo)

    function degToRad(d) {
      return d * Math.PI / 180;
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function emod(x, n) {
      return x >= 0 ? (x % n) : ((n - (-x % n)) % n);
    }

    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(60);
    var cameraHeight = 50;

    var objectsToDraw = [];
    var objects = [];
    var nodeInfosByName = {};

    // Let's make all the nodes
    var blockGuyNodeDescriptions =
    {
      name: "point between feet",
      draw: false,
      children: [
        {
          name: "waist",
          translation: [0, 3, 0],
          children: [
            {
              name: "torso",
              translation: [0, 2, 0],
              children: [
                {
                  name: "neck",
                  translation: [0, 1, 0],
                  children: [
                    {
                      name: "head",
                      translation: [0, 1, 0],
                    },
                  ],
                },
                {
                  name: "left-arm",
                  translation: [-1, 0, 0],
                  children: [
                    {
                      name: "left-forearm",
                      translation: [-1, 0, 0],
                      children: [
                        {
                          name: "left-hand",
                          translation: [-1, 0, 0],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "right-arm",
                  translation: [1, 0, 0],
                  children: [
                    {
                      name: "right-forearm",
                      translation: [1, 0, 0],
                      children: [
                        {
                          name: "right-hand",
                          translation: [1, 0, 0],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "left-leg",
              translation: [-1, -1, 0],
              children: [
                {
                  name: "left-calf",
                  translation: [0, -1, 0],
                  children: [
                    {
                      name: "left-foot",
                      translation: [0, -1, 0],
                    },
                  ],
                }
              ],
            },
            {
              name: "right-leg",
              translation: [1, -1, 0],
              children: [
                {
                  name: "right-calf",
                  translation: [0, -1, 0],
                  children: [
                    {
                      name: "right-foot",
                      translation: [0, -1, 0],
                    },
                  ],
                }
              ],
            },
          ],
        },
      ],
    };

    function makeNode(nodeDescription) {
      var trs = new TRS();
      var node = new Node(trs);
      nodeInfosByName[nodeDescription.name] = {
        trs: trs,
        node: node,
      };
      trs.translation = nodeDescription.translation || trs.translation;
      if (nodeDescription.draw !== false) {
        node.drawInfo = {
          uniforms: {
            u_colorOffset: [0, 0, 0.6, 0],
            u_colorMult: [0.4, 0.4, 0.4, 1],
          },
          programInfo: programInfo,
          bufferInfo: cubeBufferInfo,
        };
        objectsToDraw.push(node.drawInfo);
        objects.push(node);
      }
      makeNodes(nodeDescription.children).forEach(function (child) {
        child.setParent(node);
      });
      return node;
    }

    function makeNodes(nodeDescriptions) {
      return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
    }

    var scene = makeNode(blockGuyNodeDescriptions);
    console.log(scene)

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(time) {
      if (!gl) {
        return;
      }
      time *= 0.001;

      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Compute the projection matrix
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

      // Compute the camera's matrix using look at.
      var cameraPosition = [4, 3.5, 10];
      var target = [0, 3.5, 0];
      var up = [0, 1, 0];
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);

      // Make a view matrix from the camera matrix.
      var viewMatrix = m4.inverse(cameraMatrix);

      var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

      // Draw objects

      // Update all world matrices in the scene graph
      scene.updateWorldMatrix();

      var adjust;
      var speed = 3;
      var c = time * speed;
      adjust = Math.abs(Math.sin(c));
      nodeInfosByName["point between feet"].trs.translation[1] = adjust;
      adjust = Math.sin(c);
      nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
      nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
      adjust = Math.sin(c + 0.1) * 0.4;
      nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
      nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
      adjust = Math.sin(c + 0.1) * 0.4;
      nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
      nodeInfosByName["right-foot"].trs.rotation[0] = adjust;

      adjust = Math.sin(c) * 0.4;
      nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
      nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
      adjust = Math.sin(c + 0.1) * 0.4;
      nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
      nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
      adjust = Math.sin(c - 0.1) * 0.4;
      nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
      nodeInfosByName["right-hand"].trs.rotation[2] = adjust;

      adjust = Math.sin(c) * 0.4;
      nodeInfosByName["waist"].trs.rotation[1] = adjust;
      adjust = Math.sin(c) * 0.4;
      nodeInfosByName["torso"].trs.rotation[1] = adjust;
      adjust = Math.sin(c + 0.25) * 0.4;
      nodeInfosByName["neck"].trs.rotation[1] = adjust;
      adjust = Math.sin(c + 0.5) * 0.4;
      nodeInfosByName["head"].trs.rotation[1] = adjust;
      adjust = Math.cos(c * 2) * 0.4;
      nodeInfosByName["head"].trs.rotation[0] = adjust;

      // Compute all the matrices for rendering
      objects.forEach(function (object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
      });

      // ------ Draw the objects --------

      var lastUsedProgramInfo = null;
      var lastUsedBufferInfo = null;

      objectsToDraw.forEach(function (object) {
        var programInfo = object.programInfo;
        var bufferInfo = object.bufferInfo;
        var bindBuffers = false;
        console.log("GL NOW" + gl)

        if (programInfo !== lastUsedProgramInfo) {
          lastUsedProgramInfo = programInfo;
          gl.useProgram(programInfo.program);

          // We have to rebind buffers when changing programs because we
          // only bind buffers the program uses. So if 2 programs use the same
          // bufferInfo but the 1st one uses only positions the when the
          // we switch to the 2nd one some of the attributes will not be on.
          bindBuffers = true;
        }

        // Setup all the needed attributes.
        if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
          lastUsedBufferInfo = bufferInfo;
          webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        }

        // Set the uniforms.
        webglUtils.setUniforms(programInfo, object.uniforms);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
      });

      requestAnimationFrame(drawScene);
    }

  }

  return (
    <>
      <div className="w-full h-full max-h-screen overflow-auto">
        <canvas
          ref={canvasRef}
          id="webgl-canvas"
          className="w-[1920px] h-[1080px] bg-gray-200"
        />
      </div>
    </>
  );
}
