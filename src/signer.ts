import { SignerInterface } from "koilib";
import { Messenger } from "./Messenger";
import {
  Abi,
  BlockJson,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";

const messenger = new Messenger({});

function warnDeprecated(fnName: string) {
  console.warn(
    `The function kondor.signer.${fnName} will be deprecated in the future. Please use kondor.getSigner(signerAddress).${fnName}`
  );
}

export const signer: SignerInterface = {
  getAddress: (): string => {
    warnDeprecated("getAddress");
    throw new Error(
      "getAddress is not available. Please use getAccounts from kondor"
    );
  },
  getPrivateKey: (): string => {
    warnDeprecated("getPrivateKey");
    throw new Error("getPrivateKey is not available");
  },
  signTransaction: (): Promise<TransactionJson> => {
    warnDeprecated("signTransaction");
    throw new Error(
      "signTransaction is not available. Use sendTransaction instead"
    );
  },
  signHash: (): Promise<Uint8Array> => {
    warnDeprecated("signHash");
    throw new Error("signHash is not available. Use sendTransaction instead");
  },
  signMessage: (): Promise<Uint8Array> => {
    warnDeprecated("signMessage");
    throw new Error("signMessae is not available. Use sendTransaction instead");
  },
  prepareBlock: (): Promise<BlockJson> => {
    warnDeprecated("prepareBlock");
    throw new Error("prepareBlock is not available");
  },
  signBlock: (): Promise<BlockJson> => {
    warnDeprecated("signBlock");
    throw new Error("signBlock is not available");
  },
  prepareTransaction: async (
    transaction: TransactionJson
  ): Promise<TransactionJson> => {
    warnDeprecated("prepareTransaction");
    const tx = await messenger.sendDomMessage<TransactionJson>(
      "background",
      "signer:prepareTransaction",
      { transaction }
    );
    return tx;
  },
  sendTransaction: async (
    tx: TransactionJson,
    abis?: Record<string, Abi>
  ): Promise<{
    receipt: TransactionReceipt;
    transaction: TransactionJsonWait;
  }> => {
    warnDeprecated("sendTransaction");
    const { transaction, receipt } = await messenger.sendDomMessage<{
      receipt: TransactionReceipt;
      transaction: TransactionJson;
    }>("popup", "signer:sendTransaction", {
      tx,
      abis,
    });
    return {
      receipt,
      transaction: {
        ...transaction,
        wait: async (
          type: "byTransactionId" | "byBlock" = "byBlock",
          timeout = 30000
        ) => {
          return messenger.sendDomMessage("background", "provider:wait", {
            txId: transaction.id,
            type,
            timeout,
          });
        },
      },
    };
  },
};

export function getSigner(signerAddress: string): SignerInterface {
  return {
    getAddress: () => signerAddress,

    getPrivateKey: (): string => {
      throw new Error("getPrivateKey is not available");
    },

    signHash: (hash: Uint8Array): Promise<Uint8Array> => {
      return messenger.sendDomMessage<Uint8Array>("popup", "signer:signHash", {
        signerAddress,
        hash,
      });
    },

    signMessage: (message: string | Uint8Array): Promise<Uint8Array> => {
      return messenger.sendDomMessage<Uint8Array>(
        "popup",
        "signer:signMessage",
        {
          signerAddress,
          message,
        }
      );
    },

    prepareTransaction: async (
      transaction: TransactionJson
    ): Promise<TransactionJson> => {
      const tx = await messenger.sendDomMessage<TransactionJson>(
        "background",
        "signer:prepareTransaction",
        { signerAddress, transaction }
      );
      return tx;
    },

    signTransaction: async (
      tx: TransactionJson,
      abis?: Record<string, Abi>
    ): Promise<TransactionJson> => {
      return messenger.sendDomMessage<TransactionJson>(
        "popup",
        "signer:signTransaction",
        {
          signerAddress,
          tx,
          abis,
        }
      );
    },

    sendTransaction: async (
      tx: TransactionJson,
      abis?: Record<string, Abi>
    ): Promise<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }> => {
      const response = await messenger.sendDomMessage<{
        receipt: TransactionReceipt;
        transaction: TransactionJsonWait;
      }>("popup", "signer:sendTransaction", {
        signerAddress,
        tx,
        abis,
      });
      response.transaction.wait = async (
        type: "byTransactionId" | "byBlock" = "byBlock",
        timeout = 60000
      ) => {
        return messenger.sendDomMessage("background", "provider:wait", {
          txId: response.transaction.id,
          type,
          timeout,
        });
      };
      return response;
    },

    prepareBlock: (): Promise<BlockJson> => {
      throw new Error("prepareBlock is not available");
    },

    signBlock: (): Promise<BlockJson> => {
      throw new Error("signBlock is not available");
    },
  };
}

export default getSigner;
