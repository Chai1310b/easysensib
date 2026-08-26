/**
 * Lightweight SVG charts for the manager dashboards, in the spirit of the
 * indicators of the previous EasySensib (pie of user statuses, participation
 * bars, validation trends). Pure SVG, server-renderable, no library.
 */

export interface ChartSlice {
  label: string;
  value: number;
  /** Literal color (design token value). */
  color: string;
}

interface DonutChartProps {
  data: ChartSlice[];
  /** Big figure in the middle; defaults to the total. */
  centerValue?: string;
  centerLabel?: string;
  size?: number;
  thickness?: number;
  /** Hide the built-in legend (when the caller renders its own). */
  legend?: boolean;
}

/** Camembert with a hole, legend with values and percentages. */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
  size = 148,
  thickness = 17,
  legend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-gauge-neutral-track)"
            strokeWidth={thickness}
          />
          {total > 0
            ? data
                .filter((d) => d.value > 0)
                .map((d) => {
                  const fraction = d.value / total;
                  const dash = fraction * circumference;
                  const element = (
                    <circle
                      key={d.label}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={thickness}
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      strokeDashoffset={-offset}
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    >
                      <title>{`${d.label} · ${d.value}`}</title>
                    </circle>
                  );
                  offset += dash;
                  return element;
                })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[22px] leading-none font-bold text-ink">
            {centerValue ?? total}
          </span>
          {centerLabel ? (
            <span className="mt-1 max-w-[70%] text-center text-[10px] leading-tight text-ink-tertiary">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>

      {legend ? (
        <ul className="flex min-w-0 flex-col gap-2">
          {data.map((d) => {
            const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <li key={d.label} className="flex items-center gap-2 text-[12px]">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="truncate text-ink-secondary">{d.label}</span>
                <span className="ml-auto pl-3 font-semibold whitespace-nowrap text-ink">
                  {d.value}
                </span>
                <span className="w-9 text-right whitespace-nowrap text-ink-tertiary">
                  {percent}%
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export interface BarPoint {
  label: string;
  value: number;
  color?: string;
  /** Optional secondary series drawn behind (e.g. capacity vs registered). */
  reference?: number;
}

interface BarChartProps {
  data: BarPoint[];
  height?: number;
  /** Suffix appended to the value in the tooltip (e.g. "%"). */
  unit?: string;
}

/** Vertical bars with month-style labels underneath. */
export function BarChart({ data, height = 120, unit = '' }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.reference ?? 0)));

  return (
    <div className="flex w-full items-end gap-2" style={{ height: height + 26 }}>
      {data.map((d) => {
        const h = Math.max(3, Math.round((d.value / max) * height));
        const refH = d.reference !== undefined ? Math.round((d.reference / max) * height) : null;
        return (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full items-end justify-center" style={{ height }}>
              {refH !== null ? (
                <div
                  aria-hidden
                  className="absolute bottom-0 w-full max-w-7 rounded-t bg-gauge-neutral-track"
                  style={{ height: refH }}
                />
              ) : null}
              <div
                className="relative w-full max-w-7 rounded-t transition-all duration-300"
                style={{ height: h, background: d.color ?? 'var(--color-accent)' }}
              >
                <title>{`${d.label} · ${d.value}${unit}`}</title>
              </div>
            </div>
            <span className="truncate text-[10px] font-medium text-ink-tertiary uppercase">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface TrendPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

/** Simple trend line with dots, for evolutions over time. */
export function LineChart({
  data,
  color = 'var(--color-accent)',
  height = 110,
  unit = '',
}: LineChartProps) {
  const width = 100; // viewBox units; the svg stretches to its container.
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - 8 - ((d.value - min) / range) * (height - 20),
    ...d,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${points[points.length - 1]?.x ?? 0},${height} L0,${height} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        aria-hidden
      >
        <path d={area} fill={color} opacity={0.08} />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-1 flex justify-between">
        {points.map((p) => (
          <span key={p.label} className="text-[10px] font-medium text-ink-tertiary uppercase">
            <span title={`${p.label} · ${p.value}${unit}`}>{p.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  /** 0..100 */
  percent: number;
  color?: string;
  size?: number;
  label?: string;
}

/** Small percentage ring (participation rate, response rate). */
export function ProgressRing({
  percent,
  color = 'var(--color-success)',
  size = 84,
  label,
}: ProgressRingProps) {
  const thickness = 9;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-gauge-neutral-track)"
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-[17px] font-bold text-ink">
          {Math.round(clamped)}%
        </span>
      </div>
      {label ? (
        <span className="max-w-24 text-center text-[11px] leading-tight text-ink-tertiary">
          {label}
        </span>
      ) : null}
    </div>
  );
}
