import { LineThickness } from "../../../line-thickness";
import { Point } from "../../../point";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";

export abstract class Drawer<
  TCommand extends DrawingCommand<any>,
  TCommandType = TCommand extends DrawingCommand<infer T> ? T : never
> {
  abstract get type(): TCommandType;

  abstract draw(
    command: TCommand,
    ctx: DrawingContext
  ): Partial<MutableDrawingContext>;

  protected convertWorldPointToScenePoint(
    [x, y]: Point,
    ctx: DrawingContext
  ): Point {
    return [(ctx.base[0] + x) * ctx.scale, (ctx.base[1] + y) * ctx.scale];
  }

  protected scaleWorldLengthToSceneLength(
    length: number,
    ctx: DrawingContext
  ): number {
    return length * ctx.scale;
  }

  protected scaleSceneLengthToWorldLength(
    length: number,
    ctx: DrawingContext
  ): number {
    return length / ctx.scale;
  }

  protected setStrokeStyle(thickness: LineThickness, ctx: DrawingContext) {
    ctx.ctx.strokeStyle = "black";

    switch (thickness) {
      case LineThickness.Thick:
        ctx.ctx.lineWidth = 2;
        break;
      case LineThickness.Thin:
      default:
        ctx.ctx.lineWidth = 1;
        break;
    }
  }
}
