declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

import { BlurImageMaterial } from "@/materials/BlurImageMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      blurImageMaterial: ReactThreeFiber.Node<
        typeof BlurImageMaterial,
        typeof BlurImageMaterial
      >;
    }
  }
}
