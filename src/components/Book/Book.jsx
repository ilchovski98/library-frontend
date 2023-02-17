import React from 'react';
import Button from '../ui/Button';

const Book = ({ bookData, image, handleBorrow, handleDeleteBook }) => {
  return (
    <div className="card card--rounded">
      <img src={image} alt={bookData.name} />

      <div className="p-3">
        <h2>{bookData.name}</h2>

        <p>Copies: {bookData.copies.toString()}</p>

        <div className="d-flex justify-content-space-between pt-2">
          <Button onClick={handleBorrow}>Borrow</Button>

          <Button onClick={handleDeleteBook} className="ms-3">
            Return
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Book;
