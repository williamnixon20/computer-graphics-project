"use client";

import { useEffect, useRef, useState } from "react";
import TRS from "../webgl/utils/trs";

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

var blockGuyNodeDescriptions: ArticulatedDescriptions = {
  type: "articulated",
  name: "point between feet",
  draw: false,
  children: [
    {
      name: "waist",
      translation: [0, 3, 0],
      rotation: [0, 1, 0],
      scale: [1, 1, 1],
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

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

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
    }
  );
  const [animate, setAnimate] = useState(false);
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

  // Shading
  const [shading, setShading] = useState(false);
  const [color, setColor] = useState("#000099");
  const [shininess, setShininess] = useState<number>(0);
  const [specular, setSpecular] = useState<string>("#000000");
  const [diffuse, setDiffuse] = useState<string>("#000000");
  const [bumpTexture, setBumpTexture] = useState<string>('');

  const hexToRGBAArray = (hex: string, alpha: number): number[] => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }

    if (alpha === undefined || isNaN(alpha) || alpha < 0 || alpha > 1 || alpha === 1) {
        alpha = 255;
    }

    return [r, g, b, alpha];
  };


  useEffect(() => {
    setupWebGL();
  }, [color]);

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
    const arr_color = hexToRGBAArray(color, 1);
    scene = new Node().buildByDescription(jsonToDraw, arr_color);
    scene.procedureGetNodeRefDict(refNode);

    setScene(scene);
    setRefDict(refNode);

    drawer.draw(scene, cameraInformation);
  }

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
    setCameraInformation((oldState) => {
      const newState = { ...oldState };
      newState.fieldOfViewRadians = fieldOfView;
      if (scene) {
        drawer?.draw(scene, newState);
      }
      return newState;
    });
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
      <div key={type}>
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
    setMouseDownInformation({
      isDown: true,
      startX: e.nativeEvent.offsetX,
      startY: e.nativeEvent.offsetY,
    });
    // console.log("Mouse down", e.clientX, e.clientY);
    const rect = canvasRef.current?.getBoundingClientRect() as DOMRect;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let pickId = drawer?.getPickingId(mouseX, mouseY);
    if (pickId) {
      resetTransforms();
      let selectedNode = scene?.getById(pickId);
      setSelectedName(selectedNode?.name);
    }
  }

  function handleMouseUp(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    setMouseDownInformation({
      isDown: false,
      startX: undefined,
      startY: undefined,
    });
  }

  function handleMouseMove(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    if (
      mouseDownInformation.isDown &&
      mouseDownInformation.startX &&
      mouseDownInformation.startY &&

      // real ugly hacks to improve performance by reducing the number of drawing per mouse move
      e.nativeEvent.offsetX % 2 === 0 &&
      e.nativeEvent.offsetY % 2 === 0
    ) {
      // console.log(cameraInformation.cameraAngleXRadians)
      const deltaX = mouseDownInformation.startX - e.nativeEvent.offsetX;
      const deltaY = mouseDownInformation.startY - e.nativeEvent.offsetY;

      const newX = cameraInformation.cameraAngleXRadians + degToRad(deltaX);
      const newY = cameraInformation.cameraAngleYRadians + degToRad(deltaY);

      const newCameraInformation = { ...cameraInformation };
      newCameraInformation.cameraAngleXRadians = newX;
      newCameraInformation.cameraAngleYRadians = newY < degToRad(90) && newY > degToRad(-90) ? newY : newCameraInformation.cameraAngleYRadians;

      setCameraInformation(newCameraInformation);
      const newMouseDownInformation = {
        isDown: true,
        startX: e.nativeEvent.offsetX,
        startY: e.nativeEvent.offsetY,
      };
      setMouseDownInformation(newMouseDownInformation);

      if (scene) {
        drawer?.draw(scene, newCameraInformation);
      }
    }
  }

  function handleScroll(e: React.WheelEvent<HTMLCanvasElement>) {
    setCameraInformation((oldState) => {
      const newState = { ...oldState };

      if (e.deltaY < 0) {
        // console.log("Zoom in");
        // make sure the radius is not a negative value
        if (oldState.radius - 1 * (oldState.radius / 100) > 0.1) {
          newState.radius = oldState.radius - 2 * (oldState.radius / 100);
        }
      } else {
        // console.log("Zoom out");
        newState.radius = oldState.radius + 2 * (oldState.radius / 100);
      }
      if (scene) {
        drawer?.draw(scene, newState);
      }
      return newState;
    });
  }

  return (
    <>
      <div className="w-full h-full max-h-screen overflow-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleScroll}
          id="webgl-canvas"
          className="w-[720px] h-[720px] bg-white"
        />
      </div>
      <div className="flex flex-col h-full rounded-md bg-gray-black p-4">
        <label className="text-base font-semibold text-white mb-2">
          Camera: <br></br>Choose FOV:
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
        <label className="text-base font-semibold text-white mb-2">
          Turn on animation:
        </label>
        <input
          type="checkbox"
          checked={animate}
          onChange={(e) => setAnimate(e.target.checked)}
          className="w-full"
        ></input>
        <label className="text-base font-semibold text-white mb-2">
          Grayscale Postprocess:
        </label>
        <input
          type="checkbox"
          checked={postProcess}
          onChange={(e) => {
            setPostprocess(e.target.checked);
            drawer?.setPostprocess(e.target.checked);
            if (scene) drawer?.draw(scene, cameraInformation);
          }}
          className="w-full"
        ></input>
        <label className="text-base font-semibold text-white mb-2">
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
          className="w-full"
        ></input>
         <label className="text-base font-semibold text-white mb-2">
          Shading:
        </label>
        <input
        type="checkbox"
        checked={shading}
        onChange={(e) =>
          setShading(e.target.checked)
        }>
        </input>
        <label className="text-base font-semibold text-white mb-2">
          Color:
        </label>
        <input
        type="color"
        value={color}
        onChange={(e) =>
          setColor(e.target.value)
        }>  
        </input>
        {shading && (
        <div>
          <label className="text-base font-semibold text-white mb-2">
            Shininess:
            <input
              type="range"
              min={0}
              max={100}
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
        {refDict &&
          Object.keys(refDict).map((name) => (
            <div key={name} style={{ marginLeft: refDict[name].level * 10 }}>
              <button
                onClick={() => {
                  setSelectedName(name);
                  resetTransforms();
                }}
                style={{
                  backgroundColor: selectedName === name ? "gray" : "blue",
                }}
              >
                {name}
              </button>
            </div>
          ))}
      </div>
      {selectedName && (
        <div>
          <h3>Transforms for {selectedName}:</h3>
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
