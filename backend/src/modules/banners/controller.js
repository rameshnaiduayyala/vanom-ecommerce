import { BannerService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class BannerController {
  constructor(service = new BannerService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const { type, active } = request.query;
    const data = await this.service.listBanners({ type, active });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  getById = async (request, reply) => {
    const data = await this.service.getBannerById(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  create = async (request, reply) => {
    const data = await this.service.createBanner(request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(data));
  };

  update = async (request, reply) => {
    const data = await this.service.updateBanner(request.params.id, request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(data));
  };

  delete = async (request, reply) => {
    await this.service.deleteBanner(request.params.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success({ message: "Banner deleted successfully" }));
  };
}
