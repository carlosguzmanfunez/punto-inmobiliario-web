// Íconos SVG en línea (sin dependencias externas).
type P = { size?: number; className?: string };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const SearchIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const MenuIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const CloseIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ChevronDown = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m6 9 6 6 6-6" /></svg>);
export const BedIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11" r="2" /></svg>);
export const BathIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0" /></svg>);
export const AreaIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h5V4M20 15h-5v5" /></svg>);
export const PinIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const HeartIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>);
export const GlobeIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>);
export const BankIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></svg>);
export const KeyIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3M15 8l2 2" /></svg>);
export const ShieldIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const VideoIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>);
export const UserIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const PhoneIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>);
export const MailIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);

export const WhatsAppIcon = ({ size = 24, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden fill="currentColor">
    <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-1.6a12.1 12.1 0 0 0 3.79.61C22.68 28 28 22.63 28 16.02 28 9.4 22.68 3 16.04 3Zm0 22.9c-1.2 0-2.39-.2-3.5-.6l-.5-.18-4.9.95.96-4.73-.2-.49a9.86 9.86 0 0 1-1.46-5.21c0-5.45 4.5-9.88 10.03-9.88 5.52 0 9.97 4.43 9.97 9.88 0 5.44-4.45 10.26-10.4 10.26Zm5.5-7.43c-.3-.15-1.78-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.48-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.78-.72 2.03-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
  </svg>
);
export const PlusIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>);
export const EditIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" /></svg>);
export const TrashIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>);
export const EyeIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const ChartIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
export const HomeIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 11 12 4l9 7M5 10v10h14V10" /></svg>);
export const InboxIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6l2-8Z" /></svg>);
export const UsersIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6" /></svg>);
export const LogoutIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>);
export const ImageIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>);
export const LinkIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>);
export const StoreIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M10 20v-5h4v5" /></svg>);
export const CardIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>);
export const CheckIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m5 12 5 5 9-10" /></svg>);
export const ShareIcon = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>);
