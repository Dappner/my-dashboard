import { Api } from "../api";
import { createUseHoldings } from "./useHoldings";

export function createHooks(api: Api) {
  return {
    useHoldings: createUseHoldings(api),
  };
}

export type Hooks = ReturnType<typeof createHooks>;
