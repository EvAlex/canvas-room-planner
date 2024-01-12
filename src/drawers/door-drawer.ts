import { Point } from "../point";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";
import { Orientation } from "./orientation";

export enum DoorType {
  Left,
  Right,
}



export interface DrawDoorCommand extends DrawingCommand<"drawDoor"> {
  width: number;
  doorType: DoorType;
  orientation: Orientation;
}

export class DoorDrawer extends Drawer<DrawDoorCommand> {
    get type(): "drawDoor" {
        return "drawDoor";
    }

    draw({width, doorType, orientation}: DrawDoorCommand, ctx: DrawingContext): Partial<MutableDrawingContext> {
        const start = [...ctx.currentPoint] as Point;
        const end = [...ctx.currentPoint] as Point;
    
        if (orientation === Orientation.North) {
          start[0] += width;
          end[0] += width;
          end[1] -= Math.abs(width);
        } else if (orientation === Orientation.East) {
          start[1] += width;
          end[0] += Math.abs(width);
          end[1] += width;
        } else if (orientation === Orientation.South) {
          start[0] += width;
          end[0] += width;
          end[1] += Math.abs(width);
        } else {
          //start[1] += width;
          end[0] -= Math.abs(width);
          //end[1] += width;
        }
    
        ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(start, ctx));
        ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(end, ctx));
    
        ctx.ctx.arc(
          ...this.convertWorldPointToScenePoint(ctx.currentPoint, ctx),
          this.scaleWorldLengthToSceneLength(width, ctx),
          Math.PI,
          Math.PI / 2,
          true
        );
    
        ctx.ctx.stroke();
        ctx.ctx.closePath();

        return {};
    }
    
}
