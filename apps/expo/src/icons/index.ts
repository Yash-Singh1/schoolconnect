// Load all of the FontAwesome icons we use in one file for tree-shaking (performance)

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebook,
  faGithub,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCalendar,
  faCheck,
  faChevronRight,
  faCircleNotch,
  faClock,
  faEnvelope,
  faGear,
  faNewspaper,
  faPen,
  faPeopleRoof,
  faPersonChalkboard,
  faPhone,
  faPlus,
  faSchool,
  faSquareXmark,
  faUser,
  faUserSecret,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faUser,
  faNewspaper,
  faPlus,
  faClock,
  faChevronRight,
  faSchool,
  faUsers,
  faCalendar,
  faTwitter,
  faInstagram,
  faFacebook,
  faPersonChalkboard,
  faUserSecret,
  faPeopleRoof,
  faPhone,
  faCheck,
  faEnvelope,
  faGear,
  faGithub,
  faSquareXmark,
  faCircleNotch,
  faPen,
);
