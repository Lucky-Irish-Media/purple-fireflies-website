import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-giving-form": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        campaign?: string;
        account?: string;
        "theme-color"?: string;
      };
    }
  }
}
