import React, { useState } from "react";
import { FileText, UploadCloud, Download, CheckCircle2, Clock, Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { toast } from "@/components/ui/Toast.jsx";

export function B2BCompanyDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "TAX_CERTIFICATE",
    description: "",
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      toast.error("Missing Document Title", "Please provide a valid document file name.");
      return;
    }
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: uploadForm.title.endsWith(".pdf") ? uploadForm.title : `${uploadForm.title}.pdf`,
      type: uploadForm.type,
      description: uploadForm.description || "Uploaded compliance document",
      status: "PENDING_REVIEW",
      fileSize: "1.2 MB",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verifiedAt: null,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    toast.success("Document Uploaded", "Your document has been submitted for compliance verification.");
    setIsUploadOpen(false);
    setUploadForm({ title: "", type: "TAX_CERTIFICATE", description: "" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#358B5B]" />
            <span>Corporate Compliance Documents & Tax Filings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official government registrations, GST certificates, and tax exemption filings for wholesale procurement.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsUploadOpen(true)}
          className="font-bold shadow-xs bg-[#204B38] hover:bg-[#18392B] cursor-pointer shrink-0"
        >
          Upload Document
        </Button>
      </div>

      {/* ── Documents Table or Empty State ── */}
      {documents.length > 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Document Title & Detail</th>
                <th className="p-4">Classification</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4">Date Uploaded</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#358B5B] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">{doc.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-600 font-semibold">{doc.type}</td>
                  <td className="p-4 text-slate-500">{doc.fileSize}</td>
                  <td className="p-4">
                    {doc.status === "VERIFIED" ? (
                      <Badge variant="green" size="sm" className="gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
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
                    <button
                      type="button"
                      onClick={() => toast.success("Download Initiated", `Downloading ${doc.title}...`)}
                      className="p-1.5 text-slate-500 hover:text-[#358B5B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                      title="Download document copy"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#358B5B] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Compliance Documents Uploaded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload your registered business certificates, GST registration proof, or export licenses to speed up order clearance.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="font-bold mt-2 bg-[#204B38] hover:bg-[#18392B]"
          >
            Upload First Document
          </Button>
        </div>
      )}

      {/* ── Upload Modal ── */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Business Compliance Document"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document File Name"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            placeholder="e.g. GST_Registration_Certificate.pdf"
            required
          />

          <Select
            label="Document Classification"
            value={uploadForm.type}
            onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
            options={[
              { label: "Tax Certificate (GST / VAT / W-9)", value: "TAX_CERTIFICATE" },
              { label: "Certificate of Incorporation (CIN / Articles)", value: "INCORPORATION" },
              { label: "Import / Export License (IEC)", value: "TRADE_LICENSE" },
              { label: "Audited Financial Statement", value: "FINANCIALS" },
            ]}
          />

          <Input
            label="Notes or Description"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            placeholder="e.g. Active GST Certificate"
          />

          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
            <p className="text-xs font-semibold text-slate-700">Click to attach PDF or scanned image</p>
            <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10 MB</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="font-bold bg-[#204B38] hover:bg-[#18392B]">
              Submit Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default B2BCompanyDocumentsPage;
