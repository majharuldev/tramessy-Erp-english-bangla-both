const BtnSubmit = ({ children, loading }) => {
  return (
    <button
      type="submit"
      className="mt-4 bg-primary text-white text-sm px-6 py-2 rounded hover:bg-primary/80 transition-all duration-300 cursor-pointer"
    >
      {loading ? (
  <span className="flex items-center gap-2">
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
    Submitting...
  </span>
) : (
  children
)}

    </button>
  );
};

export default BtnSubmit;