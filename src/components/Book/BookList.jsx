import React from 'react';
import Book from './Book';

const BookList = ({ bookList, borrowBook, returnBook, getBooks }) => {
  return (
    <div className="row">
      {bookList.map((book, index) => (
        <div className="col-md-3 mb-5" key={index + '-book-name-' + book.name}>
          <Book bookData={book} image="/book.jpg" borrowBook={borrowBook} returnBook={returnBook} />
        </div>
      ))}
    </div>
  );
};

export default BookList;
