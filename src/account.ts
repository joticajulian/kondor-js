import { Messenger } from "./Messenger";
import { kondorVersion } from "./constants";

const messenger = new Messenger();

export async function getAccounts(): Promise<
  {
    name: string;
    address: string;
    signers: { name: string; address: string }[];
  }[]
> {
  return messenger.sendDomMessage("popup", "getAccounts", { kondorVersion });
}

export default getAccounts;
