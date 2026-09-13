import React, { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export const TokenInspector: React.FC = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [headerData, setHeaderData] = useState<any>(null);
  const [payloadData, setPayloadData] = useState<any>(null);
  const [inspectionStatus, setInspectionStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleInspect = () => {
    const raw = tokenInput.trim();
    if (!raw) {
      alert("Please paste a valid JWT token first!");
      return;
    }

    try {
      const parts = raw.split(".");
      if (parts.length !== 3) {
        alert("Invalid JWT format! A valid JWT must contain 3 parts separated by dots.");
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      setHeaderData(header);
      setPayloadData(payload);

      const expDate = payload.exp
        ? new Date(payload.exp * 1000).toLocaleString()
        : "No Expiration Claim";
      const isExpired = payload.exp ? Date.now() > payload.exp * 1000 : false;

      if (isExpired) {
        setInspectionStatus({
          valid: false,
          message: `❌ TOKEN EXPIRED (Expired at: ${expDate})`,
        });
      } else {
        setInspectionStatus({
          valid: true,
          message: `✅ TOKEN VALID (Expires at: ${expDate})`,
        });
      }
    } catch (err: any) {
      alert("Error analyzing token: " + err.message);
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <h3>Interactive JWT Token Inspector</h3>
        <span className="badge info">Token Validator</span>
      </div>
      <p className="card-desc">
        Paste any JWT token below to analyze claims, check expiration time, signature algorithm,
        and blacklist status.
      </p>

      <div className="form-group">
        <label>Paste RAW JWT Token</label>
        <textarea
          rows={3}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
        />
      </div>
      <button onClick={handleInspect} className="btn btn-primary">
        Analyze & Verify Token
      </button>

      {inspectionStatus && (
        <div className="inspect-results" style={{ marginTop: "20px" }}>
          <div className="grid-2col">
            <div>
              <label className="small-label">HEADER (Algorithm & Type)</label>
              <pre className="code-box json-box">
                {JSON.stringify(headerData, null, 2)}
              </pre>
            </div>
            <div>
              <label className="small-label">PAYLOAD (Claims)</label>
              <pre className="code-box json-box">
                {JSON.stringify(payloadData, null, 2)}
              </pre>
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              marginTop: "16px",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: inspectionStatus.valid
                ? "rgba(16,185,129,0.15)"
                : "rgba(244,63,94,0.15)",
              color: inspectionStatus.valid ? "#10b981" : "#f43f5e",
              border: `1px solid ${inspectionStatus.valid ? "#10b981" : "#f43f5e"}`,
            }}
          >
            {inspectionStatus.valid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {inspectionStatus.message}
          </div>
        </div>
      )}
    </div>
  );
};
