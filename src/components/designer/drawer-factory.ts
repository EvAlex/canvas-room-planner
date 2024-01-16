import { DrawingContext } from "./drawers/drawing-context";
import { LineThickness } from "../../line-thickness";
import { Point } from "../../point";
import { Drawer } from "./drawer";

export class DrawerFactory {
    build(canvas: HTMLCanvasElement): Drawer {
      return new Drawer(this.initContext(canvas));
    }
  
    private initContext(canvas: HTMLCanvasElement): DrawingContext {
      const sceneWidth = 10_000;
      const sceneHeight = 10_000;
      const kx = canvas.width / sceneWidth;
      const ky = canvas.height / sceneHeight;
      const scale = Math.min(kx, ky);
      const base: Point = [sceneWidth / 10, sceneHeight / 10];
  
      return {
        canvas,
        ctx: canvas.getContext("2d"),
        base,
        scale,
        currentPoint: base,
        currentThickness: LineThickness.Thick,
      };
    }
  }