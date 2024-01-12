import { Point } from "../point";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";

export interface MoveToCommand extends DrawingCommand<'moveTo'> {
    target: Point;
}
  
export class MoveToDrawer extends Drawer<MoveToCommand> {
    get type(): "moveTo" {
        return "moveTo";
    }

    draw({ target }: MoveToCommand, ctx: DrawingContext): Partial<MutableDrawingContext> {
        return {
            currentPoint: target
        };
    }

}