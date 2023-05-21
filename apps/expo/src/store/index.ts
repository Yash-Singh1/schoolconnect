// Jotai store, used to store the token

import { atom } from "jotai";

const tokenAtom = atom("");
tokenAtom.debugLabel = "Authentication Token";

const userIdAtom = atom("");
userIdAtom.debugLabel = "User ID";

export { tokenAtom, userIdAtom };
