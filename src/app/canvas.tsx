"use client";

import { useEffect, useRef, useState } from "react";
import TRS from "../webgl/utils/trs";

// @ts-ignore
import { Node } from "../webgl/models/node";

import * as m4 from "../webgl/utils/m4";
import * as webglUtils from "../webgl/utils/webGlUtils";
import * as primitives from "../webgl/utils/primitives";
import { createVertexShader, createFragmentShader } from "@/webgl/utils/create-shader";
import { Drawer } from "@/webgl/drawer";

var blockGuyNodeDescriptions =
{
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

export type Transforms = {
  translate: { x: number, y: number, z: number },
  scale: { x: number, y: number, z: number },
  rotate: { x: number, y: number, z: number }
}

export default function Canvas() {
  const [selectedName, setSelectedName] = useState(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [FOVRadians, setFOVRadians] = useState(60);
  const [animate, setAnimate] = useState(false);
  const [refDict, setRefDict] = useState({});
  const [drawer, setDrawer] = useState(null);
  const [scene, setScene] = useState(null);
  const [transforms, setTransforms] = useState<Transforms>({
    translate: { x: 0, y: 0, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
    rotate: { x: 0, y: 0, z: 0 }
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
      return d * Math.PI / 180;
    }

    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(FOVRadians);
    var cameraHeight = 100;
    let drawer = null;
    if (!drawer) {
      drawer = new Drawer(gl);
      setDrawer(drawer);
    }

    let scene = new Node().buildByDescription(blockGuyNodeDescriptions, drawer.programInfo);
    let refNode = {}
    scene.procedureGetNodeRefDict(refNode)
    setScene(scene);
    console.log(refNode);
    setRefDict(refNode);

    drawer.draw(scene);
  }

  const handleTransformChange = (type, axis, value) => {
    let newTransforms = {
      ...transforms,
      [type]: {
        ...transforms[type],
        [axis]: Number(value)
      }
    }
    setTransforms(newTransforms);
    refDict[selectedName].node.addTransform(newTransforms);
    drawer.draw(scene);
  };

  const resetTransforms = () => {
    setTransforms({
      translate: { x: 0, y: 0, z: 0 },
      scale: { x: 0, y: 0, z: 0 },
      rotate: { x: 0, y: 0, z: 0 }
    });
  }

  const renderSliders = (type, label) => {
    return (
      <div key={type}>
        <p>{label}:</p>
        {['x', 'y', 'z'].map((axis) => (
          <input
            key={axis}
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={transforms[type][axis]}
            onChange={(e) => handleTransformChange(type, axis, e.target.value)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full max-h-screen overflow-auto">
        <canvas
          ref={canvasRef}
          id="webgl-canvas"
          className="w-[720px] h-[720px] bg-gray-200"
        />
      </div>
      <div className="flex flex-col h-full rounded-md bg-gray-black p-4">
        <label
          className="text-base font-semibold text-white mb-2"
        >
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
        <label
          className="text-base font-semibold text-white mb-2"
        >
          Turn on animation:
        </label>
        <input
          type="checkbox"
          checked={animate}
          onChange={(e) => setAnimate(e.target.checked)}
          className="w-full">
        </input>
      </div >
      <div>
        {Object.keys(refDict).map((name) => (
          <div key={name} style={{ marginLeft: refDict[name].level * 10 }}>
            <button
              onClick={() => { setSelectedName(name); resetTransforms(); }}
              style={{ backgroundColor: selectedName === name ? 'gray' : 'blue' }}
            >
              {name}
            </button>
          </div>
        ))}

      </div>
      {selectedName && (
        <div>
          <h3>Transforms for {selectedName}:</h3>
          {Object.entries({ translate: 'Translate', scale: 'Scale', rotate: 'Rotate' }).map(([type, label]) => (
            renderSliders(type, label)
          ))}
        </div>
      )}
      {/* <div>
        {Object.keys(refDict).map((name) => (
          <div key={name} style={{ marginLeft: refDict[name].level * 10 }}>
            <p>{name}</p>
          </div>
        ))}
      </div> */}
    </>
  );
}
