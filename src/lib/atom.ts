import { atom } from "recoil";

export const redirectAtom = atom<string | undefined>({
  key: "user",
  default: undefined,
});
