import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";

describe("B2B Company Onboarding & Verification Tests", () => {
  let app;
  let adminUser;
  let adminToken;
  let companyUser;
  let companyUserToken;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    // Setup Admin
    adminUser = await prisma.user.findUnique({
      where: { email: "admin@vanom.com" },
      include: { roles: { include: { role: true } } },
    });
    if (adminUser) {
      adminToken = app.jwt.sign({
        userId: adminUser.id,
        email: adminUser.email,
        roles: ["SUPER_ADMIN"],
      });
    }

    // Register a new user for company testing
    const email = `companyfounder_${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email,
        password: "Password123!",
        firstName: "Anil",
        lastName: "Sharma",
        customerType: "B2B",
      },
    });
    const regBody = JSON.parse(regRes.payload);
    companyUser = regBody.data.user;
    companyUserToken = regBody.data.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await disconnectPrisma();
  });

  let createdCompanyId;
  let fileAssetId;

  it("should allow a customer to register a new B2B company", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/companies",
      headers: { authorization: `Bearer ${companyUserToken}` },
      payload: {
        legalName: "Sharma Agro Supplies LLP",
        tradingName: "Sharma Agro",
        registrationNumber: "LLPIN-123456",
        taxId: "27AAAAA0000A1Z5",
        countryCode: "IN",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("PENDING");
    createdCompanyId = body.data.id;
  });

  it("should allow company member (self) to update their company details while PENDING / UNDER_REVIEW", async () => {
    const updateRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/companies/${createdCompanyId}`,
      headers: { authorization: `Bearer ${companyUserToken}` },
      payload: {
        tradingName: "Sharma Agro Global",
        taxId: "27BBBBB1111B2Z6",
      },
    });

    expect(updateRes.statusCode).toBe(200);
    const body = JSON.parse(updateRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.tradingName).toBe("Sharma Agro Global");
    expect(body.data.taxId).toBe("27BBBBB1111B2Z6");
  });

  it("should upload a business document", async () => {
    const fileRes = await app.inject({
      method: "POST",
      url: "/api/v1/files/upload",
      headers: { authorization: `Bearer ${companyUserToken}` },
      payload: {
        originalName: "gst_certificate.pdf",
        mimeType: "application/pdf",
        type: "BUSINESS_DOCUMENT",
        base64Content: Buffer.from("Mock GST Certificate Content").toString("base64"),
      },
    });

    expect(fileRes.statusCode).toBe(201);
    const fileBody = JSON.parse(fileRes.payload);
    fileAssetId = fileBody.data.id;

    // Attach to company
    const attachRes = await app.inject({
      method: "POST",
      url: `/api/v1/companies/${createdCompanyId}/documents`,
      headers: { authorization: `Bearer ${companyUserToken}` },
      payload: {
        fileAssetId,
        documentType: "TAX_CERTIFICATE",
        documentNumber: "27AAAAA0000A1Z5",
      },
    });

    expect(attachRes.statusCode).toBe(201);
    const attachBody = JSON.parse(attachRes.payload);
    expect(attachBody.success).toBe(true);
    expect(attachBody.data.status).toBe("UPLOADED");
  });

  it("should submit company for verification", async () => {
    const submitRes = await app.inject({
      method: "POST",
      url: `/api/v1/companies/${createdCompanyId}/submit-verification`,
      headers: { authorization: `Bearer ${companyUserToken}` },
    });

    expect(submitRes.statusCode).toBe(200);
    const submitBody = JSON.parse(submitRes.payload);
    expect(submitBody.success).toBe(true);
    expect(submitBody.data.status).toBe("UNDER_REVIEW");
  });

  it("should allow admin to approve the business application", async () => {
    if (!adminToken) return;

    // 1. Find the application ID
    const appsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/business-applications?status=UNDER_REVIEW",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const appsBody = JSON.parse(appsRes.payload);
    const appRecord = appsBody.data.find(a => a.companyId === createdCompanyId);
    expect(appRecord).toBeDefined();

    // 2. Approve
    const approveRes = await app.inject({
      method: "POST",
      url: `/api/v1/admin/business-applications/${appRecord.id}/approve`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { notes: "Verified against GSTN database" },
    });

    expect(approveRes.statusCode).toBe(200);
    const approveBody = JSON.parse(approveRes.payload);
    expect(approveBody.success).toBe(true);

    // Verify company status in database
    const company = await prisma.company.findUnique({ where: { id: createdCompanyId } });
    expect(company.status).toBe("APPROVED");
    expect(company.approvedById).toBe(adminUser.id);
  });

  it("should lock company details and forbid self-edits once company is APPROVED", async () => {
    const updateRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/companies/${createdCompanyId}`,
      headers: { authorization: `Bearer ${companyUserToken}` },
      payload: {
        tradingName: "Attempted Unauthorized Name Change",
      },
    });

    expect(updateRes.statusCode).toBe(403);
    const body = JSON.parse(updateRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.message).toMatch(/locked after admin verification/i);
  });

  it("should allow admin to update company details including status and credit limits", async () => {
    if (!adminToken) return;

    const adminEditRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/companies/${createdCompanyId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        paymentTermsDays: 45,
        creditLimit: 500000,
      },
    });

    expect(adminEditRes.statusCode).toBe(200);
    const body = JSON.parse(adminEditRes.payload);
    expect(body.success).toBe(true);

    const updated = await prisma.company.findUnique({ where: { id: createdCompanyId } });
    expect(updated.paymentTermsDays).toBe(45);
    expect(Number(updated.creditLimit)).toBe(500000);
  });

  it("should list companies appropriately for self vs admin", async () => {
    // Self list: only companies user belongs to
    const selfListRes = await app.inject({
      method: "GET",
      url: "/api/v1/companies",
      headers: { authorization: `Bearer ${companyUserToken}` },
    });
    expect(selfListRes.statusCode).toBe(200);
    const selfBody = JSON.parse(selfListRes.payload);
    expect(selfBody.data.items.length).toBeGreaterThanOrEqual(1);
    expect(selfBody.data.items.some((c) => c.id === createdCompanyId)).toBe(true);

    // Admin list: can list and search all companies
    if (adminToken) {
      const adminListRes = await app.inject({
        method: "GET",
        url: "/api/v1/companies?search=Sharma",
        headers: { authorization: `Bearer ${adminToken}` },
      });
      expect(adminListRes.statusCode).toBe(200);
      const adminBody = JSON.parse(adminListRes.payload);
      expect(adminBody.data.items.some((c) => c.id === createdCompanyId)).toBe(true);
    }
  });
});

