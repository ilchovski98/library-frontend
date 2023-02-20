import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { GiBlackBook } from 'react-icons/gi';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import BookList from '../components/Book/BookList';
import Modal from '../components/layout/Modal';
import Dropdown from '../components/ui/Dropdown';
import useLibrary from '../hooks/use-library';
import { setError } from '../utils/index';

const Library = () => {
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

  const { contract, books, isLoadingBooks, borrowBook, returnBook, createNewBook, getBooks } =
    useLibrary();

  // Page state
  const [bookListError, setBookListError] = useState();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filterBy, setFilterBy] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newBookModalFormData, setNewBookModalFormData] = useState(initialNewBookFormData);
  const [isLoadingNewBookModalSubmit, setIsLoadingNewBookModalSubmit] = useState(false);
  const [newBookModalError, setNewBookModalError] = useState('');

  // Filtering
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

  // Handlers
  const handleBorrowBook = async bookName => {
    try {
      await borrowBook(bookName);
      setBookListError('');
      await getBooks();
    } catch (error) {
      setError(error.reason, setBookListError);
    }
  };

  const handleReturnBook = async bookName => {
    try {
      await returnBook(bookName);
      setBookListError('');
      await getBooks();
    } catch (error) {
      setError(error.reason, setBookListError);
    }
  };

  const handleModalFormInputChange = e => {
    const { value, name } = e.target;

    setNewBookModalFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModal = async () => {
    setNewBookModalFormData(initialNewBookFormData);
    setShowModal(!showModal);
    setNewBookModalError('');
  };

  const handleNewBookModalSubmit = async () => {
    try {
      setIsLoadingNewBookModalSubmit(true);
      await createNewBook(newBookModalFormData.name, newBookModalFormData.copies);
      handleModal();
      await getBooks();
    } catch (error) {
      setIsLoadingNewBookModalSubmit(false);
      setError(error.reason, setNewBookModalError);
    }
  };

  // Modal
  const modalActionBar = [
    <Button
      onClick={handleNewBookModalSubmit}
      loading={isLoadingNewBookModalSubmit}
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

        {newBookModalError ? (
          <div className="alert alert-danger mt-4">{newBookModalError}</div>
        ) : null}

        <div className="mt-4">
          <p className="text-small text-bold">Name: </p>

          <input
            type="text"
            className="form-control"
            name="name"
            value={newBookModalFormData.name}
            onChange={handleModalFormInputChange}
          />
        </div>

        <div className="mt-4">
          <p className="text-small text-bold">Copies: </p>

          <input
            type="number"
            className="form-control"
            name="copies"
            value={newBookModalFormData.copies}
            onChange={handleModalFormInputChange}
          />
        </div>
      </div>
    </Modal>
  );

  useEffect(() => {
    contract && filterBooks();
  }, [contract, filterBy, filterBooks]);

  return (
    <div className="container my-5 my-lg-10">
      <h2 className="heading-medium text-center mb-5">Library</h2>

      <div className="d-flex justify-content-end align-items-center mb-4">
        <Dropdown
          className="mx-3"
          options={filterOptions}
          value={filterBy}
          onChange={option => {
            setFilterBy(option);
          }}
        />

        <Button className="d-flex align-items-center" onClick={handleModal}>
          New <GiBlackBook />
        </Button>

        {showModal && modal}
      </div>

      {bookListError ? <div className="alert alert-danger mb-4">{bookListError}</div> : null}

      {isLoadingBooks ? (
        <LoadingSpinner />
      ) : (
        <BookList
          bookList={filteredBooks}
          borrowBook={handleBorrowBook}
          returnBook={handleReturnBook}
        />
      )}
    </div>
  );
};

export default Library;
