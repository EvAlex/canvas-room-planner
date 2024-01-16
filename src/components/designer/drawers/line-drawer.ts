import { LineThickness } from "../../../line-thickness";
import { Point } from "../../../point";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";

export interface DrawLineCommand extends DrawingCommand<"drawLine"> {
  start: Point;
  end: Point;
  thickness: LineThickness;
}

export class LineDrawer extends Drawer<DrawLineCommand> {
  get type(): "drawLine" {
    return "drawLine";
  }

  draw(
    { start, end, thickness }: DrawLineCommand,
    ctx: DrawingContext
  ): Partial<MutableDrawingContext> {
    this.setStrokeStyle(thickness, ctx);

    ctx.ctx.beginPath();
    ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(start, ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(end, ctx));
    ctx.ctx.stroke();
    ctx.ctx.closePath();

    return {};
  }
}
