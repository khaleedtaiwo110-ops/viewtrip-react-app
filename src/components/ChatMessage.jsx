
export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-5 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-6">
          {message.content}
        </p>
      </div>
    </div>
  );
}
