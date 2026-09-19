import sharp from "sharp";
import { env } from "../../config/env.js";

export async function optimizeImage(buffer, options = {}) {
  return sharp(buffer)
    .rotate()
    .resize({
      width: options.width || env.imageMaxWidth,
      height: options.height || env.imageMaxHeight,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: options.quality || env.imageWebpQuality })
    .toBuffer();
}
