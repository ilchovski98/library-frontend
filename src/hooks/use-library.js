import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner, useSignTypedData } from 'wagmi';

import libraryABI from '../abi/Library.json';

const useLibrary = () => {
  const { data: signer } = useSigner();
  const contractAddress = '0x210C8DEc984331de86F35Ec719F2858CC491CA45';

  const domain = {
    name: 'Elon Coin',
    version: '1',
    chainId: 31337,
    verifyingContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  };

  const types = {
    PermitTransferFrom: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const value = {
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    spender: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    amount: '50000000000000000000',
    nonce: '0x00',
    deadline: 1677505067744,
  };

  const { data, isError, isLoading, isSuccess, signTypedData } = useSignTypedData({
    domain,
    types,
    value,
  });

  const [contract, setContract] = useState();
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const getBooks = useCallback(async () => {
    setIsLoadingBooks(true);

    const numberOfBooks = await contract.getNumberOfBooks();
    const books = [];

    for (let index = 0; index <= numberOfBooks - 1; index++) {
      const key = await contract.bookKeys(index);
      const book = await contract.books(key);
      books.push(book);
    }

    setBooks(books);

    setIsLoadingBooks(false);
  }, [contract]);

  const borrowBook = async bookName => {
    await contract.callStatic.borrowBook(bookName);
    const borrowBookTx = await contract.borrowBook(bookName);
    await borrowBookTx.wait();
  };

  const returnBook = async bookName => {
    await contract.callStatic.returnBook(bookName);
    const returnBookTx = await contract.returnBook(bookName);
    await returnBookTx.wait();
  };

  const createNewBook = async (bookName, bookCopies) => {
    await contract.callStatic.addBook(bookName, bookCopies);
    const createBookTx = await contract.addBook(bookName, bookCopies);
    await createBookTx.wait();
  };

  useEffect(() => {
    if (signer) {
      setContract(new ethers.Contract(contractAddress, libraryABI.abi, signer));
    }
  }, [signer]);

  useEffect(() => {
    contract && getBooks();
  }, [contract, getBooks]);

  return {
    contract,
    books,
    isLoadingBooks,
    borrowBook,
    returnBook,
    createNewBook,
    getBooks,
    data,
    isError,
    isLoading,
    isSuccess,
    signTypedData,
  };
};

export default useLibrary;
