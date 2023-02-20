import React, { useState } from 'react';
import Button from '../ui/Button';

const Book = ({ bookData, image, borrowBook, returnBook }) => {
  const [isBorrowBtnLoading, setIsBorrowBtnLoading] = useState(false);
  const [isReturnBtnLoading, setIsReturnBtnLoading] = useState(false);

  const handleBorrowBook = async () => {
    setIsBorrowBtnLoading(true);
    await borrowBook(bookData.name);
    setIsBorrowBtnLoading(false);
  };

  const handleReturnBook = async () => {
    setIsReturnBtnLoading(true);
    await returnBook(bookData.name);
    setIsReturnBtnLoading(false);
  };

  return (
    <div className="card card--rounded">
      <img src={image} alt={bookData.name} />

      <div className="p-3">
        <h2>{bookData.name}</h2>

        <p>Copies: {bookData.copies.toString()}</p>

        <div className="d-flex justify-content-space-between pt-2">
          <Button onClick={handleBorrowBook} loading={isBorrowBtnLoading}>
            Borrow
          </Button>

          <Button onClick={handleReturnBook} loading={isReturnBtnLoading} className="ms-3">
            Return
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Book;
