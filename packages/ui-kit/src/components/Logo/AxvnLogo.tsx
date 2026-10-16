// AxvnLogo.tsx — alias file
// VnkrLogo.tsx chứa implementation thực sự, export tên "AxvnLogo"
// File này giải quyết import từ "./AxvnLogo" trong LogoGuide.tsx và index.ts
export { AxvnLogo } from "./VnkrLogo";
export type { LogoProps, LogoVariant, LogoSize } from "./VnkrLogo";
