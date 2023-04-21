// Miscellaneous type declarations for the code

import { type ImageSourcePropType } from "react-native";

// Make .png files importable
declare module "*.png" {
  declare const value: ImageSourcePropType;
  export default value;
}
