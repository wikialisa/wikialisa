"use client";
/**
 * /enter-pin — PIN Entry
 *
 * Demo mode (GitHub Pages / no API):
 *   PIN "000000" → xác thực thành công ngay lập tức
 *
 * Production mode (có API):
 *   Gọi POST /api/v1/auth/pin/verify, tối đa 5 lần thử
 */
import React, { useState, useEffect, Suspense } from "react";
import { AlertCircle, Lock, ShieldCheck } from "@wikialisa/ui-kit";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_ATTEMPTS = 5;
const API_BASE     = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEMO_PIN     = "000000";
const PIN_LENGTH   = 6;

// ── PIN dot indicators ──────────────────────────────────────────────────────
function PinDots({ filled, total, error }: { filled: number; total: number; error: boolean }) {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: "50%",
          background: i < filled ? (error ? "#FF3D71" : "#000000") : "#E5E7EB",
          border: `2px solid ${i < filled ? (error ? "#FF3D71" : "#000000") : "#CBD5E0"}`,
          transition: "background .15s",
        }} />
      ))}
    </div>
  );
}

// ── Numeric keypad ──────────────────────────────────────────────────────────
function NumPad({ onDigit, disabled }: { onDigit: (d: string) => void; disabled?: boolean }) {
  const rows = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {row.map((d, di) => (
            <button
              key={di}
              disabled={disabled || !d}
              onClick={() => d && onDigit(d)}
              style={{
                width: 80, height: 80, borderRadius: "50%", border: "none",
                background: d ? (disabled ? "#F0F0F0" : "#F5F6FA") : "transparent",
                fontSize: d === "⌫" ? "1.5rem" : "1.625rem",
                fontWeight: 600, color: disabled ? "#B0B0B0" : "#000",
                cursor: d && !disabled ? "pointer" : "default",
                fontFamily: "inherit",
                transition: "background .1s, transform .05s",
                userSelect: "none",
              }}
              onMouseDown={e => { if (d && !disabled) (e.currentTarget.style.transform = "scale(.93)"); }}
              onMouseUp={e => { (e.currentTarget.style.transform = "scale(1)"); }}
              onTouchStart={e => { if (d && !disabled) (e.currentTarget.style.transform = "scale(.93)"); }}
              onTouchEnd={e => { (e.currentTarget.style.transform = "scale(1)"); }}
            >
              {d}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function EnterPinInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const rawReturn    = searchParams.get("returnUrl") ?? "/home";
  // Decode returnUrl — Next.js encodeURIComponent thêm %2F
  const returnUrl    = decodeURIComponent(rawReturn);
  const actionLabel  = searchParams.get("action") ?? "";

  const [pin,       setPin]       = useState("");
  const [attempts,  setAttempts]  = useState(0);
  const [error,     setError]     = useState("");
  const [locked,    setLocked]    = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  // ── Lockout countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (lockTimer <= 0) return;
    const t = setTimeout(() => setLockTimer(c => {
      if (c <= 1) { setLocked(false); setAttempts(0); return 0; }
      return c - 1;
    }), 1000);
    return () => clearTimeout(t);
  }, [lockTimer]);

  // ── Check demo mode ──────────────────────────────────────────────────────
  const isDemoMode = !API_BASE || API_BASE === "" || API_BASE.includes("localhost");

  // ── Handle digit input ───────────────────────────────────────────────────
  function handleDigit(d: string) {
    if (locked || loading || success) return;
    if (d === "⌫") {
      setPin(p => p.slice(0, -1));
      if (error) setError("");
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    setPin(p => p + d);
    if (error) setError("");
  }

  // ── Submit PIN ───────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (pin.length < PIN_LENGTH || locked || loading) return;
    setLoading(true);
    setError("");

    // Demo mode: PIN 000000 → thành công ngay
    if (isDemoMode || process.env.NEXT_PUBLIC_AUTH_MODE === "test") {
      if (pin === DEMO_PIN) {
        setSuccess(true);
        localStorage.setItem("auth_state", "onboarded");
        localStorage.setItem("access_token", localStorage.getItem("access_token") || "demo_token");
        setTimeout(() => router.replace(returnUrl), 600);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin("");
        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true);
          setLockTimer(30);
          setError("Đã nhập sai quá nhiều lần. Chờ 30 giây.");
        } else {
          setError(`PIN không đúng. Demo: nhập 000000. Còn ${MAX_ATTEMPTS - newAttempts} lần.`);
        }
      }
      setLoading(false);
      return;
    }

    // Production mode: gọi API
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await fetch(`${API_BASE}/api/v1/auth/pin/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ pin, action: actionLabel || "auth" }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.verified) {
        setSuccess(true);
        localStorage.setItem("auth_state", "onboarded");
        setTimeout(() => router.replace(returnUrl), 600);
        return;
      }
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockTimer(30);
        setError("Đã nhập sai quá nhiều lần. Vui lòng chờ 30 giây.");
      } else {
        setError(data?.message ?? `PIN không đúng. Còn ${MAX_ATTEMPTS - newAttempts} lần thử.`);
      }
    } catch {
      // Fallback: thử demo mode nếu network lỗi
      if (pin === DEMO_PIN) {
        setSuccess(true);
        localStorage.setItem("auth_state", "onboarded");
        localStorage.setItem("access_token", localStorage.getItem("access_token") || "demo_token");
        setTimeout(() => router.replace(returnUrl), 600);
      } else {
        setPin("");
        setError("Không kết nối được server. Demo: nhập 000000.");
      }
    } finally {
      setLoading(false);
    }
  }

  const contextLabel: Record<string, string> = {
    withdraw: "Xác nhận rút Cashback",
    cvv: "Xem CVV thẻ",
    transfer: "Xác nhận chuyển tiền",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      padding: "24px 20px", gap: 24,
      fontFamily: "'Work Sans', system-ui, sans-serif",
      background: "#FFFFFF",
    }}>

      {/* Lock icon */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: success ? "#00D68F" : "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .3s",
      }}>
        {success
          ? <ShieldCheck size={32} color="#fff" />
          : <Lock size={32} color="#BEFF6C" />
        }
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, color: "#1A1F36" }}>
          {success ? "Xác thực thành công!" : "Nhập mã PIN"}
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "#718096" }}>
          {success
            ? "Đang chuyển hướng…"
            : actionLabel && contextLabel[actionLabel]
              ? contextLabel[actionLabel]
              : "Xác thực để tiếp tục"}
        </p>
        {/* Demo hint */}
        {isDemoMode && !success && (
          <span style={{
            display: "inline-block", marginTop: 8,
            fontSize: "0.78rem", color: "#BEFF6C",
            background: "#1a1a1a", borderRadius: 6,
            padding: "3px 10px",
          }}>
            Demo: nhập <strong>0 0 0 0 0 0</strong>
          </span>
        )}
      </div>

      {/* Error / lockout banner */}
      {locked && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 8, background: "#FFF1F2", borderRadius: 12,
          padding: "14px 20px", textAlign: "center", width: "100%", maxWidth: 320,
        }}>
          <AlertCircle size={24} color="#FF3D71" />
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#FF3D71" }}>
            {error}
          </p>
          <span style={{
            background: "#FF3D71", color: "#fff", fontSize: "0.75rem",
            padding: "2px 10px", borderRadius: 999, fontWeight: 600,
          }}>
            Mở khoá sau {lockTimer}s
          </span>
        </div>
      )}

      {error && !locked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#FFF1F2", borderRadius: 8, padding: "8px 14px",
        }}>
          <AlertCircle size={14} color="#FF3D71" />
          <span style={{ fontSize: "0.8125rem", color: "#FF3D71" }}>{error}</span>
        </div>
      )}

      {/* PIN dots */}
      {!success && !locked && (
        <PinDots filled={pin.length} total={PIN_LENGTH} error={!!error} />
      )}

      {/* Keypad */}
      {!success && !locked && (
        <NumPad onDigit={handleDigit} disabled={loading} />
      )}

      {/* Submit button — round */}
      {!success && !locked && (
        <button
          onClick={handleSubmit}
          disabled={pin.length < PIN_LENGTH || loading}
          style={{
            width: 64, height: 64, borderRadius: "50%", border: "none",
            background: pin.length === PIN_LENGTH && !loading ? "#000000" : "#E2E8F0",
            color: pin.length === PIN_LENGTH && !loading ? "#BEFF6C" : "#A0AEC0",
            fontSize: "1.5rem", cursor: pin.length === PIN_LENGTH && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s, transform .1s",
            boxShadow: pin.length === PIN_LENGTH ? "0 4px 16px rgba(0,0,0,.2)" : "none",
          }}
          onMouseDown={e => { if (pin.length === PIN_LENGTH) (e.currentTarget.style.transform = "scale(.93)"); }}
          onMouseUp={e => { (e.currentTarget.style.transform = "scale(1)"); }}
        >
          {loading ? (
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "2px solid #BEFF6C", borderTopColor: "transparent",
              animation: "spin .6s linear infinite", display: "inline-block",
            }} />
          ) : "→"}
        </button>
      )}

      {/* Forgot PIN */}
      {!success && (
        <button
          onClick={() => router.push("/reset-pin")}
          style={{
            background: "none", border: "none",
            fontSize: "0.875rem", color: "#718096",
            cursor: "pointer", textDecoration: "underline",
            fontFamily: "inherit",
          }}
        >
          Quên PIN?
        </button>
      )}

      {/* TLS badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <ShieldCheck size={14} color="#00D68F" />
        <span style={{ fontSize: "0.75rem", color: "#A0AEC0" }}>Kết nối được mã hoá TLS 1.3</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function EnterPinPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ fontSize: "0.9rem", color: "#A0AEC0" }}>Đang tải...</span>
      </div>
    }>
      <EnterPinInner />
    </Suspense>
  );
}
