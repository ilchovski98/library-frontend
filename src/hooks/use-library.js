import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';

import libraryABI from '../abi/Library.json';

const useLibrary = () => {
  const { data: signer } = useSigner();
  const contractAddress = '0x210C8DEc984331de86F35Ec719F2858CC491CA45';

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

  const borrowBook = useCallback(
    async bookName => {
      const borrowBookTx = await contract.borrowBook(bookName);
      await borrowBookTx.wait();
    },
    [contract],
  );

  const returnBook = useCallback(
    async bookName => {
      const returnBookTx = await contract.returnBook(bookName);
      await returnBookTx.wait();
    },
    [contract],
  );

  const createNewBook = useCallback(
    async (bookName, bookCopies) => {
      const createBookTx = await contract.addBook(bookName, bookCopies);
      await createBookTx.wait();
    },
    [contract],
  );

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
  };
};

export default useLibrary;
