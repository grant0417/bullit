import { Link } from "react-router-dom";

export function PillTag({
  tag, fontColor, bgColor,
}: {
  tag: string;
  fontColor: string;
  bgColor: string;
}) {
  return (
    <Link
      to={`/t/${tag}`}
      className="rounded-full px-1 text-xs font-semibold"
      style={{ color: fontColor, backgroundColor: bgColor }}
    >
      {tag}
    </Link>
  );
}

export default PillTag;