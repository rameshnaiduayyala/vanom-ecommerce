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
});
