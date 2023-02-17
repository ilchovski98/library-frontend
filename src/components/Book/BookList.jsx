import React from 'react';
import Book from './Book';

const BookList = ({ bookList }) => {
  return (
    <>
      {bookList.map((book, index) => (
        <div className="col-md-3 mb-5" key={index + '-book-name-' + book.name}>
          <Book
            bookData={book}
            image="/book.jpg"
            handleBorrow={() => {}}
            handleDeleteBook={() => {}}
          />
        </div>
      ))}
    </>
  );
};

export default BookList;
