// Turns schema.org `openingHours` strings ("Mo-Fr 09:00-18:00") into the
// Japanese the access section shows (「月〜金 9:00〜18:00」).
//
// site.business.openingHours is the one place hours are written: the JSON-LD
// emits it verbatim and the page renders it through this function, so the two
// can never state different hours.

const DAYS: Record<string, string> = {
  Mo: "月",
  Tu: "火",
  We: "水",
  Th: "木",
  Fr: "金",
  Sa: "土",
  Su: "日",
};

const ENTRY = /^\s*([A-Za-z,\-]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*$/;

const day = (code: string) => DAYS[code] ?? null;
const time = (t: string) => t.replace(/^0(\d)/, "$1");

/** "Mo,We-Fr" -> "月・水〜金", or null if any token is not a day code. */
function days(spec: string): string | null {
  const parts = spec.split(",").map((part) => {
    const [from, to, ...rest] = part.split("-");
    if (rest.length || !from) return null;
    const a = day(from);
    if (!to) return a;
    const b = day(to);
    return a && b ? `${a}〜${b}` : null;
  });
  return parts.every(Boolean) ? parts.join("・") : null;
}

/**
 * One display line per distinct time range, in first-seen order; entries that
 * share a range are merged ("Mo 10:00-20:00" + "We-Su 10:00-20:00" →
 * 「月・水〜日 10:00〜20:00」). An entry this cannot read is passed through
 * as written rather than dropped.
 */
export function formatOpeningHours(entries: string[]): string[] {
  const groups = new Map<string, string[]>();
  const lines: (string | { range: string })[] = [];

  for (const entry of entries) {
    const m = ENTRY.exec(entry);
    const d = m ? days(m[1]!) : null;
    if (!m || !d) {
      lines.push(entry);
      continue;
    }
    const range = `${time(m[2]!)}〜${time(m[3]!)}`;
    const group = groups.get(range);
    if (group) group.push(d);
    else {
      groups.set(range, [d]);
      lines.push({ range });
    }
  }

  return lines.map((line) =>
    typeof line === "string"
      ? line
      : `${groups.get(line.range)!.join("・")} ${line.range}`,
  );
}
