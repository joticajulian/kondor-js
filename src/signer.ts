import { SignerInterface, Provider, utils } from "koilib";
import {
  BlockJson,
  SendTransactionOptions,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib";
import { Messenger } from "./Messenger";
import { kondorVersion } from "./constants";

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

    signHash: (hash: Uint8Array): Promise<Uint8Array> => {
      return messenger.sendDomMessage<Uint8Array>("popup", "signer:signHash", {
        signerAddress,
        hash,
        kondorVersion,
      });
    },

    signMessage: async (message: string | Uint8Array): Promise<Uint8Array> => {
      const signatureBase64url = await messenger.sendDomMessage<string>(
        "popup",
        "signer:signMessage",
        {
          signerAddress,
          message,
          kondorVersion,
        }
      );
      return utils.decodeBase64url(signatureBase64url);
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
          kondorVersion,
        }
      );
      transaction.id = tx.id;
      transaction.header = tx.header;
      transaction.operations = tx.operations;
      transaction.signatures = tx.signatures;
      return transaction;
    },

    sendTransaction: async (
      transaction: TransactionJson,
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
        transaction,
        optsSend,
        kondorVersion,
      });
      transaction.id = response.transaction.id;
      transaction.header = response.transaction.header;
      transaction.operations = response.transaction.operations;
      transaction.signatures = response.transaction.signatures;
      (transaction as TransactionJsonWait).wait = async (
        type: "byTransactionId" | "byBlock" = "byBlock",
        timeout = 60000
      ) => {
        return messenger.sendDomMessage("background", "provider:wait", {
          network: options ? options.network : "",
          txId: transaction.id,
          type,
          timeout,
          kondorVersion,
        });
      };
      return {
        transaction: transaction as TransactionJsonWait,
        receipt: response.receipt,
      };
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
