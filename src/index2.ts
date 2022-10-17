/*! kondor - MIT License (c) Julian Gonzalez (joticajulian@gmail.com) */

import { provider } from "./provider";
import { getSigner } from "./signer";
import { getAccounts } from "./account";

declare const window: { [x: string]: unknown };

window.kondor = { provider, getSigner, getAccounts };
