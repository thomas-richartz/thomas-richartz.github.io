/// <reference types="vite/client" />
/// <reference types="jest" />

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
