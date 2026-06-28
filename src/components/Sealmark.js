export default function SealMark({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke="#C8932F" strokeWidth="1.4" strokeDasharray="2.5 3.5" />
      <circle cx="24" cy="24" r="17" fill="#143C30" />
      <path
        d="M17.5 23.5 L22 28 L31 18"
        stroke="#E0B45C"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}