import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const Pagination = ({ currentPage, totalPages, onPageChange, maxVisible = 8 }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // পেজ জেনারেট করার ফাংশন
  const getPageNumbers = () => {
    let pages = [];

    // সবসময় ১ নাম্বার পেজ দেখাবে
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded-sm ${
          currentPage === 1
            ? "bg-primary text-white"
            : "bg-gray-200 hover:bg-primary hover:text-white"
        }`}
      >
        1
      </button>
    );

    // যদি currentPage > 6 হয় তাহলে ... দেখাবে
    if (currentPage > maxVisible / 2) {
      pages.push(<span key="dots1">...</span>);
    }

    // Dynamic মাঝের পেজ
    let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(2, end - (maxVisible - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-sm ${
            currentPage === i
              ? "bg-primary text-white"
              : "bg-gray-200 hover:bg-primary hover:text-white"
          }`}
        >
          {i}
        </button>
      );
    }

    // যদি currentPage শেষের কাছাকাছি না হয় তাহলে ... দেখাবে
    if (currentPage < totalPages - maxVisible / 2) {
      pages.push(<span key="dots2">...</span>);
    }

    // সবসময় শেষ পেজ দেখাবে (যদি totalPages > 1 হয়)
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded-sm ${
            currentPage === totalPages
              ? "bg-primary text-white"
              : "bg-gray-200 hover:bg-primary hover:text-white"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="mt-10 flex justify-center">
      <div className="space-x-2 flex items-center">
        {/* Prev */}
        <button
          onClick={handlePrev}
          className={`p-2 ${
            currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
          } rounded-sm`}
          disabled={currentPage === 1}
        >
          <GrFormPrevious />
        </button>

        {/* Page Numbers */}
        {getPageNumbers()}

        {/* Next */}
        <button
          onClick={handleNext}
          className={`p-2 ${
            currentPage === totalPages ? "bg-gray-300" : "bg-primary text-white"
          } rounded-sm`}
          disabled={currentPage === totalPages}
        >
          <GrFormNext />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
