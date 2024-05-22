export const droneAnim = {
  name: "Drone Animation",
  frames: [
    { // Frame 1
      name: "body",
      keyframe: {
        scale: [3, 1, 5],
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
                rotation: [0, -1, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 1, 0],
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
        translation: [1, 0, 1],
        scale: [3, 1, 5],
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
                rotation: [0, -2, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 2, 0],
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
        translation: [2, 0, 2],
        scale: [3, 1, 5],
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
                rotation: [0, -3, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 3, 0],
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
        translation: [-1, 0, -1],
        scale: [3, 1, 5],
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
                rotation: [0, -4, 0],
                scale: [0.5, 0.5, 5],
              },
            },
            "rotor-blade-2": {
              name: "rotor-blade-2",
              keyframe: {
                translation: [0, 0.5, 0],
                rotation: [0, 4, 0],
                scale: [0.5, 0.5, 5],
              },
            },
          },
        },
      },
    }
  ]
}