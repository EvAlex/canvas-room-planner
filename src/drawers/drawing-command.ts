export interface DrawingCommand<T extends string> {
  type: T;
}
// export type DrawingCommand =
//     | MoveToCommand
//     | SetThicknessCommand
//     | DrawDoorCommand
//     | DrawWindowCommand
//     | DrawLineCommand
//     | DrawBedCommand;
