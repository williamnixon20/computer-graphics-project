"use client";

import { KeyboardEvent, RefObject, useEffect, useRef, useState } from "react";
import TRS from "../webgl/utils/trs";
import { AnimationRunner } from "@/webgl/utils/animation";

// @ts-ignore
import { Node } from "../webgl/models/Node";

import * as m4 from "../webgl/utils/m4";
import * as webglUtils from "../webgl/utils/webGlUtils";
import * as primitives from "../webgl/utils/primitives";
import { Drawer } from "@/webgl/drawer";
import { cubeHollow } from "./cube-hollow";
import {
  ArticulatedDescriptions,
  CameraInformation,
  HollowDescriptions,
  Transforms,
} from "./type";
import { degToRad, radToDeg } from "@/webgl/utils/radians";

var blockGuyNodeDescriptions: ArticulatedDescriptions = {
  type: "articulated",
  name: "point between feet",
  draw: false,
  children: [
    {
      name: "waist",
      translation: [0, 0, 0],
      rotation: [0, 1, 0],
      scale: [1, 1, 1],
      children: [
        {
          name: "test front",
          translation: [6, 0, 0],
        },
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
                  translation: [0, 1, 1], // head slightly forward to differentiate front and back side of the obj
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
            },
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
            },
          ],
        },
      ],
    },
  ],
};

var jsonToDraw: ArticulatedDescriptions | HollowDescriptions =
  blockGuyNodeDescriptions;
