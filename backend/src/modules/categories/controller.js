import { CategoryService } from "./service.js";

export class CategoryController {
  constructor(service = new CategoryService()) {
    this.service = service;
  }

  /**
   * GET /api/v1/categories
   */
  list = async (req, reply) => {
    const { activeOnly, rootOnly, search } = req.query || {};
    const data = await this.service.list({
      activeOnly: activeOnly !== undefined ? activeOnly === "true" || activeOnly === true : true,
      rootOnly: rootOnly === "true" || rootOnly === true,
      search,
    });
    return reply.send({ success: true, data });
  };

  /**
   * GET /api/v1/categories/:id
   */
  getById = async (req, reply) => {
    const data = await this.service.getById(req.params.id);
    return reply.send({ success: true, data });
  };

  /**
   * POST /api/v1/categories (JSON body or Multipart form-data)
   */
  create = async (req, reply) => {
    let categoryData = {};

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      let imageFile = null;

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "image") {
          const buffer = await part.toBuffer();
          imageFile = {
            fileBuffer: buffer,
            originalName: part.filename,
            mimeType: part.mimetype,
          };
        } else {
          categoryData[part.fieldname] = part.value;
        }
      }

      if (imageFile) {
        categoryData.imageFile = imageFile;
      }
    } else {
      categoryData = req.body || {};
    }

    const data = await this.service.create(categoryData, req.user);
    return reply.status(201).send({
      success: true,
      message: "Category created successfully",
      data,
    });
  };

  /**
   * PUT /api/v1/categories/:id (JSON body or Multipart form-data)
   */
  update = async (req, reply) => {
    let updateData = {};

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      let imageFile = null;

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "image") {
          const buffer = await part.toBuffer();
          imageFile = {
            fileBuffer: buffer,
            originalName: part.filename,
            mimeType: part.mimetype,
          };
        } else {
          updateData[part.fieldname] = part.value;
        }
      }

      if (imageFile) {
        updateData.imageFile = imageFile;
      }
    } else {
      updateData = req.body || {};
    }

    const data = await this.service.update(req.params.id, updateData, req.user);
    return reply.send({
      success: true,
      message: "Category updated successfully",
      data,
    });
  };

  /**
   * POST /api/v1/categories/:id/image (Dedicated image upload endpoint)
   */
  uploadImage = async (req, reply) => {
    if (!req.isMultipart || !req.isMultipart()) {
      return reply.status(400).send({
        success: false,
        message: "Request must be multipart/form-data with an 'image' file field",
      });
    }

    const file = await req.file();
    if (!file) {
      return reply.status(400).send({
        success: false,
        message: "No image file provided in request",
      });
    }

    const buffer = await file.toBuffer();
    const data = await this.service.uploadImageForCategory(
      req.params.id,
      {
        fileBuffer: buffer,
        originalName: file.filename,
        mimeType: file.mimetype,
      },
      req.user
    );

    return reply.send({
      success: true,
      message: "Category image uploaded successfully",
      data,
    });
  };

  /**
   * DELETE /api/v1/categories/:id/image (Remove image from category)
   */
  deleteImage = async (req, reply) => {
    const data = await this.service.deleteCategoryImage(req.params.id);
    return reply.send({
      success: true,
      message: "Category image removed successfully",
      data,
    });
  };

  /**
   * POST /api/v1/categories/:id/presigned-image-url (Get direct S3 pre-signed upload URL)
   */
  getPresignedUploadUrl = async (req, reply) => {
    const { filename, mimeType } = req.body || {};
    if (!filename || !mimeType) {
      return reply.status(400).send({
        success: false,
        message: "filename and mimeType are required",
      });
    }

    const data = await this.service.getPresignedUploadUrl(req.params.id, {
      filename,
      mimeType,
    });

    return reply.send({
      success: true,
      message: "Pre-signed S3 upload URL generated",
      data,
    });
  };

  /**
   * DELETE /api/v1/categories/:id
   */
  delete = async (req, reply) => {
    const { hard } = req.query || {};
    await this.service.delete(req.params.id, {
      hard: hard === "true" || hard === true,
    });

    return reply.send({
      success: true,
      message: "Category deleted successfully",
    });
  };
}
