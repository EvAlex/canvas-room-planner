import { drawingSettings } from "../../../drawing-settings";
import { LineThickness } from "../../../line-thickness";
import { Point } from "../../../point";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";
import { Orientation } from "./orientation";

export interface DrawBedCommand extends DrawingCommand<"drawBed"> {
  width: number;
  length: number;
  orientation: Orientation;
}

export class BedDrawer extends Drawer<DrawBedCommand> {
  get type(): "drawBed" {
    return "drawBed";
  }

  draw(
    { width, length, orientation }: DrawBedCommand,
    ctx: DrawingContext
  ): Partial<MutableDrawingContext> {
    this.setStrokeStyle(LineThickness.Thick, ctx);

    const [x, y] = ctx.currentPoint;
    const [topRight, bottomRight, bottomLeft]: [Point, Point, Point] =
      orientation === Orientation.North || orientation === Orientation.South
        ? [
            [x + width, y],
            [x + width, y + length],
            [x, y + length],
          ]
        : [
            [x + length, y],
            [x + length, y + width],
            [x, y + width],
          ];

    ctx.ctx.moveTo(...this.convertWorldPointToScenePoint([x, y], ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(topRight, ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(bottomRight, ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(bottomLeft, ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint([x, y], ctx));
    ctx.ctx.stroke();

    const headBoardStart = [x, y] as Point;
    const headBoardEnd = [x, y] as Point;

    if (orientation === Orientation.North) {
      headBoardStart[1] += drawingSettings.bed.headboardWidth;
      headBoardEnd[0] = topRight[0];
      headBoardEnd[1] = headBoardStart[1];
    } else if (orientation === Orientation.East) {
      headBoardStart[0] = topRight[0] - drawingSettings.bed.headboardWidth;
      headBoardStart[1] = topRight[1];
      headBoardEnd[0] = headBoardStart[0];
      headBoardEnd[1] = bottomRight[1];
    } else if (orientation === Orientation.South) {
      headBoardStart[1] = bottomLeft[1] - drawingSettings.bed.headboardWidth;
      headBoardEnd[0] = bottomRight[0];
      headBoardEnd[1] = headBoardStart[1];
    } else {
      headBoardStart[0] += drawingSettings.bed.headboardWidth;
      headBoardEnd[0] = headBoardStart[0];
      headBoardEnd[1] = bottomLeft[1];
    }

    ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(headBoardStart, ctx));
    ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(headBoardEnd, ctx));
    ctx.ctx.stroke();

    return {};
  }
}
