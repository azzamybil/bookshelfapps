'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const books = [];
  const RENDER_EVENT = 'render-books';
  const STORAGE_KEY = 'BOOKSHELF_APPS';

  // Mengecek local  storange jika avaible
  function isStorageExist() {
    if (typeof Storage === 'undefined') {
      alert('Your browser does not support local storage');
      return false;
    }
    return true;
  }

  //  Menyimpan array buku di local storange
  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }

  // Load books dari local storage
  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  // Mengenerate unique id 
  function generateId() {
    return +new Date();
  }

  // Membuat sebuah objek buku
  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year: parseInt(year), 
      isComplete,
    };
  }

  // Mencari buku berdasarkan id
  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  // Mencari index sebuah buku
  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }

  // Mmembuat HTML element untuk buku
  function makeBookElement(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    // Membuat  container dan text elements
    const bookContainer = document.createElement('div');
    bookContainer.setAttribute('data-bookid', id);
    bookContainer.setAttribute('data-testid', 'bookItem');
    bookContainer.classList.add('book-item');

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = `Penulis: ${author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = `Tahun: ${year}`;

    // Mmebuat action buttons container
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action-buttons');

    // Membuat Delete button
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function () {
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        deleteBook(id);
      }
    });

    // Membuat Edit button
    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.classList.add('orange');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', function () {
      editBook(id);
    });

    // Mmembuat Toggle Read Status button
    const toggleReadButton = document.createElement('button');
    toggleReadButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleReadButton.classList.add('green');
    if (isComplete) {
      toggleReadButton.innerText = 'Belum Selesai';
    } else {
      toggleReadButton.innerText = 'Selesai dibaca';
    }
    toggleReadButton.addEventListener('click', function () {
      toggleBookStatus(id);
    });

    
    actionContainer.append(toggleReadButton, deleteButton, editButton);

    
    bookContainer.append(bookTitle, bookAuthor, bookYear, actionContainer);

    return bookContainer;
  }

  // Menambah buku baru
  function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(
      generatedID,
      title,
      author,
      year,
      isComplete
    );
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku berhasil ditambahkan!');
  }

  // Toggle a book's isComplete status
  function toggleBookStatus(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // Delete a book
  function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku berhasil dihapus!');
  }

  // Mengedit sebuah buku 
  function editBook(bookId) {
    const bookToEdit = findBook(bookId);
    if (bookToEdit == null) return;

    const newTitle = prompt('Masukkan judul baru:', bookToEdit.title);
    const newAuthor = prompt('Masukkan penulis baru:', bookToEdit.author);
    const newYear = prompt('Masukkan tahun baru:', bookToEdit.year);

    if (newTitle && newAuthor && newYear) {
      bookToEdit.title = newTitle;
      bookToEdit.author = newAuthor;
      bookToEdit.year = parseInt(newYear);

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      alert('Buku berhasil diedit!');
    } else {
      alert('Edit dibatalkan. Semua field harus diisi.');
    }
  }

  // Mencari buku berdasarkan title
  function searchBooks(query) {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    renderFilteredBooks(filteredBooks);
  }

  function renderFilteredBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of filteredBooks) {
      const bookElement = makeBookElement(bookItem);
      if (bookItem.isComplete) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
  }

  // Event listener untuk book submission form
  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    event.target.reset(); // Reset form fields
  });

  // Event listener untuk search form
  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('searchBookTitle').value;
    searchBooks(searchQuery);
  });
  
  // Fungssionalitas live search
  const searchInput = document.getElementById('searchBookTitle');
  searchInput.addEventListener('keyup', function() {
      searchBooks(this.value);
  });

  // Update button text berdsasarkan checkbox
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
  isCompleteCheckbox.addEventListener('change', function () {
    const submitButtonSpan = document.querySelector('#bookFormSubmit span');
    if (this.checked) {
      submitButtonSpan.innerText = 'Selesai dibaca';
    } else {
      submitButtonSpan.innerText = 'Belum selesai dibaca';
    }
  });

  // Custom event listener untuk merender buku ke DOM
  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
      const bookElement = makeBookElement(bookItem);
      if (bookItem.isComplete) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
  });

  // Load data ketika pagenya ready
  loadDataFromStorage();
});