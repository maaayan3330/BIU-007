import { useState } from "react";
/// delete all this file it is just for demo!

export default function EmbeddingDemo() {
  const [message, setMessage] = useState("Why was this comment blurred?");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/router-demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl p-8">

        <h1 className="text-3xl font-bold mb-6">Semantic Router Demo</h1>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-slate-800 p-3 rounded-xl mb-6"
        />

        <button
          onClick={calculate}
          className="bg-emerald-500 px-6 py-2 rounded-xl mb-6"
        >
          Analyze Message
        </button>

        {loading && <p>Analyzing...</p>}

        {result && (
          <>
            <p className="text-xl mb-2">
              Route:{" "}
              <span className="text-emerald-400">{result.route}</span>
            </p>

            <p className="text-xl mb-4">
              Score:{" "}
              <span className="text-emerald-400">
                {result.score.toFixed(2)}
              </span>
            </p>

            <div className="bg-slate-800 p-4 rounded-xl">
              <p>Matched example:</p>
              <p className="text-cyan-300 font-semibold">
                {result.matchedExample}
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl mt-4">
  <p>User message vector:</p>
  <p className="font-mono text-sm text-emerald-300">
    [{result.messageVector.join(", ")} ...]
  </p>
</div>

<div className="bg-slate-800 p-4 rounded-xl mt-4">
  <p>Matched example vector:</p>
  <p className="font-mono text-sm text-cyan-300">
    [{result.matchedExampleVector.join(", ")} ...]
  </p>
</div>
          </>
        )}
      </div>
    </section>
  );
}