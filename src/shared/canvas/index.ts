import Canvas from "./Canvas";

const canvasElement =
  document.querySelector<HTMLCanvasElement>("canvas#canvas");

const canvas = new Canvas(canvasElement);

export default canvas;
