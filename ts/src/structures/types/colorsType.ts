export type colorsType = {
    [key in "certo" | "errado" | "normal" | "transparente"]: `#${string}`;
};