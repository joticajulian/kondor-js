/*! kondor - MIT License (c) Julian Gonzalez (joticajulian@gmail.com) */

import { provider, getProvider } from "./provider";
import { getSigner, KondorSigner } from "./signer";
import { getAccounts } from "./account";

declare const window: { [x: string]: unknown };

window.kondor = { provider, getProvider, KondorSigner, getSigner, getAccounts };
