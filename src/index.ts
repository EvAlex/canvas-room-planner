import { BedDrawer, DrawBedCommand } from "./drawers/bed-drawer";
import { DoorDrawer, DoorType, DrawDoorCommand } from "./drawers/door-drawer";
import { DrawingCommand } from "./drawers/drawing-command";
import { DrawingContext } from "./drawers/drawing-context";
import { DrawLineCommand, LineDrawer } from "./drawers/line-drawer";
import { MoveToCommand, MoveToDrawer } from "./drawers/move-to-drawer";
import { Orientation } from "./drawers/orientation";
import {
  SetThicknessCommand,
  SetThicknessDrawer,
} from "./drawers/set-thickness-drawer";
import { DrawWindowCommand, WindowDrawer } from "./drawers/window-drawer";
import { LineThickness } from "./line-thickness";
import { Point } from "./point";
import "./style.css";

class DrawerFactory {
  build(): Drawer {
    return new Drawer(this.initContext());
  }

  private initContext(): DrawingContext {
    const canvas = document.getElementsByTagName("canvas")[0];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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

class Drawer {
  private currentCross: Point | null = null;
  private readonly commands: DrawingCommand<any>[] = [];
  private readonly drawers = [
    new MoveToDrawer(),
    new SetThicknessDrawer(),
    new DoorDrawer(),
    new WindowDrawer(),
    new BedDrawer(),
    new LineDrawer(),
  ] as const;

  constructor(private ctx: DrawingContext) {
    this.initEventListeners();
  }

  moveTo(target: Point): Drawer {
    this.addCommand<MoveToCommand>({ type: "moveTo", target });

    return this;
  }

  setThickness(thickness: LineThickness): Drawer {
    this.addCommand<SetThicknessCommand>({
      type: "setThickness",
      thickness,
    });

    return this;
  }

  drawDoor(width: number, type: DoorType, orientation: Orientation): Drawer {
    this.addCommand<DrawDoorCommand>({
      type: "drawDoor",
      width,
      doorType: type,
      orientation,
    });

    return this;
  }

  drawBed(width: number, length: number, orientation: Orientation): Drawer {
    this.addCommand<DrawBedCommand>({
      type: "drawBed",
      width,
      length,
      orientation,
    });

    return this;
  }

  drawWindowHorizontal(length: number): Drawer {
    return this.drawWindow(length, true);
  }

  drawWindowVertical(length: number): Drawer {
    return this.drawWindow(length, false);
  }

  private drawWindow(length: number, isHorizontal: boolean): Drawer {
    this.addCommand<DrawWindowCommand>({
      type: "drawWindow",
      length,
      isHorizontal,
    });

    return this;
  }

  drawLineHorizontal(
    length: number,
    thickness: LineThickness = this.ctx.currentThickness
  ): Drawer {
    return this.drawLineTo(
      [this.ctx.currentPoint[0] + length, this.ctx.currentPoint[1]],
      thickness
    );
  }

  drawLineVertical(
    length: number,
    thickness: LineThickness = this.ctx.currentThickness
  ): Drawer {
    return this.drawLineTo(
      [this.ctx.currentPoint[0], this.ctx.currentPoint[1] + length],
      thickness
    );
  }

  drawLineTo(
    target: Point,
    thickness: LineThickness = this.ctx.currentThickness
  ): Drawer {
    this.drawLine(this.ctx.currentPoint, target, thickness);

    this.addCommand<MoveToCommand>({ type: "moveTo", target });

    return this;
  }

  drawLine(
    start: Point,
    end: Point,
    thickness: LineThickness = this.ctx.currentThickness
  ) {
    this.addCommand<DrawLineCommand>({
      type: "drawLine",
      start,
      end,
      thickness,
    });

    return this;
  }

  private runCommand<TCommand extends DrawingCommand<any>>(command: TCommand) {
    const drawer = this.drawers.find((e) => e.type === command.type);

    if (!drawer) {
      console.error("Unhandled command: " + command["type"]);
      return;
    }

    const update = drawer.draw(command as any, this.ctx);

    this.ctx = {
      ...this.ctx,
      ...update,
    };
  }

  //  TODO: remove
  private scaleSceneLengthToWorldLength(length: number): number {
    return length / this.ctx.scale;
  }

  private initEventListeners() {
    this.ctx.canvas.tabIndex = 1;
    this.ctx.canvas.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.ctx.canvas.addEventListener("click", (e) => this.onClick(e));
    this.ctx.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
  }
  private onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.redrawScene();
      this.resetCrossPoint();
    }
  }

