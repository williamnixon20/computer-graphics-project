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

var jsonToDraw: ArticulatedDescriptions | HollowDescriptions =
  blockGuyNodeDescriptions;
export default function Canvas() {
  const [selectedName, setSelectedName] = useState<string | null | undefined>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [FOVRadians, setFOVRadians] = useState(60);
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

    function degToRad(d: any) {
      return (d * Math.PI) / 180;
    }

    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(FOVRadians);
    var cameraHeight = 100;
    let drawerLoc = null;
    if (!drawer) {
      drawerLoc = new Drawer(gl);
      setDrawer(drawerLoc);
      drawer = drawerLoc;
    }
    let scene = null;
    let refNode = {};
    scene = new Node().buildByDescription(jsonToDraw);
    scene.procedureGetNodeRefDict(refNode);

    setScene(scene);
    setRefDict(refNode);

    drawer.draw(scene);
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
      refDict[selectedName].node.addTransform(newTransforms);
    }
    if (scene) {
      drawer?.draw(scene);
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
      <div key={type}>
        <p>{label}:</p>
        {["x", "y", "z"].map((axis) => (
          <input
            key={axis}
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={
              transforms[type][axis as keyof Transforms["translate"]] as number
            }
            onChange={(e) => handleTransformChange(type, axis, e.target.value)}
          />
        ))}
      </div>
    );
  };

  function handleMouseDown(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    console.log("Mouse down", e.clientX, e.clientY);
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

  return (
    <>
      <div className="w-full h-full max-h-screen overflow-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
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
          max="180"
          value={FOVRadians}
          onChange={(e) => setFOVRadians(parseInt(e.target.value))}
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
            if (scene) drawer?.draw(scene);
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
              ? cubeHollow as HollowDescriptions
              : blockGuyNodeDescriptions;
            setupWebGL();
          }}
          className="w-full"
        ></input>
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
          }).map(([type, label]) => renderSliders(type as keyof Transforms, label))}
        </div>
      )}
    </>
  );
}
