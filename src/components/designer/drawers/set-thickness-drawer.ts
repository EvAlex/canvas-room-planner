import { LineThickness } from "../../../line-thickness";
import { Drawer } from "./drawer";
import { DrawingCommand } from "./drawing-command";
import { DrawingContext, MutableDrawingContext } from "./drawing-context";

export interface SetThicknessCommand extends DrawingCommand<"setThickness"> {
  thickness: LineThickness;
}

export class SetThicknessDrawer extends Drawer<SetThicknessCommand> {
  get type(): "setThickness" {
    return "setThickness";
  }

  draw(
    command: SetThicknessCommand,
    ctx: DrawingContext
  ): Partial<MutableDrawingContext> {
    return {
      currentThickness: command.thickness,
    };
  }
}
