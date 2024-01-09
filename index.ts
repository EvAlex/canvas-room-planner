// Import stylesheets
import './style.css';

type Point = [number, number];

interface DrawingContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
  base: Point;
}

enum LineThickness {
  Thin,
  Thick,
}

enum DoorType {
  Left,
  Right,
}

enum Orientation {
  North,
  East,
  South,
  West,
}

interface MoveToCommand {
  type: 'moveTo';
  target: Point;
}

interface SetThicknessCommand {
  type: 'setThickness';
  thickness: LineThickness;
}

interface DrawDoorCommand {
  type: 'drawDoor';
  width: number;
  doorType: DoorType;
  orientation: Orientation;
}

interface DrawWindowCommand {
  type: 'drawWindow';
  length: number;
  isHorizontal: boolean;
}

interface DrawLineCommand {
  type: 'drawLine';
  start: Point;
  end: Point;
  thickness: LineThickness;
}

interface DrawBedCommand {
  type: 'drawBed';
  width: number;
  length: number;
  orientation: Orientation;
}

type DrawingCommand =
  | MoveToCommand
  | SetThicknessCommand
  | DrawDoorCommand
  | DrawWindowCommand
  | DrawLineCommand
  | DrawBedCommand;

class DrawerFactory {
  build(): Drawer {
    return new Drawer(this.initContext());
  }

  private initContext(): DrawingContext {
    const canvas = document.getElementsByTagName('canvas')[0];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sceneWidth = 10_000;
    const sceneHeight = 10_000;
    const kx = canvas.width / sceneWidth;
    const ky = canvas.height / sceneHeight;
    const scale = Math.min(kx, ky);

    return {
      canvas,
      ctx: canvas.getContext('2d'),
      scale,
      base: [sceneWidth / 10, sceneHeight / 10],
    };
  }
}

const drawingSettings = {
  windows: {
    width: 100,
    fill: 'lightblue',
  },
  bed: {
    headboardWidth: 80,
  }
} as const;

class Drawer {
  private currentPoint: Point;
  private currentCross: Point | null = null;
  private currentThickness: LineThickness;
  private readonly commands: DrawingCommand[] = [];

  constructor(private readonly ctx: DrawingContext) {
    this.moveTo(ctx.base);
    this.setThickness(LineThickness.Thick);

    this.initEventListeners();
  }

  moveTo(target: Point): Drawer {
    this.addCommand<MoveToCommand>({ type: 'moveTo', target });

    return this;
  }

  setThickness(thickness: LineThickness): Drawer {
    this.addCommand<SetThicknessCommand>({
      type: 'setThickness',
      thickness,
    });

    return this;
  }

  drawDoor(width: number, type: DoorType, orientation: Orientation): Drawer {
    this.addCommand<DrawDoorCommand>({
      type: 'drawDoor',
      width,
      doorType: type,
      orientation,
    });

    return this;
  }

  drawBed(width: number, length: number, orientation: Orientation): Drawer {
    this.addCommand<DrawBedCommand>({
      type: 'drawBed',
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
      type: 'drawWindow',
      length,
      isHorizontal,
    });
    this.addCommand<MoveToCommand>({
      type: 'moveTo',
      target: isHorizontal
        ? [this.currentPoint[0] + length, this.currentPoint[1]]
        : [this.currentPoint[0], this.currentPoint[1] + length],
    });

    return this;
  }

  drawLineHorizontal(
    length: number,
    thickness: LineThickness = this.currentThickness
  ): Drawer {
    return this.drawLineTo(
      [this.currentPoint[0] + length, this.currentPoint[1]],
      thickness
    );
  }

  drawLineVertical(
    length: number,
    thickness: LineThickness = this.currentThickness
  ): Drawer {
    return this.drawLineTo(
      [this.currentPoint[0], this.currentPoint[1] + length],
      thickness
    );
  }

  drawLineTo(
    target: Point,
    thickness: LineThickness = this.currentThickness
  ): Drawer {
    this.drawLine(this.currentPoint, target, thickness);

    this.addCommand<MoveToCommand>({ type: 'moveTo', target });

    return this;
  }

  drawLine(
    start: Point,
    end: Point,
    thickness: LineThickness = this.currentThickness
  ) {
    this.addCommand<DrawLineCommand>({
      type: 'drawLine',
      start,
      end,
      thickness,
    });

    return this;
  }

  private runCommand<T extends DrawingCommand>(command: T) {
    switch (command.type) {
      case 'moveTo':
        this.runMoveToCommand(command);
        break;
      case 'setThickness':
        this.runSetThicknessCommand(command);
        break;
      case 'drawDoor':
        this.runDrawDoorCommand(command);
        break;
      case 'drawWindow':
        this.runDrawWindowCommand(command);
        break;
      case 'drawBed':
        this.runDrawBedCommand(command);
        break;
      case 'drawLine':
        this.runDrawLineCommand(command);
        break;
      default:
        console.error('Unhandled command: ' + command['type']);
        break;
    }
  }

