export const blockGuyNodeDescriptions = {
    type: "articulated",
    name: "point between feet",
    draw: false,
    children: [
        // {
        //     name: "camera",
        //     translation: [0, 0, 10],
        // },
        {
            name: "waist",
            translation: [0, 0, 0],
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