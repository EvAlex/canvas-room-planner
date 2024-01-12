import { drawingSettings } from "../drawing-settings";
import { LineThickness } from "../line-thickness";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";

export interface DrawWindowCommand extends DrawingCommand<"drawWindow"> {
  length: number;
  isHorizontal: boolean;
}

export class WindowDrawer extends Drawer<DrawWindowCommand> {
  get type(): "drawWindow" {
    return "drawWindow";
  }

  draw(
    { length, isHorizontal }: DrawWindowCommand,
    ctx: DrawingContext
  ): Partial<MutableDrawingContext> {
    this.setStrokeStyle(LineThickness.Thick, ctx);
    ctx.ctx.fillStyle = drawingSettings.windows.fill;

    const startX =
      ctx.currentPoint[0] -
      (isHorizontal ? 0 : drawingSettings.windows.width / 2);
    const startY =
      ctx.currentPoint[1] -
      (isHorizontal ? drawingSettings.windows.width / 2 : 0);
    const start = this.convertWorldPointToScenePoint([startX, startY], ctx);
    const width = this.scaleWorldLengthToSceneLength(
      isHorizontal ? length : drawingSettings.windows.width,
      ctx
    );
    const height = this.scaleWorldLengthToSceneLength(
      isHorizontal ? drawingSettings.windows.width : length,
      ctx
    );

    ctx.ctx.rect(...start, width, height);
    ctx.ctx.fill();
    ctx.ctx.stroke();
    ctx.ctx.closePath();

    return {
      currentPoint: isHorizontal
        ? [ctx.currentPoint[0] + length, ctx.currentPoint[1]]
        : [ctx.currentPoint[0], ctx.currentPoint[1] + length],
    };
  }
}
