import { Designer, DoorType, Orientation } from "./components/designer";
import "./style.css";

const designer = document.body.appendChild(
  Designer.createElement()
) as Designer;

designer.drawer
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
