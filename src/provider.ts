import {
  BlockJson,
  CallContractOperationJson,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";
import { Messenger } from "./Messenger";
import { kondorVersion } from "./constants";

const messenger = new Messenger({});

export function getProvider(network?: string) {
  return {
    async call<T = unknown>(method: string, params: unknown): Promise<T> {
      return messenger.sendDomMessage("background", "provider:call", {
        network,
        method,
        params,
        kondorVersion,
      });
    },

    async getNonce(account: string): Promise<number> {
      return messenger.sendDomMessage("background", "provider:getNonce", {
        network,
        account,
        kondorVersion,
      });
    },

    async getAccountRc(account: string): Promise<string> {
      return messenger.sendDomMessage("background", "provider:getAccountRc", {
        network,
        account,
        kondorVersion,
      });
    },

    async getTransactionsById(transactionIds: string[]): Promise<{
      transactions: {
        transaction: TransactionJson[];
        containing_blocks: string[];
      }[];
    }> {
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

    async getBlocksById(blockIds: string[]): Promise<{
      block_items: {
        block_id: string;
        block_height: string;
        block: BlockJson;
      }[];
    }> {
      return messenger.sendDomMessage("background", "provider:getBlocksById", {
        network,
        blockIds,
        kondorVersion,
      });
    },

    async getHeadInfo(): Promise<{
      head_topology: {
        id: string;
        height: string;
        previous: string;
      };
      last_irreversible_block: string;
    }> {
      return messenger.sendDomMessage("background", "provider:getHeadInfo", {
        network,
        kondorVersion,
      });
    },

    async getChainId(): Promise<string> {
      return messenger.sendDomMessage("background", "provider:getChainId", {
        network,
        kondorVersion,
      });
    },

    async getBlocks(
      height: number,
      numBlocks = 1,
      idRef?: string
    ): Promise<
      {
        block_id: string;
        block_height: string;
        block: BlockJson;
        block_receipt: {
          [x: string]: unknown;
        };
      }[]
    > {
      return messenger.sendDomMessage("background", "provider:getBlocks", {
        network,
        height,
        numBlocks,
        idRef,
        kondorVersion,
      });
    },

    async getBlock(height: number): Promise<{
      block_id: string;
      block_height: string;
      block: BlockJson;
      block_receipt: {
        [x: string]: unknown;
      };
    }> {
      return messenger.sendDomMessage("background", "provider:getBlock", {
        network,
        height,
        kondorVersion,
      });
    },

    async wait(
      txId: string,
      type: "byTransactionId" | "byBlock" = "byBlock",
      timeout = 30000
    ): Promise<string | number> {
      return messenger.sendDomMessage("background", "provider:wait", {
        network,
        txId,
        type,
        timeout,
        kondorVersion,
      });
    },

    async sendTransaction(
      transaction: TransactionJson,
      broadcast = true
    ): Promise<{
      receipt: TransactionReceipt;
      transaction: TransactionJsonWait;
    }> {
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

    async submitBlock(block: BlockJson): Promise<Record<string, never>> {
      return messenger.sendDomMessage("background", "provider:submitBlock", {
        network,
        block,
        kondorVersion,
      });
    },

    async readContract(operation: CallContractOperationJson): Promise<{
      result: string;
      logs: string;
    }> {
      return messenger.sendDomMessage("background", "provider:readContract", {
        network,
        operation,
        kondorVersion,
      });
    },
  };
}

export const provider = getProvider();

export default provider;