  private runMoveToCommand({ target }: MoveToCommand) {
    this.currentPoint = target;
  }

  private runSetThicknessCommand({ thickness }: SetThicknessCommand) {
    this.currentThickness = thickness;
  }

  private runDrawDoorCommand({
    width,
    orientation,
    doorType,
  }: DrawDoorCommand) {
    const start = [...this.currentPoint] as Point;
    const end = [...this.currentPoint] as Point;

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

    this.ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(start));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(end));

    this.ctx.ctx.arc(
      ...this.convertWorldPointToScenePoint(this.currentPoint),
      this.scaleWorldLengthToSceneLength(width),
      Math.PI,
      Math.PI / 2,
      true
    );

    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
  }

  private runDrawWindowCommand({ length, isHorizontal }: DrawWindowCommand) {
    this.setStrokeStyle(LineThickness.Thick);
    this.ctx.ctx.fillStyle = drawingSettings.windows.fill;

    const startX =
      this.currentPoint[0] -
      (isHorizontal ? 0 : drawingSettings.windows.width / 2);
    const startY =
      this.currentPoint[1] -
      (isHorizontal ? drawingSettings.windows.width / 2 : 0);
    const start = this.convertWorldPointToScenePoint([startX, startY]);
    const width = this.scaleWorldLengthToSceneLength(
      isHorizontal ? length : drawingSettings.windows.width
    );
    const height = this.scaleWorldLengthToSceneLength(
      isHorizontal ? drawingSettings.windows.width : length
    );

    this.ctx.ctx.rect(...start, width, height);
    this.ctx.ctx.fill();
    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
  }

  private runDrawBedCommand({ width, length, orientation }: DrawBedCommand) {
    this.setStrokeStyle(LineThickness.Thick);

    const [x, y] = this.currentPoint;
    const [topRight, bottomRight, bottomLeft]: [Point, Point, Point] =
      orientation === Orientation.North || orientation === Orientation.South
        ? ([
            [x + width, y],
            [x + width, y + length],
            [x, y + length],
        ])
        : ([
          [x + length, y],
          [x + length, y + width],
          [x, y + width],
        ]);

    this.ctx.ctx.moveTo(...this.convertWorldPointToScenePoint([x, y]));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(topRight));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(bottomRight));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(bottomLeft));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint([x, y]));
    this.ctx.ctx.stroke();

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

    this.ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(headBoardStart));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(headBoardEnd));
    this.ctx.ctx.stroke();

  }

  private runDrawLineCommand({ start, end, thickness }: DrawLineCommand) {
    this.setStrokeStyle(thickness);

    this.ctx.ctx.beginPath();
    this.ctx.ctx.moveTo(...this.convertWorldPointToScenePoint(start));
    this.ctx.ctx.lineTo(...this.convertWorldPointToScenePoint(end));
    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
  }

  private convertWorldPointToScenePoint([x, y]: Point): Point {
    return [
      (this.ctx.base[0] + x) * this.ctx.scale,
      (this.ctx.base[1] + y) * this.ctx.scale,
    ];
  }

  private scaleWorldLengthToSceneLength(length: number): number {
    return length * this.ctx.scale;
  }

  private scaleSceneLengthToWorldLength(length: number): number {
    return length / this.ctx.scale;
  }

  private setStrokeStyle(thickness: LineThickness) {
    this.ctx.ctx.strokeStyle = 'black';

    switch (thickness) {
      case LineThickness.Thick:
        this.ctx.ctx.lineWidth = 2;
        break;
      case LineThickness.Thin:
      default:
        this.ctx.ctx.lineWidth = 1;
        break;
    }
  }

  private initEventListeners() {
    this.ctx.canvas.tabIndex = 1;
    this.ctx.canvas.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.ctx.canvas.addEventListener('click', (e) => this.onClick(e));
    this.ctx.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }
  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
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

    this.ctx.ctx.strokeStyle = 'red';
    this.ctx.ctx.setLineDash([5, 3]);
    this.ctx.ctx.beginPath();
    this.ctx.ctx.moveTo(x1, y1);
    this.ctx.ctx.lineTo(x2, y2);
    this.ctx.ctx.stroke();
    this.ctx.ctx.closePath();
    this.ctx.ctx.setLineDash([]);

    this.ctx.ctx.font = '12pt Calibri';
    this.ctx.ctx.lineWidth = 1;
    this.ctx.ctx.strokeText(
      Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        style: 'unit',
        unit: 'millimeter',
        unitDisplay: 'short',
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
    this.ctx.ctx.strokeStyle = 'red';
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

  private addCommand<T extends DrawingCommand>(command: T) {
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
