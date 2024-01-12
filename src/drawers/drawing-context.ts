import { LineThickness } from "../line-thickness";
import { Point } from "../point";

export type ImmutableDrawingContext = {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly base: Point;
};

export type MutableDrawingContext = {
  scale: number;
  currentPoint: Point;
  currentThickness: LineThickness;
};

export type DrawingContext = ImmutableDrawingContext & MutableDrawingContext;

export function setDrawingContext(
  ctx: DrawingContext,
  update: Partial<MutableDrawingContext>
): MutableDrawingContext {
  const { scale, currentPoint, currentThickness } = ctx;

  return {
    scale,
    currentPoint,
    currentThickness,
    ...update,
  };
}
