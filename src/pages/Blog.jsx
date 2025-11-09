import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../componentss/adsgoogle";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetch("/blogs.json")
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Error loading blogs:", err));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12 px-6">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-10">
        Travel Blog
      </h1>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {blogs.map((blog) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {blog.title}
              </h2>
              <p className="text-gray-600 mb-4">{blog.excerpt}</p>
              <button
                onClick={() => setSelectedBlog(blog)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Read More
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for reading full post */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"

          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
              >
                ✕
              </button>

              {/* Blog content */}
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                {selectedBlog.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {selectedBlog.content}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AdBanner/>
    </div>
  );
}
