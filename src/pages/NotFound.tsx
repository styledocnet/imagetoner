const NotFound = () => {
  //  my-auto mx-auto -> place-self-center
  return (
    <div className="grid grid-cols-1 ">
      <div className="max-w-xl place-self-center bg-white/10 p-6 rounded-lg shadow-md ">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-600 dark:text-gray-200">404 - Page Not Found</h1>
        <span>The item you’re looking for doesn’t exist.</span>
      </div>
    </div>
  );
};

export default NotFound;
