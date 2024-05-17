export const drone = {
    type: "articulated",
    name: "drone",
    draw: false,
    children: [
        {
            name: "body",
            scale: [3, 1, 5],
            children: [
                {
                    name: "main-rotor",
                    translation: [0, 1, 0],
                    scale: [1 / 3, 1 / 3, 1 / 5],
                    children: [
                        {
                            name: "rotor-blade-1",
                            translation: [0, 0.5, 0],
                            scale: [0.5, 0.5, 5],
                            rotation: [0, 1, 0]
                        },
                        {
                            name: "rotor-blade-2",
                            translation: [0, 0.5, 0],
                            scale: [0.5, 0.5, 5],
                            rotation: [0, -1, 0]
                        }
                    ]
                },
            ],
        },
    ],
};