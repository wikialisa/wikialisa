"use client";
/**
 * /demo — Self-contained demo walkthrough (no router, no API)
 *
 * Flow:
 *  splash → onboarding(0) → onboarding(1) → register →
 *  register_filled → otp → otp_filled → set_pin →
 *  setting_pin → home
 */
import React, { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "splash"
  | "onboarding_0"
  | "onboarding_1"
  | "register"
  | "register_filled"
  | "otp"
  | "otp_filled"
  | "set_pin"
  | "setting_pin"
  | "home";

// ── Constants ─────────────────────────────────────────────────────────────
const ACCENT   = "#BEFF6C";
const BLACK    = "#000000";
const WHITE    = "#FFFFFF";
const MUTED    = "#8F9BB3";
const FONT     = "'Work Sans', system-ui, sans-serif";

// ── Helper: Phone-frame wrapper ────────────────────────────────────────────
function PhoneFrame({ children, bg = WHITE }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{
      width: "100%", maxWidth: 390,
      minHeight: "100vh",
      background: bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      position: "relative",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

// ── Screen: Splash ─────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <PhoneFrame bg={BLACK}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
      }}>
        {/* Logo */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: ACCENT,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M10 42L26 10L42 42" stroke={BLACK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 32H36" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: WHITE, letterSpacing: "-1px" }}>AXQ</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Powered by WikiAlisa
          </div>
        </div>
        {/* Loading dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: ACCENT,
              animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
              opacity: 0.6,
            }} />
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 32, color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>
        AXQ Tech Holding JSC · axvn.vn
      </div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.4);opacity:1} }`}</style>
    </PhoneFrame>
  );
}

// ── Screen: Onboarding ─────────────────────────────────────────────────────
const SLIDES = [
  {
    bg: BLACK, fg: WHITE, accentBg: `rgba(190,255,108,.12)`,
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="16" width="40" height="28" rx="6" stroke={ACCENT} strokeWidth="2.5"/>
        <path d="M8 24h40" stroke={ACCENT} strokeWidth="2.5"/>
        <rect x="14" y="30" width="12" height="4" rx="2" fill={ACCENT}/>
      </svg>
    ),
    title:    "Quản lý tài chính thông minh",
    subtitle: "P2P · Crypto · Cashback tất cả trong một ví",
    dot:      ACCENT,
    dotInactive: "rgba(255,255,255,0.3)",
    btn:      { bg: WHITE, fg: BLACK, label: "Tiếp theo" },
  },
  {
    bg: ACCENT, fg: BLACK, accentBg: "rgba(0,0,0,.08)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M14 28h28M14 28l8-8M14 28l8 8M42 28l-8-8M42 28l-8 8" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title:    "Giao dịch tức thì",
    subtitle: "Chuyển tiền P2P, đổi crypto nhanh chóng",
    dot:      BLACK,
    dotInactive: "rgba(0,0,0,.25)",
    btn:      { bg: BLACK, fg: WHITE, label: "Bắt đầu" },
  },
];

function OnboardingScreen({ index, onNext }: { index: 0 | 1; onNext: () => void }) {
  const s = SLIDES[index];
  return (
    <PhoneFrame bg={s.bg}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "60px 32px 48px",
      }}>
        <div />
        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center" }}>
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: s.accentBg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {s.icon}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: s.fg, lineHeight: 1.2 }}>
              {s.title}
            </h1>
            <p style={{ margin: 0, fontSize: "0.9375rem", color: index === 0 ? "rgba(255,255,255,.65)" : "rgba(0,0,0,.55)", lineHeight: 1.5 }}>
              {s.subtitle}
            </p>
          </div>
        </div>
        {/* Bottom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, width: "100%" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                width: i === index ? 24 : 8, height: 8, borderRadius: 4,
                background: i === index ? s.dot : s.dotInactive,
                transition: "width .25s, background .25s",
              }} />
            ))}
          </div>
          <button onClick={onNext} style={{
            width: "100%", padding: "16px 0", borderRadius: 99, border: "none",
            background: s.btn.bg, color: s.btn.fg,
            fontSize: "1rem", fontWeight: 700, cursor: "pointer",
            fontFamily: FONT,
          }}>
            {s.btn.label}
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen: Register ───────────────────────────────────────────────────────
function RegisterScreen({ filled, onBack, onContinue }: { filled: boolean; onBack: () => void; onContinue: () => void }) {
  const phone = filled ? "+84 901 234 567" : "";
  const agreed = filled;

  return (
    <PhoneFrame bg={WHITE}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 8 }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: "#F5F6FA", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 16L6 10L12 4" stroke={BLACK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: "8px 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: BLACK }}>Đăng ký tài khoản</h1>
          <p style={{ margin: "8px 0 0", fontSize: "0.9375rem", color: MUTED }}>Nhập số điện thoại để bắt đầu</p>
        </div>

        {/* Phone input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: BLACK }}>Số điện thoại</label>
          <div style={{
            padding: "14px 16px", borderRadius: 12,
            border: `2px solid ${filled ? BLACK : "#E2E8F0"}`,
            fontSize: "0.9375rem", color: filled ? BLACK : MUTED,
            background: "#FAFAFA",
          }}>
            {filled ? phone : "+84 xxx xxx xxx"}
          </div>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            flexShrink: 0, marginTop: 2,
            width: 20, height: 20, borderRadius: 6,
            border: `2px solid ${agreed ? BLACK : "#CBD5E0"}`,
            background: agreed ? BLACK : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: "0.875rem", color: "#2E3A59", lineHeight: 1.5 }}>
            Tôi đồng ý với{" "}
            <span style={{ color: "#0095FF", fontWeight: 600 }}>Điều khoản sử dụng</span>
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={filled ? onContinue : undefined}
          disabled={!filled}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 99, border: "none",
            background: filled ? BLACK : "#E2E8F0",
            color: filled ? WHITE : MUTED,
            fontSize: "1rem", fontWeight: 700,
            cursor: filled ? "pointer" : "not-allowed",
            fontFamily: FONT, transition: "background .2s",
          }}
        >
          Tiếp tục
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen: OTP ────────────────────────────────────────────────────────────
function OtpScreen({ filled, onBack, onConfirm }: { filled: boolean; onBack: () => void; onConfirm: () => void }) {
  const otp = filled ? ["0", "0", "0", "0", "0", "0"] : ["", "", "", "", "", ""];
  return (
    <PhoneFrame bg={WHITE}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 8 }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: "#F5F6FA", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 16L6 10L12 4" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <span style={{ fontSize: "1.0625rem", fontWeight: 600, color: BLACK }}>Xác nhận OTP</span>
      </div>

      <div style={{ flex: 1, padding: "8px 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Nhập mã xác nhận</h2>
          <p style={{ margin: "8px 0 0", fontSize: "0.9375rem", color: MUTED }}>
            Mã 6 chữ số đã gửi đến <strong style={{ color: BLACK }}>+84 901 234 567</strong>
          </p>
        </div>

        {/* OTP boxes */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {otp.map((v, i) => (
            <div key={i} style={{
              width: 48, height: 56, borderRadius: 12,
              border: `2px solid ${filled ? BLACK : "#E2E8F0"}`,
              background: filled ? "#F0FFF0" : "#FAFAFA",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 700,
            }}>
              {v && "•"}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", color: MUTED, fontSize: "0.875rem" }}>
          {filled ? (
            <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ OTP hợp lệ</span>
          ) : (
            <span>Gửi lại sau <strong style={{ color: BLACK }}>59s</strong></span>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={filled ? onConfirm : undefined}
          disabled={!filled}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 99, border: "none",
            background: filled ? BLACK : "#E2E8F0",
            color: filled ? WHITE : MUTED,
            fontSize: "1rem", fontWeight: 700,
            cursor: filled ? "pointer" : "not-allowed",
            fontFamily: FONT,
          }}
        >
          Xác nhận
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen: Set PIN ────────────────────────────────────────────────────────
function SetPinScreen({ filledCount, title, subtitle, onDigit }: {
  filledCount: number; title: string; subtitle: string;
  onDigit?: (d: string) => void;
}) {
  const PIN_LEN = 6;
  const rows = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  return (
    <PhoneFrame bg={WHITE}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "64px 24px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: BLACK }}>{title}</h1>
          <p style={{ margin: "10px 0 0", fontSize: "0.9375rem", color: MUTED }}>{subtitle}</p>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: 16 }}>
          {Array.from({ length: PIN_LEN }).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%",
              background: i < filledCount ? BLACK : "#E5E7EB",
              border: `2px solid ${i < filledCount ? BLACK : "#CBD5E0"}`,
              transition: "background .15s",
            }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 8 }}>
              {row.map((d, di) => (
                <button key={di} onClick={() => onDigit?.(d)} style={{
                  width: 80, height: 80, borderRadius: "50%", border: "none",
                  background: d ? "#F5F6FA" : "transparent",
                  fontSize: d === "⌫" ? "1.4rem" : "1.625rem",
                  fontWeight: 600, color: BLACK, cursor: d ? "pointer" : "default",
                  fontFamily: FONT,
                  transition: "background .1s",
                }}>
                  {d}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen: Setting PIN (loading) ──────────────────────────────────────────
function SettingPinScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onDone, 400); return 100; }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <PhoneFrame bg={BLACK}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 32,
        padding: "40px 40px",
      }}>
        {/* Spinner */}
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(190,255,108,.15)" strokeWidth="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke={ACCENT} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset .06s linear" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 700, color: ACCENT,
          }}>
            {progress}%
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: WHITE }}>
            Đang thiết lập mã PIN
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: "0.9375rem", color: "rgba(255,255,255,.55)" }}>
            Vui lòng không tắt ứng dụng...
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {["Mã hoá", "Đồng bộ", "Xác thực"].map((step, i) => (
            <div key={i} style={{
              padding: "4px 12px", borderRadius: 999,
              background: progress > i * 33 ? `rgba(190,255,108,.15)` : "rgba(255,255,255,.06)",
              border: `1px solid ${progress > i * 33 ? ACCENT : "rgba(255,255,255,.1)"}`,
              fontSize: "0.75rem", color: progress > i * 33 ? ACCENT : "rgba(255,255,255,.3)",
              transition: "all .3s",
            }}>
              {progress > i * 33 ? "✓ " : ""}{step}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen: Home ───────────────────────────────────────────────────────────
function HomeScreen() {
  const [showBalance, setShowBalance] = useState(true);
  return (
    <PhoneFrame bg="#F8F9FC">
      {/* Header */}
      <div style={{ background: BLACK, padding: "20px 20px 28px", borderRadius: "0 0 28px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,.55)" }}>Xin chào 👋</div>
            <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: WHITE }}>Nguyễn Văn A</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" fill={BLACK}/>
              <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Balance card */}
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 20, padding: "20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,.55)" }}>Số dư khả dụng</span>
            <button onClick={() => setShowBalance(b => !b)} style={{ background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: "0.85rem" }}>
              {showBalance ? "Ẩn" : "Hiện"}
            </button>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: WHITE, letterSpacing: "-1px" }}>
            {showBalance ? "2.500.000 ₫" : "••••••••"}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.8125rem", color: ACCENT }}>+8.4% so với tháng trước</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: "↑", label: "Gửi" },
            { icon: "↓", label: "Nhận" },
            { icon: "⇄", label: "Swap" },
            { icon: "⊞", label: "QR" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: BLACK, display: "flex", alignItems: "center", justifyContent: "center",
                color: ACCENT, fontSize: "1.3rem", fontWeight: 700,
              }}>
                {icon}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#4A5568", fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Crypto badges */}
      <div style={{ padding: "24px 20px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: BLACK }}>Crypto</span>
          <span style={{ fontSize: "0.8125rem", color: "#0095FF" }}>Xem tất cả</span>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { t: "BTC", p: "+12.7%", up: true },
            { t: "ETH", p: "+5.2%",  up: true },
            { t: "SOL", p: "−3.1%",  up: false },
            { t: "AXQ", p: "+8.4%",  up: true },
          ].map(({ t, p, up }) => (
            <div key={t} style={{
              flexShrink: 0, padding: "10px 14px", borderRadius: 12,
              background: WHITE, border: "1px solid #E2E8F0",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{t}</span>
              <span style={{ fontSize: "0.8125rem", color: up ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        marginTop: "auto", background: WHITE,
        borderTop: "1px solid #E2E8F0",
        display: "flex", justifyContent: "space-around",
        padding: "12px 0 20px",
      }}>
        {[
          { icon: "🏠", label: "Home",    active: true  },
          { icon: "💳", label: "Thẻ",     active: false },
          { icon: "📊", label: "Crypto",  active: false },
          { icon: "👤", label: "Hồ sơ",  active: false },
        ].map(({ icon, label, active }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <div style={{ fontSize: "1.25rem" }}>{icon}</div>
            <span style={{ fontSize: "0.7rem", fontWeight: active ? 700 : 400, color: active ? BLACK : MUTED }}>
              {label}
            </span>
            {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT }} />}
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ── Nav bar: step indicator ────────────────────────────────────────────────
const STEPS: Screen[] = ["splash","onboarding_0","onboarding_1","register","register_filled","otp","otp_filled","set_pin","setting_pin","home"];
const STEP_LABELS: Record<Screen, string> = {
  splash:          "Splash",
  onboarding_0:    "Onboarding 1",
  onboarding_1:    "Onboarding 2",
  register:        "Đăng ký",
  register_filled: "Đăng ký (đủ TT)",
  otp:             "Nhập OTP",
  otp_filled:      "OTP hợp lệ",
  set_pin:         "Đặt mã PIN",
  setting_pin:     "Đang thiết lập",
  home:            "Home 🎉",
};

// ── Main Demo ──────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [pinCount, setPinCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function next() {
    const idx = STEPS.indexOf(screen);
    if (idx < STEPS.length - 1) setScreen(STEPS[idx + 1]);
  }

  function prev() {
    const idx = STEPS.indexOf(screen);
    if (idx > 0) setScreen(STEPS[idx - 1]);
  }

  function goTo(s: Screen) {
    setScreen(s);
    setPinCount(0);
  }

  // Auto-play
  useEffect(() => {
    if (!autoPlay) { if (autoTimer.current) clearTimeout(autoTimer.current); return; }
    if (screen === "setting_pin" || screen === "home") { setAutoPlay(false); return; }
    const delay = screen === "splash" ? 2200 : screen === "setting_pin" ? 0 : 1800;
    autoTimer.current = setTimeout(next, delay);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [autoPlay, screen]);

  // PIN interaction for set_pin
  function handlePinDigit(d: string) {
    if (d === "⌫") { setPinCount(c => Math.max(0, c - 1)); return; }
    if (d === "") return;
    const newCount = pinCount + 1;
    setPinCount(newCount);
    if (newCount >= 6) setTimeout(() => { setScreen("setting_pin"); setPinCount(0); }, 300);
  }

  const currentIdx = STEPS.indexOf(screen);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: FONT,
    }}>
      {/* Top control bar */}
      <div style={{
        width: "100%", maxWidth: 600,
        padding: "16px 20px 12px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.95rem" }}>WikiAlisa Demo</div>
            <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
              {currentIdx + 1}/{STEPS.length} — <span style={{ color: "#e2e8f0" }}>{STEP_LABELS[screen]}</span>
            </div>
          </div>
          <button
            onClick={() => setAutoPlay(a => !a)}
            style={{
              padding: "6px 16px", borderRadius: 999, border: "none",
              background: autoPlay ? "#22c55e" : "#1e293b",
              color: autoPlay ? "#000" : "#94a3b8",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            {autoPlay ? "⏸ Dừng" : "▶ Auto"}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#1e293b", borderRadius: 999, height: 4 }}>
          <div style={{
            height: 4, borderRadius: 999, background: "#38bdf8",
            width: `${((currentIdx + 1) / STEPS.length) * 100}%`,
            transition: "width .3s",
          }} />
        </div>

        {/* Step pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => goTo(s)} style={{
              padding: "4px 10px", borderRadius: 999,
              background: s === screen ? "#38bdf8" : i < currentIdx ? "#1e4a6a" : "#1e293b",
              color: s === screen ? "#000" : i < currentIdx ? "#7dd3fc" : "#475569",
              border: "none", fontSize: "0.7rem", fontWeight: s === screen ? 700 : 400,
              cursor: "pointer",
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{
        width: "100%", maxWidth: 390,
        borderRadius: 40, overflow: "hidden",
        boxShadow: "0 0 0 8px #1e293b, 0 0 0 10px #334155, 0 40px 80px rgba(0,0,0,.6)",
        margin: "0 0 16px",
      }}>
        {screen === "splash"          && <SplashScreen onDone={next} />}
        {screen === "onboarding_0"    && <OnboardingScreen index={0} onNext={next} />}
        {screen === "onboarding_1"    && <OnboardingScreen index={1} onNext={next} />}
        {screen === "register"        && <RegisterScreen filled={false} onBack={prev} onContinue={next} />}
        {screen === "register_filled" && <RegisterScreen filled={true}  onBack={prev} onContinue={next} />}
        {screen === "otp"             && <OtpScreen filled={false} onBack={prev} onConfirm={next} />}
        {screen === "otp_filled"      && <OtpScreen filled={true}  onBack={prev} onConfirm={next} />}
        {screen === "set_pin"         && <SetPinScreen filledCount={pinCount} title="Đặt mã PIN" subtitle="PIN gồm 6 chữ số, dùng để xác thực" onDigit={handlePinDigit} />}
        {screen === "setting_pin"     && <SettingPinScreen onDone={next} />}
        {screen === "home"            && <HomeScreen />}
      </div>

      {/* Nav controls */}
      <div style={{
        display: "flex", gap: 12, padding: "0 20px 32px",
        width: "100%", maxWidth: 390, justifyContent: "center",
      }}>
        <button onClick={prev} disabled={currentIdx === 0} style={{
          flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
          background: currentIdx === 0 ? "#1e293b" : "#334155",
          color: currentIdx === 0 ? "#475569" : "#e2e8f0",
          fontSize: "0.9rem", fontWeight: 600, cursor: currentIdx === 0 ? "not-allowed" : "pointer",
        }}>
          ← Trước
        </button>
        <button onClick={next} disabled={currentIdx === STEPS.length - 1} style={{
          flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
          background: currentIdx === STEPS.length - 1 ? "#1e293b" : "#38bdf8",
          color: currentIdx === STEPS.length - 1 ? "#475569" : "#000",
          fontSize: "0.9rem", fontWeight: 600,
          cursor: currentIdx === STEPS.length - 1 ? "not-allowed" : "pointer",
        }}>
          Tiếp →
        </button>
      </div>
    </div>
  );
}
