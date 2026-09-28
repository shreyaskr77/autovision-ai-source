import { Router, type IRouter, type Request } from "express";
import { inspectImage } from "../services/vehicleAnalysis";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const router: IRouter = Router();

type Upload = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

async function readMultipartImage(request: Request): Promise<Upload> {
  const contentType = request.headers["content-type"] ?? "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) {
    throw new Error("Expected a multipart image upload.");
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] ?? boundaryMatch[2]}`);
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_IMAGE_BYTES) {
      throw new Error("Image exceeds the 10 MB upload limit.");
    }
    chunks.push(buffer);
  }

  const body = Buffer.concat(chunks);
  const fieldStart = body.indexOf(Buffer.from("name=\"image\""));
  if (fieldStart < 0) {
    throw new Error("The upload must include an image field.");
  }

  const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), fieldStart);
  const contentStart = headerEnd + 4;
  const contentEnd = body.indexOf(boundary, contentStart) - 2;
  if (headerEnd < 0 || contentEnd <= contentStart) {
    throw new Error("The image upload is incomplete.");
  }

  const headerText = body.subarray(fieldStart, headerEnd).toString("utf8");
  const typeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
  const nameMatch = headerText.match(/filename="([^"]*)"/i);

  return {
    buffer: body.subarray(contentStart, contentEnd),
    filename: nameMatch?.[1] ?? "vehicle-image",
    contentType: typeMatch?.[1]?.trim().toLowerCase() ?? "application/octet-stream",
  };
}

function isSupportedImage(upload: Upload): boolean {
  const signature = upload.buffer.subarray(0, 12);
  const jpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const png = signature.toString("ascii", 1, 4) === "PNG";
  const webp = signature.toString("ascii", 0, 4) === "RIFF" && signature.toString("ascii", 8, 12) === "WEBP";
  return jpeg || png || webp;
}

router.post("/v1/analyze", async (request, response) => {
  const startedAt = Date.now();

  try {
    const upload = await readMultipartImage(request);
    if (!isSupportedImage(upload)) {
      response.status(400).json({
        success: false,
        vehicles: [],
        processing_time_ms: Date.now() - startedAt,
        error: "Unsupported image format. Use JPEG, PNG, or WebP.",
      });
      return;
    }

    const inspection = await inspectImage(upload.buffer);
    request.log.info(
      { filename: upload.filename, contentType: upload.contentType, width: inspection.width, height: inspection.height },
      "Image preprocessed for vehicle analysis",
    );

    response.json({
      success: true,
      vehicles: [],
      annotated_image: null,
      processing_time_ms: Date.now() - startedAt,
      error:
        "Vehicle detector weights are not installed. Image validation and colour sampling completed; add a trained detector before identifying vehicles.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process image.";
    const status = message.includes("10 MB") ? 413 : 400;
    request.log.warn({ err: error }, "Image analysis request rejected");
    response.status(status).json({
      success: false,
      vehicles: [],
      processing_time_ms: Date.now() - startedAt,
      error: message,
    });
  }
});

export default router;