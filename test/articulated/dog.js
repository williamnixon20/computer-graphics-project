export const dog = {
    type: "articulated",
    name: "dog",
    draw: false,
    children: [
        {
            name: "body",
            scale: [1.5, 1, 1.5],
            children: [
                {
                    name: "head",
                    translation: [0, 1, 0.75],
                },
                {
                    name: "right-back-leg",
                    translation: [-0.5, -0.5, -0.5],
                    scale: [0.5, 1, 0.5]
                },
                {
                    name: "left-back-leg",
                    translation: [0.5, -0.5, -0.5],
                    scale: [0.5, 1, 0.5]
                },
                {
                    name: "right-front-leg",
                    translation: [-0.5, -0.5, 0.5],
                    scale: [0.5, 1, 0.5]
                },
                {
                    name: "left-front-leg",
                    translation: [0.5, -0.5, 0.5],
                    scale: [0.5, 1, 0.5]
                },
            ],
        },
    ],
};