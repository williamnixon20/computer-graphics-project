// {
//   name: "base",
//   scale: [3, 2, 3],
//   translation: [0, -3, 0],
//   children: [
//     {
//       name: "pole",
//       translation: [0, 1.5, 0],
//       scale: [1 / 3, 2, 1 / 3],
//       children: [
//         {
//           name: "shade",
//           translation: [0, 0.5, 0],
//           scale: [2, 1 / 3, 2],
//           children: [
//             {
//               name: "bulb",
//               translation: [0, 1, 0],
//               scale: [1 / 2, 1 / 2, 1 / 2],
//               prim: "sphere"
//             },
//           ]
//         }
//       ]
//     },
//   ],
// }

export const lampAnim = {
  name: "Lamp Animation",
  frames: [
    { // Frame 1
      name: "base",
      keyframe: {
        translation: [0, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [0, 1.5, 0],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 2
      name: "base",
      keyframe: {
        translation: [0, 0, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [0, 1.5, 0],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 3
      name: "base",
      keyframe: {
        translation: [-3, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [3, 0.5, 0],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 4
      name: "base",
      keyframe: {
        translation: [-3, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [3, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 5
      name: "base",
      keyframe: {
        translation: [-3, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [3, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1.8, 0],
                    rotation: [0, 1.57, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 6
      name: "base",
      keyframe: {
        translation: [-4, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [4, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1.8, -0.9],
                    rotation: [0, 1.57, -0.785],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 7
      name: "base",
      keyframe: {
        translation: [-4, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [4, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 1, 0],
                    rotation: [0, 0, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 8
      name: "base",
      keyframe: {
        translation: [-5, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [5, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 2.8, 0.9],
                    rotation: [0, 2.57, 0.785],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    },
    { // Frame 9
      name: "base",
      keyframe: {
        translation: [-5, -3, 0],
        scale: [3, 2, 3],
      },
      children: {
        "pole": {
          name: "pole",
          keyframe: {
            translation: [5, 0, 0],
            rotation: [0, 0, 1.57],
            scale: [1 / 3, 2, 1 / 3],
          },
          children: {
            "shade": {
              name: "shade",
              keyframe: {
                translation: [0, 0.5, 0],
                scale: [2, 1 / 3, 2],
              },
              children: {
                "bulb": {
                  name: "bulb",
                  keyframe: {
                    translation: [0, 3.6, 0],
                    rotation: [0, 3.57, 0],
                    scale: [1 / 2, 1 / 2, 1 / 2],
                  },
                },
              },
            },
          },
        },
      },
    }
  ]
}