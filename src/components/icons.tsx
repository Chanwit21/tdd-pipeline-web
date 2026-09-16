type P = { size?: number };
const s = (n = 16) => ({
  width: n,
  height: n,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
});

export const IcoDashboard = ({ size }: P) => (
  <svg {...s(size)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
export const IcoPipeline = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M3 6h18M3 12h18M3 18h11" />
  </svg>
);
export const IcoReport = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M4 19V9M12 19V5M20 19v-6" />
  </svg>
);
export const IcoMaster = ({ size }: P) => (
  <svg {...s(size)}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="3" y="10" width="18" height="4" rx="1" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
  </svg>
);
export const IcoUsers = ({ size }: P) => (
  <svg {...s(size)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c1-3.6 3.6-5.6 6.5-5.6s5.5 2 6.5 5.6" />
    <path d="M16.5 5.2A3.2 3.2 0 1 1 18 11.3" />
    <path d="M15.8 14.5c2.6.5 4.4 2.4 5.2 5.5" />
  </svg>
);
export const IcoBell = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
export const IcoChevronLeft = ({ size }: P) => (
  <svg {...s(size)} strokeWidth={3}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const IcoPlus = ({ size }: P) => (
  <svg {...s(size)} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IcoFilter = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);
export const IcoClock = ({ size }: P) => (
  <svg {...s(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IcoDownload = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
  </svg>
);
export const IcoMenu = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
export const IcoTrendUp = ({ size }: P) => (
  <svg {...s(size)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
export const IcoCheckCircle = ({ size }: P) => (
  <svg {...s(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9" />
  </svg>
);
export const IcoArchive = ({ size }: P) => (
  <svg {...s(size)}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 13h4" />
  </svg>
);
export const IcoSearch = ({ size }: P) => (
  <svg {...s(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
