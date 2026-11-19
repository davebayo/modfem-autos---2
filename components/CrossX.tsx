const CORNERS = [
  { top: "8px", left: "8px" },
  { top: "8px", right: "8px" },
  { bottom: "8px", left: "8px" },
  { bottom: "8px", right: "8px" },
] as const;

/** 4 corner crosshair marks for Arena-style `.cross` cards — pair with the
 * `cross` class on the relatively-positioned parent. */
export function CrossX() {
  return (
    <div className="cross-x">
      {CORNERS.map((pos, i) => (
        <i key={i} style={pos}>
          +
        </i>
      ))}
    </div>
  );
}
