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
  faChevronDown,
  faChevronRight,
  faCircleNotch,
  faClock,
  faEllipsisVertical,
  faEnvelope,
  faGear,
  faNewspaper,
  faPen,
  faPeopleRoof,
  faPersonChalkboard,
  faPersonCircleQuestion,
  faPhone,
  faPlus,
  faSchool,
  faSquareXmark,
  faTrashCan,
  faUser,
  faUserPlus,
  faUserSecret,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faUser,
  faNewspaper,
  faPlus,
  faClock,
  faChevronRight,
  faChevronDown,
  faSchool,
  faUsers,
  faUserPlus,
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
  faTrashCan,
  faPersonCircleQuestion,
  faGithub,
  faSquareXmark,
  faCircleNotch,
  faPen,
  faEllipsisVertical,
);
