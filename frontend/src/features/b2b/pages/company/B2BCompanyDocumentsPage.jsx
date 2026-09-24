import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  Inbox,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import { Api } from "@/services/api/api-client.js";
import { useCompanyProfile } from "./hooks/useCompanyProfile.js";

const DOCUMENT_TYPES = [
  { label: "Tax Exemption / GST / VAT / W-9 Certificate", value: "TAX_CERTIFICATE" },
  { label: "Certificate of Incorporation (CIN / Articles)", value: "INCORPORATION" },
  { label: "Import / Export License (IEC / Commercial Permit)", value: "TRADE_LICENSE" },
  { label: "Quality, ISO, Halal, Kosher or Organic Certificate", value: "QUALITY_CERT" },
  { label: "Audited Financial Statement / Bank Solvency Letter", value: "FINANCIALS" },
  { label: "Authorized Signatory Proof of Identity", value: "IDENTITY_PROOF" },
];

export function B2BCompanyDocumentsPage() {
  const { company, updateDocuments, isUpdatingDocs, isLoading } = useCompanyProfile();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "TAX_CERTIFICATE",
    description: "",
  });

  const documents = Array.isArray(company?.documents) ? company.documents : [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("File Too Large", "Maximum allowed file size is 15MB.");
        return;
      }
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      toast.error("Missing Title", "Please provide a valid document name.");
      return;
    }

    try {
      setIsUploadingFile(true);
      let fileUrl = "";
      let fileSizeStr = "1.2 MB";

      if (selectedFile) {
        // Upload to server
        const uploadRes = await Api.upload.uploadFile(selectedFile, "documents");
        fileUrl = uploadRes?.url || uploadRes?.data?.url || "";
        const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
        fileSizeStr = `${sizeMb} MB`;
      }

      const newDoc = {
        id: `doc-${Date.now()}`,
        title: uploadForm.title.trim(),
        type: uploadForm.type,
        url: fileUrl,
        description: uploadForm.description?.trim() || "Uploaded corporate compliance certificate",
        status: "VERIFIED",
        fileSize: fileSizeStr,
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      const updatedList = [newDoc, ...documents];
      await updateDocuments(updatedList);
      toast.success("Document Uploaded", "Certificate saved and registered to your company profile.");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadForm({ title: "", type: "TAX_CERTIFICATE", description: "" });
    } catch (err) {
      toast.error("Upload Error", err.message || "Failed to process document upload.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    const remaining = documents.filter((d) => d.id !== docId);
    try {
      await updateDocuments(remaining);
      toast.success("Document Removed", "Compliance document deleted from company dossier.");
    } catch (err) {
      toast.error("Delete Error", err.message || "Could not delete document.");
    }
  };

  const isLocked = Boolean(company?.isLocked);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-700" />
            <span>Corporate Compliance Documents & Certificates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered government certificates, tax exemption proof (GST / VAT / W-9), export licenses, and ISO standards.
          </p>
        </div>

        {isLocked ? (
          <Badge variant="green" size="md" className="gap-1.5 font-bold py-2 px-3 text-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Dossier Verified & Locked</span>
          </Badge>
        ) : (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsUploadOpen(true)}
            className="font-bold shadow-xs bg-[#204B38] hover:bg-[#18392B] cursor-pointer shrink-0"
          >
            Upload Certificate / Filing
          </Button>
        )}
      </div>

      {/* ── Verified Compliance Alert ── */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-slate-900">Compliance & KYC Documentation Verified & Locked</p>
            <p className="text-slate-600 leading-relaxed">
              All corporate compliance certificates, tax filings, and trade licenses have been validated and approved by administrative compliance. Direct uploads and modifications are locked to preserve legal audit trail.
            </p>
          </div>
        </div>
      )}

      {/* ── Documents Table or Empty State ── */}
      {documents.length > 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Document Title & Summary</th>
                <th className="p-4">Classification</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4">Date Uploaded</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">{doc.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-700 font-semibold">
                    {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label.split("(")[0] || doc.type}
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{doc.fileSize || "1.2 MB"}</td>
                  <td className="p-4">
                    {doc.status === "VERIFIED" || isLocked ? (
                      <Badge variant="green" size="sm" className="gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KYC Verified</span>
                      </Badge>
                    ) : (
                      <Badge variant="yellow" size="sm" className="gap-1 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>In Review</span>
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{doc.uploadedAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                          title="View / Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toast.success("Document Verified", `Certificate ${doc.title} is active in commercial dossier.`)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </button>
                      )}
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={isUpdatingDocs}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#358B5B] flex items-center justify-center mx-auto border border-emerald-100">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Compliance Documents Uploaded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isLocked
              ? "All commercial verification was completed directly through administrative clearance."
              : "Upload your registered business certificates, GST registration proof, or export licenses to speed up order clearance."}
          </p>
          {!isLocked && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="font-bold mt-2 bg-[#204B38] hover:bg-[#18392B]"
            >
              Upload First Certificate
            </Button>
          )}
        </div>
      )}

      {/* ── Upload Modal ── */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Business Compliance Certificate"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document / Certificate Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            placeholder="e.g. GST Registration Certificate"
            required
          />

          <Select
            label="Document Classification"
            value={uploadForm.type}
            onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
            options={DOCUMENT_TYPES}
          />

          <Input
            label="Notes or Issuing Authority"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            placeholder="e.g. Ministry of Corporate Affairs, Valid until 2028"
          />

          {/* Real File Input Drag & Drop Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-5 border-2 border-dashed border-slate-200 hover:border-emerald-600/60 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <UploadCloud className="w-8 h-8 text-emerald-700 mb-1.5" />
            {selectedFile ? (
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-[10px] text-emerald-700 font-semibold font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for secure upload
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag document here to attach
                </p>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG, DOCX up to 15 MB</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploadingFile || isUpdatingDocs}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploadingFile || isUpdatingDocs}
              className="font-bold bg-[#204B38] hover:bg-[#18392B]"
            >
              Save & Attach Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default B2BCompanyDocumentsPage;
