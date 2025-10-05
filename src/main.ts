import "./style.css";
import Canvas from "./shared/canvas/Canvas";

const canvasElement =
  document.querySelector<HTMLCanvasElement>("canvas#canvas");

new Canvas(canvasElement);
