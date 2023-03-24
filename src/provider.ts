import { Messenger } from "./Messenger";
import {
  BlockJson,
  CallContractOperationJson,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";

const messenger = new Messenger({});

export function getProvider(network?: string) {
  return {
    async call<T = unknown>(method: string, params: unknown): Promise<T> {
      return messenger.sendDomMessage("background", "provider:call", {
        network,
        method,
        params,
      });
    },

    async getNonce(account: string): Promise<number> {
      return messenger.sendDomMessage("background", "provider:getNonce", {
        network,
        account,
      });
    },

    async getAccountRc(account: string): Promise<string> {
      return messenger.sendDomMessage("background", "provider:getAccountRc", {
        network,
        account,
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
      });
    },

    async getChainId(): Promise<string> {
      return messenger.sendDomMessage("background", "provider:getChainId", {
        network,
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
      });
      response.transaction.wait = async (
        type: "byTransactionId" | "byBlock" = "byBlock",
        timeout = 60000
      ) => {
        return messenger.sendDomMessage("background", "provider:wait", {
          network,
          txId: response.transaction.id,
          type,
          timeout,
        });
      };
      return response;
    },

    async submitBlock(block: BlockJson): Promise<Record<string, never>> {
      return messenger.sendDomMessage("background", "provider:submitBlock", {
        network,
        block,
      });
    },

    async readContract(operation: CallContractOperationJson): Promise<{
      result: string;
      logs: string;
    }> {
      return messenger.sendDomMessage("background", "provider:readContract", {
        network,
        operation,
      });
    },
  };
}

export const provider = getProvider();

export default provider;
