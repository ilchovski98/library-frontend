import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
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

  const filterOptions = [
    { label: 'All Books', value: 'all-books' },
    { label: 'Available Books', value: 'avalilable-books' },
    { label: 'My Books', value: 'my-books' },
  ];

  const initialNewBookFormData = {
    name: '',
    copies: 0,
  };

  const [contract, setContract] = useState();

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [filterBy, setFilterBy] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newBookFromData, setNewBookFormData] = useState(initialNewBookFormData);

  const getBooks = useCallback(async () => {
    setIsLoadingBooks(true);

    const numberOfBooks = await contract.getNumberOfBooks();
    const books = [];

    for (let index = 0; index <= numberOfBooks - 1; index++) {
      const key = await contract.bookKeys(index);
      const book = await contract.books(key);
      books.push(book);
    }

    console.log('books', books);

    setBooks(books);

    setIsLoadingBooks(false);
  }, [contract]);

  const filterBooks = useCallback(() => {
    let filteredBooks;

    if (filterBy === 'available-books') {
      filteredBooks = books.filter(book => book.copies.toNumber() > 0);
    } else if (filterBy === 'my-books') {
      filteredBooks = books.filter(book => book.copies.toNumber() > 0);
    } else {
      filteredBooks = books;
    }

    setFilteredBooks(filteredBooks);
  }, [books, filterBy]);

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
  const handleModal = () => {
    setNewBookFormData(initialNewBookFormData);
    setShowModal(!showModal);
  };

  const createNewBook = useCallback(async () => {
    const createBookTx = await contract.addBook(newBookFromData.name, newBookFromData.copies);
    await createBookTx.wait();
    handleModal();
  }, [contract, handleModal]);

  const modalActionBar = [
    <Button onClick={createNewBook} className="mx-3" key="accept-modal-btn">
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
      <div className="row">
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

        {isLoadingBooks ? <LoadingSpinner /> : <BookList bookList={filteredBooks} />}
      </div>
    </div>
  );
};

export default Library;
