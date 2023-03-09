import { type ImageURISource } from "react-native";

declare module "*.png" {
  const value: ImageURISource;
  export default value;
}
