// Miscellaneous type declarations for the code

import { type ImageURISource } from "react-native";

declare module "*.png" {
  declare const value: ImageURISource;
  export default value;
}
