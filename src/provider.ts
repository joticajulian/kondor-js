import type {
  ProviderInterface,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib";
import { Messenger } from "./Messenger";
import { kondorVersion } from "./constants";

const messenger = new Messenger({});

export function getProvider(network?: string): ProviderInterface {
  return {
    async call(method, params) {
      return messenger.sendDomMessage("background", "provider:call", {
        network,
        method,
        params,
        kondorVersion,
      });
    },

    async getNonce(account) {
      return messenger.sendDomMessage("background", "provider:getNonce", {
        network,
        account,
        kondorVersion,
      });
    },

    async getNextNonce(account) {
      return messenger.sendDomMessage("background", "provider:getNextNonce", {
        network,
        account,
        kondorVersion,
      });
    },

    async getAccountRc(account) {
      return messenger.sendDomMessage("background", "provider:getAccountRc", {
        network,
        account,
        kondorVersion,
      });
    },

    async getTransactionsById(transactionIds) {
      return messenger.sendDomMessage(
        "background",
        "provider:getTransactionsById",
        {
          network,
          transactionIds,
          kondorVersion,
        }
      );
    },

    async getBlocksById(blockIds, opts) {
      return messenger.sendDomMessage("background", "provider:getBlocksById", {
        network,
        blockIds,
        opts,
        kondorVersion,
      });
    },

    async getHeadInfo() {
      return messenger.sendDomMessage("background", "provider:getHeadInfo", {
        network,
        kondorVersion,
      });
    },

    async getChainId() {
      return messenger.sendDomMessage("background", "provider:getChainId", {
        network,
        kondorVersion,
      });
    },

    async getBlocks(height, numBlocks, idRef, opts) {
      return messenger.sendDomMessage("background", "provider:getBlocks", {
        network,
        height,
        numBlocks,
        idRef,
        opts,
        kondorVersion,
      });
    },

    getBlock(height, opts) {
      return messenger.sendDomMessage("background", "provider:getBlock", {
        network,
        height,
        opts,
        kondorVersion,
      });
    },

    async wait(txId, type, timeout) {
      return messenger.sendDomMessage("background", "provider:wait", {
        network,
        txId,
        type,
        timeout,
        kondorVersion,
      });
    },

    async sendTransaction(transaction, broadcast) {
      const response = await messenger.sendDomMessage<{
        receipt: TransactionReceipt;
        transaction: TransactionJsonWait;
      }>("background", "provider:sendTransaction", {
        network,
        transaction,
        broadcast,
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
          network,
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

    async submitBlock(block) {
      return messenger.sendDomMessage("background", "provider:submitBlock", {
        network,
        block,
        kondorVersion,
      });
    },

    async readContract(operation) {
      return messenger.sendDomMessage("background", "provider:readContract", {
        network,
        operation,
        kondorVersion,
      });
    },

    async getForkHeads() {
      return messenger.sendDomMessage("background", "provider:getForkHeads", {
        network,
        kondorVersion,
      });
    },

    async getResourceLimits() {
      return messenger.sendDomMessage(
        "background",
        "provider:getResourceLimits",
        {
          network,
          kondorVersion,
        }
      );
    },

    async invokeSystemCall(serializer, nameOrId, args, callerData) {
      return messenger.sendDomMessage(
        "background",
        "provider:invokeSystemCall",
        {
          network,
          serializer,
          nameOrId,
          args,
          callerData,
          kondorVersion,
        }
      );
    },

    async invokeGetContractMetadata(contractId) {
      return messenger.sendDomMessage(
        "background",
        "provider:getResourceLimits",
        {
          network,
          contractId,
          kondorVersion,
        }
      );
    },
  };
}

export const provider = getProvider();

export default provider;