  private onClick(e: MouseEvent) {
    this.redrawScene();
    this.setCrossPoint(this.getScenePointFromMouseEvent(e));
  }

  private onMouseMove(e: MouseEvent) {
    if (this.currentCross !== null) {
      this.displayDistance(
        this.currentCross,
        this.getScenePointFromMouseEvent(e)
      );
    }
  }

  private displayDistance([x1, y1]: Point, [x2, y2]: Point) {
    const sceneDistance = Math.sqrt(
      Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
    );
    const worldDistance = this.scaleSceneLengthToWorldLength(sceneDistance);

    this.redrawScene();

    this.drawCrossPoint(this.currentCross);

    this.ctx.ctx.strokeStyle = "red";
    this.ctx.ctx.setLineDash([5, 3]);
    this.ctx.ctx.beginPath();
    this.ctx.ctx.moveTo(x1, y1);
    this.ctx.ctx.lineTo(x2, y2);
    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
    this.ctx.ctx.setLineDash([]);

    this.ctx.ctx.font = "12pt Calibri";
    this.ctx.ctx.lineWidth = 1;
    this.ctx.ctx.strokeText(
      Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        style: "unit",
        unit: "millimeter",
        unitDisplay: "short",
      }).format(worldDistance),
      (x2 + x1) / 2 + 5,
      (y2 + y1) / 2 - 5
    );
  }

  private getScenePointFromMouseEvent(e: MouseEvent): Point {
    const x = e.pageX - this.ctx.canvas.offsetLeft;
    const y = e.pageY - this.ctx.canvas.offsetTop;

    return [x, y];
  }

  private setCrossPoint(point: Point) {
    this.drawCrossPoint(point);

    this.currentCross = point;
  }

  private drawCrossPoint([x, y]: Point) {
    this.ctx.ctx.strokeStyle = "red";
    this.ctx.ctx.lineWidth = 1;

    this.ctx.ctx.beginPath();

    this.ctx.ctx.moveTo(x - 10, y);
    this.ctx.ctx.lineTo(x + 10, y);

    this.ctx.ctx.moveTo(x, y - 10);
    this.ctx.ctx.lineTo(x, y + 10);

    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
  }

  private resetCrossPoint() {
    this.currentCross = null;
  }

  private addCommand<T extends DrawingCommand<any>>(command: T) {
    this.commands.push(command);
    this.runCommand(command);
  }

  private redrawScene() {
    this.ctx.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (const cmd of this.commands) {
      this.runCommand(cmd);
    }
  }
}

const drawer = new DrawerFactory().build();

drawer
  .moveTo([0, 0])
  .drawLineVertical(580)
  .drawWindowVertical(1525)
  .drawLineVertical(665)
  .drawLineHorizontal(1625)
  .drawWindowHorizontal(1520)
  .drawLineHorizontal(2170)
  .drawLineVertical(-2770)
  .drawLineHorizontal(-5315)

  //  door
  //.drawLine([5315, 80], [4525, 80])
  .moveTo([5315, 80])
  .drawDoor(800, DoorType.Left, Orientation.West)

  //  bed
  /*
  .drawLine([800, 0], [800, 2120])
  .drawLine([800, 2120], [2920, 2120])
  .drawLine([2920, 2120], [2920, 0])
  */
  .moveTo([800, 0])
  .drawBed(2120, 2120, Orientation.North)

  //  wardrobe
  .drawLine([3720, 0], [3720, 2020])
  .drawLine([3720, 2020], [4320, 2020])
  .drawLine([4320, 2020], [4320, 0]);
