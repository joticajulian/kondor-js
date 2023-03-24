import { SignerInterface, Provider, Signer } from "koilib";
import { Messenger } from "./Messenger";
import {
  BlockJson,
  SendTransactionOptions,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";

const messenger = new Messenger({});

export function getSigner(
  signerAddress: string,
  options?: {
    /**
     * When providerPrepareTransaction is defined then
     * the prepareTransaction function will use that provider
     * to prepare the transaction rather than calling the extension.
     *
     * TODO: this is a temporal solution to fix the problem with
     * the double popup.
     */
    providerPrepareTransaction?: Provider;
    network?: string;
  }
): SignerInterface {
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
      if (options && options.providerPrepareTransaction) {
        const signer = Signer.fromSeed("seed");
        signer.provider = options.providerPrepareTransaction;
        if (!transaction.header) {
          transaction.header = { payer: signerAddress };
        }

        if (!transaction.header.payer) {
          transaction.header.payer = signerAddress;
        }
        return signer.prepareTransaction(transaction);
      }

      const network = options ? options.network : "";

      const tx = await messenger.sendDomMessage<TransactionJson>(
        "background",
        "signer:prepareTransaction",
        { network, signerAddress, transaction }
      );
      transaction.id = tx.id;
      transaction.header = tx.header;
      return transaction;
    },

    signTransaction: async (
      transaction: TransactionJson,
      abis?: SendTransactionOptions["abis"]
    ): Promise<TransactionJson> => {
      const tx = await messenger.sendDomMessage<TransactionJson>(
        "popup",
        "signer:signTransaction",
        {
          signerAddress,
          transaction,
          abis,
        }
      );
      transaction.signatures = tx.signatures;
      return transaction;
    },

    sendTransaction: async (
      tx: TransactionJson,
      optsSend?: SendTransactionOptions
    ): Promise<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }> => {
      if (optsSend?.beforeSend) {
        throw new Error("beforeSend option is not supported in kondor");
      }
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
