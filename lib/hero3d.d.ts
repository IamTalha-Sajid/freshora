export type HeroSceneOptions = { autorotate?: boolean; brush?: boolean; bubbles?: boolean };
export type HeroScene = { update(o: HeroSceneOptions): void; dispose(): void; tint(rimHex: number, bubbleHex: number): void };
export function mount(canvas: HTMLCanvasElement, opts?: HeroSceneOptions): Promise<HeroScene>;
