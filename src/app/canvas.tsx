"use client";

import { KeyboardEvent, RefObject, useEffect, useRef, useState } from "react";

// @ts-ignore
import { Node } from "../webgl/models/Node";
import { Drawer } from "@/webgl/drawer";
import { cubeHollow } from "../../test/hollow/cube-hollow";
import { hexagon } from "../../test/hollow/hexagon";
import { prism } from "../../test/hollow/prism";
import { box } from "../../test/hollow/box";
import {
  ArticulatedDescriptions,
  CameraInformation,
  HollowDescriptions,
  Transforms,
} from "./type";
import { blockGuyNodeDescriptions } from "../../test/articulated/man";
import { dog } from "../../test/articulated/dog";
import { lamp } from "../../test/articulated/lamp";
import { drone } from "../../test/articulated/drone";
import { degToRad, radToDeg } from "@/webgl/utils/radians";

import { Animator } from "@/webgl/utils/animator";
import { walking } from "../../test/animation/walking";

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

  const [lightDirection, setLightDirection] = useState([0, 0, 1]);

  const handleSliderChange = (index, value) => {
    const newDirection = [...lightDirection];
    newDirection[index] = value;
    setLightDirection(newDirection);
  };

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
  const [material, setMaterial] = useState(0);

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

    let newScene = null;
    let refNode = {};
    newScene = new Node().buildByDescription(jsonToDraw);
    const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
    newScene.setTexture(gl, "normalMap.png");
    newScene.setAmbientColor(arr_color.concat([1]));

    newScene.procedureGetNodeRefDict(refNode);
    // refNode["head"].node.setTexture(gl, 'f-texture.png');

    setScene(newScene);
    setRefDict(refNode);
    setSelectedName(newScene.name);

    if (canvasId === 0 && drawer1) {
      drawer1.draw(newScene, cameraInformation1);
    } else if (canvasId === 1 && drawer2) {
      drawer2.draw(newScene, cameraInformation2);
    }
  }

  useEffect(() => {
    if (scene) {
      const arr_color = normalizeRGB(hexToRGBAArray(color, 1));
      if (selectedName) {
        let selectedNode = refDict[selectedName].node;
        selectedNode.setAmbientColor(arr_color.concat([1]));
      }
      console.log(arr_color);
      drawer1?.draw(scene, cameraInformation1);
      drawer2?.draw(scene, cameraInformation2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  useEffect(() => {
    updateShading();
    console.log("update");
    if (scene) {
      drawer1?.draw(scene, cameraInformation1);
      drawer2?.draw(scene, cameraInformation2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shading, shininess, specular, diffuse, material, lightDirection]);

  const updateShading = () => {
    if (scene && selectedName) {
      let selectedNode = refDict[selectedName].node;

      selectedNode.setShadingMode(shading ? 1 : 0);
      selectedNode.setShininess(shininess);
      const diffuseColor = normalizeRGB(hexToRGBAArray(diffuse, 1));
      selectedNode.setDiffuseColor(diffuseColor);
      const specularColor = normalizeRGB(hexToRGBAArray(specular, 1));
      selectedNode.setSpecularColor(specularColor);
      console.log("material: ", material);
      selectedNode.setMaterial(material);
      selectedNode.setLightDirection(lightDirection);
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaterial(parseInt(e.target.value));
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
    console.log("MOUSE PICK");
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
    console.log("MOUSE UP");
    mouseDownInformation.isDown = false;
    mouseDownInformation.startX = undefined;
    mouseDownInformation.startY = undefined;
  }

  function handleMouseMove(
    canvasId: number,
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
        let cameraInfo;
        if (canvasId === 0) {
          cameraInfo = cameraInformation1;
        } else {
          cameraInfo = cameraInformation2;
        }
        const newX = cameraInfo.cameraAngleXRadians + degToRad(deltaX);
        const newY = cameraInfo.cameraAngleYRadians + degToRad(deltaY);

        cameraInfo.cameraAngleXRadians = newX;
        cameraInfo.cameraAngleYRadians =
          newY < degToRad(88) && newY > degToRad(-88)
            ? newY
            : cameraInfo.cameraAngleYRadians;
      }

      mouseDownInformation.isDown = true;
      mouseDownInformation.startX = e.nativeEvent.offsetX;
      mouseDownInformation.startY = e.nativeEvent.offsetY;

      if (scene) {
        if (canvasId === 0) {
          drawer1?.draw(scene, cameraInformation1);
        } else {
          drawer2?.draw(scene, cameraInformation2);
        }
      }
    }
  }

  function handleScroll(
    canvasId: number,
    e: React.WheelEvent<HTMLCanvasElement>
  ) {
    console.log("SROLL");
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
    console.log("KEY DOWN");
    const { key } = e;

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

      // console.log(
      //   newCameraInformation.translateX,
      //   newCameraInformation.translateY
      // );
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [replay, setReplay] = useState(false);
  const [fps, setFps] = useState(1);

  let animator = new Animator(
    walking,
    currentFrame,
    reverse,
    replay,
    scene!,
    fps
  );
  let lastFrameTime: number;
  let animationFrameId: number;

  function runAnim(currentTime: number) {
    if (!animate || !scene) return;

    if (lastFrameTime === undefined) lastFrameTime = currentTime;
    const deltaSecond = (currentTime - lastFrameTime) / 1000;

    animator.update(deltaSecond);
    setCurrentFrame(animator.currentFrame);

    drawer1?.draw(scene, cameraInformation1);
    drawer2?.draw(scene, cameraInformation2);

    lastFrameTime = currentTime;
    animationFrameId = requestAnimationFrame(runAnim);
  }

  useEffect(() => {
    if (animate) {
      animationFrameId = requestAnimationFrame(runAnim);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [animate]);

  useEffect(() => {
    animator.isReverse = reverse;
  }, [reverse]);

  useEffect(() => {
    animator.isReplay = replay;
  }, [replay]);

  useEffect(() => {
    animator.fps = fps;
  }, [fps]);

  // File handler
  const [selectedShape, setSelectedShape] = useState("");
  const [selectedArticulated, setSelectedArticulated] = useState("man");

  const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shape = e.target.value;
    setSelectedShape(shape);

    let shapeData;
    switch (shape) {
      case "cubeHollow":
        shapeData = cubeHollow;
        break;
      case "hexagon":
        shapeData = hexagon;
        break;
      case "prism":
        shapeData = prism;
        break;
      case "box":
        shapeData = box;
        break;
      default:
        shapeData = prism;
        break;
    }
    jsonToDraw = shapeData;
    console.log(shapeData);
    setupWebGL(0, canvas1Ref);
    setupWebGL(1, canvas2Ref);
  };

  const handleArticulatedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const articulated = e.target.value;
    setSelectedArticulated(articulated);

    let articulatedData;
    switch (articulated) {
      case "man":
        articulatedData = blockGuyNodeDescriptions;
        break;
      case "dog":
        articulatedData = dog;
        break;
      case "lamp":
        articulatedData = lamp;
        break;
      case "drone":
        articulatedData = drone;
        break;
      default:
        articulatedData = blockGuyNodeDescriptions;
        break;
    }
    jsonToDraw = articulatedData;
    setupWebGL(0, canvas1Ref);
    setupWebGL(1, canvas2Ref);
  };
  return (
    <>
      <div className="w-full h-screen overflow-auto">
        <canvas
          ref={canvas1Ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={(e) => handleMouseMove(0, e)}
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
          onMouseMove={(e) => handleMouseMove(1, e)}
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
              if (animate) {
                cameraInformation2.projType = newValue;
                if (scene) {
                  drawer2?.draw(scene, cameraInformation2);
                }
              } else {
                const newVal = { ...cameraInformation2 };
                newVal.projType = newValue;
                setCameraInformation2(newVal);
                if (scene) {
                  drawer2?.draw(scene, newVal);
                }
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
              / {animator!.length - 1 || 0}
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
              checked={replay}
              onChange={(e) => setReplay(e.target.checked)}
            />
          </div>

          <label className="text-base font-semibold text-white mb-2">
            FPS: {fps}
          </label>
          <input
            type="range"
            min="1"
            defaultValue={"1"}
            value={fps}
            max="60"
            onChange={(e) => setFps(parseInt(e.target.value))}
            className="w-full"
          />
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
            Model type
          </label>
          <select
            className="text-black"
            onChange={(e) => {
              if (e.target.value === "hollow") {
                setHollow(true);
                setSelectedArticulated("");
              } else {
                setHollow(false);
                setSelectedShape("");
              }
            }}
          >
            <option value="articulate">Articulate</option>
            <option value="hollow">Hollow</option>
          </select>
        </div>
        {hollow && (
          <>
            <div className="mb-2 flex flex-row justify-between">
              <label className="text-base font-semibold text-white mr-2">
                Select hollow model
              </label>
              <select
                className="text-black"
                value={selectedShape}
                onChange={handleShapeChange}
              >
                <option value="" disabled>
                  Select a shape
                </option>
                <option value="cubeHollow">Cube Hollow</option>
                <option value="hexagon">Hexagon</option>
                <option value="prism">Prism</option>
                <option value="box">Box</option>
              </select>
            </div>
          </>
        )}
        {!hollow && (
          <div className="mb-2 flex flex-row justify-between">
            <label className="text-base font-semibold text-white mr-2">
              Select articulated model
            </label>
            <select
              className="text-black"
              value={selectedArticulated}
              onChange={handleArticulatedChange}
            >
              <option value="" disabled>
                Select a model
              </option>
              <option value="man">Man</option>
              <option value="dog">Dog</option>
              <option value="lamp">Lamp</option>
              <option value="drone">drone</option>
            </select>
          </div>
        )}
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
                Material
              </label>
              <select
                className="text-base text-black mb-2"
                value={material}
                onChange={handleMaterialChange}
              >
                <option value={0} selected>
                  Basic Material
                </option>
                <option value={1}>Bump Mapping</option>
              </select>
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
                className={`${selectedName === name ? "bg-teal-600" : "bg-blue-500"
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
        <>
          <p className="font-semibold">Light Controls</p>
          <div>
            <div>
              <label>
                X:
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={lightDirection[0]}
                  onChange={(e) => handleSliderChange(0, parseFloat(e.target.value))}
                />
              </label>
            </div>
            <div>
              <label>
                Y:
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={lightDirection[1]}
                  onChange={(e) => handleSliderChange(1, parseFloat(e.target.value))}
                />
              </label>
            </div>
            <div>
              <label>
                Z:
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.01"
                  value={lightDirection[2]}
                  onChange={(e) => handleSliderChange(2, parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>
        </>
      </div>
    </>
  );
}
