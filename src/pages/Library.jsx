import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner, useAccount } from 'wagmi';
import { GiBlackBook } from 'react-icons/gi';

import libraryABI from '../abi/Library.json';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import Button from '../components/ui/Button';
import BookList from '../components/Book/BookList';
import Modal from '../components/layout/Modal';
import Dropdown from '../components/layout/Dropdown';

const Library = () => {
  const { data: signer } = useSigner();
  const contractAddress = '0x210C8DEc984331de86F35Ec719F2858CC491CA45';
  const { isConnected, address } = useAccount();

  const filterOptions = [
    { label: 'All Books', value: 'all-books' },
    { label: 'Available Books', value: 'available-books' },
  ];

  if (isConnected) {
    filterOptions.push({ label: 'My Books', value: 'my-books' });
  }

  const initialNewBookFormData = {
    name: '',
    copies: 0,
  };

  const [contract, setContract] = useState();

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [filterBy, setFilterBy] = useState('');
  const [returnBorrowError, setReturnBorrowError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newBookFromData, setNewBookFormData] = useState(initialNewBookFormData);
  const [isLoadingSubmitNewBook, setIsLoadingSubmitNewBook] = useState(false);
  const [createBookModalError, setCreateBookModalError] = useState('');

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

  const filterBooks = useCallback(async () => {
    let filteredBooks = [];

    if (filterBy.value === 'available-books') {
      filteredBooks = books.filter(book => book.copies.toNumber() > 0);
    } else if (filterBy.value === 'my-books') {
      for (const book of books) {
        const isBookBorrowed = await contract.borrowedBooks(
          address,
          ethers.utils.formatBytes32String(book.name),
        );

        if (isBookBorrowed) {
          filteredBooks.push(book);
        }
      }
    } else {
      filteredBooks = books;
    }

    setFilteredBooks(filteredBooks);
  }, [books, filterBy, contract, address]);

  const setError = (errorMessage, setErrorState) => {
    if (!(errorMessage === 'user rejected transaction')) {
      setErrorState(errorMessage);
    } else {
      setErrorState('');
    }
  };

  const borrowBook = useCallback(
    async bookName => {
      try {
        const borrowBookTx = await contract.borrowBook(bookName);
        const receipt = await borrowBookTx.wait();
        setReturnBorrowError('');
        await getBooks();
      } catch (error) {
        setError(error.reason, setReturnBorrowError);
      }
    },
    [contract, getBooks],
  );

  const returnBook = useCallback(
    async bookName => {
      try {
        const returnBookTx = await contract.returnBook(bookName);
        const receipt = await returnBookTx.wait();
        setReturnBorrowError('');
        await getBooks();
      } catch (error) {
        setError(error.reason, setReturnBorrowError);
      }
    },
    [contract, getBooks],
  );

  const handleFilterByChange = option => {
    setFilterBy(option);
  };

  // handlers
  const handleFormInputChange = e => {
    const { value, name } = e.target;

    setNewBookFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal
  const handleModal = useCallback(async () => {
    setNewBookFormData(initialNewBookFormData);
    setShowModal(!showModal);
    setCreateBookModalError('');
  }, [initialNewBookFormData, showModal]);

  const createNewBook = useCallback(async () => {
    try {
      setIsLoadingSubmitNewBook(true);

      const createBookTx = await contract.addBook(newBookFromData.name, newBookFromData.copies);
      await createBookTx.wait();

      handleModal();
      await getBooks();
    } catch (error) {
      setError(error.reason, setCreateBookModalError);
    } finally {
      setIsLoadingSubmitNewBook(false);
    }
  }, [contract, handleModal, newBookFromData, getBooks]);

  const modalActionBar = [
    <Button
      onClick={createNewBook}
      loading={isLoadingSubmitNewBook}
      className="mx-3"
      key="accept-modal-btn"
    >
      Create
    </Button>,
    <Button onClick={handleModal} key="cancel-modal-btn">
      Cancel
    </Button>,
  ];

  const modal = (
    <Modal onClose={handleModal} actionBar={modalActionBar}>
      <div className="mb-4">
        <h2>Create New Book</h2>

        {createBookModalError ? (
          <div className="alert alert-danger mt-4">{createBookModalError}</div>
        ) : null}

        <div className="mt-4">
          <p className="text-small text-bold">Name: </p>

          <input
            type="text"
            className="form-control"
            name="name"
            value={newBookFromData.name}
            onChange={handleFormInputChange}
          />
        </div>

        <div className="mt-4">
          <p className="text-small text-bold">Copies: </p>

          <input
            type="number"
            className="form-control"
            name="copies"
            value={newBookFromData.copies}
            onChange={handleFormInputChange}
          />
        </div>
      </div>
    </Modal>
  );
  // End Modal

  useEffect(() => {
    if (signer) {
      setContract(new ethers.Contract(contractAddress, libraryABI.abi, signer));
    }
  }, [signer]);

  useEffect(() => {
    contract && getBooks();
  }, [contract, getBooks]);

  useEffect(() => {
    contract && filterBooks();
  }, [contract, filterBy, filterBooks]);

  return (
    // Wrapper component
    <div className="container my-5 my-lg-10">
      <h2 className="heading-medium text-center mb-5">Library</h2>

      <div className="d-flex justify-content-end align-items-center mb-4">
        <Dropdown
          className="mx-3"
          options={filterOptions}
          value={filterBy}
          onChange={handleFilterByChange}
        />

        <Button className="d-flex align-items-center" onClick={handleModal}>
          New <GiBlackBook />
        </Button>

        {showModal && modal}
      </div>

      {returnBorrowError ? (
        <div className="alert alert-danger mb-4">{returnBorrowError}</div>
      ) : null}

      {isLoadingBooks ? (
        <LoadingSpinner />
      ) : (
        <BookList
          bookList={filteredBooks}
          borrowBook={borrowBook}
          returnBook={returnBook}
          getBooks={getBooks}
        />
      )}
    </div>
  );
};

export default Library;
