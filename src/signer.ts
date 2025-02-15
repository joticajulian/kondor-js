import type {
  SignerInterface,
  Provider,
  ProviderInterface,
  BlockJson,
  SendTransactionOptions,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib";
import { Messenger } from "./Messenger";
import { kondorVersion } from "./constants";
import { decodeBase64url } from "./utils";

const messenger = new Messenger({});

export class KondorSigner implements SignerInterface {
  address: string;

  provider?: ProviderInterface;

  sendOptions?: SendTransactionOptions;

  constructor(c: {
    provider?: ProviderInterface;
    address: string;
    sendOptions?: SendTransactionOptions;
  }) {
    this.provider = c.provider;
    this.address = c.address;
    this.sendOptions = {
      broadcast: true,
      ...c.sendOptions,
    };
  }

  getAddress() {
    return this.address;
  }

  signHash(hash: Uint8Array) {
    return messenger.sendDomMessage<Uint8Array>("popup", "signer:signHash", {
      signerAddress: this.address,
      hash,
      kondorVersion,
    });
  }

  async signMessage(message: string | Uint8Array) {
    const signatureBase64url = await messenger.sendDomMessage<string>(
      "popup",
      "signer:signMessage",
      {
        signerAddress: this.address,
        message,
        kondorVersion,
      }
    );
    return decodeBase64url(signatureBase64url);
  }

  async signTransaction(
    transaction: TransactionJson,
    abis?: SendTransactionOptions["abis"]
  ) {
    const tx = await messenger.sendDomMessage<TransactionJson>(
      "popup",
      "signer:signTransaction",
      {
        signerAddress: this.address,
        transaction,
        abis,
        kondorVersion,
      }
    );
    transaction.id = tx.id;
    transaction.header = tx.header;
    transaction.operations = tx.operations;
    transaction.signatures = tx.signatures;
    return transaction;
  }

  async sendTransaction(
    transaction: TransactionJson,
    options?: SendTransactionOptions
  ) {
    const opts: SendTransactionOptions = {
      ...this.sendOptions,
      ...options,
    };

    if (opts?.beforeSend) {
      throw new Error("beforeSend option is not supported in kondor");
    }

    const response = await messenger.sendDomMessage<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }>("popup", "signer:sendTransaction", {
      signerAddress: this.address,
      transaction,
      optsSend: opts,
      kondorVersion,
    });
    transaction.id = response.transaction.id;
    transaction.header = response.transaction.header;
    transaction.operations = response.transaction.operations;
    transaction.signatures = response.transaction.signatures;
    if (opts.broadcast) {
      (transaction as TransactionJsonWait).wait = async (
        type: "byTransactionId" | "byBlock" = "byTransactionId",
        timeout = 15000
      ) => {
        if (!this.provider) throw new Error("provider is undefined");
        return this.provider.wait(transaction.id as string, type, timeout);
      };
    }
    return {
      transaction: transaction as TransactionJsonWait,
      receipt: response.receipt,
    };
  }

  async prepareBlock(): Promise<BlockJson> {
    throw new Error("prepareBlock is not available");
  }

  async signBlock(): Promise<BlockJson> {
    throw new Error("signBlock is not available");
  }
}

export function getSigner(
  signerAddress: string,
  options?: {
    provider?: Provider;
    sendOptions?: SendTransactionOptions;
  }
): SignerInterface {
  if (!signerAddress) throw new Error("no signerAddress defined");

  return new KondorSigner({
    provider: options?.provider,
    address: signerAddress,
    sendOptions: options?.sendOptions,
  });
}
