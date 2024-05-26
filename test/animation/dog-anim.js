export const dogAnim = {
  name: "Dog Animation",
  frames: [
    { // Frame 1
      name: "body",
      keyframe: {
        translation: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5]
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5]
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5]
          },
        },
      },
    },
    { // Frame 2
      name: "body",
      keyframe: {
        translation: [0, 0, 0],
        rotation: [0, 2.355, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1.5, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 3
      name: "body",
      keyframe: {
        translation: [3, 2, -3],
        rotation: [0, 2.355, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 4
      name: "body",
      keyframe: {
        translation: [6, 0, -6],
        rotation: [0, 2.355, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 5
      name: "body",
      keyframe: {
        translation: [6, 0, -6],
        rotation: [0, 4.712, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1.5, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 6
      name: "body",
      keyframe: {
        translation: [3, 2, -6],
        rotation: [0, 4.712, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 7
      name: "body",
      keyframe: {
        translation: [0, 0, -6],
        rotation: [0, 4.712, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 8
      name: "body",
      keyframe: {
        translation: [0, 0, -6],
        rotation: [0, 6.283, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1.5, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [0, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    },
    { // Frame 9
      name: "body",
      keyframe: {
        translation: [0, 2, 3],
        rotation: [0, 3.141, 0],
        scale: [1.5, 1, 1.5],
      },
      children: {
        "head": {
          name: "head",
          keyframe: {
            translation: [0, 1, 0.75],
            rotation: [0, 0, 0],
          },
        },
        "right-back-leg": {
          name: "right-back-leg",
          keyframe: {
            translation: [-0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-back-leg": {
          name: "left-back-leg",
          keyframe: {
            translation: [0.5, -0.5, -0.5],
            rotation: [0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "right-front-leg": {
          name: "right-front-leg",
          keyframe: {
            translation: [-0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
        "left-front-leg": {
          name: "left-front-leg",
          keyframe: {
            translation: [0.5, -0.5, 0.5],
            rotation: [-0.5, 0, 0],
            scale: [0.5, 1, 0.5],
          },
        },
      },
    }
  ]
}