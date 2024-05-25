export const lamp = {
    type: "articulated",
    name: "lamp",
    draw: false,
    children: [
        {
            name: "base",
            scale: [3, 2, 3],
            translation: [0, -3, 0],
            children: [
                {
                    name: "pole",
                    translation: [0, 1.5, 0],
                    scale: [1 / 3, 2, 1 / 3],
                    children: [
                        {
                            name: "shade",
                            translation: [0, 0.5, 0],
                            scale: [2, 1 / 3, 2],
                            children: [
                                {
                                    name: "bulb",
                                    translation: [0, 1, 0],
                                    scale: [1 / 2, 1 / 2, 1 / 2],
                                    prim: "sphere"
                                },
                            ]
                        }
                    ]
                },
            ],
        },
    ],
};