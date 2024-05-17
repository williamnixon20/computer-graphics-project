"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
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
import { degToRad } from "@/webgl/utils/radians";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraInformation, setCameraInformation] = useState<CameraInformation>(
    {
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
    }
  );
  const [refDict, setRefDict] = useState<{ [key: string]: any }>({});
  let [drawer, setDrawer] = useState<Drawer>();
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

    let drawerLoc = null;
    if (!drawer) {
      drawerLoc = new Drawer(gl);
      setDrawer(drawerLoc);
      drawer = drawerLoc;
    }
    let scene = null;
    let refNode = {};
    scene = new Node().buildByDescription(jsonToDraw);
    const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
    scene.setAmbientColor(arr_color.concat([1]));

    scene.procedureGetNodeRefDict(refNode);

    setScene(scene);
    setRefDict(refNode);

    drawer.draw(scene, cameraInformation);
  }

  useEffect(() => {
    if (scene) {
      const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
      scene.setAmbientColor(arr_color.concat([1]));
      console.log(arr_color);
      drawer?.draw(scene, cameraInformation);
    }
  }, [color]);

  useEffect(() => {
    updateShading();
    console.log("update");
    if (scene) drawer?.draw(scene, cameraInformation);
  }, [shading, shininess, specular, diffuse, bumpTexture, cameraInformation]);

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
      drawer?.draw(scene, cameraInformation);
    }
  };

  const handleFieldOfViewChange = (fieldOfView: number) => {
    // const newCameraInfo = {...cameraInformation}
    // newCameraInfo.fieldOfViewRadians = fieldOfView
    // setCameraInformation(newCameraInfo)

    // animate purposes
    cameraInformation.fieldOfViewRadians = fieldOfView;
    if (scene) {
      drawer?.draw(scene, cameraInformation);
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
                // cameraInformation.projType === "perspective"  ?
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
    const rect = canvasRef.current?.getBoundingClientRect() as DOMRect;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let pickId = drawer?.getPickingId(mouseX, mouseY);
    if (pickId) {
      resetTransforms();
      let selectedNode = scene?.getById(pickId);
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
      // console.log(cameraInformation.cameraAngleXRadians)
      const deltaX = mouseDownInformation.startX - e.nativeEvent.offsetX;
      const deltaY = mouseDownInformation.startY - e.nativeEvent.offsetY;

      if (isShiftPressed) {
        const newX = cameraInformation.rotateX + degToRad(deltaX / 10);
        const newY = cameraInformation.rotateY + degToRad(deltaY / 10);
        cameraInformation.rotateX = newX;
        cameraInformation.rotateY = newY;
      } else {
        const newX = cameraInformation.cameraAngleXRadians + degToRad(deltaX);
        const newY = cameraInformation.cameraAngleYRadians + degToRad(deltaY);

        cameraInformation.cameraAngleXRadians = newX;
        cameraInformation.cameraAngleYRadians =
          newY < degToRad(88) && newY > degToRad(-88)
            ? newY
            : cameraInformation.cameraAngleYRadians;
      }

      mouseDownInformation.isDown = true;
      mouseDownInformation.startX = e.nativeEvent.offsetX;
      mouseDownInformation.startY = e.nativeEvent.offsetY;

      if (scene) {
        drawer?.draw(scene, cameraInformation);
      }
    }
  }

  function handleScroll(e: React.WheelEvent<HTMLCanvasElement>) {
    if (e.deltaY < 0) {
      // make sure the radius is not a negative value
      if (
        cameraInformation.radius - 5 * (cameraInformation.radius / 10) >
        0.1
      ) {
        cameraInformation.radius =
          cameraInformation.radius - 5 * (cameraInformation.radius / 100);
      }
    } else {
      // console.log("Zoom out");
      cameraInformation.radius =
        cameraInformation.radius + 5 * (cameraInformation.radius / 100);
    }
    if (scene) {
      drawer?.draw(scene, cameraInformation);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const { key } = e;
    // console.log(key)

    if (key === "Shift") {
      cameraInformation.radiusRotate = cameraInformation.radius;
      setIsShiftPressed(true);
    }

    if (key === "w" || key === "a" || key === "s" || key === "d") {
      if (key === "w") {
        cameraInformation.translateY += 2 * (cameraInformation.radius / 100);
      } else if (key === "a") {
        cameraInformation.translateX -= 2 * (cameraInformation.radius / 100);
      } else if (key === "s") {
        cameraInformation.translateY -= 2 * (cameraInformation.radius / 100);
      } else {
        cameraInformation.translateX += 2 * (cameraInformation.radius / 100);
      }

      if (scene) {
        drawer?.draw(scene, cameraInformation);
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
    drawer?.draw(scene, cameraInformation);

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
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleScroll}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
          id="webgl-canvas"
          className="w-full h-full bg-white"
        />
      </div>
      <div className="flex flex-col h-full rounded-md bg-gray-black p-4 w-72">
        <label className="text-base font-semibold text-white mb-2">
          Camera:
        </label>
        <button
          onClick={() => {
            cameraInformation.cameraAngleXRadians = degToRad(0);
            cameraInformation.cameraAngleYRadians = degToRad(0);
            cameraInformation.fieldOfViewRadians = degToRad(60);
            cameraInformation.radius = 10;
            cameraInformation.projType = "perspective";
            cameraInformation.translateX = 0;
            cameraInformation.translateY = 0;
            cameraInformation.rotateX = 0;
            cameraInformation.rotateY = 0;
            cameraInformation.radiusRotate = 10;

            if (scene) {
              drawer?.draw(scene, cameraInformation);
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
              cameraInformation.projType = newValue
            }}
            value={cameraInformation.projType}
          >
            <option value="perspective">Perspective</option>
            <option value="orthographic">Orthographic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>
        {cameraInformation.projType === "perspective" && (
          <>
            <label className="text-base font-semibold text-white mb-2">
              Choose FOV:
            </label>
            <input
              type="range"
              min="0"
              defaultValue={"60"}
              max="180"
              onChange={(e) =>
                handleFieldOfViewChange(degToRad(parseFloat(e.target.value)))
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

          <div className="mb-4 flex flex-row justify-between">
            <label className="text-base font-semibold text-white mr-2">
              Reverse
            </label>
            <input
              type="checkbox"
              checked={reverse}
              onChange={(e) => setReverse(e.target.checked)}
            />
          </div>

          <div className="mb-4 flex flex-row justify-between">
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
        <div className="mb-4 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Grayscale Postprocess
          </label>
          <input
            type="checkbox"
            checked={postProcess}
            onChange={(e) => {
              setPostprocess(e.target.checked);
              drawer?.setPostprocess(e.target.checked);
              if (scene) drawer?.draw(scene, cameraInformation);
            }}
          ></input>
        </div>
        <div className="mb-4 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Hollow Object:
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
              setupWebGL();
            }}
          ></input>
        </div>
        <div className="mb-4 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Shading
          </label>
          <input
            type="checkbox"
            checked={shading}
            onChange={(e) => setShading(e.target.checked)}
          ></input>
        </div>
        <div className="mb-4 flex flex-row justify-between">
          <label className="text-base font-semibold text-white mr-2">
            Color:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          ></input>
        </div>
        {shading && (
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-white mb-2">
              Shininess:
              <input
                type="range"
                min={1}
                max={120}
                value={shininess}
                onChange={(e) => setShininess(parseInt(e.target.value))}
              />
            </label>
            <label className="text-base font-semibold text-white mb-2">
              Specular:
              <input
                type="color"
                value={specular}
                onChange={(e) => setSpecular(e.target.value)}
              />
            </label>
            <label className="text-base font-semibold text-white mb-2">
              Diffuse:
              <input
                type="color"
                value={diffuse}
                onChange={(e) => setDiffuse(e.target.value)}
              />
            </label>
            <label className="text-base font-semibold text-white mb-2">
              Bump Texture:
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setBumpTexture(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>
      <div>
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
      {selectedName && (
        <div className="px-3">
          <p className="font-semibold">Transforms</p>
          {Object.entries({
            translate: "Translate",
            scale: "Scale",
            rotate: "Rotate",
          }).map(([type, label]) =>
            renderSliders(type as keyof Transforms, label)
          )}
        </div>
      )}
    </>
  );
}
