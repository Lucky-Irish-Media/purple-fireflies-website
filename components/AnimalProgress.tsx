import { formatCents } from "@/app/lib/currency";

interface AnimalProgressProps {
  /** Cached `animals.gb_raised_cents`; never a live Givebutter API read. */
  raisedCents: number;
  /** `animals.goal_cents`. Zero is a real state, not a missing value. */
  goalCents: number;
  /** Cached `animals.gb_supporters`. */
  supporters: number;
  /** Sum of `animal_expenses.amount_cents` for this pet, read by the page. */
  spentCents: number;
}

/**
 * Progress for one pet, built only from values already cached on the animal row
 * plus the expense sum the page passes in. Keeping the Givebutter API out of the
 * render path means a slow or failed campaign lookup cannot take the page down.
 */
export default function AnimalProgress({
  raisedCents,
  goalCents,
  supporters,
  spentCents,
}: AnimalProgressProps) {
  const hasGoal = goalCents > 0;
  // A goal of zero would divide by zero, so the bar only exists when there is a
  // goal. A pet that outgrows its goal clamps at 100 rather than overflowing.
  const percent = hasGoal
    ? Math.min(100, Math.max(0, Math.round((raisedCents / goalCents) * 100)))
    : 0;
  const supporterLabel =
    supporters === 1 ? "1 supporter" : `${supporters} supporters`;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(124,58,237,0.06)",
        border: "1px solid rgba(124,58,237,0.12)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xl font-bold text-foreground">
          {formatCents(raisedCents)}
          {hasGoal ? (
            <span className="ml-2 text-base font-medium text-text-secondary">
              raised of {formatCents(goalCents)}
            </span>
          ) : (
            <span className="ml-2 text-base font-medium text-text-secondary">
              raised so far
            </span>
          )}
        </p>
        {hasGoal ? (
          <span
            className="text-sm font-semibold"
            style={{ color: "#7C3AED" }}
          >
            {percent}% of goal
          </span>
        ) : (
          <span className="text-sm font-semibold" style={{ color: "#7C3AED" }}>
            Any amount helps
          </span>
        )}
      </div>

      {hasGoal ? (
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(124,58,237,0.15)" }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Sponsorship progress toward this pet's goal"
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: "#7C3AED" }}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          This pet has no fixed goal. Gifts of any size go toward the needs
          listed on this page, and leftover funds stay in the Community Pet Fund
          for other neighbors&apos; pets.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-text-secondary">
        <span>{supporterLabel}</span>
        <span>
          Spent from the fund so far:{" "}
          <span className="font-semibold text-foreground">
            {formatCents(spentCents)}
          </span>
        </span>
      </div>
    </div>
  );
}
