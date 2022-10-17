import { SignerInterface } from "koilib";
import { Messenger } from "./Messenger";
import {
  BlockJson,
  SendTransactionOptions,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";

const messenger = new Messenger({});

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
      transaction: TransactionJson,
      abis?: SendTransactionOptions["abis"]
    ): Promise<TransactionJson> => {
      return messenger.sendDomMessage<TransactionJson>(
        "popup",
        "signer:signTransaction",
        {
          signerAddress,
          transaction,
          abis,
        }
      );
    },

    sendTransaction: async (
      tx: TransactionJson,
      optsSend?: SendTransactionOptions
    ): Promise<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }> => {
      const response = await messenger.sendDomMessage<{
        receipt: TransactionReceipt;
        transaction: TransactionJsonWait;
      }>("popup", "signer:sendTransaction", {
        signerAddress,
        transaction: tx,
        optsSend,
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