export default function Canvas() {
  const [selectedName, setSelectedName] = useState<string | null | undefined>();
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  const [cameraInformation1, setCameraInformation1] =
    useState<CameraInformation>({
      cameraAngleXRadians: degToRad(0),
      cameraAngleYRadians: degToRad(0),
      fieldOfViewRadians: degToRad(60),
      radius: 10,
      projType: "perspective",
      translateX: 0,
      translateY: 0,
      rotateX: degToRad(0),
      rotateY: degToRad(0),
      radiusRotate: 10,
    });
  const [cameraInformation2, setCameraInformation2] =
    useState<CameraInformation>({
      cameraAngleXRadians: degToRad(0),
      cameraAngleYRadians: degToRad(0),
      fieldOfViewRadians: degToRad(60),
      radius: 10,
      projType: "perspective",
      translateX: 0,
      translateY: 0,
      rotateX: degToRad(0),
      rotateY: degToRad(0),
      radiusRotate: 10,
    });
  const [refDict, setRefDict] = useState<{ [key: string]: any }>({});
  let [drawer1, setDrawer1] = useState<Drawer>();
  let [drawer2, setDrawer2] = useState<Drawer>();
  const [scene, setScene] = useState<Node>();
  const [hollow, setHollow] = useState(false);
  const [postProcess, setPostprocess] = useState(false);
  const [transforms, setTransforms] = useState<Transforms>({
    translate: { x: 0, y: 0, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
    rotate: { x: 0, y: 0, z: 0 },
  });
  const [mouseDownInformation, setMouseDownInformation] = useState<{
    isDown: boolean;
    startX: number | undefined;
    startY: number | undefined;
  }>({ isDown: false, startX: undefined, startY: undefined });
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Shading
  const [shading, setShading] = useState(false);
  const [color, setColor] = useState("#000099");
  const [shininess, setShininess] = useState<number>(80);
  const [specular, setSpecular] = useState<string>("#ffffff");
  const [diffuse, setDiffuse] = useState<string>("#6464FF");
  const [bumpTexture, setBumpTexture] = useState<string>("");

  const hexToRGBAArray = (hex: string, alpha: number): number[] => {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    if (
      alpha === undefined ||
      isNaN(alpha) ||
      alpha < 0 ||
      alpha > 1 ||
      alpha === 1
    ) {
      alpha = 255;
    }

    return [r, g, b, alpha];
  };
  const normalizeRGB = (rgb: number[]): number[] => {
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  };

  useEffect(() => {
    setupWebGL(0, canvas1Ref);
    setupWebGL(1, canvas2Ref);
  }, []);

  function setupWebGL(
    canvasId: number,
    canvasRef: RefObject<HTMLCanvasElement>
  ) {
    if (!canvasRef.current) {
      console.error("Canvas not found");
      return;
    }
    var gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let drawerLoc = null;
    if (!drawer1 && canvasId === 0) {
      drawerLoc = new Drawer(gl);
      setDrawer1(drawerLoc);
      drawer1 = drawerLoc;
    }
    if (!drawer2 && canvasId === 1) {
      drawerLoc = new Drawer(gl);
      setDrawer2(drawerLoc);
      drawer2 = drawerLoc;
    }
    if (scene !== undefined) {
      return;
    }
    let newScene = null;
    let refNode = {};
    newScene = new Node().buildByDescription(jsonToDraw);
    const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
    newScene.setAmbientColor(arr_color.concat([1]));

    newScene.procedureGetNodeRefDict(refNode);

    setScene(newScene);
    setRefDict(refNode);

    if (canvasId === 0 && drawer1) {
      drawer1.draw(newScene, cameraInformation1);
    } else if (canvasId === 1 && drawer2) {
      drawer2.draw(newScene, cameraInformation2);
    }
  }

  useEffect(() => {
    if (scene) {
      const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
      scene.setAmbientColor(arr_color.concat([1]));
      console.log(arr_color);
      drawer1?.draw(scene, cameraInformation1);
      drawer2?.draw(scene, cameraInformation2);
    }
  }, [color]);

  useEffect(() => {
    updateShading();
    console.log("update");
    if (scene) {
      drawer1?.draw(scene, cameraInformation1);
      drawer2?.draw(scene, cameraInformation2);
    }
  }, [shading, shininess, specular, diffuse, bumpTexture]);

  const updateShading = () => {
    if (scene) {
      scene.setShadingMode(shading ? 1 : 0);
      scene.setShininess(shininess);
      const diffuseColor = normalizeRGB(hexToRGBAArray(diffuse, 1));
      scene.setDiffuseColor(diffuseColor);
      const specularColor = normalizeRGB(hexToRGBAArray(specular, 1));
      scene.setSpecularColor(specularColor);
    }
  };

  const handleTransformChange = (
    type: keyof Transforms,
    axis: string,
    value: string
  ) => {
    let newTransforms = {
      ...transforms,
      [type]: {
        ...transforms[type],
        [axis]: Number(value),
      },
    };
    setTransforms(newTransforms);
    if (selectedName) {
      (refDict[selectedName].node as Node).addTransform(newTransforms);
    }
    if (scene) {
      drawer1?.draw(scene, cameraInformation1);
      drawer2?.draw(scene, cameraInformation2);
    }
  };

  const handleFieldOfViewChange = (canvasId: number, fieldOfView: number) => {
    let cameraInfo;
    const drawer = canvasId === 0 ? drawer1 : drawer2;
    if (animate) {
      cameraInfo = canvasId === 0 ? cameraInformation1 : cameraInformation2;
      cameraInfo.fieldOfViewRadians = fieldOfView;
    } else {
      cameraInfo = {
        ...(canvasId === 0 ? cameraInformation1 : cameraInformation2),
      };
      cameraInfo.fieldOfViewRadians = fieldOfView;
      if (canvasId === 0) {
        setCameraInformation1(cameraInfo);
      } else {
        setCameraInformation2(cameraInfo);
      }
    }
    if (scene) {
      drawer?.draw(scene, cameraInfo);
    }
  };

  const resetTransforms = () => {
    setTransforms({
      translate: { x: 0, y: 0, z: 0 },
      scale: { x: 0, y: 0, z: 0 },
      rotate: { x: 0, y: 0, z: 0 },
    });
  };

  const renderSliders = (type: keyof Transforms, label: string) => {
    return (
      <div key={type} className="mt-2">
        <p>{label}:</p>
        {["x", "y", "z"].map((axis) => (
          <div key={"div-" + axis} className="flex flex-row">
            <p key={"p-" + axis} className="mr-2 ml-1">
              {axis}
            </p>
            <input
              key={"input-" + axis}
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={
                transforms[type][
                  axis as keyof Transforms["translate"]
                ] as number
              }
              onChange={(e) =>
                // cameraInformation1.projType === "perspective"  ?
                //     handleTransformChange(type, axis, e.target.value) :
                handleTransformChange(type, axis, e.target.value)
              }
            />
          </div>
        ))}
      </div>
    );
  };

  function handleMouseDown(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    mouseDownInformation.isDown = true;
    mouseDownInformation.startX = e.nativeEvent.offsetX;
    mouseDownInformation.startY = e.nativeEvent.offsetY;

    // console.log("Mouse down", e.clientX, e.clientY);
    const rect = canvas1Ref.current?.getBoundingClientRect() as DOMRect;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let pickId1 = drawer1?.getPickingId(mouseX, mouseY);
    let pickId2 = drawer2?.getPickingId(mouseX, mouseY);

    if (pickId1) {
      resetTransforms();
      let selectedNode = scene?.getById(pickId1);
      console.log("position: ", selectedNode?.arrayInfo);
      setSelectedName(selectedNode?.name);
    } else if (pickId2) {
      resetTransforms();
      let selectedNode = scene?.getById(pickId2);
      console.log("position: ", selectedNode?.arrayInfo);
      setSelectedName(selectedNode?.name);
    }
  }

  function handleMouseUp(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    mouseDownInformation.isDown = false;
    mouseDownInformation.startX = undefined;
    mouseDownInformation.startY = undefined;
  }

  function handleMouseMove(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    if (
      mouseDownInformation.isDown &&
      mouseDownInformation.startX &&
      mouseDownInformation.startY &&
      // real ugly hacks to improve performance by reducing the number of drawing per mouse move
      // e.nativeEvent.offsetX % 2 === 0 &&
      e.nativeEvent.offsetY % 2 === 0
    ) {
      // console.log(cameraInformation1.cameraAngleXRadians)
      const deltaX = mouseDownInformation.startX - e.nativeEvent.offsetX;
      const deltaY = mouseDownInformation.startY - e.nativeEvent.offsetY;

      if (isShiftPressed) {
        const newX = cameraInformation1.rotateX + degToRad(deltaX / 10);
        const newY = cameraInformation1.rotateY + degToRad(deltaY / 10);
        cameraInformation1.rotateX = newX;
        cameraInformation1.rotateY = newY;
      } else {
        const newX = cameraInformation1.cameraAngleXRadians + degToRad(deltaX);
        const newY = cameraInformation1.cameraAngleYRadians + degToRad(deltaY);

        cameraInformation1.cameraAngleXRadians = newX;
        cameraInformation1.cameraAngleYRadians =
          newY < degToRad(88) && newY > degToRad(-88)
            ? newY
            : cameraInformation1.cameraAngleYRadians;
      }

      mouseDownInformation.isDown = true;
      mouseDownInformation.startX = e.nativeEvent.offsetX;
      mouseDownInformation.startY = e.nativeEvent.offsetY;

      if (scene) {
        drawer1?.draw(scene, cameraInformation1);
        drawer2?.draw(scene, cameraInformation2);
      }
    }
  }

  function handleScroll(
    canvasId: number,
    e: React.WheelEvent<HTMLCanvasElement>
  ) {
    if (scene === undefined) {
      return;
    }
    if (canvasId === 0) {
      if (e.deltaY < 0) {
        // make sure the radius is not a negative value
        if (
          cameraInformation1.radius - 5 * (cameraInformation1.radius / 10) >
          0.1
        ) {
          cameraInformation1.radius =
            cameraInformation1.radius - 5 * (cameraInformation1.radius / 100);
        }
      } else {
        // console.log("Zoom out");
        cameraInformation1.radius =
          cameraInformation1.radius + 5 * (cameraInformation1.radius / 100);
      }
      drawer1?.draw(scene, cameraInformation1);
    } else if (canvasId === 1) {
      if (e.deltaY < 0) {
        // make sure the radius is not a negative value
        if (
          cameraInformation2.radius - 5 * (cameraInformation2.radius / 10) >
          0.1
        ) {
          cameraInformation2.radius =
            cameraInformation2.radius - 5 * (cameraInformation2.radius / 100);
        }
      } else {
        // console.log("Zoom out");
        cameraInformation2.radius =
          cameraInformation2.radius + 5 * (cameraInformation2.radius / 100);
      }
      drawer2?.draw(scene, cameraInformation2);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const { key } = e;
    // console.log(key)

    if (key === "Shift") {
      cameraInformation1.radiusRotate = cameraInformation1.radius;
      setIsShiftPressed(true);
    }

    if (key === "w" || key === "a" || key === "s" || key === "d") {
      if (key === "w") {
        cameraInformation1.translateY += 2 * (cameraInformation1.radius / 100);
      } else if (key === "a") {
        cameraInformation1.translateX -= 2 * (cameraInformation1.radius / 100);
      } else if (key === "s") {
        cameraInformation1.translateY -= 2 * (cameraInformation1.radius / 100);
      } else {
        cameraInformation1.translateX += 2 * (cameraInformation1.radius / 100);
      }

      if (scene) {
        drawer1?.draw(scene, cameraInformation1);
        drawer2?.draw(scene, cameraInformation2);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const { key } = e;

    if (key === "Shift") {
      setIsShiftPressed(false);
    }
  };

  // Animation
  const [animate, setAnimate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [autoReplay, setAutoReplay] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  let walkAnim: AnimationRunner = new AnimationRunner(scene!, 60);
  let lastFrameTime: number | undefined;
  let animationFrameId: number;

  function runAnim(currentTime: number) {
    if (!animate || !scene) return;

    if (lastFrameTime === undefined) lastFrameTime = currentTime;
    const deltaSecond = (currentTime - lastFrameTime) / 1000;

    walkAnim!.update(deltaSecond);
    setCurrentFrame(walkAnim.CurrentFrame);
    drawer1?.draw(scene, cameraInformation1);
    drawer2?.draw(scene, cameraInformation2);

    lastFrameTime = currentTime;
    animationFrameId = requestAnimationFrame(runAnim);
  }

  useEffect(() => {
    if (animate) {
      console.log("Animation started");
      walkAnim.start();
      animationFrameId = requestAnimationFrame(runAnim);
    } else {
      console.log("Animation stopped");
      walkAnim.stop();
      cancelAnimationFrame(animationFrameId);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [animate]);

  return (
    <>
      <div className="w-full h-screen overflow-auto">
        <canvas
          ref={canvas1Ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={(e) => handleScroll(0, e)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
          id="webgl-canvas"
          className="w-full h-1/2 bg-white border-b-2 border-b-black rounded-none"
        />
        <canvas
          ref={canvas2Ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={(e) => handleScroll(1, e)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
          id="webgl-canvas"
          className="w-full h-1/2 bg-white"
        />
      </div>
      <div className="flex flex-col h-screen bg-gray-black p-4 w-80 border-r-2 border-r-blue-500 max-h-screen overflow-y-auto scrollbar-hide">
        <label className="text-base font-semibold text-white mb-2">
          Camera 1:
        </label>
        <button
          onClick={() => {
            let cameraInfo;
            if (animate) {
              cameraInfo = cameraInformation1;
            } else {
              cameraInfo = { ...cameraInformation1 };
            }
            cameraInfo.cameraAngleXRadians = degToRad(0);
            cameraInfo.cameraAngleYRadians = degToRad(0);
            cameraInfo.fieldOfViewRadians = degToRad(60);
            cameraInfo.radius = 10;
            cameraInfo.projType = "perspective";
            cameraInfo.translateX = 0;
            cameraInfo.translateY = 0;
            cameraInfo.rotateX = 0;
            cameraInfo.rotateY = 0;
            cameraInfo.radiusRotate = 10;

            if (!animate) {
              setCameraInformation1(cameraInfo);
            }

            if (scene) {
              drawer1?.draw(scene, cameraInfo);
            }
          }}
          className="w-full mb-4 bg-blue-500 text-white py-2"
        >
          Reset camera
        </button>
        <div className="text-base font-semibold text-black mb-2">
          <select
            onChange={(e) => {
              const newValue = e.target.value;
              if (animate) {
                cameraInformation1.projType = newValue;
                if (scene) {
                  drawer1?.draw(scene, cameraInformation1);
                }
              } else {
                const newVal = { ...cameraInformation1 };
                newVal.projType = newValue;
                setCameraInformation1(newVal);
                if (scene) {
                  drawer1?.draw(scene, newVal);
                }
              }
            }}
            value={cameraInformation1.projType}
          >
            <option value="perspective">Perspective</option>
            <option value="orthographic">Orthographic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>
        {cameraInformation1.projType === "perspective" && (
          <>
            <label className="text-base font-semibold text-white mb-2">
              Choose FOV:
            </label>
            <input
              type="range"
              min="0"
              defaultValue={"60"}
              value={radToDeg(cameraInformation1.fieldOfViewRadians)}
              max="180"
              onChange={(e) =>
                handleFieldOfViewChange(0, degToRad(parseFloat(e.target.value)))
              }
              className="w-full"
            />
          </>
        )}
        <label className="text-base font-semibold text-white mb-2">
          Camera 2:
        </label>
        <button
          onClick={() => {
            let cameraInfo;
            if (animate) {
              cameraInfo = cameraInformation2;
            } else {
              cameraInfo = { ...cameraInformation2 };
            }
            cameraInfo.cameraAngleXRadians = degToRad(0);
            cameraInfo.cameraAngleYRadians = degToRad(0);
            cameraInfo.fieldOfViewRadians = degToRad(60);
            cameraInfo.radius = 10;
            cameraInfo.projType = "perspective";
            cameraInfo.translateX = 0;
            cameraInfo.translateY = 0;
            cameraInfo.rotateX = 0;
            cameraInfo.rotateY = 0;
            cameraInfo.radiusRotate = 10;

            if (!animate) {
              setCameraInformation2(cameraInfo);
            }

            if (scene) {
              drawer2?.draw(scene, cameraInfo);
            }
          }}
          className="w-full mb-4 bg-blue-500 text-white py-2"
        >
          Reset camera
        </button>
        <div className="text-base font-semibold text-black mb-2">
          <select
            onChange={(e) => {
              const newValue = e.target.value;
              cameraInformation2.projType = newValue;
              if (scene) {
                drawer2?.draw(scene, cameraInformation2);
              }
            }}
            value={cameraInformation2.projType}
          >
            <option value="perspective">Perspective</option>
            <option value="orthographic">Orthographic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>
        {cameraInformation2.projType === "perspective" && (
          <>
            <label className="text-base font-semibold text-white mb-2">
              Choose FOV:
            </label>
            <input
              type="range"
              min="0"
              defaultValue={"60"}
              value={radToDeg(cameraInformation2.fieldOfViewRadians)}
              max="180"
              onChange={(e) =>
                handleFieldOfViewChange(1, degToRad(parseFloat(e.target.value)))
              }
              className="w-full"
            />
          </>
        )}

        <div>
          <div className="mb-4">
            <span className="text-sm font-semibold text-white">
              Current Frame: {currentFrame}
            </span>
            <span className="text-base font-semibold text-white">
              / {walkAnim!.length || 0}
            </span>
          </div>

          <button
            onClick={() => setAnimate(!animate)}
            className="w-full mb-4 bg-blue-500 text-white py-2"
          >
            {animate ? "Pause" : "Play"}
          </button>

          <div className="mb-2 flex flex-row justify-between">
            <label className="text-base font-semibold text-white mr-2">
              Reverse
            </label>
            <input
              type="checkbox"
              checked={reverse}
              onChange={(e) => setReverse(e.target.checked)}
            />
          </div>

          <div className="mb-2 flex flex-row justify-between">
            <label className="text-base font-semibold text-white mr-2">
              Auto-Replay
            </label>
            <input
              type="checkbox"
              checked={autoReplay}
              onChange={(e) => setAutoReplay(e.target.checked)}
            />
          </div>
        </div>
        <div className="mb-2 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Grayscale Postprocess
          </label>
          <input
            type="checkbox"
            checked={postProcess}
            onChange={(e) => {
              setPostprocess(e.target.checked);
              drawer1?.setPostprocess(e.target.checked);
              drawer2?.setPostprocess(e.target.checked);
              if (scene) {
                drawer1?.draw(scene, cameraInformation1);
                drawer2?.draw(scene, cameraInformation2);
              }
            }}
          ></input>
        </div>
        <div className="mb-2 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Hollow Object
          </label>
          <input
            type="checkbox"
            checked={hollow}
            onChange={(e) => {
              setHollow(e.target.checked);
              setSelectedName(null);
              jsonToDraw = e.target.checked
                ? (cubeHollow as HollowDescriptions)
                : blockGuyNodeDescriptions;
              setupWebGL(0, canvas1Ref);
              setupWebGL(1, canvas2Ref);
            }}
          ></input>
        </div>
        <div className="mb-2 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Shading
          </label>
          <input
            type="checkbox"
            checked={shading}
            onChange={(e) => setShading(e.target.checked)}
          ></input>
        </div>
        <div className="mb-2 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          ></input>
        </div>
        {shading && (
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-row justify-between">
              <label className="text-base font-semibold text-white mr-2">
                Shininess
              </label>
              <input
                type="range"
                min={1}
                max={120}
                value={shininess}
                onChange={(e) => setShininess(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-2 flex flex-row justify-between">
              <label className="text-base font-semibold text-white mr-2">
                Specular
              </label>
              <input
                type="color"
                value={specular}
                onChange={(e) => setSpecular(e.target.value)}
              />
            </div>
            <div className="mb-2 flex flex-row justify-between">
              <label className="text-base font-semibold text-white mr-2">
                Diffuse
              </label>
              <input
                type="color"
                value={diffuse}
                onChange={(e) => setDiffuse(e.target.value)}
              />
            </div>
            <div className="mb-2 flex flex-col justify-between">
              <label className="text-base font-semibold text-white mb-2">
                Bump Texture
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setBumpTexture(e.target.files[0].name);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="px-2 border-r-2 border-r-blue-500 h-screen min-w-36 p-4">
        <p className="font-semibold">Structure</p>
        {refDict &&
          Object.keys(refDict).map((name) => (
            <div key={name} style={{ marginLeft: refDict[name].level * 10 }}>
              <button
                onClick={() => {
                  setSelectedName(name);
                  resetTransforms();
                }}
                className={`${
                  selectedName === name ? "bg-teal-600" : "bg-blue-500"
                } p-1 text-sm`}
              >
                {name}
              </button>
            </div>
          ))}
      </div>
      <div className="p-4 min-w-44 h-screen">
        {selectedName && (
          <>
            <p className="font-semibold">Transforms</p>
            {Object.entries({
              translate: "Translate",
              scale: "Scale",
              rotate: "Rotate",
            }).map(([type, label]) =>
              renderSliders(type as keyof Transforms, label)
            )}
          </>
        )}
      </div>
    </>
  );
}
