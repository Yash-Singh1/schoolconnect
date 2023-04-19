// Miscellaneous type declarations for the code

import { type ImageURISource } from "react-native";

// Make .png files importable
declare module "*.png" {
  declare const value: ImageURISource;
  export default value;
}
