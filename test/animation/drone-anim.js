export const droneAnim = {
  name: "Drone Animation",
  frames: [
    { // Frame 1
      name: "body",
      keyframe: {
        translation: [0, 0, 0],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 1, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -1, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 2
      name: "body",
      keyframe: {
        translation: [4, 0, 0],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 2, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -2, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 3
      name: "body",
      keyframe: {
        translation: [2.828, 0, 2.828],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 3, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -3, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 4
      name: "body",
      keyframe: {
        translation: [0, 0, 4],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 4, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -4, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 5
      name: "body",
      keyframe: {
        translation: [-2.828, 0, 2.828],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 5, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -5, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 6
      name: "body",
      keyframe: {
        translation: [-4, 0, 0],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 6, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -6, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 7
      name: "body",
      keyframe: {
        translation: [-2.828, 0, -2.828],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 7, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -7, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 8
      name: "body",
      keyframe: {
        translation: [0, 0, -4],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 8, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -8, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    },
    { // Frame 9
      name: "body",
      keyframe: {
        translation: [2.828, 0, -2.828],
      },
      children: {
        "main-rotor": {
          name: "main-rotor",
          keyframe: {
            translation: [0, 1, 0],
            scale: [1 / 3, 1 / 3, 1 / 5],
          },
          children: {
            "rotor-blade-1": {
              name: "rotor-blade-1",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 9, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, -9, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    }
  ]
}
