import DefaultTheme from "vitepress/theme";
import { h } from "vue";

import HeroImage from "./hero-image.vue";
import HomeFeaturesAfter from "./home-features-after.vue";
import "./custom.css";

const div = document.createElement("div");
div.id = "after";
document.body.querySelector("#app").insertAdjacentElement("afterend", div);

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image": () => h(HeroImage),
      // "home-features-after": () => h(HomeFeaturesAfter),
    });
  },
};
