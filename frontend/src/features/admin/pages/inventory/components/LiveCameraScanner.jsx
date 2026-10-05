import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  ScanBarcode,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

/**
 * Synthetic beep sound for barcode scan confirmation
 */
function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Audio autoplay restrictions or unsupported
  }

  // Haptic feedback for mobile phones
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([60, 40, 60]);
    } catch (e) {}
  }
}

export function LiveCameraScanner({
  onScan,
  isActive = true,
  className = "",
  compact = false,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastScannedCodeRef = useRef("");
  const lastScannedTimeRef = useRef(0);

  const [cameraState, setCameraState] = useState("initializing"); // initializing | active | denied | unsupported
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // environment (back) | user (front)
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorchCapability, setHasTorchCapability] = useState(false);
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const [lastDetected, setLastDetected] = useState(null);

  // Check BarcodeDetector API support
  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setHasBarcodeDetector(true);
    } else {
      setHasBarcodeDetector(false);
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState("unsupported");
      setErrorMessage("Camera access is not supported by your browser or environment.");
      return;
    }

    setCameraState("initializing");
    setErrorMessage("");

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === "function") {
        const caps = videoTrack.getCapabilities();
        setHasTorchCapability(Boolean(caps.torch));
      } else {
        setHasTorchCapability(false);
      }

      setCameraState("active");
    } catch (err) {
      console.warn("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraState("denied");
        setErrorMessage("Camera permission was denied. Please allow camera permissions in your browser.");
      } else {
        setCameraState("denied");
        setErrorMessage(err.message || "Failed to initialize camera video stream.");
      }
    }
  }, [facingMode, stopCamera]);

  // Handle detection loop with BarcodeDetector
  useEffect(() => {
    if (cameraState !== "active" || !isActive || !hasBarcodeDetector) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      return;
    }

    let detector = null;
    try {
      detector = new window.BarcodeDetector({
        formats: [
          "qr_code",
          "ean_13",
          "ean_8",
          "code_128",
          "code_39",
          "upc_a",
          "upc_e",
          "itf",
          "codabar",
        ],
      });
    } catch (e) {
      detector = null;
    }

    if (!detector) return;

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue?.trim();
          if (raw) {
            const now = Date.now();
            // Prevent duplicate triggers within 2 seconds for identical barcode
            if (raw !== lastScannedCodeRef.current || now - lastScannedTimeRef.current > 2000) {
              lastScannedCodeRef.current = raw;
              lastScannedTimeRef.current = now;
              setLastDetected({ code: raw, time: new Date().toLocaleTimeString() });
              playScanBeep();
              if (onScan) {
                onScan(raw);
              }
            }
          }
        }
      } catch (err) {
        // Frame detection error
      }
    }, 200);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraState, isActive, hasBarcodeDetector, onScan]);

  // Lifecycle for starting and stopping camera
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn("Torch toggle not supported:", e);
    }
  };

  // Flip Front / Back Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Handle Photo Upload fallback
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (hasBarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector();
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const barcodes = await detector.detect(img);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              playScanBeep();
              setLastDetected({ code, time: new Date().toLocaleTimeString() });
              if (onScan) onScan(code);
            } else {
              alert("No barcode could be detected in this photo. Please try a clearer picture or enter SKU manually.");
            }
          } catch (err) {
            alert("Error analyzing image barcode.");
          }
        };
      } catch (err) {}
    } else {
      alert("Barcode image detection requires modern browser support. Please type the SKU directly.");
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center ${className}`}>
      {/* ── Video Stream Viewfinder ── */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          cameraState === "active" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Viewfinder Overlay Targeting Box (Active Camera) ── */}
      {cameraState === "active" && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          {/* Target Reticle Box */}
          <div className="relative w-64 h-48 sm:w-80 sm:h-56 border-2 border-white/40 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00A86B] rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00A86B] rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00A86B] rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00A86B] rounded-br-lg" />

            {/* Animated Laser Scanning Line */}
            <div
              className="absolute left-2 right-2 h-0.5 bg-rose-500 shadow-[0_0_8px_2px_rgba(244,63,94,0.85)] animate-pulse"
              style={{
                animation: "laserScan 2.2s ease-in-out infinite alternate",
              }}
            />

            <span className="text-[11px] font-mono font-bold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs tracking-wider uppercase">
              Align Barcode / QR Here
            </span>
          </div>

          {/* Last detected badge popup */}
          {lastDetected && (
            <div className="absolute bottom-16 bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scanned: {lastDetected.code} ({lastDetected.time})</span>
            </div>
          )}
        </div>
      )}

      {/* ── State Loading & Errors Overlay ── */}
      {cameraState === "initializing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/90 text-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm font-bold text-white">Opening Mobile Camera...</p>
          <p className="text-xs text-slate-400">Please grant camera permission when prompted.</p>
        </div>
      )}

      {cameraState === "denied" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-center gap-3">
          <CameraOff className="w-10 h-10 text-rose-400" />
          <p className="text-sm font-bold text-white">Camera Access Denied</p>
          <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={startCamera}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Try Again
            </Button>
            <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {cameraState === "unsupported" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-center gap-3">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Camera Not Accessible</p>
          <p className="text-xs text-slate-400 max-w-xs">
            {errorMessage || "Use an HTTPS connection or hardware scanner."}
          </p>
          <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Scan from Photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* ── Controls Floating Toolbar (Bottom/Top) ── */}
      {cameraState === "active" && (
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            {/* Flip camera */}
            <button
              type="button"
              onClick={flipCamera}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Flip Camera (Front/Back)"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Flip Camera</span>
            </button>

            {/* Flashlight toggle */}
            {hasTorchCapability && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  torchOn ? "bg-amber-400 text-slate-950 font-bold" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Toggle Flashlight"
              >
                {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
                <span className="hidden sm:inline text-[11px]">{torchOn ? "Flash On" : "Torch"}</span>
              </button>
            )}
          </div>

          {/* Photo upload fallback */}
          <label className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">Snap / Upload</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* CSS Keyframes for laser animation */}
      <style>{`
        @keyframes laserScan {
          0% { top: 8%; opacity: 0.8; }
          50% { opacity: 1; }
          100% { top: 92%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default LiveCameraScanner;
