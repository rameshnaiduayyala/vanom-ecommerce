import { FileService } from "./service.js";

export class FileController {
  constructor(service = new FileService()) {
    this.service = service;
  }

  upload = async (request, reply) => {
    const { originalName, mimeType, type, base64Content } = request.body || {};
    if (!base64Content || !originalName) {
      return reply.status(400).send({ success: false, message: "originalName and base64Content are required" });
    }
    const buffer = Buffer.from(base64Content, "base64");
    const asset = await this.service.uploadFile({
      fileBuffer: buffer,
      originalName,
      mimeType: mimeType || "application/octet-stream",
      type: type || "BUSINESS_DOCUMENT",
      uploadedById: request.user.id,
    });
    return reply.status(201).send({ success: true, data: asset });
  };

  getFile = async (request, reply) => {
    const storageKey = request.params["*"];
    const fileData = await this.service.getFileStream(storageKey, request.user);
    reply.type(fileData.mimeType);
    return reply.send(fileData.buffer);
  };
}
