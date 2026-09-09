const paths = {
  chevron: {
    left: "M15 19l-7-7 7-7",
    right: "M9 5l7 7-7 7",
  },
  arrow: {
    left: "M10 19l-7-7m0 0l7-7m-7 7h18",
    right: "M14 5l7 7m0 0l-7 7m7-7H3",
  },
};

export default function ArrowIcon({
  direction = "right",
  variant = "chevron",
  className = "h-4 w-4",
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        d={paths[variant][direction]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
