import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * Givebutter Widgets ship as web components. React renders an unknown tag
 * verbatim and sets its attributes, which is exactly what the library expects,
 * but TypeScript will not accept the tag in JSX until it is declared.
 *
 * Only the tag this repo actually uses is declared. Attribute names come from
 * the manual embed docs for the form widget:
 * https://docs.givebutter.com/widgets/widget-types/form
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-giving-form": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        /** Campaign code, the same value stored in `animals.gb_campaign_code`. */
        campaign?: string;
        /** Givebutter Widgets account ID, also used in the library script URL. */
        account?: string;
        /** Accepts a CSS color; drives the goal bar, which this repo keeps off. */
        "theme-color"?: string;
        /** CSS length for the widest the form may render, e.g. `560px`. */
        "max-width"?: string;
        /** `"true"` inserts Givebutter's own goal bar above the form. */
        "show-goal-bar"?: string;
      };
    }
  }
}
