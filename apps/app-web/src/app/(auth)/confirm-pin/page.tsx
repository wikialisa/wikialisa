"use client";
/**
 * /confirm-pin — Confirm PIN Page
 * Gửi PIN lên POST /api/v1/auth/pin/set sau khi xác nhận khớp.
 * Không lưu PIN vào localStorage.
 */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@wikialisa/ui-kit";

const PIN_LENGTH = 6;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ConfirmPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleComplete(value: string) {
    const expected = sessionStorage.getItem("pin_temp") ?? "";
    if (value !== expected) {
      setError(true);
      setPin("");
      return;
    }
    // Xác nhận khớp — gửi PIN lên server để hash & lưu
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await fetch(`${API_BASE}/api/v1/auth/pin/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ newPin: value }),
      });
      if (!res.ok) {
        setError(true);
        setPin("");
        return;
      }
      // Xóa PIN tạm ngay lập tức, đánh dấu onboarded
      sessionStorage.removeItem("pin_temp");
      localStorage.setItem("auth_state", "onboarded");
      router.replace("/home");
    } catch {
      setError(true);
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(val: string) {
    setPin(val);
    if (error) setError(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Work Sans', sans-serif",
      padding: "64px 24px 48px",
    }}>
      {/* Title */}
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: "#000" }}>
          Xác nhận mã PIN
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: "0.9375rem", color: "#8F9BB3" }}>
          Nhập lại PIN để xác nhận
        </p>
      </div>

      {/* Dot indicators */}
      <PinDots filled={pin.length} total={PIN_LENGTH} error={error} />

      {error && (
        <p style={{
          marginTop: 16,
          color: "#FF3D71",
          fontSize: "0.875rem",
          textAlign: "center",
        }}>
          PIN không khớp, thử lại
        </p>
      )}

      <div style={{ marginTop: 48 }}>
        <PinPad
          length={PIN_LENGTH}
          value={pin}
          onChange={handleChange}
          onComplete={handleComplete}
          error={error}
        />
      </div>
    </div>
  );
}

function PinDots({ filled, total, error }: { filled: number; total: number; error: boolean }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: i < filled
              ? (error ? "#FF3D71" : "#000000")
              : "#E5E7EB",
            transition: "background 0.15s",
            border: `2px solid ${i < filled ? (error ? "#FF3D71" : "#000000") : "#CBD5E0"}`,
          }}
        />
      ))}
    </div>
  );
}
