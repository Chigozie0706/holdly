import { openContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { 
  stringUtf8CV, 
  uintCV, 
  PostConditionMode,
  makeStandardFungiblePostCondition,
  FungibleConditionCode,
  createAssetInfo
} from '@stacks/transactions';

const CONTRACT_ADDRESS = 'ST11V9ZN6E6VG72SHMAVM9GDE30VD3VGW5Q1W9WX3';
const CONTRACT_NAME = 'book-lending';
const SBTC_CONTRACT = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4';
const DEPOSIT_AMOUNT = 100000;

export const addBook = async (title: string, author: string) => {
  await openContractCall({
    network: new StacksTestnet(),
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'add-book',
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(author)
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Transaction:', data.txId);
    },
  });
};

export const borrowBook = async (bookId: number, userAddress: string) => {
  const postCondition = makeStandardFungiblePostCondition(
    userAddress,
    FungibleConditionCode.Equal,
    DEPOSIT_AMOUNT,
    createAssetInfo(SBTC_CONTRACT, 'sbtc-token', 'sbtc-token')
  );

  await openContractCall({
    network: new StacksTestnet(),
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'borrow-book',
    functionArgs: [uintCV(bookId)],
    postConditions: [postCondition],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Borrowed:', data.txId);
    },
  });
};

export const returnBook = async (bookId: number) => {
  await openContractCall({
    network: new StacksTestnet(),
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'return-book',
    functionArgs: [uintCV(bookId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Returned:', data.txId);
    },
  });
};
